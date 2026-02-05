'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { SmartSetInput } from '@/components/workout/SmartSetInput';
import { useWorkout } from '@/hooks/use-workout';
import type { Exercise } from '@/types';
import { ArrowLeft, Plus, Check, Clock, Dumbbell, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const ExercisePickerComponent = dynamic(
  () =>
    import('@/components/workout/ExercisePickerDialog').then((mod) => ({
      default: mod.ExercisePickerComponent,
    })),
  { ssr: false }
);

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const {
    activeWorkout,
    isActive,
    isLoading,
    addExercise: addExerciseToWorkout,
    addSet: addSetToWorkout,
    finishWorkout: finishActiveWorkout,
  } = useWorkout();

  const [pageLoading, setPageLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(0);

  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [expandedSetFormExerciseId, setExpandedSetFormExerciseId] = useState<string | null>(null);
  const [initialSetValues, setInitialSetValues] = useState<{ reps: number; weight: number }>({
    reps: 10,
    weight: 0,
  });

  useEffect(() => {
    if (!isLoading) {
      if (!isActive) {
        router.push('/');
      }
      setPageLoading(false);
    }
  }, [isActive, isLoading, activeWorkout, router]);

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
        sessionId: activeWorkout.id,
        name: exerciseName,
        sets: [],
        restTime: 60,
        order: activeWorkout.exercises.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
        exerciseId,
        repetitions: reps,
        weight: weight && weight > 0 ? weight : 0,
        intensity: undefined,
        notes: undefined,
        order: activeWorkout.exercises.find((ex) => ex.id === exerciseId)?.sets.length || 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addSetToWorkout(exerciseId, newSet);
    } catch (error) {
      console.error('Error adding set:', error);
    }
  };

  const handleAddSetClick = (exerciseId: string) => {
    if (!activeWorkout) return;

    const exercise = activeWorkout.exercises.find((e) => e.id === exerciseId);
    if (exercise && exercise.sets.length > 0) {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const repsFromSet =
        (typeof lastSet.repetitions === 'number' ? lastSet.repetitions : undefined) ??
        (typeof (lastSet as { reps?: number }).reps === 'number'
          ? (lastSet as { reps?: number }).reps
          : undefined);
      const lastReps = repsFromSet ?? 10;
      const lastWeight = lastSet.weight ?? 0;

      setInitialSetValues({ reps: lastReps, weight: lastWeight });
    } else {
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

  const normalizeExerciseForCard = (exercise: Exercise, index: number): Exercise => {
    const now = new Date().toISOString();

    return {
      ...exercise,
      sessionId: exercise.sessionId ?? activeWorkout?.id ?? 'session',
      order: exercise.order ?? index,
      createdAt: exercise.createdAt ?? now,
      updatedAt: exercise.updatedAt ?? now,
      sets: exercise.sets.map((set, setIndex) => ({
        ...set,
        exerciseId: set.exerciseId ?? exercise.id,
        repetitions:
          set.repetitions ??
          (typeof (set as { reps?: number }).reps === 'number'
            ? (set as { reps?: number }).reps
            : undefined),
        order: set.order ?? setIndex,
        isCompleted: set.isCompleted ?? false,
        createdAt: set.createdAt ?? now,
        updatedAt: set.updatedAt ?? now,
      })),
    };
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando entrenamiento...</p>
        </div>
      </div>
    );
  }

  if (!activeWorkout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No hay entrenamiento activo</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-6 text-background font-medium transition-colors hover:bg-foreground/90"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  const totalSets = activeWorkout.exercises.reduce((total, ex) => total + ex.sets.length, 0);

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center h-9 w-9 rounded-full border border-border bg-card transition-colors hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <div>
                <h1 className="font-semibold text-foreground truncate max-w-[180px] sm:max-w-none">
                  {activeWorkout.name}
                </h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                    </span>
                    Activo
                  </span>
                  <span>·</span>
                  <span className="number-display">{formatTime(workoutDuration)}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleFinishWorkout}
              disabled={isFinishing}
              className="flex items-center gap-2 h-9 px-4 rounded-full bg-foreground text-background text-sm font-medium transition-all hover:bg-foreground/90 disabled:opacity-50"
            >
              {isFinishing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Finalizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold number-display">{formatTime(workoutDuration)}</p>
            <p className="text-xs text-muted-foreground">Duracion</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="rounded-xl border border-border bg-card p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold number-display">{activeWorkout.exercises.length}</p>
            <p className="text-xs text-muted-foreground">Ejercicios</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold number-display">{totalSets}</p>
            <p className="text-xs text-muted-foreground">Series</p>
          </motion.div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="max-w-2xl mx-auto px-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {activeWorkout.exercises.map((exercise, index) => {
            const normalizedExercise = normalizeExerciseForCard(exercise, index);
            return (
              <motion.div
                key={exercise.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="space-y-3"
              >
                <ExerciseCard
                  exercise={normalizedExercise}
                  onEditExercise={() => {}}
                  onAddSet={() => handleAddSetClick(exercise.id)}
                  onEditSet={() => {}}
                  onDeleteSet={() => {}}
                />

                {expandedSetFormExerciseId === exercise.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <SmartSetInput
                      initialReps={initialSetValues.reps}
                      initialWeight={initialSetValues.weight}
                      onConfirm={handleSetConfirm}
                      onCancel={handleSetCancel}
                    />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add Exercise Button */}
        {isExercisePickerOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ExercisePickerComponent
              onClose={() => setIsExercisePickerOpen(false)}
              onSelect={(name) => {
                handleAddExercise(name);
                setIsExercisePickerOpen(false);
              }}
            />
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setIsExercisePickerOpen(true)}
            className="group w-full rounded-xl border-2 border-dashed border-border bg-card/50 p-8 text-center transition-all duration-300 hover:border-accent/50 hover:bg-card"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary transition-colors group-hover:bg-accent group-hover:border-accent">
                <Plus className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-accent-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                Agregar ejercicio
              </span>
            </div>
          </motion.button>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex-1 h-12 rounded-xl border border-border bg-card font-medium transition-colors hover:bg-secondary"
          >
            Guardar y salir
          </button>
          <button
            onClick={handleFinishWorkout}
            disabled={isFinishing}
            className={cn(
              'flex-1 h-12 rounded-xl bg-foreground text-background font-medium transition-all',
              'hover:bg-foreground/90 disabled:opacity-50',
              'flex items-center justify-center gap-2'
            )}
          >
            {isFinishing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Finalizando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Finalizar entrenamiento
              </>
            )}
          </button>
        </div>
      </div>

      {/* Finish Dialog */}
      <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Finalizar entrenamiento</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Has completado {activeWorkout.exercises.length} ejercicios y {totalSets} series en{' '}
              {formatTime(workoutDuration)}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-2">
            <button
              onClick={() => setIsFinishDialogOpen(false)}
              className="flex-1 sm:flex-none h-10 px-4 rounded-lg border border-border bg-card font-medium transition-colors hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={confirmFinishWorkout}
              className="flex-1 sm:flex-none h-10 px-4 rounded-lg bg-foreground text-background font-medium transition-colors hover:bg-foreground/90"
            >
              Finalizar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
