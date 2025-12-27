import { useState, useCallback, useEffect, useMemo } from 'react';
import type { WorkoutSession, Exercise, Set } from '@/types';
import { isValidUUID } from '@/lib/validation';

export interface WorkoutTemplate {
  name: string;
  exercises: Exercise[];
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalSets: number;
  totalReps: number;
  totalWeight: number;
  averageDuration: number;
}

export const ACTIVE_WORKOUT_STORAGE_KEY = 'repe-active-workout';

export interface UseWorkoutReturn {
  // Current state
  activeWorkout: WorkoutSession | null;
  isActive: boolean;
  isLoading: boolean;
  currentExercise: Exercise | null;
  workoutHistory: WorkoutSession[];
  stats: WorkoutStats;
  
  // Workout management
  startWorkout: (template: WorkoutTemplate) => Promise<WorkoutSession>;
  pauseWorkout: () => Promise<void>;
  resumeWorkout: () => Promise<void>;
  finishWorkout: () => Promise<void>;
  
  // Exercise management
  addExercise: (exercise: Exercise) => Promise<void>;
  removeExercise: (exerciseId: string) => Promise<void>;
  selectExercise: (exercise: Exercise) => void;
  
  // Set management
  addSet: (exerciseId: string, set: Set) => Promise<void>;
  updateSet: (exerciseId: string, setId: string, set: Set) => Promise<void>;
  removeSet: (exerciseId: string, setId: string) => Promise<void>;
  
  // Template management
  saveTemplate: (template: WorkoutTemplate) => Promise<void>;
  
  // History management
  loadWorkoutHistory: () => Promise<void>;
  
  // Testing utility (internal)
  setActiveWorkout?: (workout: WorkoutSession | null) => void;
}

export function useWorkout(): UseWorkoutReturn {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildId = useCallback(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `workout-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const stored = localStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);
    if (stored) {
      try {
        setActiveWorkout(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse stored workout', error);
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (activeWorkout) {
      try {
        localStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, JSON.stringify(activeWorkout));
      } catch (error) {
        console.error('Failed to persist workout', error);
      }
    } else {
      localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
    }
  }, [activeWorkout]);

  const startWorkout = useCallback(async (template: WorkoutTemplate) => {
    const workout: WorkoutSession = {
      id: buildId(),
      userId: 'user-1',
      name: template.name,
      exercises: template.exercises,
      startTime: new Date().toISOString(),
      status: 'active',
      durationSeconds: 0,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActiveWorkout(workout);
    return workout;
  }, [buildId]);

  const pauseWorkout = useCallback(async () => {
    if (!activeWorkout) return;
    setActiveWorkout({ ...activeWorkout, status: 'paused' });
  }, [activeWorkout]);

  const resumeWorkout = useCallback(async () => {
    if (!activeWorkout) return;
    setActiveWorkout({ ...activeWorkout, status: 'active' });
  }, [activeWorkout]);

  const finishWorkout = useCallback(async () => {
    if (!activeWorkout) return;

    const endTime = new Date().toISOString();
    const durationSeconds = Math.max(
      0,
      Math.floor(
        (new Date(endTime).getTime() - new Date(activeWorkout.startTime).getTime()) / 1000
      )
    );

    const completed: WorkoutSession = {
      ...activeWorkout,
      endTime,
      status: 'completed',
      durationSeconds,
      updatedAt: endTime,
    };

    try {
      // Persist workout, exercises, and sets so detail view can render
      let workoutIdForHistory: string | undefined = undefined;
      try {
        const workoutResponse = await fetch('/api/workouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: isValidUUID(completed.id) ? completed.id : undefined,
            name: completed.name || 'Workout',
            userId: completed.userId,
            createdAt: completed.startTime,
            updatedAt: endTime,
            exercises: completed.exercises.map((ex, index) => ({
              name: ex.name,
              orderIndex: index,
            })),
          }),
        });

        if (workoutResponse.ok) {
          const workout = await workoutResponse.json();
          workoutIdForHistory = workout.id;

          // Save completed sets for each exercise
          for (const exercise of completed.exercises) {
            // Find the matching workout exercise from the response
            const workoutExercise = workout.exercises?.find(
              (we: { exercise: { name: string } }) => 
                we.exercise.name.toLowerCase() === exercise.name.toLowerCase()
            );

            if (workoutExercise && exercise.sets && exercise.sets.length > 0) {
              // Save each completed set
              for (const set of exercise.sets) {
                const reps = set.repetitions ?? (set as { reps?: number }).reps ?? 0;
                if (reps > 0) {
                  try {
                    await fetch(`/api/exercises/${workoutExercise.id}/sets`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        reps,
                        weight: set.weight ?? 0,
                      }),
                    });
                  } catch (setError) {
                    console.error('Error saving set:', setError);
                  }
                }
              }
            }
          }
        } else {
          console.error('Failed to persist workout before history', workoutResponse.status);
        }
      } catch (workoutError) {
        console.error('Error persisting workout before history', workoutError);
      }

      const payload = {
        workoutId: workoutIdForHistory || (isValidUUID(completed.id) ? completed.id : undefined),
        performedAt: completed.startTime,
        durationSeconds,
        notes: completed.notes,
      };

      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to log history', error);
    }

    setWorkoutHistory(prev => [completed, ...prev]);
    setActiveWorkout(null);
  }, [activeWorkout]);

  const addExercise = useCallback(async (exercise: Exercise) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      updatedAt: new Date().toISOString(),
      exercises: [...activeWorkout.exercises, exercise],
    });
  }, [activeWorkout]);

  const removeExercise = useCallback(async (exerciseId: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      updatedAt: new Date().toISOString(),
      exercises: activeWorkout.exercises.filter(ex => ex.id !== exerciseId),
    });
  }, [activeWorkout]);

  const selectExercise = useCallback((exercise: Exercise) => {
    setCurrentExercise(exercise);
  }, []);

  const addSet = useCallback(async (exerciseId: string, set: Set) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      updatedAt: new Date().toISOString(),
      exercises: activeWorkout.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, sets: [...ex.sets, set] } : ex
      ),
    });
  }, [activeWorkout]);

  const updateSet = useCallback(async (exerciseId: string, setId: string, set: Set) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      updatedAt: new Date().toISOString(),
      exercises: activeWorkout.exercises.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.map(s => (s.id === setId ? set : s)) }
          : ex
      ),
    });
  }, [activeWorkout]);

  const removeSet = useCallback(async (exerciseId: string, setId: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      updatedAt: new Date().toISOString(),
      exercises: activeWorkout.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) } : ex
      ),
    });
  }, [activeWorkout]);

  const saveTemplate = useCallback(async () => {
    // No-op placeholder after removing legacy storage
    return Promise.resolve();
  }, []);

  const loadWorkoutHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/history', { cache: 'no-store' });
      if (!response.ok) return;
      const payload = await response.json();
      if (Array.isArray(payload.data)) {
        type HistoryItem = {
          id: string;
          userId?: string;
          workoutName?: string;
          performedAt: string;
          durationSeconds?: number;
          notes?: string;
        };

        const mapped: WorkoutSession[] = (payload.data as HistoryItem[]).map((entry) => ({
          id: entry.id,
          userId: entry.userId || 'user-1',
          name: entry.workoutName || 'Workout',
          startTime: entry.performedAt,
          endTime: entry.performedAt,
          exercises: [],
          notes: entry.notes,
          createdAt: entry.performedAt,
          updatedAt: entry.performedAt,
          durationSeconds: entry.durationSeconds,
          status: 'completed',
        }));
        setWorkoutHistory(mapped);
      }
    } catch (error) {
      console.error('Failed to load history', error);
    }
  }, []);

  const stats: WorkoutStats = useMemo(() => ({
    totalWorkouts: workoutHistory.length,
    totalSets: workoutHistory.reduce(
      (total, workout) => total + workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0),
      0
    ),
    totalReps: workoutHistory.reduce(
      (total, workout) => total + workout.exercises.reduce(
        (exerciseTotal, exercise) => exerciseTotal + exercise.sets.reduce((setTotal, set) => setTotal + (set.repetitions ?? 0), 0),
        0
      ),
      0
    ),
    totalWeight: workoutHistory.reduce(
      (total, workout) => total + workout.exercises.reduce(
        (exerciseTotal, exercise) => exerciseTotal + exercise.sets.reduce((setTotal, set) => setTotal + (set.weight ?? 0), 0),
        0
      ),
      0
    ),
    averageDuration: workoutHistory.length > 0
      ? workoutHistory.reduce((total, workout) => total + (workout.durationSeconds ?? 0), 0) / workoutHistory.length
      : 0,
  }), [workoutHistory]);

  return {
    activeWorkout,
    isActive: activeWorkout?.status === 'active',
    isLoading,
    currentExercise,
    workoutHistory,
    stats,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    finishWorkout,
    addExercise,
    removeExercise,
    selectExercise,
    addSet,
    updateSet,
    removeSet,
    saveTemplate,
    loadWorkoutHistory,
    setActiveWorkout,
  };
}