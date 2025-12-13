/**
 * Storage Service Unit Tests
 * Basic tests for JSON storage operations
 */

import {
  userStorage,
  workoutStorage,
  exerciseTemplateStorage,
  clearAllData,
} from '@/lib/storage';
import type { ExerciseTemplate } from '@/types';

// Mock data
const mockUser = {
  name: 'Test User',
  preferences: {
    defaultWeightUnit: 'kg' as const,
    defaultIntensityScale: 10 as const,
    theme: 'dark' as const
  }
};

const mockWorkoutSession = {
  userId: 'user-123',
  name: 'Push Day',
  exercises: [],
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  notes: 'Great workout'
};

const mockExerciseTemplate: Omit<ExerciseTemplate, 'id'> = {
  name: 'Bench Press',
  category: 'chest',
  defaultWeightUnit: 'kg'
};

describe('Storage Service (final)', () => {
  beforeEach(async () => {
    await clearAllData();
  });

  afterEach(async () => {
    await clearAllData();
  });

  describe('User Storage', () => {
    it('should create a new user', async () => {
      const user = await userStorage.create(mockUser);
      
      expect(user.id).toBeDefined();
      expect(user.name).toBe(mockUser.name);
      expect(user.preferences.defaultWeightUnit).toBe('kg');
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should find user by ID', async () => {
      const createdUser = await userStorage.create(mockUser);
      const foundUser = await userStorage.findById(createdUser.id);
      
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.name).toBe(mockUser.name);
    });

    it('should return undefined for non-existent user', async () => {
      const foundUser = await userStorage.findById('non-existent-id');
      expect(foundUser).toBeUndefined();
    });
  });

  describe('Workout Storage', () => {
    it('should create a new workout session', async () => {
      const workout = await workoutStorage.create(mockWorkoutSession);
      
      expect(workout.id).toBeDefined();
      expect(workout.userId).toBe(mockWorkoutSession.userId);
      expect(workout.name).toBe(mockWorkoutSession.name);
      expect(workout.exercises).toHaveLength(1);
    });
  });

  describe('Exercise Template Storage', () => {
    it('should create a new exercise template', async () => {
      const template = await exerciseTemplateStorage.create(mockExerciseTemplate);
      
      expect(template.id).toBeDefined();
      expect(template.name).toBe(mockExerciseTemplate.name);
      expect(template.category).toBe(mockExerciseTemplate.category);
      expect(template.defaultWeightUnit).toBe(mockExerciseTemplate.defaultWeightUnit);
    });
  });
});