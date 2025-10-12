/**
 * Exercise types for workout tracking application
 * Based on data model specification
 */

import { Set } from './set';

export interface Exercise {
  id: string;              // Unique identifier within session
  sessionId: string;       // Foreign key to WorkoutSession
  name: string;            // Exercise name (e.g., "Bench Press")
  category?: string;       // Optional category (e.g., "Chest", "Legs")
  sets: Set[];            // Array of sets performed
  notes?: string;          // Optional exercise notes
  order: number;           // Display order within session
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
}

// Exercise template interface for common exercises
export interface ExerciseTemplate {
  id: string;
  name: string;
  category: string;
  defaultWeightUnit: 'kg' | 'lbs';
}

// Exercise statistics interface
export interface ExerciseStats {
  setCount: number;
  totalWeight?: number;      // Sum of all weights used
  totalReps?: number;        // Sum of all repetitions
  averageIntensity?: number; // Average intensity across sets
  duration?: number;         // Total time spent on exercise
  personalBest?: {
    maxWeight?: number;
    maxReps?: number;
    maxVolume?: number;      // weight * reps
  };
}

// Exercise creation type (without auto-generated fields)
export type CreateExerciseData = Omit<Exercise, 'id' | 'sets' | 'createdAt' | 'updatedAt'>;

// Exercise update type (partial data)
export type UpdateExerciseData = Partial<Pick<Exercise, 'name' | 'category' | 'notes' | 'order'>>;

// Type guards and utilities
export function isExerciseCompleted(exercise: Exercise): boolean {
  return exercise.sets.length > 0 && exercise.sets.some(set => set.isCompleted);
}

export function calculateExerciseStats(exercise: Exercise): ExerciseStats {
  const completedSets = exercise.sets.filter(set => set.isCompleted);
  
  const stats: ExerciseStats = {
    setCount: completedSets.length,
  };

  if (completedSets.length > 0) {
    // Calculate totals
    const weights = completedSets.map(set => set.weight).filter((w): w is number => w !== undefined);
    const reps = completedSets.map(set => set.repetitions).filter((r): r is number => r !== undefined);
    const intensities = completedSets.map(set => set.intensity).filter((i): i is number => i !== undefined);

    if (weights.length > 0) {
      stats.totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      stats.personalBest = {
        ...stats.personalBest,
        maxWeight: Math.max(...weights),
      };
    }

    if (reps.length > 0) {
      stats.totalReps = reps.reduce((sum, rep) => sum + rep, 0);
      stats.personalBest = {
        ...stats.personalBest,
        maxReps: Math.max(...reps),
      };
    }

    if (intensities.length > 0) {
      stats.averageIntensity = intensities.reduce((sum, intensity) => sum + intensity, 0) / intensities.length;
    }

    // Calculate volume (weight * reps) for sets that have both
    const volumes = completedSets
      .filter(set => set.weight !== undefined && set.repetitions !== undefined)
      .map(set => set.weight! * set.repetitions!);
    
    if (volumes.length > 0) {
      stats.personalBest = {
        ...stats.personalBest,
        maxVolume: Math.max(...volumes),
      };
    }

    // Calculate duration
    const durations = completedSets
      .map(set => {
        if (set.startTime && set.endTime) {
          return new Date(set.endTime).getTime() - new Date(set.startTime).getTime();
        }
        return null;
      })
      .filter((d): d is number => d !== null);

    if (durations.length > 0) {
      stats.duration = durations.reduce((sum, duration) => sum + duration, 0);
    }
  }

  return stats;
}

// Common exercise categories
export const EXERCISE_CATEGORIES = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Cardio',
  'Full Body',
  'Other',
] as const;

export type ExerciseCategory = typeof EXERCISE_CATEGORIES[number];