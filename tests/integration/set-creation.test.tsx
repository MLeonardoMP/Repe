/**
 * T007: Integration test - Add set via dialog
 * Tests the quick set dialog integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SetForm } from '@/components/workout/SetForm';

// Mock the storage module
jest.mock('@/lib/storage', () => ({
  addSetToExercise: jest.fn((exerciseId, data) =>
    Promise.resolve({
      id: 'test-set-id',
      exerciseId,
      repetitions: data.repetitions,
      weight: data.weight,
      isCompleted: true,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  ),
}));

describe('Set Creation via QuickSetDialog', () => {
  const mockExercise = {
    id: 'test-exercise-id',
    sessionId: 'test-session-id',
    name: 'Bench Press',
    category: 'Chest',
    sets: [],
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display add set button', () => {
    render(<SetForm exercise={mockExercise} onUpdate={jest.fn()} />);

    const addButton = screen.getByRole('button', { name: /add set|agregar serie/i });
    expect(addButton).toBeInTheDocument();
  });

  it('should open quick set dialog when add set clicked', async () => {
    render(<SetForm exercise={mockExercise} onUpdate={jest.fn()} />);

    const addButton = screen.getByRole('button', { name: /add set|agregar serie/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should not show native prompt for set data', async () => {
    const mockPrompt = jest.spyOn(window, 'prompt');
    
    render(<SetForm exercise={mockExercise} onUpdate={jest.fn()} />);

    const addButton = screen.getByRole('button', { name: /add set|agregar serie/i });
    fireEvent.click(addButton);

    expect(mockPrompt).not.toHaveBeenCalled();
  });

  it('should display reps and weight inputs in dialog', async () => {
    render(<SetForm exercise={mockExercise} onUpdate={jest.fn()} />);

    const addButton = screen.getByRole('button', { name: /add set|agregar serie/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/reps|repetitions|repeticiones/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/weight|peso/i)).toBeInTheDocument();
    });
  });

  it('should add set with reps and weight when confirmed', async () => {
    const { addSetToExercise } = require('@/lib/storage');
    const mockOnUpdate = jest.fn();
    
    render(<SetForm exercise={mockExercise} onUpdate={mockOnUpdate} />);

    const addButton = screen.getByRole('button', { name: /add set|agregar serie/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/reps|repetitions|repeticiones/i)).toBeInTheDocument();
    });

    const repsInput = screen.getByLabelText(/reps|repetitions|repeticiones/i);
    const weightInput = screen.getByLabelText(/weight|peso/i);

    fireEvent.change(repsInput, { target: { value: '10' } });
    fireEvent.change(weightInput, { target: { value: '80' } });

    const confirmButton = screen.getByRole('button', { name: /confirm|add|agregar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(addSetToExercise).toHaveBeenCalledWith(
        'test-exercise-id',
        expect.objectContaining({
          repetitions: 10,
          weight: 80,
        })
      );
    });
  });

  it('should add set with only reps when weight is empty', async () => {
    const { addSetToExercise } = require('@/lib/storage');
    
    render(<SetForm exercise={mockExercise} onUpdate={jest.fn()} />);

    const addButton = screen.getByRole('button', { name: /add set|agregar serie/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/reps|repetitions|repeticiones/i)).toBeInTheDocument();
    });

    const repsInput = screen.getByLabelText(/reps|repetitions|repeticiones/i);
    fireEvent.change(repsInput, { target: { value: '10' } });

    const confirmButton = screen.getByRole('button', { name: /confirm|add|agregar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(addSetToExercise).toHaveBeenCalledWith(
        'test-exercise-id',
        expect.objectContaining({
          repetitions: 10,
          weight: undefined,
        })
      );
    });
  });

  it('should close dialog after set creation', async () => {
    render(<SetForm exercise={mockExercise} onUpdate={jest.fn()} />);

    const addButton = screen.getByRole('button', { name: /add set|agregar serie/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const repsInput = screen.getByLabelText(/reps|repetitions|repeticiones/i);
    fireEvent.change(repsInput, { target: { value: '10' } });

    const confirmButton = screen.getByRole('button', { name: /confirm|add|agregar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should call onUpdate after set is added', async () => {
    const mockOnUpdate = jest.fn();
    
    render(<SetForm exercise={mockExercise} onUpdate={mockOnUpdate} />);

    const addButton = screen.getByRole('button', { name: /add set|agregar serie/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/reps|repetitions|repeticiones/i)).toBeInTheDocument();
    });

    const repsInput = screen.getByLabelText(/reps|repetitions|repeticiones/i);
    fireEvent.change(repsInput, { target: { value: '10' } });

    const confirmButton = screen.getByRole('button', { name: /confirm|add|agregar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('should validate reps is required', async () => {
    render(<SetForm exercise={mockExercise} onUpdate={jest.fn()} />);

    const addButton = screen.getByRole('button', { name: /add set|agregar serie/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /confirm|add|agregar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      const { addSetToExercise } = require('@/lib/storage');
      expect(addSetToExercise).not.toHaveBeenCalled();
    });
  });

  it('should display added set in the set list', async () => {
    const updatedExercise = {
      ...mockExercise,
      sets: [
        {
          id: 'test-set-id',
          exerciseId: 'test-exercise-id',
          repetitions: 10,
          weight: 80,
          isCompleted: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    render(<SetForm exercise={updatedExercise} onUpdate={jest.fn()} />);

    expect(screen.getByText(/10.*reps/i)).toBeInTheDocument();
    expect(screen.getByText(/80.*kg/i)).toBeInTheDocument();
  });
});
