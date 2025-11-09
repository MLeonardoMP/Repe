import { useState, useCallback, useEffect } from 'react';
import { useStorage } from './use-storage';

// Types based on test expectations
export interface WorkoutSession {
  id: string;
  userId: string;
  name: string;
  exercises: Exercise[];
  startTime: string;
  endTime?: string;
  status: 'active' | 'paused' | 'completed';
  duration: number;
  notes: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  restTime: number;
}

export interface Set {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
  restTime: number;
}

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
  const storage = useStorage<WorkoutSession>('workouts');
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load active workout on mount
  useEffect(() => {
    const loadActiveWorkout = async () => {
      try {
        console.log('[useWorkout] Loading active workout from storage...');
        const workouts = await storage.list();
        console.log('[useWorkout] All workouts:', workouts);
        const active = workouts.find(w => w.status === 'active');
        console.log('[useWorkout] Active workout found:', active);
        if (active) {
          setActiveWorkout(active);
        }
      } catch (error) {
        console.error('Error loading active workout:', error);
      } finally {
        console.log('[useWorkout] Loading finished, setting isLoading to false');
        setIsLoading(false);
      }
    };
    loadActiveWorkout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount
  
  const startWorkout = useCallback(async (template: WorkoutTemplate) => {
    console.log('[useWorkout] Starting new workout with template:', template);
    const newWorkout: Omit<WorkoutSession, 'id'> = {
      userId: 'user-1', // Default user for now
      name: template.name,
      exercises: template.exercises,
      startTime: new Date().toISOString(),
      status: 'active',
      duration: 0,
      notes: '',
    };
    
    console.log('[useWorkout] Creating workout in storage:', newWorkout);
    const createdWorkout = await storage.create(newWorkout);
    console.log('[useWorkout] Workout created:', createdWorkout);
    setActiveWorkout(createdWorkout);
    console.log('[useWorkout] Active workout state updated');
    return createdWorkout;
  }, [storage]);

  const pauseWorkout = useCallback(async () => {
    if (!activeWorkout) return;
    
    const updatedWorkout = await storage.update(activeWorkout.id, {
      status: 'paused',
    });
    
    setActiveWorkout(updatedWorkout);
  }, [activeWorkout, storage]);

  const resumeWorkout = useCallback(async () => {
    if (!activeWorkout) return;
    
    const updatedWorkout = await storage.update(activeWorkout.id, {
      status: 'active',
    });
    
    setActiveWorkout(updatedWorkout);
  }, [activeWorkout, storage]);

  const finishWorkout = useCallback(async () => {
    if (!activeWorkout) return;
    
    await storage.update(activeWorkout.id, {
      status: 'completed',
      endTime: new Date().toISOString(),
    });
    
    setActiveWorkout(null);
  }, [activeWorkout, storage]);

  const addExercise = useCallback(async (exercise: Exercise) => {
    if (!activeWorkout) return;
    
    const updatedExercises = [...activeWorkout.exercises, exercise];
    
    await storage.update(activeWorkout.id, {
      exercises: updatedExercises,
    });
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises,
    });
  }, [activeWorkout, storage]);

  const removeExercise = useCallback(async (exerciseId: string) => {
    if (!activeWorkout) return;
    
    const updatedExercises = activeWorkout.exercises.filter(ex => ex.id !== exerciseId);
    
    await storage.update(activeWorkout.id, {
      exercises: updatedExercises,
    });
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises,
    });
  }, [activeWorkout, storage]);

  const selectExercise = useCallback((exercise: Exercise) => {
    setCurrentExercise(exercise);
  }, []);

  const addSet = useCallback(async (exerciseId: string, set: Set) => {
    if (!activeWorkout) return;
    
    const updatedExercises = activeWorkout.exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: [...ex.sets, set] }
        : ex
    );
    
    await storage.update(activeWorkout.id, {
      exercises: updatedExercises,
    });
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises,
    });
  }, [activeWorkout, storage]);

  const updateSet = useCallback(async (exerciseId: string, setId: string, set: Set) => {
    if (!activeWorkout) return;
    
    const updatedExercises = activeWorkout.exercises.map(ex =>
      ex.id === exerciseId
        ? {
            ...ex,
            sets: ex.sets.map(s => s.id === setId ? set : s)
          }
        : ex
    );
    
    await storage.update(activeWorkout.id, {
      exercises: updatedExercises,
    });
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises,
    });
  }, [activeWorkout, storage]);

  const removeSet = useCallback(async (exerciseId: string, setId: string) => {
    if (!activeWorkout) return;
    
    const updatedExercises = activeWorkout.exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) }
        : ex
    );
    
    await storage.update(activeWorkout.id, {
      exercises: updatedExercises,
    });
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises,
    });
  }, [activeWorkout, storage]);

  const saveTemplate = useCallback(async (template: WorkoutTemplate) => {
    const templateWorkout: Omit<WorkoutSession, 'id'> = {
      userId: 'user-1',
      name: template.name,
      exercises: template.exercises,
      startTime: new Date().toISOString(),
      status: 'completed',
      duration: 0,
      notes: '',
      isTemplate: true,
    } as unknown as WorkoutSession; // TypeScript workaround for isTemplate
    
    await storage.create(templateWorkout);
  }, [storage]);

  const loadWorkoutHistory = useCallback(async () => {
    const history = await storage.list();
    setWorkoutHistory(history);
  }, [storage]);

  // Calculate stats from workout history
  const stats: WorkoutStats = {
    totalWorkouts: workoutHistory.length,
    totalSets: workoutHistory.reduce((total, workout) => 
      total + workout.exercises.reduce((exerciseTotal, exercise) => 
        exerciseTotal + exercise.sets.length, 0
      ), 0
    ),
    totalReps: workoutHistory.reduce((total, workout) => 
      total + workout.exercises.reduce((exerciseTotal, exercise) => 
        exerciseTotal + exercise.sets.reduce((setTotal, set) => 
          setTotal + set.reps, 0
        ), 0
      ), 0
    ),
    totalWeight: workoutHistory.reduce((total, workout) => 
      total + workout.exercises.reduce((exerciseTotal, exercise) => 
        exerciseTotal + exercise.sets.reduce((setTotal, set) => 
          setTotal + set.weight, 0
        ), 0
      ), 0
    ),
    averageDuration: workoutHistory.length > 0 
      ? workoutHistory.reduce((total, workout) => total + workout.duration, 0) / workoutHistory.length
      : 0,
  };

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