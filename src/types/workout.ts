/**
 * WorkoutSession types for workout tracking application
 * Based on data model specification
 */

import { Exercise } from './exercise';

export interface WorkoutSession {
  id: string;              // Unique identifier (UUID)
  userId: string;          // Foreign key to User
  name?: string;           // Optional session name
  startTime: string;       // ISO date string when session started
  endTime?: string;        // ISO date string when session ended
  exercises: Exercise[];   // Array of exercises performed
  notes?: string;          // Optional session notes
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
  status?: WorkoutSessionState; // Optional runtime status for UI
  durationSeconds?: number;     // Optional computed duration
}

// Derived properties interface for computed values
export interface WorkoutSessionStats {
  duration?: number;       // Duration in milliseconds (endTime - startTime)
  exerciseCount: number;   // Number of exercises
  setCount: number;        // Total number of sets across all exercises
  isCompleted: boolean;    // Whether the session has an endTime
  isActive: boolean;       // Whether the session is currently in progress
}

// State transitions for workout session
export type WorkoutSessionState = 'created' | 'active' | 'completed' | 'archived' | 'paused';

// Session creation type (without auto-generated fields)
export type CreateWorkoutSessionData = Omit<WorkoutSession, 'id' | 'exercises' | 'createdAt' | 'updatedAt'>;

// Session update type (partial data)
export type UpdateWorkoutSessionData = Partial<Pick<WorkoutSession, 'name' | 'endTime' | 'notes'>>;

// Type guards for runtime validation
export function isWorkoutSessionCompleted(session: WorkoutSession): boolean {
  return !!session.endTime;
}

export function isWorkoutSessionActive(session: WorkoutSession): boolean {
  return !!session.startTime && !session.endTime;
}

// Utility function to calculate session duration
export function calculateSessionDuration(session: WorkoutSession): number | undefined {
  if (!session.startTime || !session.endTime) {
    return undefined;
  }
  return new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
}

// Utility function to get session statistics
export function getWorkoutSessionStats(session: WorkoutSession): WorkoutSessionStats {
  const setCount = session.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  
  return {
    duration: calculateSessionDuration(session),
    exerciseCount: session.exercises.length,
    setCount,
    isCompleted: isWorkoutSessionCompleted(session),
    isActive: isWorkoutSessionActive(session),
  };
}