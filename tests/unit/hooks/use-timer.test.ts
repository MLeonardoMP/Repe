/**
 * useTimer Hook Unit Tests
 * Tests for timer functionality with rest periods and workout timing
 */

import { renderHook, act } from '@testing-library/react';
import { useTimer } from '@/hooks/use-timer';

// Mock requestAnimationFrame and performance.now for testing
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Mock performance.now
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
  },
  writable: true
});

describe('useTimer Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic Timer Functionality', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useTimer());
      
      expect(result.current.time).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.mode).toBe('stopwatch');
      expect(result.current.laps).toEqual([]);
    });

    it('should start timer in stopwatch mode', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it('should pause running timer', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        result.current.pause();
      });
      
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(true);
    });

    it('should resume paused timer', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        result.current.pause();
      });
      
      act(() => {
        result.current.resume();
      });
      
      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it('should stop and reset timer', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      // Let some time pass
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      act(() => {
        result.current.stop();
      });
      
      expect(result.current.time).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);
    });

    it('should reset timer to initial state', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.time).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.laps).toEqual([]);
    });
  });

  describe('Countdown Timer', () => {
    it('should initialize countdown with specified duration', () => {
      const { result } = renderHook(() => useTimer({ 
        mode: 'countdown', 
        initialTime: 60000 
      }));
      
      expect(result.current.time).toBe(60000);
      expect(result.current.mode).toBe('countdown');
    });

    it('should countdown from initial time', () => {
      const { result } = renderHook(() => useTimer({ 
        mode: 'countdown', 
        initialTime: 10000 
      }));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(result.current.time).toBeLessThan(10000);
    });

    it('should stop at zero and call onComplete', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => useTimer({ 
        mode: 'countdown', 
        initialTime: 1000,
        onComplete 
      }));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        jest.advanceTimersByTime(1100);
      });
      
      expect(result.current.time).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(onComplete).toHaveBeenCalled();
    });

    it('should handle countdown reset properly', () => {
      const { result } = renderHook(() => useTimer({ 
        mode: 'countdown', 
        initialTime: 30000 
      }));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.time).toBe(30000);
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('Lap Functionality', () => {
    it('should record laps during stopwatch', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      act(() => {
        result.current.lap();
      });
      
      expect(result.current.laps).toHaveLength(1);
      expect(result.current.laps[0]).toBeGreaterThan(0);
    });

    it('should record multiple laps', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      act(() => {
        result.current.lap();
      });
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      act(() => {
        result.current.lap();
      });
      
      expect(result.current.laps).toHaveLength(2);
      expect(result.current.laps[1]).toBeGreaterThan(result.current.laps[0]);
    });

    it('should clear laps on reset', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      act(() => {
        result.current.lap();
      });
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.laps).toEqual([]);
    });
  });

  describe('Rest Timer Integration', () => {
    it('should start rest timer with specified duration', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.startRestTimer(90000); // 90 seconds
      });
      
      expect(result.current.mode).toBe('countdown');
      expect(result.current.time).toBe(90000);
      expect(result.current.isRunning).toBe(true);
    });

    it('should call callback when rest timer completes', () => {
      const onRestComplete = jest.fn();
      const { result } = renderHook(() => useTimer({ onRestComplete }));
      
      act(() => {
        result.current.startRestTimer(1000);
      });
      
      act(() => {
        jest.advanceTimersByTime(1100);
      });
      
      expect(onRestComplete).toHaveBeenCalled();
    });

    it('should cancel rest timer', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.startRestTimer(30000);
      });
      
      act(() => {
        result.current.cancelRestTimer();
      });
      
      expect(result.current.isRunning).toBe(false);
      expect(result.current.time).toBe(0);
      expect(result.current.mode).toBe('stopwatch');
    });
  });

  describe('Time Formatting', () => {
    it('should format time as MM:SS', () => {
      const { result } = renderHook(() => useTimer());
      
      expect(result.current.formattedTime).toBe('00:00');
      
      act(() => {
        (result.current as any).setTime(65000); // 1:05
      });
      
      expect(result.current.formattedTime).toBe('01:05');
    });

    it('should format time as HH:MM:SS for longer durations', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        (result.current as any).setTime(3665000); // 1:01:05
      });
      
      expect(result.current.formattedTime).toBe('1:01:05');
    });

    it('should handle milliseconds display', () => {
      const { result } = renderHook(() => useTimer({ showMilliseconds: true }));
      
      act(() => {
        (result.current as any).setTime(1500); // 1.5 seconds
      });
      
      expect(result.current.formattedTime).toBe('00:01.5');
    });
  });

  describe('Timer Configuration', () => {
    it('should initialize with custom configuration', () => {
      const config = {
        mode: 'countdown' as const,
        initialTime: 180000,
        autoStart: true,
        showMilliseconds: true
      };
      
      const { result } = renderHook(() => useTimer(config));
      
      expect(result.current.time).toBe(180000);
      expect(result.current.mode).toBe('countdown');
      expect(result.current.isRunning).toBe(true);
    });

    it('should update timer configuration', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.configure({
          mode: 'countdown',
          initialTime: 120000
        });
      });
      
      expect(result.current.mode).toBe('countdown');
      expect(result.current.time).toBe(120000);
    });
  });

  describe('Timer Persistence', () => {
    it('should save timer state', () => {
      const { result } = renderHook(() => useTimer());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      const state = result.current.getState();
      
      expect(state).toMatchObject({
        time: expect.any(Number),
        isRunning: true,
        mode: 'stopwatch'
      });
    });

    it('should restore timer state', () => {
      const { result } = renderHook(() => useTimer());
      
      const savedState = {
        time: 10000,
        isRunning: false,
        isPaused: true,
        mode: 'stopwatch' as const,
        laps: [5000]
      };
      
      act(() => {
        result.current.setState(savedState);
      });
      
      expect(result.current.time).toBe(10000);
      expect(result.current.isPaused).toBe(true);
      expect(result.current.laps).toEqual([5000]);
    });
  });

  describe('Timer Events', () => {
    it('should trigger onTick callback', () => {
      const onTick = jest.fn();
      const { result } = renderHook(() => useTimer({ onTick }));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(onTick).toHaveBeenCalled();
    });

    it('should trigger onStart callback', () => {
      const onStart = jest.fn();
      const { result } = renderHook(() => useTimer({ onStart }));
      
      act(() => {
        result.current.start();
      });
      
      expect(onStart).toHaveBeenCalled();
    });

    it('should trigger onPause callback', () => {
      const onPause = jest.fn();
      const { result } = renderHook(() => useTimer({ onPause }));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        result.current.pause();
      });
      
      expect(onPause).toHaveBeenCalled();
    });

    it('should trigger onStop callback', () => {
      const onStop = jest.fn();
      const { result } = renderHook(() => useTimer({ onStop }));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        result.current.stop();
      });
      
      expect(onStop).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid initial time', () => {
      const { result } = renderHook(() => useTimer({ 
        mode: 'countdown',
        initialTime: -1000 
      }));
      
      expect(result.current.time).toBe(0);
    });

    it('should handle timer cleanup on unmount', () => {
      const { unmount } = renderHook(() => useTimer());
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should throttle time updates appropriately', () => {
      const onTick = jest.fn();
      const { result } = renderHook(() => useTimer({ onTick }));
      
      act(() => {
        result.current.start();
      });
      
      // Advance time by 100ms (less than typical refresh rate)
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // Should not update too frequently
      expect(onTick).toHaveBeenCalledTimes(1);
    });

    it('should cleanup intervals on component unmount', () => {
      const { result, unmount } = renderHook(() => useTimer());
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      act(() => {
        result.current.start();
      });
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      clearIntervalSpy.mockRestore();
    });
  });
});