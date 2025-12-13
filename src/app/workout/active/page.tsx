'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { SmartSetInput } from '@/components/workout/SmartSetInput';
import { useWorkout, type Exercise } from '@/hooks/use-workout';

// Dynamic import of ExercisePickerComponent
const ExercisePickerComponent = dynamic(
  () => import('@/components/workout/ExercisePickerDialog').then(mod => ({ default: mod.ExercisePickerComponent })),
  { ssr: false }
);

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const { activeWorkout, isActive, isLoading, addExercise: addExerciseToWorkout, addSet: addSetToWorkout, finishWorkout: finishActiveWorkout } = useWorkout();
  
  const [pageLoading, setPageLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  
  // Dialog states
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [expandedSetFormExerciseId, setExpandedSetFormExerciseId] = useState<string | null>(null);
  const [initialSetValues, setInitialSetValues] = useState<{ reps: number; weight: number }>({ reps: 10, weight: 0 });
  
  // Redirect if no active workout after hook has finished loading
  useEffect(() => {
    console.log('[ActivePage] Effect triggered - isLoading:', isLoading, 'isActive:', isActive, 'activeWorkout:', activeWorkout);
    if (!isLoading) {
      if (!isActive) {
        console.log('[ActivePage] No active workout, redirecting to home');
        router.push('/');
      } else {
        console.log('[ActivePage] Active workout found, staying on page');
      }
      setPageLoading(false);
    }
  }, [isActive, isLoading, activeWorkout, router]);
  
  // Update workout duration every second
  useEffect(() => {
    if (!activeWorkout?.startTime || activeWorkout.endTime) return;

    const interval = setInterval(() => {
      const start = new Date(activeWorkout.startTime).getTime();
      const now = Date.now();
      setWorkoutDuration(Math.floor((now - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout?.startTime, activeWorkout?.endTime]);

  const handleAddExercise = async (exerciseName: string) => {
    if (!activeWorkout) return;
    
    try {
      const newExercise: Exercise = {
        id: Math.random().toString(36).substr(2, 9),
        name: exerciseName,
        sets: [],
        restTime: 60,
      };
      await addExerciseToWorkout(newExercise);
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  const handleAddSet = async (exerciseId: string, reps: number, weight?: number) => {
    if (!activeWorkout) return;
    
    try {
      const newSet = {
        id: Math.random().toString(36).substr(2, 9),
        reps: reps,
        weight: weight && weight > 0 ? weight : 0,
        completed: false,
        restTime: 60,
      };
      await addSetToWorkout(exerciseId, newSet);
    } catch (error) {
      console.error('Error adding set:', error);
    }
  };

  const handleAddSetClick = (exerciseId: string) => {
    if (!activeWorkout) return;
    
    const exercise = activeWorkout.exercises.find(e => e.id === exerciseId);
    if (exercise && exercise.sets.length > 0) {
      // Get the last set
      const lastSet = exercise.sets[exercise.sets.length - 1];
      // Handle potential different property names (reps vs repetitions) just in case
      const lastReps = (lastSet as any).reps ?? (lastSet as any).repetitions ?? 10;
      const lastWeight = lastSet.weight ?? 0;
      
      setInitialSetValues({ reps: lastReps, weight: lastWeight });
    } else {
      // Default values if no previous sets
      setInitialSetValues({ reps: 10, weight: 0 });
    }

    setExpandedSetFormExerciseId(exerciseId);
  };

  const handleSetConfirm = (reps: number, weight?: number) => {
    if (expandedSetFormExerciseId) {
      handleAddSet(expandedSetFormExerciseId, reps, weight);
      setExpandedSetFormExerciseId(null);
    }
  };

  const handleSetCancel = () => {
    setExpandedSetFormExerciseId(null);
  };

  const handleFinishWorkout = () => {
    if (!activeWorkout || isFinishing) return;
    setIsFinishDialogOpen(true);
  };

  const confirmFinishWorkout = async () => {
    if (!activeWorkout) return;
    
    setIsFinishDialogOpen(false);
    setIsFinishing(true);
    try {
      await finishActiveWorkout();
      router.push(`/workout/${activeWorkout.id}`);
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

  if (pageLoading) {
    return (
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-800 rounded w-3/4"></div>
            <div className="h-20 bg-neutral-800 rounded"></div>
            <div className="h-32 bg-neutral-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeWorkout) {
    return (
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-neutral-400">No active workout</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Go to Home
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
              className="text-neutral-400 hover:text-white p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{activeWorkout.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-white text-black border-white">
                  Active
                </Badge>
                <span className="text-sm text-neutral-400">
                  {formatTime(workoutDuration)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-black border-neutral-800">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-white">{activeWorkout.exercises.length}</div>
                <div className="text-xs text-neutral-400">Exercises</div>
              </CardContent>
            </Card>
            <Card className="bg-black border-neutral-800">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {activeWorkout.exercises.reduce((total, ex) => total + ex.sets.length, 0)}
                </div>
                <div className="text-xs text-neutral-400">Sets</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          {activeWorkout.exercises.map((exercise) => (
            <div key={exercise.id} className="space-y-3">
              <ExerciseCard
                exercise={exercise as any}
                onEditExercise={() => {}}
                onAddSet={() => handleAddSetClick(exercise.id)}
                onEditSet={() => {}}
                onDeleteSet={() => {}}
              />
              
              {/* Inline Set Form */}
              {expandedSetFormExerciseId === exercise.id && (
                <SmartSetInput
                  initialReps={initialSetValues.reps}
                  initialWeight={initialSetValues.weight}
                  onConfirm={handleSetConfirm}
                  onCancel={handleSetCancel}
                />
              )}
            </div>
          ))}
        </div>

        {/* Add Exercise */}
        {isExercisePickerOpen ? (
          <ExercisePickerComponent
            onClose={() => setIsExercisePickerOpen(false)}
            onSelect={(name) => {
              handleAddExercise(name);
              setIsExercisePickerOpen(false);
            }}
          />
        ) : (
          <Card className="bg-black border-neutral-800">
            <CardContent className="p-4">
              <Button
                variant="ghost"
                onClick={() => setIsExercisePickerOpen(true)}
                className="w-full text-white hover:text-neutral-300 hover:bg-neutral-900 border border-dashed border-neutral-800 py-8"
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
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleFinishWorkout}
            disabled={isFinishing}
            className="w-full h-12 bg-white hover:bg-neutral-200 text-black text-lg font-medium"
          >
            {isFinishing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Finishing...
              </div>
            ) : (
              'Finish Workout'
            )}
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="w-full text-neutral-400 hover:text-white"
          >
            Save & Exit
          </Button>
        </div>
      </div>

      <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Finish Workout</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to finish this workout?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsFinishDialogOpen(false)}
              className="flex-1 sm:flex-none border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmFinishWorkout}
              className="flex-1 sm:flex-none bg-white text-black hover:bg-neutral-200"
            >
              Finish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
