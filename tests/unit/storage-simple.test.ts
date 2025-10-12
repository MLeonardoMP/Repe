/**
 * Storage Service Unit Tests
 * Basic tests for JSON storage operations
 */

import { promises as fs } from 'fs';
import {
  userStorage,
  workoutStorage,
  exerciseTemplateStorage,
} from '@/lib/storage';
import type { User, WorkoutSession, ExerciseTemplate } from '@/types';

// Mock UUID to return predictable values
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

// Mock fs instead of using files
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    rename: jest.fn(),
    unlink: jest.fn(),
  },
}));

const mockedFs = jest.mocked(fs);

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
  exercises: [
    {
      templateId: 'template-1',
      sets: [
        {
          reps: 10,
          weight: 50,
          intensity: 8,
          restTime: 60,
          completed: true
        }
      ],
      notes: 'Good form'
    }
  ],
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  notes: 'Great workout'
};

const mockExerciseTemplate: Omit<ExerciseTemplate, 'id'> = {
  name: 'Bench Press',
  category: 'chest',
  defaultWeightUnit: 'kg'
};

// In-memory storage for testing
let mockUsersData: User[] = [];
let mockWorkoutsData: WorkoutSession[] = [];
let mockExerciseTemplatesData: ExerciseTemplate[] = [];

describe('Storage Service', () => {
  beforeEach(async () => {
    // Reset in-memory storage
    mockUsersData = [];
    mockWorkoutsData = [];
    mockExerciseTemplatesData = [];
    
    // Setup fs mocks
    mockedFs.mkdir.mockResolvedValue(undefined);
    mockedFs.writeFile.mockResolvedValue();
    mockedFs.rename.mockResolvedValue();
    mockedFs.unlink.mockResolvedValue();
    
    // Mock readFile to return our in-memory data
    mockedFs.readFile.mockImplementation((filePath: any) => {
      const path = filePath.toString();
      if (path.includes('users.json')) {
        return Promise.resolve(JSON.stringify(mockUsersData));
      } else if (path.includes('workouts.json')) {
        return Promise.resolve(JSON.stringify(mockWorkoutsData));
      } else if (path.includes('exercise-templates.json')) {
        return Promise.resolve(JSON.stringify(mockExerciseTemplatesData));
      }
      return Promise.reject(new Error('File not found'));
    });
    
    // Mock access to allow file existence checks
    mockedFs.access.mockResolvedValue();
  });

  describe('User Storage', () => {
    it('should create a new user', async () => {
      const user = await userStorage.create(mockUser);
      
      expect(user.id).toBeDefined();
      expect(user.name).toBe(mockUser.name);
      expect(user.preferences.defaultWeightUnit).toBe('kg');
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      
      // Verify the user was added to mock storage
      expect(mockUsersData).toHaveLength(1);
      expect(mockUsersData[0]).toEqual(user);
    });

    it('should find user by ID', async () => {
      const createdUser = await userStorage.create(mockUser);
      const foundUser = await userStorage.findById(createdUser.id);
      
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.name).toBe(mockUser.name);
    });

    it('should return null for non-existent user', async () => {
      const foundUser = await userStorage.findById('non-existent-id');
      expect(foundUser).toBeNull();
    });

    it('should find all users', async () => {
      const user1 = await userStorage.create(mockUser);
      const user2 = await userStorage.create({
        ...mockUser,
        name: 'Another User'
      });
      
      const allUsers = await userStorage.findAll();
      
      expect(allUsers).toHaveLength(2);
      expect(allUsers.find(u => u.id === user1.id)).toBeDefined();
      expect(allUsers.find(u => u.id === user2.id)).toBeDefined();
    });

    it('should update user', async () => {
      const createdUser = await userStorage.create(mockUser);
      const updatedData = { name: 'Updated Name' };
      
      const updatedUser = await userStorage.update(createdUser.id, updatedData);
      
      expect(updatedUser).toBeDefined();
      if (updatedUser) {
        expect(updatedUser.name).toBe('Updated Name');
        expect(updatedUser.preferences).toEqual(mockUser.preferences);
        expect(new Date(updatedUser.updatedAt).getTime())
          .toBeGreaterThan(new Date(createdUser.updatedAt).getTime());
      }
    });

    it('should delete user', async () => {
      const createdUser = await userStorage.create(mockUser);
      
      await userStorage.delete(createdUser.id);
      
      const foundUser = await userStorage.findById(createdUser.id);
      expect(foundUser).toBeNull();
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

    it('should find workouts by user ID', async () => {
      const workout1 = await workoutStorage.create(mockWorkoutSession);
      const workout2 = await workoutStorage.create({
        ...mockWorkoutSession,
        name: 'Pull Day'
      });
      
      const userWorkouts = await workoutStorage.findByUserId(mockWorkoutSession.userId);
      
      expect(userWorkouts).toHaveLength(2);
      expect(userWorkouts.find(w => w.id === workout1.id)).toBeDefined();
      expect(userWorkouts.find(w => w.id === workout2.id)).toBeDefined();
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

    it('should find templates by category', async () => {
      const template1 = await exerciseTemplateStorage.create(mockExerciseTemplate);
      const template2 = await exerciseTemplateStorage.create({
        ...mockExerciseTemplate,
        name: 'Incline Press'
      });
      
      const chestTemplates = await exerciseTemplateStorage.findByCategory('chest');
      
      expect(chestTemplates).toHaveLength(2);
      expect(chestTemplates.find(t => t.id === template1.id)).toBeDefined();
      expect(chestTemplates.find(t => t.id === template2.id)).toBeDefined();
    });
  });
});