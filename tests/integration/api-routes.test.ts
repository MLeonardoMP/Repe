/**
 * API Routes Integration Tests
 * Tests for all workout, exercise, and set API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearAllData } from '@/lib/storage';

// Import API route handlers
import { POST as createWorkout, GET as getWorkouts } from '@/app/api/workouts/route';
import { GET as getWorkout, PUT as updateWorkout, DELETE as deleteWorkout } from '@/app/api/workouts/[id]/route';
import { POST as addExercise } from '@/app/api/workouts/[id]/exercises/route';
import { PUT as updateExercise } from '@/app/api/workouts/[id]/exercises/[exerciseId]/route';
import { POST as addSet } from '@/app/api/exercises/[exerciseId]/sets/route';
import { PUT as updateSet } from '@/app/api/exercises/[exerciseId]/sets/[setId]/route';

// Helper function to create a mock NextRequest
function createRequest(method: string, url: string, body?: any) {
  const request = {
    method,
    url,
    json: jest.fn().mockResolvedValue(body || {}),
    text: jest.fn().mockResolvedValue(body ? JSON.stringify(body) : ''),
    nextUrl: new URL(url),
  } as unknown as NextRequest;
  
  return request;
}

describe('API Routes Integration Tests', () => {
  let testWorkoutId: string;
  let testExerciseId: string;
  let testSetId: string;

  beforeEach(async () => {
    await clearAllData();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe('/api/workouts', () => {
    it('should create a new workout session', async () => {
      const requestBody = {
        name: 'Test Workout',
        startTime: '2024-01-15T10:00:00.000Z',
        notes: 'Test workout notes',
      };

      const request = createRequest('POST', 'http://localhost:3000/api/workouts', requestBody);
      const response = await createWorkout(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        name: 'Test Workout',
        startTime: '2024-01-15T10:00:00.000Z',
        notes: 'Test workout notes',
        userId: 'user-1',
        exercises: [],
      });
      expect(data.data.id).toBeDefined();
      expect(data.data.createdAt).toBeDefined();
      
      testWorkoutId = data.data.id;
    });

    it('should validate required startTime field', async () => {
      const requestBody = {
        name: 'Test Workout',
        notes: 'Test workout notes',
      };

      const request = createRequest('POST', 'http://localhost:3000/api/workouts', requestBody);
      const response = await createWorkout(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('startTime is required');
    });

    it('should validate startTime is valid ISO date', async () => {
      const requestBody = {
        name: 'Test Workout',
        startTime: 'invalid-date',
        notes: 'Test workout notes',
      };

      const request = createRequest('POST', 'http://localhost:3000/api/workouts', requestBody);
      const response = await createWorkout(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('startTime must be a valid ISO date string');
    });

    it('should get workouts list', async () => {
      // First create a workout
      const createWorkoutRequest = createRequest('POST', 'http://localhost:3000/api/workouts', {
        name: 'Test Workout',
        startTime: '2024-01-15T10:00:00.000Z',
      });
      await createWorkout(createWorkoutRequest);

      // Then get the list
      const request = createRequest('GET', 'http://localhost:3000/api/workouts');
      const response = await getWorkouts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBe(1);
      expect(data.pagination).toMatchObject({
        total: 1,
        offset: 0,
        limit: 20,
      });
    });

    it('should handle pagination parameters', async () => {
      const request = createRequest('GET', 'http://localhost:3000/api/workouts?limit=5&offset=0');
      const response = await getWorkouts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination).toMatchObject({
        total: 0,
        offset: 0,
        limit: 5,
      });
    });
  });

  describe('/api/workouts/[id]', () => {
    beforeEach(async () => {
      // Create a test workout
      const createWorkoutRequest = createRequest('POST', 'http://localhost:3000/api/workouts', {
        name: 'Test Workout',
        startTime: '2024-01-15T10:00:00.000Z',
      });
      const createResponse = await createWorkout(createWorkoutRequest);
      const createData = await createResponse.json();
      testWorkoutId = createData.data.id;
    });

    it('should get single workout by ID', async () => {
      const request = createRequest('GET', `http://localhost:3000/api/workouts/${testWorkoutId}`);
      const response = await getWorkout(request, { params: { id: testWorkoutId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(testWorkoutId);
      expect(data.data.name).toBe('Test Workout');
    });

    it('should return 404 for non-existent workout', async () => {
      const request = createRequest('GET', 'http://localhost:3000/api/workouts/non-existent-id');
      const response = await getWorkout(request, { params: { id: 'non-existent-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should update workout session', async () => {
      const updateBody = {
        name: 'Updated Workout',
        endTime: '2024-01-15T11:30:00.000Z',
        notes: 'Updated notes',
      };

      const request = createRequest('PUT', `http://localhost:3000/api/workouts/${testWorkoutId}`, updateBody);
      const response = await updateWorkout(request, { params: { id: testWorkoutId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Workout');
      expect(data.data.endTime).toBe('2024-01-15T11:30:00.000Z');
      expect(data.data.notes).toBe('Updated notes');
    });

    it('should validate endTime format on update', async () => {
      const updateBody = {
        endTime: 'invalid-date',
      };

      const request = createRequest('PUT', `http://localhost:3000/api/workouts/${testWorkoutId}`, updateBody);
      const response = await updateWorkout(request, { params: { id: testWorkoutId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should delete workout session', async () => {
      const request = createRequest('DELETE', `http://localhost:3000/api/workouts/${testWorkoutId}`);
      const response = await deleteWorkout(request, { params: { id: testWorkoutId } });

      expect(response.status).toBe(204);

      // Verify deletion
      const getRequest = createRequest('GET', `http://localhost:3000/api/workouts/${testWorkoutId}`);
      const getResponse = await getWorkout(getRequest, { params: { id: testWorkoutId } });
      expect(getResponse.status).toBe(404);
    });
  });

  describe('/api/workouts/[sessionId]/exercises', () => {
    beforeEach(async () => {
      // Create a test workout
      const createWorkoutRequest = createRequest('POST', 'http://localhost:3000/api/workouts', {
        name: 'Test Workout',
        startTime: '2024-01-15T10:00:00.000Z',
      });
      const createResponse = await createWorkout(createWorkoutRequest);
      const createData = await createResponse.json();
      testWorkoutId = createData.data.id;
    });

    it('should add exercise to workout session', async () => {
      const exerciseBody = {
        name: 'Bench Press',
        category: 'Chest',
        notes: 'Exercise notes',
      };

      const request = createRequest('POST', `http://localhost:3000/api/workouts/${testWorkoutId}/exercises`, exerciseBody);
      const response = await addExercise(request, { params: { sessionId: testWorkoutId } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        name: 'Bench Press',
        category: 'Chest',
        notes: 'Exercise notes',
        sessionId: testWorkoutId,
        sets: [],
        order: 1,
      });
      expect(data.data.id).toBeDefined();
      
      testExerciseId = data.data.id;
    });

    it('should validate required exercise name', async () => {
      const exerciseBody = {
        category: 'Chest',
      };

      const request = createRequest('POST', `http://localhost:3000/api/workouts/${testWorkoutId}/exercises`, exerciseBody);
      const response = await addExercise(request, { params: { sessionId: testWorkoutId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Exercise name is required');
    });

    it('should return 404 for non-existent workout session', async () => {
      const exerciseBody = {
        name: 'Bench Press',
      };

      const request = createRequest('POST', 'http://localhost:3000/api/workouts/non-existent/exercises', exerciseBody);
      const response = await addExercise(request, { params: { sessionId: 'non-existent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('/api/exercises/[exerciseId]/sets', () => {
    beforeEach(async () => {
      // Create workout and exercise
      const createWorkoutRequest = createRequest('POST', 'http://localhost:3000/api/workouts', {
        name: 'Test Workout',
        startTime: '2024-01-15T10:00:00.000Z',
      });
      const workoutResponse = await createWorkout(createWorkoutRequest);
      const workoutData = await workoutResponse.json();
      testWorkoutId = workoutData.data.id;

      const createExerciseRequest = createRequest('POST', `http://localhost:3000/api/workouts/${testWorkoutId}/exercises`, {
        name: 'Bench Press',
      });
      const exerciseResponse = await addExercise(createExerciseRequest, { params: { sessionId: testWorkoutId } });
      const exerciseData = await exerciseResponse.json();
      testExerciseId = exerciseData.data.id;
    });

    it('should add set to exercise', async () => {
      const setBody = {
        weight: 100,
        repetitions: 12,
        intensity: 8,
        notes: 'Good set',
        startTime: '2024-01-15T10:15:00.000Z',
        endTime: '2024-01-15T10:16:00.000Z',
      };

      const request = createRequest('POST', `http://localhost:3000/api/exercises/${testExerciseId}/sets`, setBody);
      const response = await addSet(request, { params: { exerciseId: testExerciseId } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        weight: 100,
        repetitions: 12,
        intensity: 8,
        notes: 'Good set',
        exerciseId: testExerciseId,
        isCompleted: true,
        order: 1,
      });
      expect(data.data.id).toBeDefined();
      
      testSetId = data.data.id;
    });

    it('should validate intensity range', async () => {
      const setBody = {
        weight: 100,
        repetitions: 12,
        intensity: 15, // Invalid: > 10
      };

      const request = createRequest('POST', `http://localhost:3000/api/exercises/${testExerciseId}/sets`, setBody);
      const response = await addSet(request, { params: { exerciseId: testExerciseId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Intensity must be between 1 and 10');
    });

    it('should return 404 for non-existent exercise', async () => {
      const setBody = {
        weight: 100,
        repetitions: 12,
      };

      const request = createRequest('POST', 'http://localhost:3000/api/exercises/non-existent/sets', setBody);
      const response = await addSet(request, { params: { exerciseId: 'non-existent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('/api/exercises/[exerciseId]/sets/[setId]', () => {
    beforeEach(async () => {
      // Create workout, exercise, and set
      const createWorkoutRequest = createRequest('POST', 'http://localhost:3000/api/workouts', {
        name: 'Test Workout',
        startTime: '2024-01-15T10:00:00.000Z',
      });
      const workoutResponse = await createWorkout(createWorkoutRequest);
      const workoutData = await workoutResponse.json();
      testWorkoutId = workoutData.data.id;

      const createExerciseRequest = createRequest('POST', `http://localhost:3000/api/workouts/${testWorkoutId}/exercises`, {
        name: 'Bench Press',
      });
      const exerciseResponse = await addExercise(createExerciseRequest, { params: { sessionId: testWorkoutId } });
      const exerciseData = await exerciseResponse.json();
      testExerciseId = exerciseData.data.id;

      const createSetRequest = createRequest('POST', `http://localhost:3000/api/exercises/${testExerciseId}/sets`, {
        weight: 100,
        repetitions: 12,
      });
      const setResponse = await addSet(createSetRequest, { params: { exerciseId: testExerciseId } });
      const setData = await setResponse.json();
      testSetId = setData.data.id;
    });

    it('should update set', async () => {
      const updateBody = {
        weight: 105,
        repetitions: 10,
        intensity: 9,
        notes: 'Updated set',
      };

      const request = createRequest('PUT', `http://localhost:3000/api/exercises/${testExerciseId}/sets/${testSetId}`, updateBody);
      const response = await updateSet(request, { params: { exerciseId: testExerciseId, setId: testSetId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        weight: 105,
        repetitions: 10,
        intensity: 9,
        notes: 'Updated set',
        isCompleted: true,
      });
    });

    it('should return 404 for non-existent set', async () => {
      const updateBody = {
        weight: 105,
      };

      const request = createRequest('PUT', `http://localhost:3000/api/exercises/${testExerciseId}/sets/non-existent`, updateBody);
      const response = await updateSet(request, { params: { exerciseId: testExerciseId, setId: 'non-existent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      const response = await createWorkout(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });
});