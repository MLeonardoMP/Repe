/**
 * useWorkoutHistory Hook
 * Custom hook for managing workout history operations
 */

import { useState, useEffect, useCallback } from 'react';
import type { WorkoutSession } from '@/types/workout';

interface UseWorkoutHistoryOptions {
  limit?: number;
  userId?: string;
}

interface WorkoutHistoryState {
  workouts: WorkoutSession[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
}

interface WorkoutHistoryActions {
  loadWorkouts: (page?: number, search?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  searchWorkouts: (query: string) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  clearError: () => void;
}

export function useWorkoutHistory(options: UseWorkoutHistoryOptions = {}) {
  const { limit = 10, userId = 'default' } = options;

  const [state, setState] = useState<WorkoutHistoryState>({
    workouts: [],
    loading: false,
    error: null,
    hasMore: true,
    total: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [currentSearch, setCurrentSearch] = useState('');

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const loadWorkouts = useCallback(async (
    page: number = 1, 
    search: string = ''
  ): Promise<void> => {
    if (state.loading) return;

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        userId,
        ...(search && { search })
      });

      const response = await fetch(`/api/workouts?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load workouts');
      }

      const newWorkouts = data.data.workouts || [];
      
      setState(prev => ({
        ...prev,
        workouts: page === 1 ? newWorkouts : [...prev.workouts, ...newWorkouts],
        hasMore: newWorkouts.length === limit,
        total: data.data.total || 0,
        loading: false,
        error: null
      }));

      setCurrentPage(page);
      setCurrentSearch(search);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load workouts';
      setError(errorMessage);
    }
  }, [limit, userId, state.loading, setLoading, setError]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!state.hasMore || state.loading) return;
    
    await loadWorkouts(currentPage + 1, currentSearch);
  }, [state.hasMore, state.loading, currentPage, currentSearch, loadWorkouts]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadWorkouts(1, currentSearch);
  }, [loadWorkouts, currentSearch]);

  const searchWorkouts = useCallback(async (query: string): Promise<void> => {
    await loadWorkouts(1, query);
  }, [loadWorkouts]);

  const deleteWorkout = useCallback(async (workoutId: string): Promise<void> => {
    if (state.loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete workout');
      }

      // Remove the workout from state
      setState(prev => ({
        ...prev,
        workouts: prev.workouts.filter(workout => workout.id !== workoutId),
        total: Math.max(0, prev.total - 1),
        loading: false,
        error: null
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete workout';
      setError(errorMessage);
    }
  }, [state.loading, setLoading, setError]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Load initial workouts on mount
  useEffect(() => {
    loadWorkouts(1, '');
  }, [userId]); // Only re-run when userId changes

  const actions: WorkoutHistoryActions = {
    loadWorkouts,
    loadMore,
    refresh,
    searchWorkouts,
    deleteWorkout,
    clearError
  };

  return {
    ...state,
    ...actions,
    // Additional computed properties
    isEmpty: state.workouts.length === 0 && !state.loading,
    isSearching: currentSearch.length > 0,
    currentPage,
    currentSearch
  };
}

// Additional helper hooks for specific use cases
export function useWorkoutStats(workouts: WorkoutSession[]) {
  return {
    totalWorkouts: workouts.length,
    completedWorkouts: workouts.filter(w => w.endTime).length,
    activeWorkouts: workouts.filter(w => !w.endTime).length,
    totalExercises: workouts.reduce((sum, w) => sum + w.exercises.length, 0),
    totalSets: workouts.reduce((sum, w) => 
      sum + w.exercises.reduce((exSum, ex) => exSum + ex.sets.length, 0), 0
    ),
    averageWorkoutDuration: (() => {
      const completedWorkouts = workouts.filter(w => w.endTime);
      if (completedWorkouts.length === 0) return 0;
      
      const totalDuration = completedWorkouts.reduce((sum, w) => {
        if (w.endTime) {
          return sum + (new Date(w.endTime).getTime() - new Date(w.startTime).getTime());
        }
        return sum;
      }, 0);
      
      return totalDuration / completedWorkouts.length;
    })()
  };
}

export default useWorkoutHistory;