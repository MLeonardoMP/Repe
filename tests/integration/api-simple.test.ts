/**
 * Simplified API Routes Integration Tests
 * Tests API functionality through storage layer
 */

import { clearAllData } from '@/lib/storage';
import { workoutStorage } from '@/lib/storage';

describe('API Routes Integration Tests (Simplified)', () => {
  beforeEach(async () => {
    // Clear test data before each test
    await clearAllData();
  });

  describe('Workout Operations', () => {
    it('should create and retrieve a workout session', async () => {
      // Create workout
      const workoutData = {
        userId: 'test-user',
        name: 'Test Workout',
        startTime: '2024-01-15T10:00:00.000Z',
        exercises: [],
      };

      const workout = await workoutStorage.create(workoutData);
      
      expect(workout).toBeDefined();
      expect(workout.id).toBeDefined();
      expect(workout.name).toBe('Test Workout');
      expect(workout.startTime).toBe('2024-01-15T10:00:00.000Z');

      // Retrieve workout
      const retrievedWorkout = await workoutStorage.findById(workout.id);
      expect(retrievedWorkout).toBeDefined();
      expect(retrievedWorkout?.id).toBe(workout.id);
      expect(retrievedWorkout?.name).toBe('Test Workout');
    });

    it('should update workout session', async () => {
      // Create workout
      const workoutData = {
        userId: 'test-user',
        name: 'Test Workout',
        startTime: '2024-01-15T10:00:00.000Z',
        exercises: [],
      };

      const workout = await workoutStorage.create(workoutData);

      // Update workout
      const updatedWorkout = await workoutStorage.update(workout.id, {
        name: 'Updated Workout',
        endTime: '2024-01-15T11:00:00.000Z',
      });

      expect(updatedWorkout).toBeDefined();
      expect(updatedWorkout!.name).toBe('Updated Workout');
      expect(updatedWorkout!.endTime).toBe('2024-01-15T11:00:00.000Z');
    });

    it('should delete workout session', async () => {
      // Create workout
      const workoutData = {
        userId: 'test-user',
        name: 'Test Workout',
        startTime: '2024-01-15T10:00:00.000Z',
        exercises: [],
      };

      const workout = await workoutStorage.create(workoutData);

      // Delete workout
      await workoutStorage.delete(workout.id);

      // Verify deletion
      const deletedWorkout = await workoutStorage.findById(workout.id);
      expect(deletedWorkout).toBeUndefined();
    });

    it('should list workouts', async () => {
      // Create multiple workouts
      const workout1 = await workoutStorage.create({
        userId: 'test-user',
        name: 'Workout 1',
        startTime: '2024-01-15T10:00:00.000Z',
        exercises: [],
      });

      const workout2 = await workoutStorage.create({
        userId: 'test-user',
        name: 'Workout 2',
        startTime: '2024-01-15T11:00:00.000Z',
        exercises: [],
      });

      // Get workouts list
      const workouts = await workoutStorage.findAll();
      
      expect(workouts).toHaveLength(2);
      expect(workouts.find(w => w.id === workout1.id)).toBeDefined();
      expect(workouts.find(w => w.id === workout2.id)).toBeDefined();
    });
  });

  describe('Data Validation', () => {
    it('should validate required workout fields', async () => {
      await expect(
        workoutStorage.create({
          // Missing required fields
        } as any)
      ).rejects.toThrow();
    });

    it('should validate date formats', async () => {
      await expect(
        workoutStorage.create({
          userId: 'test-user',
          name: 'Test Workout',
          startTime: 'invalid-date',
          exercises: [],
        })
      ).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      // Test error handling by trying operations on non-existent data
      const result = await workoutStorage.findById('non-existent-id');
      expect(result).toBeUndefined();

      const updateResult = await workoutStorage.update('non-existent-id', { name: 'Updated' });
      expect(updateResult).toBeUndefined();

      const deleteResult = await workoutStorage.delete('non-existent-id');
      expect(deleteResult).toBe(false);
    });

    it('should maintain data consistency on errors', async () => {
      const workout = await workoutStorage.create({
        userId: 'test-user',
        name: 'Test Workout',
        startTime: '2024-01-15T10:00:00.000Z',
        exercises: [],
      });

      // Try to update with invalid data
      await expect(
        workoutStorage.update(workout.id, {
          startTime: 'invalid-date',
        })
      ).rejects.toThrow();

      // Verify original data is still intact
      const retrievedWorkout = await workoutStorage.findById(workout.id);
      expect(retrievedWorkout?.name).toBe('Test Workout');
      expect(retrievedWorkout?.startTime).toBe('2024-01-15T10:00:00.000Z');
    });
  });
});