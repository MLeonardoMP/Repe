'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { QuickSetForm } from '@/components/workout/QuickSetForm';
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
  const [workoutDuration, setWorkoutDuration] = useState(0);
  
  // Dialog states
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [expandedSetFormExerciseId, setExpandedSetFormExerciseId] = useState<string | null>(null);
  
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
        repetitions: reps,
        weight: weight && weight > 0 ? weight : undefined,
        completed: false,
        restTime: 60,
      };
      await addSetToWorkout(exerciseId, newSet);
    } catch (error) {
      console.error('Error adding set:', error);
    }
  };

  const handleAddSetClick = (exerciseId: string) => {
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

  const handleFinishWorkout = async () => {
    if (!activeWorkout || isFinishing) return;

    const confirmed = window.confirm('¿Listo para terminar este entrenamiento?');
    if (!confirmed) return;

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
            <div className="h-8 bg-gray-700 rounded w-3/4"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeWorkout) {
    return (
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-gray-400">No hay entrenamiento activo</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Ir al inicio
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
              <h1 className="text-2xl font-bold text-white">{activeWorkout.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="success" className="bg-green-900 text-green-300">
                  Activo
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
                <div className="text-lg font-bold text-white">{activeWorkout.exercises.length}</div>
                <div className="text-xs text-gray-400">Ejercicios</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {activeWorkout.exercises.reduce((total, ex) => total + ex.sets.length, 0)}
                </div>
                <div className="text-xs text-gray-400">Series</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {activeWorkout.exercises.reduce((total, ex) => 
                    total + ex.sets.filter(set => set.completed).length, 0
                  )}
                </div>
                <div className="text-xs text-gray-400">Completas</div>
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
                <QuickSetForm
                  exerciseName={exercise.name}
                  onConfirm={handleSetConfirm}
                  onCancel={handleSetCancel}
                  autoFocus
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
                  <div>Agregar Ejercicio</div>
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
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-lg"
          >
            {isFinishing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Finalizando...
              </div>
            ) : (
              'Finalizar Entrenamiento'
            )}
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="w-full text-gray-400 hover:text-white"
          >
            Guardar y Salir
          </Button>
        </div>
      </div>
    </div>
  );
}
