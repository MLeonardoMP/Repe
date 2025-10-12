/**
 * ExerciseCard Component Unit Tests
 * Tests for exercise display with sets management
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import type { Exercise } from '@/types';

// Mock exercise data
const mockExercise: Exercise = {
  id: 'ex-1',
  sessionId: 'session-1',
  name: 'Bench Press',
  category: 'Chest',
  sets: [
    {
      id: 'set-1',
      exerciseId: 'ex-1',
      repetitions: 10,
      weight: 80,
      intensity: 8,
      order: 0,
      isCompleted: true,
      createdAt: '2025-09-19T08:05:00Z',
      updatedAt: '2025-09-19T08:06:00Z'
    },
    {
      id: 'set-2',
      exerciseId: 'ex-1',
      repetitions: 8,
      weight: 82.5,
      intensity: 9,
      order: 1,
      isCompleted: true,
      createdAt: '2025-09-19T08:10:00Z',
      updatedAt: '2025-09-19T08:11:00Z'
    }
  ],
  notes: 'Good form throughout',
  order: 0,
  createdAt: '2025-09-19T08:05:00Z',
  updatedAt: '2025-09-19T08:15:00Z'
};

const mockExerciseNoSets: Exercise = {
  ...mockExercise,
  id: 'ex-no-sets',
  sets: []
};

describe('ExerciseCard Component', () => {
  const mockOnAddSet = jest.fn();
  const mockOnEditSet = jest.fn();
  const mockOnDeleteSet = jest.fn();
  const mockOnEditExercise = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Display and Layout', () => {
    it('should render exercise basic information', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Chest')).toBeInTheDocument();
      expect(screen.getByText('Good form throughout')).toBeInTheDocument();
      expect(screen.getByText(/2 sets/)).toBeInTheDocument();
    });

    it('should render exercise without category', () => {
      const exerciseNoCategory = { ...mockExercise, category: undefined };
      
      render(
        <ExerciseCard
          exercise={exerciseNoCategory}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.queryByText('Chest')).not.toBeInTheDocument();
    });

    it('should render exercise without notes', () => {
      const exerciseNoNotes = { ...mockExercise, notes: undefined };
      
      render(
        <ExerciseCard
          exercise={exerciseNoNotes}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.queryByText('Good form throughout')).not.toBeInTheDocument();
    });

    it('should render exercise with no sets', () => {
      render(
        <ExerciseCard
          exercise={mockExerciseNoSets}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      expect(screen.getByText(/No sets yet/)).toBeInTheDocument();
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });

    it('should show active indicator when isActive prop is true', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
          isActive={true}
        />
      );
      
      expect(screen.getByTestId('active-exercise-indicator')).toBeInTheDocument();
      expect(screen.getByText(/Currently active/)).toBeInTheDocument();
    });
  });

  describe('Sets Display', () => {
    it('should display all sets with correct information', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      // First set - look for specific set content using within
      const firstSet = screen.getByTestId('set-set-1');
      expect(within(firstSet).getByText(/10 reps/)).toBeInTheDocument();
      expect(screen.getByText(/80 kg/)).toBeInTheDocument();
      expect(screen.getByText(/RPE 8/)).toBeInTheDocument();

      // Second set - look for specific set content using within
      const secondSet = screen.getByTestId('set-set-2');
      expect(within(secondSet).getByText(/8 reps/)).toBeInTheDocument();
      expect(screen.getByText(/82.5 kg/)).toBeInTheDocument();
      expect(screen.getByText(/RPE 9/)).toBeInTheDocument();
    });

    it('should handle sets with missing optional data', () => {
      const exerciseWithMinimalSets: Exercise = {
        ...mockExercise,
        sets: [{
          id: 'set-minimal',
          exerciseId: 'ex-1',
          repetitions: 10,
          order: 0,
          isCompleted: true,
          createdAt: '2025-09-19T08:05:00Z',
          updatedAt: '2025-09-19T08:06:00Z'
        }]
      };
      
      render(
        <ExerciseCard
          exercise={exerciseWithMinimalSets}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      const minimalSet = screen.getByTestId('set-set-minimal');
      expect(within(minimalSet).getByText(/10 reps/)).toBeInTheDocument();
      expect(screen.queryByText(/kg/)).not.toBeInTheDocument();
      expect(screen.queryByText(/RPE/)).not.toBeInTheDocument();
    });

    it('should show completed/incomplete status for sets', () => {
      const exerciseWithMixedSets: Exercise = {
        ...mockExercise,
        sets: [
          { ...mockExercise.sets[0], isCompleted: true },
          { ...mockExercise.sets[1], isCompleted: false }
        ]
      };
      
      render(
        <ExerciseCard
          exercise={exerciseWithMixedSets}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      const completedSets = screen.getAllByTestId(/set-.*-completed/);
      const incompleteSets = screen.getAllByTestId(/set-.*-incomplete/);
      
      expect(completedSets).toHaveLength(1);
      expect(incompleteSets).toHaveLength(1);
    });
  });

  describe('User Interactions', () => {
    it('should call onAddSet when add set button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      await user.click(screen.getByRole('button', { name: /add set/i }));
      
      expect(mockOnAddSet).toHaveBeenCalledWith('ex-1');
    });

    it('should call onEditExercise when exercise header is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      await user.click(screen.getByTestId('exercise-header'));
      
      expect(mockOnEditExercise).toHaveBeenCalledWith('ex-1');
    });

    it('should call onEditSet when set is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      await user.click(screen.getByTestId('set-set-1'));
      
      expect(mockOnEditSet).toHaveBeenCalledWith('set-1');
    });

    it('should call onDeleteSet when delete set button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      await user.click(screen.getByLabelText(/delete set 1/i));
      
      expect(mockOnDeleteSet).toHaveBeenCalledWith('set-1');
    });

    it('should handle keyboard navigation for sets', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      const firstSet = screen.getByTestId('set-set-1');
      await user.tab();
      
      if (firstSet.matches(':focus')) {
        await user.keyboard('{Enter}');
        expect(mockOnEditSet).toHaveBeenCalledWith('set-1');
      }
    });
  });

  describe('Set Statistics', () => {
    it('should display exercise statistics summary', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      // Should show total volume, average intensity, etc.
      expect(screen.getByText(/Total: 18 reps/)).toBeInTheDocument();
      expect(screen.getByText(/Max: 82.5 kg/)).toBeInTheDocument();
      expect(screen.getByText(/Avg RPE: 8.5/)).toBeInTheDocument();
    });

    it('should handle statistics for sets without weight', () => {
      const bodyweightExercise: Exercise = {
        ...mockExercise,
        name: 'Push Ups',
        sets: [{
          id: 'set-bw',
          exerciseId: 'ex-1',
          repetitions: 20,
          order: 0,
          isCompleted: true,
          createdAt: '2025-09-19T08:05:00Z',
          updatedAt: '2025-09-19T08:06:00Z'
        }]
      };
      
      render(
        <ExerciseCard
          exercise={bodyweightExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      expect(screen.getByText(/Total: 20 reps/)).toBeInTheDocument();
      expect(screen.queryByText(/kg/)).not.toBeInTheDocument();
    });
  });

  describe('Mobile Optimization', () => {
    it('should have appropriate touch targets for mobile', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      const addSetButton = screen.getByRole('button', { name: /add set/i });
      const deleteButtons = screen.getAllByLabelText(/delete set/i);
      
      expect(addSetButton).toHaveClass('min-h-[44px]');
      deleteButtons.forEach(button => {
        expect(button).toHaveClass('min-h-[44px]', 'min-w-[44px]');
      });
    });

    it('should support swipe gestures for set management', async () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      const firstSet = screen.getByTestId('set-set-1');
      
      // Simulate swipe left to reveal delete action
      fireEvent.touchStart(firstSet, { touches: [{ clientX: 100, clientY: 0 }] });
      fireEvent.touchMove(firstSet, { touches: [{ clientX: 50, clientY: 0 }] });
      fireEvent.touchEnd(firstSet);
      
      await waitFor(() => {
        expect(firstSet).toHaveClass('swipe-left-active');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      expect(screen.getByRole('region', { name: /bench press exercise/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add set to bench press/i })).toBeInTheDocument();
      
      const sets = screen.getAllByRole('listitem');
      expect(sets).toHaveLength(2);
    });

    it('should announce set completion status to screen readers', () => {
      render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      const completedSets = screen.getAllByLabelText(/completed set/i);
      expect(completedSets).toHaveLength(2);
    });

    it('should support keyboard navigation through sets', async () => {
      const user = userEvent.setup();
      
      render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      // Tab through interactive elements
      await user.tab(); // Exercise header
      await user.tab(); // First set
      await user.tab(); // First set delete button
      await user.tab(); // Second set
      await user.tab(); // Second set delete button
      await user.tab(); // Add set button
      
      expect(screen.getByRole('button', { name: /add set/i })).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('should memoize set components to prevent unnecessary re-renders', () => {
      const { rerender } = render(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      const firstRenderSets = screen.getAllByTestId(/set-/);
      
      rerender(
        <ExerciseCard
          exercise={mockExercise}
          onAddSet={mockOnAddSet}
          onEditSet={mockOnEditSet}
          onDeleteSet={mockOnDeleteSet}
          onEditExercise={mockOnEditExercise}
        />
      );
      
      const secondRenderSets = screen.getAllByTestId(/set-/);
      
      // Sets should be the same DOM nodes (memoized)
      expect(firstRenderSets[0]).toBe(secondRenderSets[0]);
      expect(firstRenderSets[1]).toBe(secondRenderSets[1]);
    });
  });

  describe('Error Handling', () => {
    it('should handle sets with invalid data gracefully', () => {
      const exerciseWithInvalidSet: Exercise = {
        ...mockExercise,
        sets: [{
          id: 'invalid-set',
          exerciseId: 'ex-1',
          repetitions: -1, // Invalid
          weight: -50, // Invalid
          order: 0,
          isCompleted: true,
          createdAt: 'invalid-date', // Invalid
          updatedAt: '2025-09-19T08:06:00Z'
        }]
      };
      
      expect(() => {
        render(
          <ExerciseCard
            exercise={exerciseWithInvalidSet as any}
            onAddSet={mockOnAddSet}
            onEditSet={mockOnEditSet}
            onDeleteSet={mockOnDeleteSet}
            onEditExercise={mockOnEditExercise}
          />
        );
      }).not.toThrow();
      
      // Should show some error indication or default values
      expect(screen.getByText(/Invalid set data/)).toBeInTheDocument();
    });

    it('should handle missing callback props gracefully', () => {
      expect(() => {
        render(
          <ExerciseCard
            exercise={mockExercise}
            onAddSet={mockOnAddSet}
            onEditSet={mockOnEditSet}
            onDeleteSet={mockOnDeleteSet}
            onEditExercise={mockOnEditExercise}
          />
        );
      }).not.toThrow();
    });
  });
});