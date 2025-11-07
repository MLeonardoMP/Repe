'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { ExercisePickerDialog } from '@/components/workout/ExercisePickerDialog';
import { QuickSetDialog } from '@/components/workout/QuickSetDialog';
import type { WorkoutSession } from '@/types/workout';
import type { Exercise } from '@/types/exercise';
import type { Set } from '@/types/set';

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workoutId = searchParams.get('id');
  
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  
  // Dialog states
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [isQuickSetDialogOpen, setIsQuickSetDialogOpen] = useState(false);
  const [currentExerciseIdForSet, setCurrentExerciseIdForSet] = useState<string | null>(null);
  
  // Update workout duration every second
  useEffect(() => {
    if (!workout?.startTime || workout.endTime) return;

    const interval = setInterval(() => {
      const start = new Date(workout.startTime).getTime();
      const now = Date.now();
      setWorkoutDuration(Math.floor((now - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [workout?.startTime, workout?.endTime]);

  // Load workout data
  const loadWorkout = useCallback(async () => {
    if (!workoutId) {
      router.push('/');
      return;
    }

    try {
      const response = await fetch(`/api/workouts/${workoutId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkout(data.data);
        
        // Calculate initial duration
        if (data.data.startTime && !data.data.endTime) {
          const startTime = new Date(data.data.startTime);
          const elapsed = Date.now() - startTime.getTime();
          setWorkoutDuration(Math.floor(elapsed / 1000));
        }
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading workout:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [workoutId, router]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  const addExercise = async (exerciseName: string) => {
    if (!workout) return;

    try {
      const newExercise = {
        sessionId: workout.id,
        name: exerciseName,
        order: workout.exercises.length,
        category: 'strength',
        notes: ''
      };

      const response = await fetch(`/api/workouts/${workout.id}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExercise),
      });

      if (response.ok) {
        const data = await response.json();
        setWorkout(prev => prev ? {
          ...prev,
          exercises: [...prev.exercises, data.data]
        } : null);
      }
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  const addSet = async (exerciseId: string, reps: number, weight?: number) => {
    if (!workout) return;

    try {
      const setData = {
        order: workout.exercises.find(e => e.id === exerciseId)?.sets.length || 0,
        repetitions: reps,
        weight: weight && weight > 0 ? weight : undefined,
        isCompleted: true,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString()
      };

      const response = await fetch(`/api/workouts/${workout.id}/exercises/${exerciseId}/sets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...setData,
          exerciseId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWorkout(prev => {
          if (!prev) return null;
          return {
            ...prev,
            exercises: prev.exercises.map(ex =>
              ex.id === exerciseId
                ? { ...ex, sets: [...ex.sets, data.data] }
                : ex
            )
          };
        });
      }
    } catch (error) {
      console.error('Error adding set:', error);
    }
  };

  const handleAddSetClick = (exerciseId: string) => {
    setCurrentExerciseIdForSet(exerciseId);
    setIsQuickSetDialogOpen(true);
  };

  const handleSetConfirm = (reps: number, weight?: number) => {
    if (currentExerciseIdForSet) {
      addSet(currentExerciseIdForSet, reps, weight);
    }
  };

  const finishWorkout = async () => {
    if (!workout || isFinishing) return;

    const confirmed = window.confirm('Are you ready to finish this workout?');
    if (!confirmed) return;

    setIsFinishing(true);
    try {
      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endTime: new Date().toISOString()
        }),
      });

      if (response.ok) {
        router.push(`/workout/${workout.id}`);
      }
    } catch (error) {
      console.error('Error finishing workout:', error);
    } finally {
      setIsFinishing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-3/4"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-gray-400">Workout not found</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{workout.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="success" className="bg-green-900 text-green-300">
                  Active
                </Badge>
                <span className="text-sm text-gray-400">
                  {formatTime(workoutDuration)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-white">{workout.exercises.length}</div>
                <div className="text-xs text-gray-400">Exercises</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)}
                </div>
                <div className="text-xs text-gray-400">Sets</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {workout.exercises.reduce((total, ex) => 
                    total + ex.sets.filter(set => set.isCompleted).length, 0
                  )}
                </div>
                <div className="text-xs text-gray-400">Completed</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          {workout.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onEditExercise={() => setActiveExerciseId(exercise.id)}
              onAddSet={() => handleAddSetClick(exercise.id)}
              onEditSet={() => {}}
              onDeleteSet={() => {}}
            />
          ))}
        </div>

        {/* Add Exercise */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              onClick={() => setIsExercisePickerOpen(true)}
              className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 border border-dashed border-gray-600 py-8"
            >
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                </svg>
                <div>Add Exercise</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={finishWorkout}
            disabled={isFinishing}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-lg"
          >
            {isFinishing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Finishing...
              </div>
            ) : (
              'Finish Workout'
            )}
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="w-full text-gray-400 hover:text-white"
          >
            Save & Exit
          </Button>
        </div>

        {/* Dialogs */}
        <ExercisePickerDialog
          open={isExercisePickerOpen}
          onClose={() => setIsExercisePickerOpen(false)}
          onSelect={(name) => {
            addExercise(name);
            setIsExercisePickerOpen(false);
          }}
        />

        <QuickSetDialog
          open={isQuickSetDialogOpen}
          onClose={() => setIsQuickSetDialogOpen(false)}
          onConfirm={handleSetConfirm}
        />
      </div>
    </div>
  );
}