/**
 * useWorkout Hook Unit Tests
 * Tests for workout management hook with session state and exercise tracking
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useWorkout } from '@/hooks/use-workout';
import type { WorkoutSession, Exercise, Set } from '@/types';

// Mock the storage hook
jest.mock('@/hooks/use-storage', () => ({
  useStorage: jest.fn(() => ({
    create: jest.fn(),
    read: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    list: jest.fn(),
  })),
}));

describe('useWorkout Hook', () => {
  const mockStorage = {
    create: jest.fn(),
    read: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    list: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { useStorage } = require('@/hooks/use-storage');
    useStorage.mockReturnValue(mockStorage);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWorkout());
    
    expect(result.current.activeWorkout).toBeNull();
    expect(result.current.isActive).toBe(false);
    expect(result.current.currentExercise).toBeNull();
    expect(result.current.workoutHistory).toEqual([]);
    expect(result.current.stats).toEqual({
      totalWorkouts: 0,
      totalSets: 0,
      totalReps: 0,
      totalWeight: 0,
      averageDuration: 0
    });
  });

  it('should start a new workout', async () => {
    const { result } = renderHook(() => useWorkout());
    
    const workoutTemplate = {
      name: 'Push Day',
      exercises: [
        { id: '1', name: 'Bench Press', sets: [], restTime: 90 },
        { id: '2', name: 'Push Ups', sets: [], restTime: 60 }
      ]
    };
    
    const mockWorkout: WorkoutSession = {
      id: 'workout-1',
      userId: 'user-1',
      name: 'Push Day',
      exercises: workoutTemplate.exercises,
      startTime: new Date().toISOString(),
      status: 'active',
      duration: 0,
      notes: ''
    };
    
    mockStorage.create.mockResolvedValue(mockWorkout);
    
    await act(async () => {
      await result.current.startWorkout(workoutTemplate);
    });
    
    expect(result.current.activeWorkout).toEqual(mockWorkout);
    expect(result.current.isActive).toBe(true);
    expect(mockStorage.create).toHaveBeenCalled();
  });

  it('should pause active workout', async () => {
    const { result } = renderHook(() => useWorkout());
    
    // First start a workout
    const activeWorkout: WorkoutSession = {
      id: 'workout-1',
      userId: 'user-1',
      name: 'Push Day',
      exercises: [],
      startTime: new Date().toISOString(),
      status: 'active',
      duration: 300,
      notes: ''
    };
    
    const pausedWorkout = { ...activeWorkout, status: 'paused' as const };
    mockStorage.update.mockResolvedValue(pausedWorkout);
    
    // Set initial state
    act(() => {
      (result.current as any).setActiveWorkout(activeWorkout);
    });
    
    await act(async () => {
      await result.current.pauseWorkout();
    });
    
    expect(mockStorage.update).toHaveBeenCalledWith(
      'workout-1',
      expect.objectContaining({ status: 'paused' })
    );
  });

  it('should resume paused workout', async () => {
    const { result } = renderHook(() => useWorkout());
    
    const pausedWorkout: WorkoutSession = {
      id: 'workout-1',
      userId: 'user-1',
      name: 'Push Day',
      exercises: [],
      startTime: new Date().toISOString(),
      status: 'paused',
      duration: 300,
      notes: ''
    };
    
    const resumedWorkout = { ...pausedWorkout, status: 'active' as const };
    mockStorage.update.mockResolvedValue(resumedWorkout);
    
    act(() => {
      (result.current as any).setActiveWorkout(pausedWorkout);
    });
    
    await act(async () => {
      await result.current.resumeWorkout();
    });
    
    expect(mockStorage.update).toHaveBeenCalledWith(
      'workout-1',
      expect.objectContaining({ status: 'active' })
    );
  });

  it('should finish workout', async () => {
    const { result } = renderHook(() => useWorkout());
    
    const activeWorkout: WorkoutSession = {
      id: 'workout-1',
      userId: 'user-1',
      name: 'Push Day',
      exercises: [],
      startTime: new Date().toISOString(),
      status: 'active',
      duration: 1200,
      notes: ''
    };
    
    const finishedWorkout = { 
      ...activeWorkout, 
      status: 'completed' as const,
      endTime: new Date().toISOString()
    };
    
    mockStorage.update.mockResolvedValue(finishedWorkout);
    
    act(() => {
      (result.current as any).setActiveWorkout(activeWorkout);
    });
    
    await act(async () => {
      await result.current.finishWorkout();
    });
    
    expect(result.current.activeWorkout).toBeNull();
    expect(result.current.isActive).toBe(false);
    expect(mockStorage.update).toHaveBeenCalledWith(
      'workout-1',
      expect.objectContaining({ 
        status: 'completed',
        endTime: expect.any(String)
      })
    );
  });

  it('should add exercise to workout', async () => {
    const { result } = renderHook(() => useWorkout());
    
    const exercise: Exercise = {
      id: 'ex-1',
      name: 'Bench Press',
      sets: [],
      restTime: 90
    };
    
    const activeWorkout: WorkoutSession = {
      id: 'workout-1',
      userId: 'user-1',
      name: 'Push Day',
      exercises: [],
      startTime: new Date().toISOString(),
      status: 'active',
      duration: 0,
      notes: ''
    };
    
    const updatedWorkout = {
      ...activeWorkout,
      exercises: [exercise]
    };
    
    mockStorage.update.mockResolvedValue(updatedWorkout);
    
    act(() => {
      (result.current as any).setActiveWorkout(activeWorkout);
    });
    
    await act(async () => {
      await result.current.addExercise(exercise);
    });
    
    expect(mockStorage.update).toHaveBeenCalledWith(
      'workout-1',
      expect.objectContaining({
        exercises: [exercise]
      })
    );
  });

  it('should remove exercise from workout', async () => {
    const { result } = renderHook(() => useWorkout());
    
    const exercise: Exercise = {
      id: 'ex-1',
      name: 'Bench Press',
      sets: [],
      restTime: 90
    };
    
    const activeWorkout: WorkoutSession = {
      id: 'workout-1',
      userId: 'user-1',
      name: 'Push Day',
      exercises: [exercise],
      startTime: new Date().toISOString(),
      status: 'active',
      duration: 0,
      notes: ''
    };
    
    const updatedWorkout = {
      ...activeWorkout,
      exercises: []
    };
    
    mockStorage.update.mockResolvedValue(updatedWorkout);
    
    act(() => {
      (result.current as any).setActiveWorkout(activeWorkout);
    });
    
    await act(async () => {
      await result.current.removeExercise('ex-1');
    });
    
    expect(mockStorage.update).toHaveBeenCalledWith(
      'workout-1',
      expect.objectContaining({
        exercises: []
      })
    );
  });

  it('should add set to exercise', async () => {
    const { result } = renderHook(() => useWorkout());
    
    const set: Set = {
      id: 'set-1',
      reps: 12,
      weight: 100,
      completed: true,
      restTime: 90
    };
    
    const exercise: Exercise = {
      id: 'ex-1',
      name: 'Bench Press',
      sets: [],
      restTime: 90
    };
    
    const activeWorkout: WorkoutSession = {
      id: 'workout-1',
      userId: 'user-1',
      name: 'Push Day',
      exercises: [exercise],
      startTime: new Date().toISOString(),
      status: 'active',
      duration: 0,
      notes: ''
    };
    
    const updatedWorkout = {
      ...activeWorkout,
      exercises: [{
        ...exercise,
        sets: [set]
      }]
    };
    
    mockStorage.update.mockResolvedValue(updatedWorkout);
    
    act(() => {
      (result.current as any).setActiveWorkout(activeWorkout);
    });
    
    await act(async () => {
      await result.current.addSet('ex-1', set);
    });
    
    expect(mockStorage.update).toHaveBeenCalledWith(
      'workout-1',
      expect.objectContaining({
        exercises: expect.arrayContaining([
          expect.objectContaining({
            id: 'ex-1',
            sets: [set]
          })
        ])
      })
    );
  });

  it('should update set in exercise', async () => {
    const { result } = renderHook(() => useWorkout());
    
    const originalSet: Set = {
      id: 'set-1',
      reps: 10,
      weight: 90,
      completed: false,
      restTime: 90
    };
    
    const updatedSet: Set = {
      id: 'set-1',
      reps: 12,
      weight: 100,
      completed: true,
      restTime: 90
    };
    
    const exercise: Exercise = {
      id: 'ex-1',
      name: 'Bench Press',
      sets: [originalSet],
      restTime: 90
    };
    
    const activeWorkout: WorkoutSession = {
      id: 'workout-1',
      userId: 'user-1',
      name: 'Push Day',
      exercises: [exercise],
      startTime: new Date().toISOString(),
      status: 'active',
      duration: 0,
      notes: ''
    };
    
    mockStorage.update.mockResolvedValue({
      ...activeWorkout,
      exercises: [{
        ...exercise,
        sets: [updatedSet]
      }]
    });
    
    act(() => {
      (result.current as any).setActiveWorkout(activeWorkout);
    });
    
    await act(async () => {
      await result.current.updateSet('ex-1', 'set-1', updatedSet);
    });
    
    expect(mockStorage.update).toHaveBeenCalled();
  });

  it('should remove set from exercise', async () => {
    const { result } = renderHook(() => useWorkout());
    
    const set: Set = {
      id: 'set-1',
      reps: 12,
      weight: 100,
      completed: true,
      restTime: 90
    };
    
    const exercise: Exercise = {
      id: 'ex-1',
      name: 'Bench Press',
      sets: [set],
      restTime: 90
    };
    
    const activeWorkout: WorkoutSession = {
      id: 'workout-1',
      userId: 'user-1',
      name: 'Push Day',
      exercises: [exercise],
      startTime: new Date().toISOString(),
      status: 'active',
      duration: 0,
      notes: ''
    };
    
    mockStorage.update.mockResolvedValue({
      ...activeWorkout,
      exercises: [{
        ...exercise,
        sets: []
      }]
    });
    
    act(() => {
      (result.current as any).setActiveWorkout(activeWorkout);
    });
    
    await act(async () => {
      await result.current.removeSet('ex-1', 'set-1');
    });
    
    expect(mockStorage.update).toHaveBeenCalled();
  });

  it('should load workout history', async () => {
    const { result } = renderHook(() => useWorkout());
    
    const workoutHistory: WorkoutSession[] = [
      {
        id: 'workout-1',
        userId: 'user-1',
        name: 'Push Day',
        exercises: [],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
        status: 'completed',
        duration: 3600,
        notes: ''
      },
      {
        id: 'workout-2',
        userId: 'user-1',
        name: 'Pull Day',
        exercises: [],
        startTime: '2024-01-02T10:00:00Z',
        endTime: '2024-01-02T11:30:00Z',
        status: 'completed',
        duration: 5400,
        notes: ''
      }
    ];
    
    mockStorage.list.mockResolvedValue(workoutHistory);
    
    await act(async () => {
      await result.current.loadWorkoutHistory();
    });
    
    expect(result.current.workoutHistory).toEqual(workoutHistory);
    expect(mockStorage.list).toHaveBeenCalled();
  });

  it('should calculate workout statistics', async () => {
    const { result } = renderHook(() => useWorkout());
    
    const workoutHistory: WorkoutSession[] = [
      {
        id: 'workout-1',
        userId: 'user-1',
        name: 'Push Day',
        exercises: [
          {
            id: 'ex-1',
            name: 'Bench Press',
            sets: [
              { id: 'set-1', reps: 10, weight: 100, completed: true, restTime: 90 },
              { id: 'set-2', reps: 8, weight: 105, completed: true, restTime: 90 }
            ],
            restTime: 90
          }
        ],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
        status: 'completed',
        duration: 3600,
        notes: ''
      }
    ];
    
    mockStorage.list.mockResolvedValue(workoutHistory);
    
    await act(async () => {
      await result.current.loadWorkoutHistory();
    });
    
    const expectedStats = {
      totalWorkouts: 1,
      totalSets: 2,
      totalReps: 18,
      totalWeight: 205,
      averageDuration: 3600
    };
    
    expect(result.current.stats).toEqual(expectedStats);
  });

  it('should select current exercise', () => {
    const { result } = renderHook(() => useWorkout());
    
    const exercise: Exercise = {
      id: 'ex-1',
      name: 'Bench Press',
      sets: [],
      restTime: 90
    };
    
    act(() => {
      result.current.selectExercise(exercise);
    });
    
    expect(result.current.currentExercise).toEqual(exercise);
  });

  it('should handle workout templates', async () => {
    const { result } = renderHook(() => useWorkout());
    
    const template = {
      name: 'Push Day Template',
      exercises: [
        { id: '1', name: 'Bench Press', sets: [], restTime: 90 },
        { id: '2', name: 'Push Ups', sets: [], restTime: 60 }
      ]
    };
    
    await act(async () => {
      await result.current.saveTemplate(template);
    });
    
    expect(mockStorage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Push Day Template',
        isTemplate: true
      })
    );
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useWorkout());
    
    const error = new Error('Storage error');
    mockStorage.create.mockRejectedValue(error);
    
    await act(async () => {
      try {
        await result.current.startWorkout({ name: 'Test', exercises: [] });
      } catch (e) {
        expect(e).toBe(error);
      }
    });
    
    expect(result.current.activeWorkout).toBeNull();
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useWorkout());
    
    expect(() => unmount()).not.toThrow();
  });
});