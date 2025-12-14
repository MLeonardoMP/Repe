/**
 * Data Validation Utilities
 * Additional Zod schemas and validation helpers for workout data
 */

import { z } from 'zod';
import type { 
  User, 
  WorkoutSession, 
  Exercise, 
  ExerciseTemplate,
  Set 
} from '@/types';

// ========== Base Validation Schemas ==========

// Common field validations
const NonEmptyString = z.string().min(1, 'Field cannot be empty');
const ISODateString = z.string().refine(
  (val) => !isNaN(Date.parse(val)), 
  { message: "Must be a valid ISO date string" }
);

// Weight and measurement validations
const WeightSchema = z.number().min(0.1).max(1000, 'Weight must be between 0.1 and 1000');
const RepsSchema = z.number().int().min(1).max(999, 'Reps must be between 1 and 999');
const IntensitySchema = z.number().int().min(1).max(10, 'Intensity must be between 1 and 10');

// ========== User Validation Schemas ==========

export const UserPreferencesSchema = z.object({
  defaultWeightUnit: z.enum(['kg', 'lbs']),
  defaultIntensityScale: z.union([z.literal(1), z.literal(5), z.literal(10)]),
  theme: z.literal('dark')
});

export const UserSchema = z.object({
  id: NonEmptyString,
  name: z.string().optional(),
  preferences: UserPreferencesSchema,
  createdAt: ISODateString,
  updatedAt: ISODateString
});

export const CreateUserSchema = UserSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const UpdateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).partial();

// ========== Set Validation Schemas ==========

export const SetSchema = z.object({
  id: NonEmptyString,
  exerciseId: NonEmptyString,
  startTime: ISODateString.optional(),
  endTime: ISODateString.optional(),
  weight: WeightSchema.optional(),
  repetitions: RepsSchema.optional(),
  intensity: IntensitySchema.optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  order: z.number().int().min(0, 'Order must be a non-negative integer'),
  isCompleted: z.boolean().default(false),
  createdAt: ISODateString,
  updatedAt: ISODateString
}).refine((data) => {
  // At least one performance metric must be provided
  return data.repetitions || data.weight;
}, {
  message: "At least one performance metric (repetitions or weight) must be provided"
}).refine((data) => {
  // If both startTime and endTime are provided, endTime must be after startTime
  if (data.startTime && data.endTime) {
    return new Date(data.endTime) > new Date(data.startTime);
  }
  return true;
}, {
  message: "End time must be after start time"
});

export const CreateSetSchema = SetSchema.omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const UpdateSetSchema = SetSchema.omit({
  id: true,
  exerciseId: true,
  createdAt: true,
  updatedAt: true
}).partial();

// ========== Exercise Validation Schemas ==========

export const ExerciseSchema = z.object({
  id: NonEmptyString,
  sessionId: NonEmptyString,
  name: NonEmptyString.max(100, 'Exercise name cannot exceed 100 characters'),
  category: z.string().max(50, 'Category cannot exceed 50 characters').optional(),
  sets: z.array(SetSchema).default([]),
  notes: z.string().max(1000, 'Exercise notes cannot exceed 1000 characters').optional(),
  order: z.number().int().min(0, 'Order must be a non-negative integer'),
  createdAt: ISODateString,
  updatedAt: ISODateString
});

export const CreateExerciseSchema = ExerciseSchema.omit({ 
  id: true, 
  sets: true,
  createdAt: true, 
  updatedAt: true 
});

export const UpdateExerciseSchema = ExerciseSchema.omit({
  id: true,
  sessionId: true,
  sets: true,
  createdAt: true,
  updatedAt: true
}).partial();

// ========== Exercise Template Validation Schemas ==========

export const ExerciseTemplateSchema = z.object({
  id: NonEmptyString,
  name: NonEmptyString.max(100, 'Template name cannot exceed 100 characters'),
  category: NonEmptyString.max(50, 'Category cannot exceed 50 characters'),
  defaultWeightUnit: z.enum(['kg', 'lbs'])
});

export const CreateExerciseTemplateSchema = ExerciseTemplateSchema.omit({ id: true });

export const UpdateExerciseTemplateSchema = ExerciseTemplateSchema.omit({ id: true }).partial();

// ========== Workout Session Validation Schemas ==========

export const WorkoutSessionSchema = z.object({
  id: NonEmptyString,
  userId: NonEmptyString,
  name: z.string().max(100, 'Workout name cannot exceed 100 characters').optional(),
  startTime: ISODateString,
  endTime: ISODateString.optional(),
  exercises: z.array(ExerciseSchema).default([]),
  notes: z.string().max(2000, 'Workout notes cannot exceed 2000 characters').optional(),
  createdAt: ISODateString,
  updatedAt: ISODateString
}).refine((data) => {
  // If endTime is provided, it must be after startTime
  if (data.endTime) {
    return new Date(data.endTime) > new Date(data.startTime);
  }
  return true;
}, {
  message: "End time must be after start time"
});

export const CreateWorkoutSessionSchema = WorkoutSessionSchema.omit({ 
  id: true, 
  exercises: true,
  createdAt: true, 
  updatedAt: true 
});

export const UpdateWorkoutSessionSchema = WorkoutSessionSchema.omit({
  id: true,
  userId: true,
  exercises: true,
  createdAt: true,
  updatedAt: true
}).partial();

// ========== Validation Helper Functions ==========

/**
 * Validates if a string is a valid UUID v4
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validates if a string is a valid ISO date
 */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.toISOString() === dateString;
}

/**
 * Validates if a date is in the future
 */
export function isDateInFuture(dateString: string): boolean {
  if (!isValidISODate(dateString)) return false;
  return new Date(dateString) > new Date();
}

/**
 * Validates if a date is in the past
 */
export function isDateInPast(dateString: string): boolean {
  if (!isValidISODate(dateString)) return false;
  return new Date(dateString) < new Date();
}

/**
 * Validates workout session timing constraints
 */
export function validateWorkoutTiming(startTime: string, endTime?: string): boolean {
  if (!isValidISODate(startTime)) return false;
  if (endTime && !isValidISODate(endTime)) return false;
  if (endTime && new Date(endTime) <= new Date(startTime)) return false;
  
  // Workout cannot be longer than 24 hours
  if (endTime) {
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    if (duration > 24 * 60 * 60 * 1000) return false; // 24 hours in milliseconds
  }
  
  return true;
}

/**
 * Validates set timing constraints
 */
export function validateSetTiming(startTime?: string, endTime?: string, restTime?: number): boolean {
  if (startTime && !isValidISODate(startTime)) return false;
  if (endTime && !isValidISODate(endTime)) return false;
  if (startTime && endTime && new Date(endTime) <= new Date(startTime)) return false;
  if (restTime !== undefined && (restTime < 0 || restTime > 7200)) return false; // max 2 hours
  
  return true;
}

/**
 * Validates exercise order within a workout
 */
export function validateExerciseOrder(exercises: Exercise[]): boolean {
  const orders = exercises.map(ex => ex.order).sort((a, b) => a - b);
  
  // Check for duplicates and ensure sequential ordering starting from 0
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i) return false;
  }
  
  return true;
}

/**
 * Validates performance metrics based on set type
 */
export function validateSetMetrics(set: Partial<{
  type?: string;
  repetitions?: number;
  weight?: number;
  duration?: number;
  distance?: number;
}>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Working sets should have weight and reps for strength exercises
  if (set.type === 'working') {
    if (!set.repetitions && !set.duration && !set.distance) {
      errors.push('Working sets should have repetitions, duration, or distance');
    }
  }
  
  // Cardio exercises should have duration or distance
  if (set.duration && set.distance) {
    errors.push('Set should have either duration or distance, not both');
  }
  
  // Weight should only be provided with reps
  if (set.weight && !set.repetitions) {
    errors.push('Weight should be provided together with repetitions');
  }
  
  // Distance should be provided with duration for cardio
  if (set.distance && !set.duration) {
    errors.push('Distance should be provided together with duration');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes user input strings
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Validates and normalizes weight units
 */
export function normalizeWeight(weight: number, fromUnit: 'kg' | 'lbs', toUnit: 'kg' | 'lbs'): number {
  if (fromUnit === toUnit) return weight;
  
  if (fromUnit === 'lbs' && toUnit === 'kg') {
    return Math.round((weight / 2.20462) * 100) / 100; // Round to 2 decimal places
  }
  
  if (fromUnit === 'kg' && toUnit === 'lbs') {
    return Math.round((weight * 2.20462) * 100) / 100; // Round to 2 decimal places
  }
  
  return weight;
}

// ========== Type Guards ==========

export function isUser(obj: unknown): obj is User {
  try {
    UserSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

export function isWorkoutSession(obj: unknown): obj is WorkoutSession {
  try {
    WorkoutSessionSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

export function isExercise(obj: unknown): obj is Exercise {
  try {
    ExerciseSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

export function isExerciseTemplate(obj: unknown): obj is ExerciseTemplate {
  try {
    ExerciseTemplateSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

export function isSet(obj: unknown): obj is Set {
  try {
    SetSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

// ========== Error Aggregation Utilities ==========

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

/**
 * Validates data and returns structured result
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const validData = schema.parse(data);
    return {
      success: true,
      data: validData,
      errors: []
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
      };
    }
    
    return {
      success: false,
      errors: [(error as Error).message]
    };
  }
}

/**
 * Validates multiple data items and aggregates results
 */
export function validateMultiple<T>(
  schema: z.ZodSchema<T>, 
  items: unknown[]
): ValidationResult<T[]> {
  const validItems: T[] = [];
  const allErrors: string[] = [];
  
  items.forEach((item, index) => {
    const result = validateData(schema, item);
    if (result.success && result.data) {
      validItems.push(result.data);
    } else {
      allErrors.push(...result.errors.map(err => `Item ${index}: ${err}`));
    }
  });
  
  return {
    success: allErrors.length === 0,
    data: allErrors.length === 0 ? validItems : undefined,
    errors: allErrors
  };
}