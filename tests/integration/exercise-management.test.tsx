/**
 * Exercise Management Integration Tests
 * End-to-end tests for exercise template management and exercise tracking
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseManagement } from '@/components/workout/ExerciseManagement';
import { exerciseTemplateStorage, workoutStorage, clearAllData } from '@/lib/storage';
import type { ExerciseTemplate, WorkoutSession } from '@/types';

// Mock modules
jest.mock('@/lib/storage');

// Mock exercise templates
const mockExerciseTemplates: ExerciseTemplate[] = [
  {
    id: 'template-1',
    name: 'Bench Press',
    category: 'Chest',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    instructions: 'Lie on bench, lower bar to chest, press up',
    createdAt: '2025-09-19T08:00:00Z',
    updatedAt: '2025-09-19T08:00:00Z'
  },
  {
    id: 'template-2',
    name: 'Squat',
    category: 'Legs',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    instructions: 'Stand with feet shoulder-width apart, squat down',
    createdAt: '2025-09-19T08:00:00Z',
    updatedAt: '2025-09-19T08:00:00Z'
  }
];

// Mock workout with exercise history
const mockWorkoutHistory: WorkoutSession[] = [
  {
    id: 'workout-1',
    userId: 'user-1',
    name: 'Previous Chest Day',
    startTime: '2025-09-18T08:00:00Z',
    endTime: '2025-09-18T09:30:00Z',
    exercises: [
      {
        name: 'Bench Press',
        category: 'Chest',
        sets: [
          {
            repetitions: 10,
            weight: 80,
            intensity: 8,
            startTime: '2025-09-18T08:10:00Z',
            endTime: '2025-09-18T08:12:00Z'
          },
          {
            repetitions: 8,
            weight: 82.5,
            intensity: 9,
            startTime: '2025-09-18T08:14:00Z',
            endTime: '2025-09-18T08:16:00Z'
          }
        ]
      }
    ],
    createdAt: '2025-09-18T08:00:00Z',
    updatedAt: '2025-09-18T09:30:00Z'
  }
];

// Mock storage functions
const mockExerciseStorage = exerciseTemplateStorage as jest.Mocked<typeof exerciseTemplateStorage>;
const mockWorkoutStorage = workoutStorage as jest.Mocked<typeof workoutStorage>;
const mockClearAllData = clearAllData as jest.MockedFunction<typeof clearAllData>;

describe('Exercise Management Integration', () => {
  const mockOnExerciseSelect = jest.fn();
  const mockOnTemplateUpdate = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Setup mock storage responses
    mockExerciseStorage.findAll.mockResolvedValue(mockExerciseTemplates);
    mockExerciseStorage.create.mockImplementation(async (template) => ({
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as ExerciseTemplate));
    mockExerciseStorage.update.mockImplementation(async (id, updates) => ({
      ...mockExerciseTemplates.find(t => t.id === id)!,
      ...updates,
      updatedAt: new Date().toISOString()
    } as ExerciseTemplate));
    
    mockWorkoutStorage.findByUser.mockResolvedValue(mockWorkoutHistory);
    
    await mockClearAllData();
  });

  afterEach(async () => {
    await mockClearAllData();
  });

  describe('Exercise Template Management', () => {
    it('should display and filter exercise templates', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseManagement
          userId="user-1"
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      // Wait for templates to load
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
        expect(screen.getByText('Squat')).toBeInTheDocument();
      });
      
      // Test category filtering
      const categoryFilter = screen.getByLabelText(/filter by category/i);
      await user.selectOptions(categoryFilter, 'Chest');
      
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.queryByText('Squat')).not.toBeInTheDocument();
      
      // Test search filtering
      await user.selectOptions(categoryFilter, 'All');
      
      const searchInput = screen.getByLabelText(/search exercises/i);
      await user.type(searchInput, 'bench');
      
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.queryByText('Squat')).not.toBeInTheDocument();
      
      // Clear search
      await user.clear(searchInput);
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
        expect(screen.getByText('Squat')).toBeInTheDocument();
      });
    });

    it('should create new exercise template', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseManagement
          userId="user-1"
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      // Open create template dialog
      await user.click(screen.getByRole('button', { name: /create template/i }));
      
      // Fill template form
      await user.type(screen.getByLabelText(/exercise name/i), 'Deadlift');
      await user.selectOptions(screen.getByLabelText(/category/i), 'Back');
      
      // Add muscle groups
      const muscleGroupCheckbox = screen.getByLabelText(/hamstrings/i);
      await user.click(muscleGroupCheckbox);
      
      const instructionsTextarea = screen.getByLabelText(/instructions/i);
      await user.type(instructionsTextarea, 'Stand with feet hip-width apart, bend at hips and knees to grip bar');
      
      await user.click(screen.getByRole('button', { name: /create template/i }));
      
      // Verify template was created
      await waitFor(() => {
        expect(mockExerciseStorage.create).toHaveBeenCalledWith({
          name: 'Deadlift',
          category: 'Back',
          muscleGroups: expect.arrayContaining(['Hamstrings']),
          instructions: 'Stand with feet hip-width apart, bend at hips and knees to grip bar'
        });
      });
      
      expect(mockOnTemplateUpdate).toHaveBeenCalled();
    });

    it('should edit existing exercise template', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseManagement
          userId="user-1"
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      // Open edit menu for Bench Press
      const benchPressCard = screen.getByText('Bench Press').closest('[data-testid="exercise-card"]');
      const editButton = benchPressCard?.querySelector('[data-testid="edit-button"]');
      await user.click(editButton!);
      
      // Edit instructions
      const instructionsField = screen.getByLabelText(/instructions/i);
      await user.clear(instructionsField);
      await user.type(instructionsField, 'Updated instructions: Lie on bench, control the descent, explosive press');
      
      await user.click(screen.getByRole('button', { name: /save changes/i }));
      
      await waitFor(() => {
        expect(mockExerciseStorage.update).toHaveBeenCalledWith('template-1', {
          instructions: 'Updated instructions: Lie on bench, control the descent, explosive press'
        });
      });
    });

    it('should delete exercise template with confirmation', async () => {
      const user = userEvent.setup();
      
      mockExerciseStorage.delete.mockResolvedValue(undefined);
      
      render(
        <ExerciseManagement
          userId="user-1"
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      // Open delete confirmation
      const benchPressCard = screen.getByText('Bench Press').closest('[data-testid="exercise-card"]');
      const deleteButton = benchPressCard?.querySelector('[data-testid="delete-button"]');
      await user.click(deleteButton!);
      
      // Confirm deletion
      expect(screen.getByText(/delete exercise template/i)).toBeInTheDocument();
      expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
      
      await user.click(screen.getByRole('button', { name: /delete/i }));
      
      await waitFor(() => {
        expect(mockExerciseStorage.delete).toHaveBeenCalledWith('template-1');
      });
      
      expect(mockOnTemplateUpdate).toHaveBeenCalled();
    });
  });

  describe('Exercise Selection for Workout', () => {
    it('should select exercise from template for workout', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseManagement
          userId="user-1"
          mode="selection"
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      // Select Bench Press template
      const benchPressCard = screen.getByText('Bench Press').closest('[data-testid="exercise-card"]');
      await user.click(benchPressCard!);
      
      expect(mockOnExerciseSelect).toHaveBeenCalledWith({
        name: 'Bench Press',
        category: 'Chest',
        templateId: 'template-1'
      });
    });

    it('should create custom exercise for workout', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseManagement
          userId="user-1"
          mode="selection"
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      // Switch to custom exercise tab
      await user.click(screen.getByRole('tab', { name: /custom exercise/i }));
      
      // Create custom exercise
      await user.type(screen.getByLabelText(/exercise name/i), 'Custom Push-up Variation');
      await user.selectOptions(screen.getByLabelText(/category/i), 'Chest');
      
      await user.click(screen.getByRole('button', { name: /use exercise/i }));
      
      expect(mockOnExerciseSelect).toHaveBeenCalledWith({
        name: 'Custom Push-up Variation',
        category: 'Chest',
        isCustom: true
      });
    });

    it('should show exercise history and suggest previous sets', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseManagement
          userId="user-1"
          mode="selection"
          showHistory={true}
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      // Click on Bench Press to see details
      const benchPressCard = screen.getByText('Bench Press').closest('[data-testid="exercise-card"]');
      await user.click(screen.getByText('View History', { container: benchPressCard! }));
      
      // Should show previous workout data
      expect(screen.getByText(/previous chest day/i)).toBeInTheDocument();
      expect(screen.getByText('10 reps @ 80kg')).toBeInTheDocument();
      expect(screen.getByText('8 reps @ 82.5kg')).toBeInTheDocument();
      
      // Should show suggested starting weights
      expect(screen.getByText(/suggested: 82.5kg/i)).toBeInTheDocument();
    });
  });

  describe('Exercise Statistics and Analytics', () => {
    it('should display exercise performance trends', async () => {
      const user = userEvent.setup();
      
      // Mock additional workout history for trends
      const extendedHistory: WorkoutSession[] = [
        ...mockWorkoutHistory,
        {
          id: 'workout-2',
          userId: 'user-1',
          name: 'Chest Day 2',
          startTime: '2025-09-16T08:00:00Z',
          endTime: '2025-09-16T09:30:00Z',
          exercises: [
            {
              name: 'Bench Press',
              category: 'Chest',
              sets: [
                { repetitions: 10, weight: 77.5, intensity: 8 },
                { repetitions: 8, weight: 80, intensity: 9 }
              ]
            }
          ],
          createdAt: '2025-09-16T08:00:00Z',
          updatedAt: '2025-09-16T09:30:00Z'
        }
      ];
      
      mockWorkoutStorage.findByUser.mockResolvedValue(extendedHistory);
      
      render(
        <ExerciseManagement
          userId="user-1"
          showAnalytics={true}
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      // Open analytics view
      await user.click(screen.getByRole('tab', { name: /analytics/i }));
      
      // Should show progress trends
      expect(screen.getByText(/weight progression/i)).toBeInTheDocument();
      expect(screen.getByText(/volume trends/i)).toBeInTheDocument();
      
      // Click on Bench Press analytics
      const benchPressAnalytics = screen.getByText('Bench Press').closest('[data-testid="analytics-card"]');
      await user.click(benchPressAnalytics!);
      
      // Should show detailed statistics
      expect(screen.getByText(/max weight: 82.5kg/i)).toBeInTheDocument();
      expect(screen.getByText(/total volume/i)).toBeInTheDocument();
      expect(screen.getByText(/average intensity/i)).toBeInTheDocument();
      
      // Should show progression chart
      expect(screen.getByTestId('progression-chart')).toBeInTheDocument();
    });

    it('should calculate and display personal records', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseManagement
          userId="user-1"
          showAnalytics={true}
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('tab', { name: /records/i }));
      
      // Should show personal records
      expect(screen.getByText(/personal records/i)).toBeInTheDocument();
      
      // Bench Press records
      const benchPressRecord = screen.getByText('Bench Press').closest('[data-testid="record-card"]');
      expect(benchPressRecord).toContainHTML('82.5kg');
      expect(benchPressRecord).toContainHTML('1RM estimate');
      
      // Should show record progression dates
      expect(screen.getByText(/sep 18, 2025/i)).toBeInTheDocument();
    });
  });

  describe('Exercise Import and Export', () => {
    it('should import exercise templates from file', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseManagement
          userId="user-1"
          allowImport={true}
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      // Mock file content
      const importData = [
        {
          name: 'Pull-up',
          category: 'Back',
          muscleGroups: ['Lats', 'Biceps'],
          instructions: 'Hang from bar, pull body up until chin over bar'
        }
      ];
      
      // Open import dialog
      await user.click(screen.getByRole('button', { name: /import templates/i }));
      
      // Mock file upload
      const fileInput = screen.getByLabelText(/choose file/i);
      const file = new File([JSON.stringify(importData)], 'exercises.json', { type: 'application/json' });
      await user.upload(fileInput, file);
      
      await user.click(screen.getByRole('button', { name: /import/i }));
      
      await waitFor(() => {
        expect(mockExerciseStorage.create).toHaveBeenCalledWith({
          name: 'Pull-up',
          category: 'Back',
          muscleGroups: ['Lats', 'Biceps'],
          instructions: 'Hang from bar, pull body up until chin over bar'
        });
      });
    });

    it('should export exercise templates to file', async () => {
      const user = userEvent.setup();
      
      // Mock download function
      const mockDownload = jest.fn();
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();
      
      // Mock createElement and appendChild for download link
      const mockLink = {
        href: '',
        download: '',
        click: mockDownload,
        remove: jest.fn()
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      
      render(
        <ExerciseManagement
          userId="user-1"
          allowExport={true}
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /export templates/i }));
      
      expect(mockDownload).toHaveBeenCalled();
      expect(mockLink.download).toBe('exercise-templates.json');
    });
  });

  describe('Error Handling', () => {
    it('should handle template loading errors gracefully', async () => {
      mockExerciseStorage.findAll.mockRejectedValue(new Error('Failed to load templates'));
      
      render(
        <ExerciseManagement
          userId="user-1"
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load exercise templates/i)).toBeInTheDocument();
      });
      
      // Should show retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle template creation errors', async () => {
      const user = userEvent.setup();
      
      mockExerciseStorage.create.mockRejectedValue(new Error('Failed to create template'));
      
      render(
        <ExerciseManagement
          userId="user-1"
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      // Try to create template
      await user.click(screen.getByRole('button', { name: /create template/i }));
      await user.type(screen.getByLabelText(/exercise name/i), 'Test Exercise');
      await user.selectOptions(screen.getByLabelText(/category/i), 'Chest');
      await user.click(screen.getByRole('button', { name: /create template/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/failed to create exercise template/i)).toBeInTheDocument();
      });
    });

    it('should handle template deletion errors', async () => {
      const user = userEvent.setup();
      
      mockExerciseStorage.delete.mockRejectedValue(new Error('Failed to delete template'));
      
      render(
        <ExerciseManagement
          userId="user-1"
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      // Try to delete template
      const benchPressCard = screen.getByText('Bench Press').closest('[data-testid="exercise-card"]');
      const deleteButton = benchPressCard?.querySelector('[data-testid="delete-button"]');
      await user.click(deleteButton!);
      await user.click(screen.getByRole('button', { name: /delete/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/failed to delete exercise template/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and Mobile Behavior', () => {
    it('should support keyboard navigation through exercise list', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseManagement
          userId="user-1"
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      // Tab through exercise cards
      await user.tab();
      expect(screen.getByText('Bench Press').closest('[data-testid="exercise-card"]')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('Squat').closest('[data-testid="exercise-card"]')).toHaveFocus();
      
      // Use Enter to select
      await user.keyboard('{Enter}');
      expect(mockOnExerciseSelect).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Squat'
      }));
    });

    it('should announce state changes to screen readers', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseManagement
          userId="user-1"
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      // Filter exercises
      const categoryFilter = screen.getByLabelText(/filter by category/i);
      await user.selectOptions(categoryFilter, 'Chest');
      
      // Should announce the filtered state
      expect(screen.getByLabelText(/showing \d+ exercises/i)).toBeInTheDocument();
    });

    it('should optimize touch targets for mobile', async () => {
      const user = userEvent.setup();
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 667 });
      
      render(
        <ExerciseManagement
          userId="user-1"
          onExerciseSelect={mockOnExerciseSelect}
          onTemplateUpdate={mockOnTemplateUpdate}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
      
      // Check minimum touch target sizes
      const exerciseCard = screen.getByText('Bench Press').closest('[data-testid="exercise-card"]');
      expect(exerciseCard).toHaveStyle('min-height: 44px');
      
      const editButton = exerciseCard?.querySelector('[data-testid="edit-button"]');
      expect(editButton).toHaveStyle('min-width: 44px');
      expect(editButton).toHaveStyle('min-height: 44px');
    });
  });
});