/**
 * useOffline Hook Unit Tests
 * Tests for offline detection and sync functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useOffline } from '@/hooks/use-offline';

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock storage hook
jest.mock('@/hooks/use-storage', () => ({
  useStorage: jest.fn(() => ({
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    list: jest.fn(),
  })),
}));

describe('useOffline Hook', () => {
  const mockStorage = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    list: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    navigator.onLine = true;
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { useStorage } = require('@/hooks/use-storage');
    useStorage.mockReturnValue(mockStorage);
  });

  describe('Online/Offline Detection', () => {
    it('should initialize with online status', () => {
      const { result } = renderHook(() => useOffline());
      
      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });

    it('should detect when going offline', () => {
      const { result } = renderHook(() => useOffline());
      
      act(() => {
        navigator.onLine = false;
        window.dispatchEvent(new Event('offline'));
      });
      
      expect(result.current.isOnline).toBe(false);
      expect(result.current.isOffline).toBe(true);
    });

    it('should detect when coming back online', () => {
      const { result } = renderHook(() => useOffline());
      
      // Go offline first
      act(() => {
        navigator.onLine = false;
        window.dispatchEvent(new Event('offline'));
      });
      
      // Come back online
      act(() => {
        navigator.onLine = true;
        window.dispatchEvent(new Event('online'));
      });
      
      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });

    it('should call onOnline callback when coming online', () => {
      const onOnline = jest.fn();
      renderHook(() => useOffline({ onOnline }));
      
      act(() => {
        navigator.onLine = false;
        window.dispatchEvent(new Event('offline'));
      });
      
      act(() => {
        navigator.onLine = true;
        window.dispatchEvent(new Event('online'));
      });
      
      expect(onOnline).toHaveBeenCalled();
    });

    it('should call onOffline callback when going offline', () => {
      const onOffline = jest.fn();
      renderHook(() => useOffline({ onOffline }));
      
      act(() => {
        navigator.onLine = false;
        window.dispatchEvent(new Event('offline'));
      });
      
      expect(onOffline).toHaveBeenCalled();
    });
  });

  describe('Offline Data Management', () => {
    it('should queue operations when offline', async () => {
      const { result } = renderHook(() => useOffline());
      
      // Go offline
      act(() => {
        navigator.onLine = false;
        window.dispatchEvent(new Event('offline'));
      });
      
      const operation = {
        type: 'create' as const,
        entity: 'workout',
        data: { id: '1', name: 'Push Day' }
      };
      
      await act(async () => {
        await result.current.queueOperation(operation);
      });
      
      expect(result.current.pendingOperations).toHaveLength(1);
      expect(result.current.pendingOperations[0]).toEqual(
        expect.objectContaining(operation)
      );
    });

    it('should execute operations immediately when online', async () => {
      const { result } = renderHook(() => useOffline());
      
      const operation = {
        type: 'create' as const,
        entity: 'workout',
        data: { id: '1', name: 'Push Day' }
      };
      
      await act(async () => {
        await result.current.queueOperation(operation);
      });
      
      expect(mockStorage.create).toHaveBeenCalledWith(operation.data);
      expect(result.current.pendingOperations).toHaveLength(0);
    });

    it('should sync pending operations when coming online', async () => {
      const { result } = renderHook(() => useOffline());
      
      // Go offline and queue operations
      act(() => {
        navigator.onLine = false;
        window.dispatchEvent(new Event('offline'));
      });
      
      const operations = [
        { type: 'create' as const, entity: 'workout', data: { id: '1', name: 'Push Day' } },
        { type: 'update' as const, entity: 'workout', data: { id: '2', name: 'Pull Day' } }
      ];
      
      for (const op of operations) {
        await act(async () => {
          await result.current.queueOperation(op);
        });
      }
      
      // Come back online
      act(() => {
        navigator.onLine = true;
        window.dispatchEvent(new Event('online'));
      });
      
      await waitFor(() => {
        expect(result.current.pendingOperations).toHaveLength(0);
      });
      
      expect(mockStorage.create).toHaveBeenCalledWith(operations[0].data);
      expect(mockStorage.update).toHaveBeenCalledWith(
        operations[1].data.id,
        operations[1].data
      );
    });

    it('should handle sync errors gracefully', async () => {
      const { result } = renderHook(() => useOffline());
      
      mockStorage.create.mockRejectedValue(new Error('Sync failed'));
      
      // Go offline and queue operation
      act(() => {
        navigator.onLine = false;
        window.dispatchEvent(new Event('offline'));
      });
      
      const operation = {
        type: 'create' as const,
        entity: 'workout',
        data: { id: '1', name: 'Push Day' }
      };
      
      await act(async () => {
        await result.current.queueOperation(operation);
      });
      
      // Come back online
      act(() => {
        navigator.onLine = true;
        window.dispatchEvent(new Event('online'));
      });
      
      await waitFor(() => {
        expect(result.current.syncErrors).toHaveLength(1);
      });
      
      expect(result.current.syncErrors[0]).toEqual(
        expect.objectContaining({
          operation,
          error: expect.any(Error)
        })
      );
    });

    it('should retry failed operations', async () => {
      const { result } = renderHook(() => useOffline());
      
      mockStorage.create
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({ id: '1', name: 'Push Day' });
      
      const operation = {
        type: 'create' as const,
        entity: 'workout',
        data: { id: '1', name: 'Push Day' }
      };
      
      await act(async () => {
        await result.current.retryOperation(operation);
      });
      
      expect(mockStorage.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('Offline Storage', () => {
    it('should cache data for offline access', async () => {
      const { result } = renderHook(() => useOffline());
      
      const data = [
        { id: '1', name: 'Push Day' },
        { id: '2', name: 'Pull Day' }
      ];
      
      await act(async () => {
        await result.current.cacheData('workouts', data);
      });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'offline_cache_workouts',
        JSON.stringify(data)
      );
    });

    it('should retrieve cached data when offline', () => {
      const cachedData = [
        { id: '1', name: 'Push Day' },
        { id: '2', name: 'Pull Day' }
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(cachedData));
      
      const { result } = renderHook(() => useOffline());
      
      const data = result.current.getCachedData('workouts');
      
      expect(data).toEqual(cachedData);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('offline_cache_workouts');
    });

    it('should clear cache', () => {
      const { result } = renderHook(() => useOffline());
      
      act(() => {
        result.current.clearCache('workouts');
      });
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('offline_cache_workouts');
    });

    it('should clear all cache', () => {
      const { result } = renderHook(() => useOffline());
      
      act(() => {
        result.current.clearAllCache();
      });
      
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });
  });

  describe('Background Sync', () => {
    it('should register background sync if supported', () => {
      // Mock Service Worker registration
      const mockServiceWorker = {
        sync: {
          register: jest.fn().mockResolvedValue(undefined)
        }
      };
      
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve(mockServiceWorker)
        }
      });
      
      const { result } = renderHook(() => useOffline({ enableBackgroundSync: true }));
      
      act(() => {
        result.current.registerBackgroundSync();
      });
      
      expect(mockServiceWorker.sync.register).toHaveBeenCalledWith('workout-sync');
    });

    it('should handle background sync gracefully when not supported', () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined
      });
      
      const { result } = renderHook(() => useOffline({ enableBackgroundSync: true }));
      
      expect(() => {
        act(() => {
          result.current.registerBackgroundSync();
        });
      }).not.toThrow();
    });
  });

  describe('Connection Quality', () => {
    it('should detect connection quality', () => {
      // Mock navigator.connection
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 50
        }
      });
      
      const { result } = renderHook(() => useOffline());
      
      expect(result.current.connectionInfo).toEqual({
        effectiveType: '4g',
        downlink: 10,
        rtt: 50
      });
    });

    it('should handle missing connection API', () => {
      Object.defineProperty(navigator, 'connection', {
        value: undefined
      });
      
      const { result } = renderHook(() => useOffline());
      
      expect(result.current.connectionInfo).toBeNull();
    });

    it('should detect slow connection', () => {
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '2g',
          downlink: 0.5,
          rtt: 2000
        }
      });
      
      const { result } = renderHook(() => useOffline());
      
      expect(result.current.isSlowConnection).toBe(true);
    });
  });

  describe('Auto Sync Configuration', () => {
    it('should auto sync when enabled', async () => {
      const { result } = renderHook(() => useOffline({ autoSync: true }));
      
      // Queue operation while offline
      act(() => {
        navigator.onLine = false;
        window.dispatchEvent(new Event('offline'));
      });
      
      const operation = {
        type: 'create' as const,
        entity: 'workout',
        data: { id: '1', name: 'Push Day' }
      };
      
      await act(async () => {
        await result.current.queueOperation(operation);
      });
      
      // Come back online
      act(() => {
        navigator.onLine = true;
        window.dispatchEvent(new Event('online'));
      });
      
      await waitFor(() => {
        expect(result.current.pendingOperations).toHaveLength(0);
      });
    });

    it('should not auto sync when disabled', async () => {
      const { result } = renderHook(() => useOffline({ autoSync: false }));
      
      // Queue operation while offline
      act(() => {
        navigator.onLine = false;
        window.dispatchEvent(new Event('offline'));
      });
      
      const operation = {
        type: 'create' as const,
        entity: 'workout',
        data: { id: '1', name: 'Push Day' }
      };
      
      await act(async () => {
        await result.current.queueOperation(operation);
      });
      
      // Come back online
      act(() => {
        navigator.onLine = true;
        window.dispatchEvent(new Event('online'));
      });
      
      // Should not auto sync
      expect(result.current.pendingOperations).toHaveLength(1);
    });

    it('should manually sync when auto sync is disabled', async () => {
      const { result } = renderHook(() => useOffline({ autoSync: false }));
      
      // Queue operation while offline
      act(() => {
        navigator.onLine = false;
        window.dispatchEvent(new Event('offline'));
      });
      
      const operation = {
        type: 'create' as const,
        entity: 'workout',
        data: { id: '1', name: 'Push Day' }
      };
      
      await act(async () => {
        await result.current.queueOperation(operation);
      });
      
      // Come back online
      act(() => {
        navigator.onLine = true;
        window.dispatchEvent(new Event('online'));
      });
      
      // Manually sync
      await act(async () => {
        await result.current.syncPendingOperations();
      });
      
      expect(result.current.pendingOperations).toHaveLength(0);
    });
  });

  describe('Event Listeners Cleanup', () => {
    it('should cleanup event listeners on unmount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useOffline());
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Persistence', () => {
    it('should persist pending operations to localStorage', async () => {
      const { result } = renderHook(() => useOffline());
      
      act(() => {
        navigator.onLine = false;
        window.dispatchEvent(new Event('offline'));
      });
      
      const operation = {
        type: 'create' as const,
        entity: 'workout',
        data: { id: '1', name: 'Push Day' }
      };
      
      await act(async () => {
        await result.current.queueOperation(operation);
      });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'offline_pending_operations',
        expect.stringContaining('"type":"create"')
      );
    });

    it('should restore pending operations from localStorage', () => {
      const pendingOps = [
        { type: 'create', entity: 'workout', data: { id: '1', name: 'Push Day' } }
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(pendingOps));
      
      const { result } = renderHook(() => useOffline());
      
      expect(result.current.pendingOperations).toHaveLength(1);
    });
  });
});