/**
 * Workout Creation Flow Integration Tests
 * End-to-end tests for the complete workout creation process
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkoutCreationFlow } from '@/components/workout/WorkoutCreationFlow';
import { userStorage, workoutStorage, clearAllData } from '@/lib/storage';
import type { User, WorkoutSession } from '@/types';

// Mock modules
jest.mock('@/lib/storage');

// Mock user data
const mockUser: User = {
  id: 'user-1',
  name: 'Test User',
  preferences: {
    defaultWeightUnit: 'kg',
    defaultIntensityScale: 10,
    theme: 'dark'
  },
  createdAt: '2025-09-19T08:00:00Z',
  updatedAt: '2025-09-19T08:00:00Z'
};

// Mock storage functions
const mockUserStorage = userStorage as jest.Mocked<typeof userStorage>;
const mockWorkoutStorage = workoutStorage as jest.Mocked<typeof workoutStorage>;
const mockClearAllData = clearAllData as jest.MockedFunction<typeof clearAllData>;

describe('Workout Creation Flow Integration', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Setup mock storage responses
    mockUserStorage.findById.mockResolvedValue(mockUser);
    mockWorkoutStorage.create.mockImplementation(async (workout) => ({
      ...workout,
      id: 'session-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as WorkoutSession));
    
    await mockClearAllData();
  });

  afterEach(async () => {
    await mockClearAllData();
  });

  describe('Complete Workout Creation Flow', () => {
    it('should create a complete workout session from start to finish', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCreationFlow
          userId="user-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );
      
      // Step 1: Name the workout
      expect(screen.getByText(/new workout session/i)).toBeInTheDocument();
      
      const workoutNameInput = screen.getByLabelText(/workout name/i);
      await user.type(workoutNameInput, 'Push Day Workout');
      
      await user.click(screen.getByRole('button', { name: /start workout/i }));
      
      // Step 2: Add first exercise
      await waitFor(() => {
        expect(screen.getByText(/add exercise/i)).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      
      // Select exercise from template or enter custom
      const exerciseInput = screen.getByLabelText(/exercise name/i);
      await user.type(exerciseInput, 'Bench Press');
      
      const categorySelect = screen.getByLabelText(/category/i);
      await user.selectOptions(categorySelect, 'Chest');
      
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      
      // Step 3: Add sets to the exercise
      await waitFor(() => {
        expect(screen.getByText(/bench press/i)).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /add set/i }));
      
      // Fill set data
      const repsInput = screen.getByLabelText(/repetitions/i);
      const weightInput = screen.getByLabelText(/weight/i);
      const intensitySlider = screen.getByLabelText(/intensity/i);
      
      await user.type(repsInput, '10');
      await user.type(weightInput, '80');
      await user.type(intensitySlider, '8');
      
      await user.click(screen.getByRole('button', { name: /save set/i }));
      
      // Add second set
      await user.click(screen.getByRole('button', { name: /add set/i }));
      
      await user.type(screen.getByLabelText(/repetitions/i), '8');
      await user.type(screen.getByLabelText(/weight/i), '82.5');
      await user.type(screen.getByLabelText(/intensity/i), '9');
      
      await user.click(screen.getByRole('button', { name: /save set/i }));
      
      // Step 4: Add second exercise
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      
      await user.type(screen.getByLabelText(/exercise name/i), 'Incline Dumbbell Press');
      await user.selectOptions(screen.getByLabelText(/category/i), 'Chest');
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      
      // Add sets to second exercise
      await user.click(screen.getAllByRole('button', { name: /add set/i })[1]);
      
      await user.type(screen.getByLabelText(/repetitions/i), '12');
      await user.type(screen.getByLabelText(/weight/i), '30');
      await user.type(screen.getByLabelText(/intensity/i), '7');
      
      await user.click(screen.getByRole('button', { name: /save set/i }));
      
      // Step 5: Complete workout
      const workoutNotes = screen.getByLabelText(/workout notes/i);
      await user.type(workoutNotes, 'Great session, felt strong throughout');
      
      await user.click(screen.getByRole('button', { name: /complete workout/i }));
      
      // Verify workout was saved correctly
      await waitFor(() => {
        expect(mockWorkoutStorage.create).toHaveBeenCalledWith({
          userId: 'user-1',
          name: 'Push Day Workout',
          startTime: expect.any(String),
          endTime: expect.any(String),
          exercises: [
            {
              name: 'Bench Press',
              category: 'Chest',
              sets: [
                expect.objectContaining({
                  repetitions: 10,
                  weight: 80,
                  intensity: 8
                }),
                expect.objectContaining({
                  repetitions: 8,
                  weight: 82.5,
                  intensity: 9
                })
              ]
            },
            {
              name: 'Incline Dumbbell Press',
              category: 'Chest',
              sets: [
                expect.objectContaining({
                  repetitions: 12,
                  weight: 30,
                  intensity: 7
                })
              ]
            }
          ],
          notes: 'Great session, felt strong throughout'
        });
      });
      
      expect(mockOnComplete).toHaveBeenCalledWith(expect.objectContaining({
        id: 'session-123',
        name: 'Push Day Workout'
      }));
    }, 30000); // Extended timeout for complex flow

    it('should handle workout creation with minimal data', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCreationFlow
          userId="user-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );
      
      // Skip name, use default
      await user.click(screen.getByRole('button', { name: /start workout/i }));
      
      // Add one exercise with one set
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      await user.type(screen.getByLabelText(/exercise name/i), 'Push Ups');
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      
      await user.click(screen.getByRole('button', { name: /add set/i }));
      await user.type(screen.getByLabelText(/repetitions/i), '20');
      await user.click(screen.getByRole('button', { name: /save set/i }));
      
      await user.click(screen.getByRole('button', { name: /complete workout/i }));
      
      await waitFor(() => {
        expect(mockWorkoutStorage.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 'user-1',
            name: undefined,
            exercises: [{
              name: 'Push Ups',
              sets: [{ repetitions: 20 }]
            }]
          })
        );
      });
    });

    it('should handle cancellation at different stages', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCreationFlow
          userId="user-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );
      
      // Cancel during initial setup
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      
      expect(mockOnCancel).toHaveBeenCalled();
      expect(mockWorkoutStorage.create).not.toHaveBeenCalled();
    });

    it('should handle cancellation after adding exercises', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCreationFlow
          userId="user-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );
      
      await user.type(screen.getByLabelText(/workout name/i), 'Test Workout');
      await user.click(screen.getByRole('button', { name: /start workout/i }));
      
      // Add exercise
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      await user.type(screen.getByLabelText(/exercise name/i), 'Squats');
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      
      // Add set
      await user.click(screen.getByRole('button', { name: /add set/i }));
      await user.type(screen.getByLabelText(/repetitions/i), '10');
      await user.click(screen.getByRole('button', { name: /save set/i }));
      
      // Now cancel - should prompt for confirmation
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      
      expect(screen.getByText(/discard workout/i)).toBeInTheDocument();
      
      await user.click(screen.getByRole('button', { name: /yes, discard/i }));
      
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Form Validation During Flow', () => {
    it('should validate workout name length', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCreationFlow
          userId="user-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );
      
      const longName = 'a'.repeat(101); // Exceed 100 char limit
      await user.type(screen.getByLabelText(/workout name/i), longName);
      await user.click(screen.getByRole('button', { name: /start workout/i }));
      
      expect(screen.getByText(/workout name cannot exceed 100 characters/i)).toBeInTheDocument();
    });

    it('should require at least one exercise before completion', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCreationFlow
          userId="user-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );
      
      await user.type(screen.getByLabelText(/workout name/i), 'Empty Workout');
      await user.click(screen.getByRole('button', { name: /start workout/i }));
      
      // Try to complete without exercises
      await user.click(screen.getByRole('button', { name: /complete workout/i }));
      
      expect(screen.getByText(/at least one exercise is required/i)).toBeInTheDocument();
      expect(mockWorkoutStorage.create).not.toHaveBeenCalled();
    });

    it('should require at least one set per exercise', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutCreationFlow
          userId="user-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );
      
      await user.type(screen.getByLabelText(/workout name/i), 'Test Workout');
      await user.click(screen.getByRole('button', { name: /start workout/i }));
      
      // Add exercise but no sets
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      await user.type(screen.getByLabelText(/exercise name/i), 'Bench Press');
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      
      // Try to complete
      await user.click(screen.getByRole('button', { name: /complete workout/i }));
      
      expect(screen.getByText(/each exercise must have at least one set/i)).toBeInTheDocument();
    });
  });

  describe('Storage Integration', () => {
    it('should handle storage errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock storage to throw error
      mockWorkoutStorage.create.mockRejectedValue(new Error('Storage failed'));
      
      render(
        <WorkoutCreationFlow
          userId="user-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );
      
      // Create valid workout
      await user.type(screen.getByLabelText(/workout name/i), 'Test Workout');
      await user.click(screen.getByRole('button', { name: /start workout/i }));
      
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      await user.type(screen.getByLabelText(/exercise name/i), 'Push Ups');
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      
      await user.click(screen.getByRole('button', { name: /add set/i }));
      await user.type(screen.getByLabelText(/repetitions/i), '10');
      await user.click(screen.getByRole('button', { name: /save set/i }));
      
      await user.click(screen.getByRole('button', { name: /complete workout/i }));
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to save workout/i)).toBeInTheDocument();
      });
      
      expect(mockOnComplete).not.toHaveBeenCalled();
    });

    it('should preserve workout data during temporary errors', async () => {
      const user = userEvent.setup();
      
      // First attempt fails, second succeeds
      mockWorkoutStorage.create
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({
          id: 'session-123',
          userId: 'user-1',
          name: 'Test Workout',
          startTime: '2025-09-19T08:00:00Z',
          endTime: '2025-09-19T09:00:00Z',
          exercises: [],
          createdAt: '2025-09-19T08:00:00Z',
          updatedAt: '2025-09-19T09:00:00Z'
        });
      
      render(
        <WorkoutCreationFlow
          userId="user-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );
      
      // Create workout
      await user.type(screen.getByLabelText(/workout name/i), 'Test Workout');
      await user.click(screen.getByRole('button', { name: /start workout/i }));
      
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      await user.type(screen.getByLabelText(/exercise name/i), 'Squats');
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      
      await user.click(screen.getByRole('button', { name: /add set/i }));
      await user.type(screen.getByLabelText(/repetitions/i), '15');
      await user.click(screen.getByRole('button', { name: /save set/i }));
      
      // First save attempt
      await user.click(screen.getByRole('button', { name: /complete workout/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/failed to save workout/i)).toBeInTheDocument();
      });
      
      // Retry button should be available
      await user.click(screen.getByRole('button', { name: /retry/i }));
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
      
      expect(mockWorkoutStorage.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('Timer Integration', () => {
    it('should track workout duration automatically', async () => {
      const user = userEvent.setup();
      jest.useFakeTimers();
      const startTime = new Date('2025-09-19T08:00:00Z');
      jest.setSystemTime(startTime);
      
      render(
        <WorkoutCreationFlow
          userId="user-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );
      
      await user.type(screen.getByLabelText(/workout name/i), 'Timed Workout');
      await user.click(screen.getByRole('button', { name: /start workout/i }));
      
      // Fast forward 30 minutes
      jest.advanceTimersByTime(30 * 60 * 1000);
      
      // Add quick exercise and set
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      await user.type(screen.getByLabelText(/exercise name/i), 'Quick Set');
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      
      await user.click(screen.getByRole('button', { name: /add set/i }));
      await user.type(screen.getByLabelText(/repetitions/i), '10');
      await user.click(screen.getByRole('button', { name: /save set/i }));
      
      // Fast forward another 30 minutes
      jest.advanceTimersByTime(30 * 60 * 1000);
      
      await user.click(screen.getByRole('button', { name: /complete workout/i }));
      
      await waitFor(() => {
        expect(mockWorkoutStorage.create).toHaveBeenCalledWith(
          expect.objectContaining({
            startTime: startTime.toISOString(),
            endTime: new Date('2025-09-19T09:00:00Z').toISOString()
          })
        );
      });
      
      jest.useRealTimers();
    });

    it('should handle set timing when timer is used', async () => {
      const user = userEvent.setup();
      jest.useFakeTimers();
      
      render(
        <WorkoutCreationFlow
          userId="user-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );
      
      await user.type(screen.getByLabelText(/workout name/i), 'Timed Sets');
      await user.click(screen.getByRole('button', { name: /start workout/i }));
      
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      await user.type(screen.getByLabelText(/exercise name/i), 'Timed Exercise');
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      
      // Add set with timer
      await user.click(screen.getByRole('button', { name: /add set/i }));
      
      // Start set timer
      await user.click(screen.getByRole('button', { name: /start timer/i }));
      
      // Fast forward 45 seconds
      jest.advanceTimersByTime(45000);
      
      // Stop timer and fill data
      await user.click(screen.getByRole('button', { name: /stop timer/i }));
      await user.type(screen.getByLabelText(/repetitions/i), '10');
      await user.click(screen.getByRole('button', { name: /save set/i }));
      
      await user.click(screen.getByRole('button', { name: /complete workout/i }));
      
      await waitFor(() => {
        expect(mockWorkoutStorage.create).toHaveBeenCalledWith(
          expect.objectContaining({
            exercises: [
              expect.objectContaining({
                sets: [
                  expect.objectContaining({
                    repetitions: 10,
                    startTime: expect.any(String),
                    endTime: expect.any(String)
                  })
                ]
              })
            ]
          })
        );
      });
      
      jest.useRealTimers();
    });
  });

  describe('Mobile Specific Behavior', () => {
    it('should handle mobile keyboard behavior during exercise entry', async () => {
      const user = userEvent.setup();
      
      // Mock mobile environment
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        configurable: true
      });
      
      render(
        <WorkoutCreationFlow
          userId="user-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );
      
      await user.type(screen.getByLabelText(/workout name/i), 'Mobile Test');
      await user.click(screen.getByRole('button', { name: /start workout/i }));
      
      await user.click(screen.getByRole('button', { name: /add exercise/i }));
      
      const exerciseInput = screen.getByLabelText(/exercise name/i);
      expect(exerciseInput).toHaveAttribute('autocomplete', 'off');
      expect(exerciseInput).toHaveAttribute('autocapitalize', 'words');
    });

    it('should auto-save draft data for recovery', async () => {
      const user = userEvent.setup();
      
      // Mock localStorage for draft saving
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      
      render(
        <WorkoutCreationFlow
          userId="user-1"
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );
      
      await user.type(screen.getByLabelText(/workout name/i), 'Draft Test');
      
      // Should auto-save draft after typing
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'workout-draft-user-1',
          expect.stringContaining('Draft Test')
        );
      });
    });
  });
});