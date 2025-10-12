/**
 * WorkoutForm Component Unit Tests
 * Tests for workout form with validation and submission
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkoutForm } from '@/components/workout/workout-form';

// Mock workout data
const mockWorkout = {
  name: 'Push Day',
  exercises: [
    {
      templateId: 'bench-press',
      sets: [
        { reps: 10, weight: 80, intensity: 8, restTime: 120, completed: true }
      ]
    }
  ],
  startTime: '2024-01-15T10:00:00Z',
  endTime: '2024-01-15T11:30:00Z',
  notes: 'Good session'
};

describe('WorkoutForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty form for new workout', () => {
    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByLabelText(/workout name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/workout name/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /start workout/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should render form with existing workout data', () => {
    render(
      <WorkoutForm 
        workout={mockWorkout}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    const nameInput = screen.getByLabelText(/workout name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Push Day');
    expect(screen.getByText('bench-press')).toBeInTheDocument();
  });

  it('should handle workout name input', async () => {
    const user = userEvent.setup();
    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const nameInput = screen.getByLabelText(/workout name/i);
    await user.type(nameInput, 'New Workout');
    
    expect(nameInput).toHaveValue('New Workout');
  });

  it('should validate required workout name', async () => {
    const user = userEvent.setup();
    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const submitButton = screen.getByRole('button', { name: /start workout/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/workout name is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should add exercise to workout', async () => {
    const user = userEvent.setup();
    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const addExerciseButton = screen.getByRole('button', { name: /add exercise/i });
    await user.click(addExerciseButton);
    
    expect(screen.getByTestId('exercise-selector')).toBeInTheDocument();
  });

  it('should remove exercise from workout', async () => {
    const user = userEvent.setup();
    render(
      <WorkoutForm 
        workout={mockWorkout}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    const removeButton = screen.getByRole('button', { name: /remove exercise/i });
    await user.click(removeButton);
    
    expect(screen.queryByText('bench-press')).not.toBeInTheDocument();
  });

  it('should handle workout notes input', async () => {
    const user = userEvent.setup();
    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const notesInput = screen.getByLabelText(/notes/i);
    await user.type(notesInput, 'Great workout today');
    
    expect(notesInput).toHaveValue('Great workout today');
  });

  it('should submit valid workout data', async () => {
    const user = userEvent.setup();
    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const nameInput = screen.getByLabelText(/workout name/i);
    const submitButton = screen.getByRole('button', { name: /start workout/i });
    
    await user.type(nameInput, 'Test Workout');
    await user.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Workout'
      })
    );
  });

  it('should handle form cancellation', async () => {
    const user = userEvent.setup();
    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    render(
      <WorkoutForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );
    
    const submitButton = screen.getByRole('button', { name: /start workout/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display validation errors', async () => {
    const user = userEvent.setup();
    render(
      <WorkoutForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        errors={{ name: 'Name is too short' }}
      />
    );
    
    expect(screen.getByText('Name is too short')).toBeInTheDocument();
  });

  it('should handle exercise template selection', async () => {
    const user = userEvent.setup();
    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const addExerciseButton = screen.getByRole('button', { name: /add exercise/i });
    await user.click(addExerciseButton);
    
    const exerciseOption = screen.getByText('Bench Press');
    await user.click(exerciseOption);
    
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
  });

  it('should validate exercise requirements', async () => {
    const user = userEvent.setup();
    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const nameInput = screen.getByLabelText(/workout name/i);
    const submitButton = screen.getByRole('button', { name: /start workout/i });
    
    await user.type(nameInput, 'Test Workout');
    await user.click(submitButton);
    
    expect(screen.getByText(/at least one exercise is required/i)).toBeInTheDocument();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const nameInput = screen.getByLabelText(/workout name/i);
    await user.tab();
    
    expect(nameInput).toHaveFocus();
    
    await user.tab();
    expect(screen.getByRole('button', { name: /add exercise/i })).toHaveFocus();
  });

  it('should handle form reset', () => {
    const { rerender } = render(
      <WorkoutForm 
        workout={mockWorkout}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    rerender(
      <WorkoutForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        reset={true}
      />
    );
    
    const nameInput = screen.getByLabelText(/workout name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('');
  });
});