/**
 * Set types for workout tracking application
 * Based on data model specification
 */

export interface Set {
  id: string;              // Unique identifier within exercise
  exerciseId: string;      // Foreign key to Exercise
  startTime?: string;      // ISO date string when set started
  endTime?: string;        // ISO date string when set ended
  weight?: number;         // Weight used (in user's preferred unit)
  repetitions?: number;    // Number of repetitions completed
  intensity?: number;      // Subjective intensity (1-5 or 1-10 scale)
  notes?: string;          // Optional set notes
  order: number;           // Display order within exercise
  isCompleted: boolean;    // Whether set was completed
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
}

// Set statistics interface for computed values
export interface SetStats {
  duration?: number;       // Duration in milliseconds (endTime - startTime)
  volume?: number;         // Weight * repetitions
  restTime?: number;       // Time between this set and next set start
  pace?: number;           // Repetitions per minute (if duration available)
}

// Set creation type (without auto-generated fields)
export type CreateSetData = Omit<Set, 'id' | 'createdAt' | 'updatedAt'>;

// Set update type (partial data)
export type UpdateSetData = Partial<Omit<Set, 'id' | 'exerciseId' | 'createdAt' | 'updatedAt'>>;

// Type guards and validation functions
export function isSetCompleted(set: Set): boolean {
  return set.isCompleted;
}

export function isSetTimed(set: Set): boolean {
  return !!(set.startTime && set.endTime);
}

export function hasSetWeight(set: Set): boolean {
  return set.weight !== undefined && set.weight > 0;
}

export function hasSetReps(set: Set): boolean {
  return set.repetitions !== undefined && set.repetitions > 0;
}

export function isValidIntensity(intensity: number, scale: 1 | 5 | 10): boolean {
  if (scale === 1) return intensity === 1;
  if (scale === 5) return intensity >= 1 && intensity <= 5;
  if (scale === 10) return intensity >= 1 && intensity <= 10;
  return false;
}

// Utility functions for set calculations
export function calculateSetDuration(set: Set): number | undefined {
  if (!set.startTime || !set.endTime) {
    return undefined;
  }
  return new Date(set.endTime).getTime() - new Date(set.startTime).getTime();
}

export function calculateSetVolume(set: Set): number | undefined {
  if (!hasSetWeight(set) || !hasSetReps(set)) {
    return undefined;
  }
  return set.weight! * set.repetitions!;
}

export function calculateSetPace(set: Set): number | undefined {
  const duration = calculateSetDuration(set);
  if (!duration || !hasSetReps(set)) {
    return undefined;
  }
  // Convert to reps per minute
  return (set.repetitions! * 60 * 1000) / duration;
}

export function calculateRestTime(currentSet: Set, nextSet: Set): number | undefined {
  if (!currentSet.endTime || !nextSet.startTime) {
    return undefined;
  }
  return new Date(nextSet.startTime).getTime() - new Date(currentSet.endTime).getTime();
}

// Get comprehensive set statistics
export function getSetStats(set: Set, nextSet?: Set): SetStats {
  const stats: SetStats = {};

  stats.duration = calculateSetDuration(set);
  stats.volume = calculateSetVolume(set);
  stats.pace = calculateSetPace(set);
  
  if (nextSet) {
    stats.restTime = calculateRestTime(set, nextSet);
  }

  return stats;
}

// Set state types
export type SetState = 'created' | 'in_progress' | 'completed' | 'skipped';

export function getSetState(set: Set): SetState {
  if (set.isCompleted) {
    return 'completed';
  }
  if (set.startTime && !set.endTime) {
    return 'in_progress';
  }
  if (set.startTime && set.endTime && !set.isCompleted) {
    return 'skipped';
  }
  return 'created';
}

// Default values for new sets
export const DEFAULT_SET_ORDER = 1;
export const DEFAULT_SET_COMPLETED = false;