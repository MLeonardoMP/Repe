/**
 * useStorage Hook Unit Tests
 * Tests for storage hook with CRUD operations and error handling
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useStorage } from '@/hooks/use-storage';
import type { User, WorkoutSession, Exercise } from '@/types';

// Mock the storage service
jest.mock('@/lib/storage', () => ({
  StorageService: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    read: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    list: jest.fn(),
    exists: jest.fn(),
    clear: jest.fn(),
    backup: jest.fn(),
    restore: jest.fn(),
  })),
}));

describe('useStorage Hook', () => {
  const mockStorage = {
    create: jest.fn(),
    read: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    list: jest.fn(),
    exists: jest.fn(),
    clear: jest.fn(),
    backup: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementation
    const { StorageService } = require('@/lib/storage');
    StorageService.mockImplementation(() => mockStorage);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useStorage<User>('users'));
    
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isValidating).toBe(false);
  });

  it('should create new item successfully', async () => {
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockStorage.create.mockResolvedValue(mockUser);
    
    const { result } = renderHook(() => useStorage<User>('users'));
    
    await act(async () => {
      await result.current.create(mockUser);
    });
    
    expect(mockStorage.create).toHaveBeenCalledWith(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('should handle create errors', async () => {
    const error = new Error('Storage full');
    mockStorage.create.mockRejectedValue(error);
    
    const { result } = renderHook(() => useStorage<User>('users'));
    
    await act(async () => {
      try {
        await result.current.create({} as User);
      } catch (e) {
        // Expected to throw
      }
    });
    
    expect(result.current.error).toBe(error);
  });

  it('should read item by id', async () => {
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockStorage.read.mockResolvedValue(mockUser);
    
    const { result } = renderHook(() => useStorage<User>('users'));
    
    await act(async () => {
      const user = await result.current.read('1');
      expect(user).toEqual(mockUser);
    });
    
    expect(mockStorage.read).toHaveBeenCalledWith('1');
  });

  it('should update item successfully', async () => {
    const updatedUser: User = {
      id: '1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockStorage.update.mockResolvedValue(updatedUser);
    
    const { result } = renderHook(() => useStorage<User>('users'));
    
    await act(async () => {
      await result.current.update('1', updatedUser);
    });
    
    expect(mockStorage.update).toHaveBeenCalledWith('1', updatedUser);
  });

  it('should delete item successfully', async () => {
    mockStorage.delete.mockResolvedValue(true);
    
    const { result } = renderHook(() => useStorage<User>('users'));
    
    await act(async () => {
      const success = await result.current.delete('1');
      expect(success).toBe(true);
    });
    
    expect(mockStorage.delete).toHaveBeenCalledWith('1');
  });

  it('should list all items', async () => {
    const mockUsers: User[] = [
      { id: '1', name: 'John', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'Jane', email: 'jane@example.com', createdAt: new Date(), updatedAt: new Date() }
    ];
    
    mockStorage.list.mockResolvedValue(mockUsers);
    
    const { result } = renderHook(() => useStorage<User>('users'));
    
    await act(async () => {
      const users = await result.current.list();
      expect(users).toEqual(mockUsers);
    });
    
    expect(mockStorage.list).toHaveBeenCalled();
  });

  it('should check if item exists', async () => {
    mockStorage.exists.mockResolvedValue(true);
    
    const { result } = renderHook(() => useStorage<User>('users'));
    
    await act(async () => {
      const exists = await result.current.exists('1');
      expect(exists).toBe(true);
    });
    
    expect(mockStorage.exists).toHaveBeenCalledWith('1');
  });

  it('should clear all items', async () => {
    mockStorage.clear.mockResolvedValue(true);
    
    const { result } = renderHook(() => useStorage<User>('users'));
    
    await act(async () => {
      const success = await result.current.clear();
      expect(success).toBe(true);
    });
    
    expect(mockStorage.clear).toHaveBeenCalled();
  });

  it('should handle loading states', async () => {
    let resolvePromise: (value: User) => void;
    const promise = new Promise<User>((resolve) => {
      resolvePromise = resolve;
    });
    
    mockStorage.read.mockReturnValue(promise);
    
    const { result } = renderHook(() => useStorage<User>('users'));
    
    // Start loading
    act(() => {
      result.current.read('1');
    });
    
    expect(result.current.isLoading).toBe(true);
    
    // Complete loading
    await act(async () => {
      resolvePromise!({
        id: '1',
        name: 'John',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await promise;
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle validation states', async () => {
    mockStorage.list.mockResolvedValue([]);
    
    const { result } = renderHook(() => 
      useStorage<User>('users', { autoValidate: true })
    );
    
    await act(async () => {
      await result.current.revalidate();
    });
    
    expect(result.current.isValidating).toBe(false);
  });

  it('should support optimistic updates', async () => {
    const mockUser: User = {
      id: '1',
      name: 'John',
      email: 'john@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockStorage.update.mockResolvedValue(mockUser);
    
    const { result } = renderHook(() => 
      useStorage<User>('users', { optimistic: true })
    );
    
    await act(async () => {
      await result.current.update('1', mockUser);
    });
    
    expect(result.current.data).toEqual(mockUser);
  });

  it('should handle retry on failure', async () => {
    mockStorage.read
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue({ id: '1', name: 'John' } as User);
    
    const { result } = renderHook(() => 
      useStorage<User>('users', { retryAttempts: 2 })
    );
    
    await act(async () => {
      await result.current.read('1');
    });
    
    expect(mockStorage.read).toHaveBeenCalledTimes(2);
  });

  it('should support caching', async () => {
    const mockUser: User = {
      id: '1',
      name: 'John',
      email: 'john@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockStorage.read.mockResolvedValue(mockUser);
    
    const { result } = renderHook(() => 
      useStorage<User>('users', { cache: true, cacheTTL: 5000 })
    );
    
    // First read
    await act(async () => {
      await result.current.read('1');
    });
    
    // Second read (should use cache)
    await act(async () => {
      await result.current.read('1');
    });
    
    expect(mockStorage.read).toHaveBeenCalledTimes(1);
  });

  it('should handle concurrent operations', async () => {
    const mockUsers: User[] = [
      { id: '1', name: 'John', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() }
    ];
    
    mockStorage.list.mockResolvedValue(mockUsers);
    mockStorage.create.mockResolvedValue(mockUsers[0]);
    
    const { result } = renderHook(() => useStorage<User>('users'));
    
    await act(async () => {
      // Execute multiple operations concurrently
      await Promise.all([
        result.current.list(),
        result.current.create(mockUsers[0]),
        result.current.exists('1')
      ]);
    });
    
    expect(mockStorage.list).toHaveBeenCalled();
    expect(mockStorage.create).toHaveBeenCalled();
    expect(mockStorage.exists).toHaveBeenCalled();
  });

  it('should support pagination', async () => {
    const mockUsers: User[] = Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    mockStorage.list.mockResolvedValue(mockUsers.slice(0, 10));
    
    const { result } = renderHook(() => useStorage<User>('users'));
    
    await act(async () => {
      const page1 = await result.current.list({ offset: 0, limit: 10 });
      expect(page1).toHaveLength(10);
    });
  });

  it('should support filtering and sorting', async () => {
    const mockUsers: User[] = [
      { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'Bob', email: 'bob@example.com', createdAt: new Date(), updatedAt: new Date() }
    ];
    
    mockStorage.list.mockResolvedValue(mockUsers);
    
    const { result } = renderHook(() => useStorage<User>('users'));
    
    await act(async () => {
      await result.current.list({ 
        filter: { name: 'Alice' },
        sort: { field: 'name', order: 'asc' }
      });
    });
    
    expect(mockStorage.list).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { name: 'Alice' },
        sort: { field: 'name', order: 'asc' }
      })
    );
  });

  it('should handle backup operations', async () => {
    const backupData = { users: [], workouts: [] };
    mockStorage.backup.mockResolvedValue(backupData);
    
    const { result } = renderHook(() => useStorage<User>('users'));
    
    await act(async () => {
      const backup = await result.current.backup();
      expect(backup).toEqual(backupData);
    });
    
    expect(mockStorage.backup).toHaveBeenCalled();
  });

  it('should handle restore operations', async () => {
    const restoreData = { users: [], workouts: [] };
    mockStorage.restore.mockResolvedValue(true);
    
    const { result } = renderHook(() => useStorage<User>('users'));
    
    await act(async () => {
      const success = await result.current.restore(restoreData);
      expect(success).toBe(true);
    });
    
    expect(mockStorage.restore).toHaveBeenCalledWith(restoreData);
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useStorage<User>('users'));
    
    expect(() => unmount()).not.toThrow();
  });

  it('should handle subscription to data changes', async () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => 
      useStorage<User>('users', { onDataChange: mockCallback })
    );
    
    const mockUser: User = {
      id: '1',
      name: 'John',
      email: 'john@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockStorage.create.mockResolvedValue(mockUser);
    
    await act(async () => {
      await result.current.create(mockUser);
    });
    
    expect(mockCallback).toHaveBeenCalledWith(mockUser, 'create');
  });

  it('should handle offline mode', async () => {
    const { result } = renderHook(() => 
      useStorage<User>('users', { offlineMode: true })
    );
    
    // Mock offline scenario
    mockStorage.read.mockRejectedValue(new Error('Network unavailable'));
    
    await act(async () => {
      try {
        await result.current.read('1');
      } catch (error) {
        expect(error.message).toBe('Network unavailable');
      }
    });
    
    expect(result.current.isOffline).toBe(true);
  });
});