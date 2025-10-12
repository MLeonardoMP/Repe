/**
 * WorkoutSessionCard Component Unit Tests
 * Tests for workout session summary display and interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkoutSessionCard } from '@/components/workout/WorkoutSessionCard';
import type { WorkoutSession } from '@/types';

// Mock workout session data
const mockWorkoutSession: WorkoutSession = {
  id: 'session-1',
  userId: 'user-1',
  name: 'Push Day',
  startTime: '2025-09-19T08:00:00Z',
  endTime: '2025-09-19T09:30:00Z',
  exercises: [
    {
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
        }
      ],
      notes: 'Good form',
      order: 0,
      createdAt: '2025-09-19T08:05:00Z',
      updatedAt: '2025-09-19T08:15:00Z'
    }
  ],
  notes: 'Great workout session',
  createdAt: '2025-09-19T08:00:00Z',
  updatedAt: '2025-09-19T09:30:00Z'
};

const mockActiveSession: WorkoutSession = {
  ...mockWorkoutSession,
  id: 'active-session',
  endTime: undefined
};

describe('WorkoutSessionCard Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Display and Layout', () => {
    it('should render workout session basic information', () => {
      render(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
        />
      );
      
      expect(screen.getByText('Push Day')).toBeInTheDocument();
      expect(screen.getByText(/Sep 19, 2025/)).toBeInTheDocument();
      expect(screen.getByText(/1 exercise/)).toBeInTheDocument();
      expect(screen.getByText(/1h 30m/)).toBeInTheDocument();
    });

    it('should render default name when session name is not provided', () => {
      const sessionWithoutName = { ...mockWorkoutSession, name: undefined };
      
      render(
        <WorkoutSessionCard
          session={sessionWithoutName}
          onView={mockOnView}
        />
      );
      
      expect(screen.getByText(/Workout on Sep 19, 2025/)).toBeInTheDocument();
    });

    it('should show active session indicator for sessions without endTime', () => {
      render(
        <WorkoutSessionCard
          session={mockActiveSession}
          onView={mockOnView}
        />
      );
      
      expect(screen.getByText(/Active/)).toBeInTheDocument();
      expect(screen.getByTestId('active-indicator')).toBeInTheDocument();
    });

    it('should display exercise count correctly', () => {
      const sessionWithMultipleExercises = {
        ...mockWorkoutSession,
        exercises: [...mockWorkoutSession.exercises, {
          id: 'ex-2',
          sessionId: 'session-1',
          name: 'Push Ups',
          category: 'Chest',
          sets: [],
          order: 1,
          createdAt: '2025-09-19T08:20:00Z',
          updatedAt: '2025-09-19T08:25:00Z'
        }]
      };
      
      render(
        <WorkoutSessionCard
          session={sessionWithMultipleExercises}
          onView={mockOnView}
        />
      );
      
      expect(screen.getByText(/2 exercises/)).toBeInTheDocument();
    });

    it('should handle sessions with no exercises', () => {
      const sessionWithNoExercises = {
        ...mockWorkoutSession,
        exercises: []
      };
      
      render(
        <WorkoutSessionCard
          session={sessionWithNoExercises}
          onView={mockOnView}
        />
      );
      
      expect(screen.getByText(/No exercises/)).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render in compact variant', () => {
      render(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
          variant="compact"
        />
      );
      
      // Compact variant should show less detail
      expect(screen.getByText('Push Day')).toBeInTheDocument();
      expect(screen.queryByText('Great workout session')).not.toBeInTheDocument();
    });

    it('should render in default variant with full details', () => {
      render(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
          variant="default"
        />
      );
      
      expect(screen.getByText('Push Day')).toBeInTheDocument();
      expect(screen.getByText('Great workout session')).toBeInTheDocument();
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onView when card is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
        />
      );
      
      await user.click(screen.getByTestId('workout-session-card'));
      
      expect(mockOnView).toHaveBeenCalledWith('session-1');
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
          onEdit={mockOnEdit}
        />
      );
      
      await user.click(screen.getByLabelText(/edit workout/i));
      
      expect(mockOnEdit).toHaveBeenCalledWith('session-1');
      expect(mockOnView).not.toHaveBeenCalled();
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
          onDelete={mockOnDelete}
        />
      );
      
      await user.click(screen.getByLabelText(/delete workout/i));
      
      expect(mockOnDelete).toHaveBeenCalledWith('session-1');
      expect(mockOnView).not.toHaveBeenCalled();
    });

    it('should not show edit/delete buttons when callbacks not provided', () => {
      render(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
        />
      );
      
      expect(screen.queryByLabelText(/edit workout/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/delete workout/i)).not.toBeInTheDocument();
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );
      
      // Tab to the card
      await user.tab();
      expect(screen.getByTestId('workout-session-card')).toHaveFocus();
      
      // Enter should trigger onView
      await user.keyboard('{Enter}');
      expect(mockOnView).toHaveBeenCalledWith('session-1');
      
      // Space should also trigger onView
      mockOnView.mockClear();
      await user.keyboard(' ');
      expect(mockOnView).toHaveBeenCalledWith('session-1');
    });
  });

  describe('Duration Calculations', () => {
    it('should display correct duration for completed sessions', () => {
      render(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
        />
      );
      
      // 90 minutes = 1h 30m
      expect(screen.getByText(/1h 30m/)).toBeInTheDocument();
    });

    it('should display elapsed time for active sessions', () => {
      // Mock current time to be 1 hour after start
      const now = new Date('2025-09-19T09:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);
      
      render(
        <WorkoutSessionCard
          session={mockActiveSession}
          onView={mockOnView}
        />
      );
      
      expect(screen.getByText(/1h/)).toBeInTheDocument();
      expect(screen.getByText(/Active/)).toBeInTheDocument();
      
      jest.useRealTimers();
    });

    it('should handle sessions with same start and end time', () => {
      const quickSession = {
        ...mockWorkoutSession,
        endTime: mockWorkoutSession.startTime
      };
      
      render(
        <WorkoutSessionCard
          session={quickSession}
          onView={mockOnView}
        />
      );
      
      expect(screen.getByText(/0m/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );
      
      expect(screen.getByRole('button', { name: /view push day workout details/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/edit workout/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/delete workout/i)).toBeInTheDocument();
    });

    it('should support screen readers', () => {
      render(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
        />
      );
      
      const card = screen.getByTestId('workout-session-card');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('Push Day'));
    });

    it('should indicate active session status to screen readers', () => {
      render(
        <WorkoutSessionCard
          session={mockActiveSession}
          onView={mockOnView}
        />
      );
      
      expect(screen.getByText('Active')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Mobile Optimization', () => {
    it('should have appropriate touch targets', () => {
      render(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );
      
      const editButton = screen.getByLabelText(/edit workout/i);
      const deleteButton = screen.getByLabelText(/delete workout/i);
      
      // Touch targets should be at least 44px (will be tested via CSS classes)
      expect(editButton).toHaveClass('min-h-[44px]', 'min-w-[44px]');
      expect(deleteButton).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    });

    it('should handle touch interactions', async () => {
      const user = userEvent.setup();
      
      render(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
        />
      );
      
      const card = screen.getByTestId('workout-session-card');
      
      // Simulate touch start/end
      fireEvent.touchStart(card);
      fireEvent.touchEnd(card);
      
      await waitFor(() => {
        expect(mockOnView).toHaveBeenCalledWith('session-1');
      });
    });
  });

  describe('Performance', () => {
    it('should not re-render when session prop reference is the same', () => {
      const { rerender } = render(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
        />
      );
      
      const firstRender = screen.getByTestId('workout-session-card');
      
      rerender(
        <WorkoutSessionCard
          session={mockWorkoutSession}
          onView={mockOnView}
        />
      );
      
      const secondRender = screen.getByTestId('workout-session-card');
      
      // Component should be memoized
      expect(firstRender).toBe(secondRender);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid date strings gracefully', () => {
      const sessionWithInvalidDate = {
        ...mockWorkoutSession,
        startTime: 'invalid-date'
      };
      
      render(
        <WorkoutSessionCard
          session={sessionWithInvalidDate as any}
          onView={mockOnView}
        />
      );
      
      expect(screen.getByText(/Invalid date/)).toBeInTheDocument();
    });

    it('should handle missing required props gracefully', () => {
      // This test ensures component doesn't crash with minimal props
      expect(() => {
        render(
          <WorkoutSessionCard
            session={mockWorkoutSession}
            onView={mockOnView}
          />
        );
      }).not.toThrow();
    });
  });
});