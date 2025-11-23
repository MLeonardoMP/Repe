'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkoutSession, Exercise, Set } from '@/types';
import { MinimalSetForm } from './MinimalSetForm';

interface WorkoutCreationFlowProps {
  onWorkoutCreate: (workout: WorkoutSession) => void;
  onCancel?: () => void;
}

export function WorkoutCreationFlow({ onWorkoutCreate, onCancel }: WorkoutCreationFlowProps) {
  const [step, setStep] = useState<'workout' | 'exercises' | 'sets'>('workout');
  const [workoutData, setWorkoutData] = useState<Partial<WorkoutSession>>({
    name: '',
    notes: '',
  });
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Partial<Exercise>>({
    name: '',
    category: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWorkoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutData.name?.trim()) return;
    setStep('exercises');
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentExercise.name?.trim()) return;

    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      name: currentExercise.name,
      category: currentExercise.category || 'General',
      notes: currentExercise.notes,
      sessionId: 'temp',
      sets: [],
      order: exercises.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setExercises([...exercises, newExercise]);
    setCurrentExercise({ name: '', category: '', notes: '' });
  };

  const handleAddSet = (exerciseId: string, setData: Partial<Set>) => {
    const newSet: Set = {
      id: `set-${Date.now()}`,
      exerciseId,
      weight: setData.weight,
      repetitions: setData.repetitions || 0,
      intensity: setData.intensity,
      notes: setData.notes,
      isCompleted: true,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: [...ex.sets, newSet] }
        : ex
    ));
  };

  const handleCreateWorkout = async () => {
    if (!workoutData.name) return;

    setIsSubmitting(true);
    try {
      const workout: WorkoutSession = {
        id: `workout-${Date.now()}`,
        name: workoutData.name,
        userId: 'user-1',
        startTime: new Date().toISOString(),
        endTime: undefined,
        notes: workoutData.notes,
        exercises,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onWorkoutCreate(workout);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'workout') {
    return (
      <Card className="bg-black border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Create New Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWorkoutSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Workout Name
              </label>
              <Input
                type="text"
                value={workoutData.name || ''}
                onChange={(e) => setWorkoutData({ ...workoutData, name: e.target.value })}
                placeholder="Enter workout name"
                className="bg-neutral-900 border-neutral-700 text-white"
                data-testid="workout-name-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Notes (optional)
              </label>
              <Input
                type="text"
                value={workoutData.notes || ''}
                onChange={(e) => setWorkoutData({ ...workoutData, notes: e.target.value })}
                placeholder="Add workout notes"
                className="bg-neutral-900 border-neutral-700 text-white"
                data-testid="workout-notes-input"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                type="submit"
                className="flex-1 bg-white hover:bg-neutral-200 text-black"
                data-testid="next-button"
              >
                Next: Add Exercises
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                  data-testid="cancel-button"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (step === 'exercises') {
    return (
      <div className="space-y-4">
        <Card className="bg-black border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Add Exercises</CardTitle>
            <p className="text-neutral-400 text-sm">
              Workout: {workoutData.name}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Exercise Name
                </label>
                <Input
                  type="text"
                  value={currentExercise.name || ''}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                  placeholder="Enter exercise name"
                  className="bg-neutral-900 border-neutral-700 text-white"
                  data-testid="exercise-name-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Category
                </label>
                <Input
                  type="text"
                  value={currentExercise.category || ''}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, category: e.target.value })}
                  placeholder="e.g., Chest, Back, Legs"
                  className="bg-neutral-900 border-neutral-700 text-white"
                  data-testid="exercise-category-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Notes (optional)
                </label>
                <Input
                  type="text"
                  value={currentExercise.notes || ''}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, notes: e.target.value })}
                  placeholder="Add exercise notes"
                  className="bg-neutral-900 border-neutral-700 text-white"
                  data-testid="exercise-notes-input"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-white hover:bg-neutral-200 text-black"
                data-testid="add-exercise-button"
              >
                Add Exercise
              </Button>
            </form>
          </CardContent>
        </Card>

        {exercises.length > 0 && (
          <Card className="bg-black border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Added Exercises ({exercises.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="p-3 bg-neutral-900 rounded-lg border border-neutral-700"
                    data-testid={`exercise-item-${index}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium">{exercise.name}</h4>
                        <p className="text-neutral-400 text-sm">{exercise.category}</p>
                        {exercise.notes && (
                          <p className="text-neutral-300 text-sm mt-1">{exercise.notes}</p>
                        )}
                      </div>
                      <span className="text-xs text-neutral-500">
                        {exercise.sets.length} sets
                      </span>
                    </div>

                    <div className="mt-2">
                      <MinimalSetForm
                        onSave={(setData) => handleAddSet(exercise.id, setData)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-2">
          <Button
            onClick={() => setStep('workout')}
            variant="outline"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            data-testid="back-button"
          >
            Back
          </Button>
          <Button
            onClick={handleCreateWorkout}
            disabled={exercises.length === 0 || isSubmitting}
            className="flex-1 bg-white hover:bg-neutral-200 text-black disabled:opacity-50"
            data-testid="create-workout-button"
          >
            {isSubmitting ? 'Creating...' : 'Create Workout'}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

export default WorkoutCreationFlow;