/**
 * WorkoutForm Component Unit Tests (simplified)
 * Focused on core flows: render, typing, submit, cancel, loading
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkoutForm } from '@/components/workout/workout-form';

const mockWorkout = {
  name: 'Push Day',
  notes: 'Good session',
  exercises: [],
};

describe('WorkoutForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty form with required fields and actions', () => {
    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByTestId('workout-form')).toBeInTheDocument();
    expect(screen.getByLabelText(/workout name/i)).toHaveValue('');
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create workout/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('prefills data when workout is provided', () => {
    render(<WorkoutForm workout={mockWorkout} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const nameInput = screen.getByLabelText(/workout name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Push Day');
    expect(screen.getByLabelText(/notes/i)).toHaveValue('Good session');
  });

  it('submits name when provided', async () => {
    const user = userEvent.setup();
    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const nameInput = screen.getByLabelText(/workout name/i);
    const submitButton = screen.getByRole('button', { name: /create workout/i });

    await user.type(nameInput, 'Test Workout');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Workout' })
    );
  });

  it('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<WorkoutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});