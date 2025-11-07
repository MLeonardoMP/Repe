/**
 * API response types for workout tracking application
 * Based on API routes specification
 */

import { WorkoutSession } from './workout';
import { Exercise } from './exercise';
import { Set } from './set';

// Base API response types
export interface ApiSuccessResponse<T = Record<string, unknown>> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T = Record<string, unknown>> = ApiSuccessResponse<T> | ApiErrorResponse;

// Pagination interface for list responses
export interface PaginationInfo {
  total: number;
  offset: number;
  limit: number;
  hasMore?: boolean;
}

export interface PaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  pagination: PaginationInfo;
}

// Workout Session API Response Types
export type CreateWorkoutResponse = ApiSuccessResponse<WorkoutSession>;
export type GetWorkoutResponse = ApiSuccessResponse<WorkoutSession>;
export type UpdateWorkoutResponse = ApiSuccessResponse<WorkoutSession>;
export type GetWorkoutsResponse = PaginatedResponse<WorkoutSession>;

// Exercise API Response Types  
export type AddExerciseResponse = ApiSuccessResponse<Exercise>;
export type UpdateExerciseResponse = ApiSuccessResponse<Exercise>;

// Set API Response Types
export type AddSetResponse = ApiSuccessResponse<Set>;
export type UpdateSetResponse = ApiSuccessResponse<Set>;

// Request body types for API endpoints
export interface CreateWorkoutRequest {
  name?: string;
  startTime: string;  // ISO date
  notes?: string;
}

export interface UpdateWorkoutRequest {
  name?: string;
  endTime?: string;  // ISO date
  notes?: string;
}

export interface AddExerciseRequest {
  name: string;
  category?: string;
  notes?: string;
}

export interface UpdateExerciseRequest {
  name?: string;
  category?: string;
  notes?: string;
}

export interface AddSetRequest {
  weight?: number;
  repetitions?: number;
  intensity?: number;
  notes?: string;
  startTime?: string;  // ISO date
  endTime?: string;    // ISO date
}

export interface UpdateSetRequest {
  weight?: number;
  repetitions?: number;
  intensity?: number;
  notes?: string;
  startTime?: string;  // ISO date
  endTime?: string;    // ISO date
  isCompleted?: boolean;
}

// Query parameters for GET requests
export interface GetWorkoutsQuery {
  limit?: number;
  offset?: number;
  start_date?: string;  // ISO date
  end_date?: string;    // ISO date
}

// Error codes enum for consistent error handling
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  STORAGE_ERROR = 'STORAGE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
}

// Type guards for API responses
export function isApiSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isApiErrorResponse(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false;
}

export function isPaginatedResponse<T>(response: ApiResponse<T[] | T>): response is PaginatedResponse<T> {
  return isApiSuccessResponse(response) && 'pagination' in response;
}

// Utility type for API endpoints that return void/no content
export type VoidResponse = ApiSuccessResponse<void>;

// Type for form data that maps to API requests
export interface WorkoutFormData {
  name?: string;
  notes?: string;
}

export interface ExerciseFormData {
  name: string;
  category?: string;
  notes?: string;
}

export interface SetFormData {
  weight?: number;
  repetitions?: number;
  intensity?: number;
  notes?: string;
}

// HTTP Status codes for reference
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

// API endpoint paths as constants
export const API_ENDPOINTS = {
  WORKOUTS: '/api/workouts',
  WORKOUT_BY_ID: (id: string) => `/api/workouts/${id}`,
  EXERCISES: (sessionId: string) => `/api/workouts/${sessionId}/exercises`,
  EXERCISE_BY_ID: (sessionId: string, exerciseId: string) => `/api/workouts/${sessionId}/exercises/${exerciseId}`,
  SETS: (exerciseId: string) => `/api/exercises/${exerciseId}/sets`,
  SET_BY_ID: (exerciseId: string, setId: string) => `/api/exercises/${exerciseId}/sets/${setId}`,
} as const;