/**
 * Storage Service Unit Tests
 * Tests for JSON storage operations, validation, and error handling
 */

import { promises as fs } from 'fs';
import path from 'path';
import {
  userStorage,
  workoutStorage,
  exerciseTemplateStorage,
  clearAllData,
  StorageError,
  ValidationError,
  FileOperationError
} from '@/lib/storage';
import type { User, WorkoutSession, ExerciseTemplate } from '@/types';

// Mock UUID to return predictable values while keeping uniqueness
jest.mock('uuid', () => {
  let counter = 0;
  return {
    v4: jest.fn(() => `mock-uuid-${++counter}`),
  };
});

// Test data directory
const TEST_DATA_DIR = path.join(process.cwd(), 'tests', 'fixtures', 'data');

// Mock data
const mockUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Test User',
  preferences: {
    defaultWeightUnit: 'kg',
    defaultIntensityScale: 10,
    theme: 'dark'
  }
};

const mockWorkoutSession: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'> = {
  userId: 'test-user-id',
  name: 'Test Workout',
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
  exercises: [],
  notes: 'Test workout notes'
};

const mockExerciseTemplate: Omit<ExerciseTemplate, 'id'> = {
  name: 'Push Up',
  category: 'Chest',
  defaultWeightUnit: 'kg'
};

describe('Storage Service', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await clearAllData();
    
    // Ensure test data directory exists
    try {
      await fs.mkdir(TEST_DATA_DIR, { recursive: true });
    } catch (error) {
      // Directory already exists, ignore error
    }
  });

  afterEach(async () => {
    // Clean up test data after each test
    await clearAllData();
  });

  describe('User Storage', () => {
    describe('create', () => {
      it('should create a new user with generated ID and timestamps', async () => {
        const user = await userStorage.create(mockUser);
        
        expect(user.id).toBeDefined();
        expect(user.id.length).toBeGreaterThan(0);
        expect(user.name).toBe(mockUser.name);
        expect(user.preferences).toEqual(mockUser.preferences);
        expect(user.createdAt).toBeDefined();
        expect(user.updatedAt).toBeDefined();
        expect(new Date(user.createdAt)).toBeInstanceOf(Date);
        expect(new Date(user.updatedAt)).toBeInstanceOf(Date);
      });

      it('should validate user data before creation', async () => {
        const invalidUser = {
          ...mockUser,
          preferences: {
            ...mockUser.preferences,
            defaultWeightUnit: 'invalid' as any
          }
        };

        await expect(userStorage.create(invalidUser)).rejects.toThrow(ValidationError);
      });

      it('should handle creation with minimal data', async () => {
        const minimalUser = {
          preferences: {
            defaultWeightUnit: 'lbs' as const,
            defaultIntensityScale: 5 as const,
            theme: 'dark' as const
          }
        };

        const user = await userStorage.create(minimalUser);
        
        expect(user.id).toBeDefined();
        expect(user.name).toBeUndefined();
        expect(user.preferences.defaultWeightUnit).toBe('lbs');
      });
    });

    describe('findById', () => {
      it('should find user by ID', async () => {
        const createdUser = await userStorage.create(mockUser);
        const foundUser = await userStorage.findById(createdUser.id);
        
        expect(foundUser).toBeDefined();
        expect(foundUser?.id).toBe(createdUser.id);
        expect(foundUser?.name).toBe(mockUser.name);
      });

      it('should return undefined for non-existent ID', async () => {
        const foundUser = await userStorage.findById('non-existent-id');
        
        expect(foundUser).toBeUndefined();
      });

      it('should handle empty ID', async () => {
        const foundUser = await userStorage.findById('');
        
        expect(foundUser).toBeUndefined();
      });
    });

    describe('findAll', () => {
      it('should return empty array when no users exist', async () => {
        const users = await userStorage.findAll();
        
        expect(users).toEqual([]);
      });

      it('should return all users', async () => {
        const user1 = await userStorage.create(mockUser);
        const user2 = await userStorage.create({
          ...mockUser,
          name: 'User 2'
        });
        
        const users = await userStorage.findAll();
        
        expect(users).toHaveLength(2);
        expect(users.map(u => u.id)).toContain(user1.id);
        expect(users.map(u => u.id)).toContain(user2.id);
      });
    });

    describe('update', () => {
      it('should update existing user', async () => {
        const createdUser = await userStorage.create(mockUser);
        
        const updatedUser = await userStorage.update(createdUser.id, {
          name: 'Updated Name'
        });
        
        expect(updatedUser).toBeDefined();
        expect(updatedUser?.name).toBe('Updated Name');
        expect(updatedUser?.id).toBe(createdUser.id);
        expect(new Date(updatedUser!.updatedAt)).toBeInstanceOf(Date);
        expect(updatedUser!.updatedAt).not.toBe(createdUser.updatedAt);
      });

      it('should return undefined for non-existent user', async () => {
        const updatedUser = await userStorage.update('non-existent-id', {
          name: 'Updated Name'
        });
        
        expect(updatedUser).toBeUndefined();
      });

      it('should validate update data', async () => {
        const createdUser = await userStorage.create(mockUser);
        
        await expect(userStorage.update(createdUser.id, {
          preferences: {
            defaultWeightUnit: 'invalid' as any,
            defaultIntensityScale: 5,
            theme: 'dark'
          }
        })).rejects.toThrow(ValidationError);
      });
    });

    describe('delete', () => {
      it('should delete existing user', async () => {
        const createdUser = await userStorage.create(mockUser);
        
        const deleted = await userStorage.delete(createdUser.id);
        
        expect(deleted).toBe(true);
        
        const foundUser = await userStorage.findById(createdUser.id);
        expect(foundUser).toBeUndefined();
      });

      it('should return false for non-existent user', async () => {
        const deleted = await userStorage.delete('non-existent-id');
        
        expect(deleted).toBe(false);
      });
    });
  });

  describe('Workout Storage', () => {
    let testUserId: string;

    beforeEach(async () => {
      const user = await userStorage.create(mockUser);
      testUserId = user.id;
    });

    describe('create', () => {
      it('should create a new workout session', async () => {
        const workoutData = {
          ...mockWorkoutSession,
          userId: testUserId
        };
        
        const workout = await workoutStorage.create(workoutData);
        
        expect(workout.id).toBeDefined();
        expect(workout.userId).toBe(testUserId);
        expect(workout.name).toBe(mockWorkoutSession.name);
        expect(workout.exercises).toEqual([]);
      });

      it('should validate workout timing', async () => {
        const invalidWorkout = {
          ...mockWorkoutSession,
          userId: testUserId,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        };

        await expect(workoutStorage.create(invalidWorkout)).rejects.toThrow(ValidationError);
      });
    });

    describe('findByUserId', () => {
      it('should find workouts by user ID', async () => {
        const workout1 = await workoutStorage.create({
          ...mockWorkoutSession,
          userId: testUserId,
          name: 'Workout 1'
        });
        
        const workout2 = await workoutStorage.create({
          ...mockWorkoutSession,
          userId: testUserId,
          name: 'Workout 2'
        });

        // Create workout for different user
        const otherUser = await userStorage.create({
          ...mockUser,
          name: 'Other User'
        });
        
        await workoutStorage.create({
          ...mockWorkoutSession,
          userId: otherUser.id,
          name: 'Other Workout'
        });
        
        const userWorkouts = await workoutStorage.findByUserId(testUserId);
        
        expect(userWorkouts).toHaveLength(2);
        expect(userWorkouts.map(w => w.id)).toContain(workout1.id);
        expect(userWorkouts.map(w => w.id)).toContain(workout2.id);
        expect(userWorkouts.every(w => w.userId === testUserId)).toBe(true);
      });

      it('should return empty array for user with no workouts', async () => {
        const userWorkouts = await workoutStorage.findByUserId(testUserId);
        
        expect(userWorkouts).toEqual([]);
      });
    });
  });

  describe('Exercise Template Storage', () => {
    describe('create', () => {
      it('should create a new exercise template', async () => {
        const template = await exerciseTemplateStorage.create(mockExerciseTemplate);
        
        expect(template.id).toBeDefined();
        expect(template.name).toBe(mockExerciseTemplate.name);
        expect(template.category).toBe(mockExerciseTemplate.category);
        expect(template.defaultWeightUnit).toBe(mockExerciseTemplate.defaultWeightUnit);
      });
    });

    describe('findByCategory', () => {
      it('should find templates by category', async () => {
        const chestTemplate = await exerciseTemplateStorage.create(mockExerciseTemplate);
        const backTemplate = await exerciseTemplateStorage.create({
          ...mockExerciseTemplate,
          name: 'Pull Up',
          category: 'Back'
        });
        
        const chestTemplates = await exerciseTemplateStorage.findByCategory('Chest');
        
        expect(chestTemplates).toHaveLength(1);
        expect(chestTemplates[0].id).toBe(chestTemplate.id);
      });

      it('should return empty array for category with no templates', async () => {
        const templates = await exerciseTemplateStorage.findByCategory('Legs');
        
        expect(templates).toEqual([]);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', async () => {
      // Mock fs.readFile to throw error and ensure graceful fallback
      const originalReadFile = fs.readFile;
      fs.readFile = jest.fn().mockRejectedValue({
        code: 'EACCES',
        message: 'Permission denied'
      });
      
      try {
        const result = await userStorage.findAll();
        expect(result).toEqual([]);
      } finally {
        // Restore original function
        fs.readFile = originalReadFile;
      }
    });

    it('should handle corrupted JSON files', async () => {
      // Write invalid JSON to users file
      const usersFile = path.join(TEST_DATA_DIR, 'users.json');
      await fs.writeFile(usersFile, 'invalid json content');
      
      await expect(userStorage.findAll()).rejects.toThrow(FileOperationError);
    });

    it('should handle validation errors properly', async () => {
      const invalidUser = {
        name: 'Test User',
        preferences: {
          defaultWeightUnit: 'invalid',
          defaultIntensityScale: 15, // Invalid scale
          theme: 'light' // Invalid theme
        }
      };

      await expect(userStorage.create(invalidUser as any)).rejects.toThrow(ValidationError);
    });
  });

  // Atomic write behavior is covered at a lower level; omit heavy concurrency scenarios here for stability

  describe('Data Directory Management', () => {
    it('should create data directory if it does not exist', async () => {
      // Remove test data directory
      try {
        await fs.rmdir(TEST_DATA_DIR, { recursive: true });
      } catch {
        // Directory may not exist, ignore error
      }
      
      // Creating a user should create the directory
      await userStorage.create(mockUser);
      
      // Directory should now exist
      const stats = await fs.stat(TEST_DATA_DIR);
      expect(stats.isDirectory()).toBe(true);
    });
  });

  describe('clearAllData', () => {
    it('should remove all data files', async () => {
      // Create some data
      await userStorage.create(mockUser);
      await exerciseTemplateStorage.create(mockExerciseTemplate);
      
      // Verify files exist
      const users = await userStorage.findAll();
      const templates = await exerciseTemplateStorage.findAll();
      expect(users).toHaveLength(1);
      expect(templates).toHaveLength(1);
      
      // Clear all data
      await clearAllData();
      
      // Verify files are cleared
      const clearedUsers = await userStorage.findAll();
      const clearedTemplates = await exerciseTemplateStorage.findAll();
      expect(clearedUsers).toEqual([]);
      expect(clearedTemplates).toEqual([]);
    });
  });
});