/**
 * T003: Component test for ExercisePickerDialog
 * Tests the exercise picker dialog component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExercisePickerDialog from '@/components/workout/ExercisePickerDialog';

describe('ExercisePickerDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch for exercise library
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [
            { id: 'ex-001', name: 'Bench Press', category: 'Chest', equipment: 'Barbell' },
            { id: 'ex-002', name: 'Squat', category: 'Legs', equipment: 'Barbell' },
            { id: 'ex-003', name: 'Deadlift', category: 'Back', equipment: 'Barbell' },
          ],
        }),
      } as Response)
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not render when open is false', () => {
    render(
      <ExercisePickerDialog
        open={false}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when open is true', async () => {
    render(
      <ExercisePickerDialog
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should display search input', async () => {
    render(
      <ExercisePickerDialog
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search|buscar/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('should load and display exercises from API', async () => {
    render(
      <ExercisePickerDialog
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Squat')).toBeInTheDocument();
      expect(screen.getByText('Deadlift')).toBeInTheDocument();
    });
  });

  it('should filter exercises based on search query', async () => {
    render(
      <ExercisePickerDialog
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search|buscar/i);
    fireEvent.change(searchInput, { target: { value: 'bench' } });

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.queryByText('Squat')).not.toBeInTheDocument();
    });
  });

  it('should call onSelect when exercise is clicked', async () => {
    render(
      <ExercisePickerDialog
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });

    const exerciseButton = screen.getByText('Bench Press');
    fireEvent.click(exerciseButton);

    expect(mockOnSelect).toHaveBeenCalledWith('Bench Press');
  });

  it('should call onClose when cancel button is clicked', async () => {
    render(
      <ExercisePickerDialog
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel|cancelar|cerrar/i });
      expect(cancelButton).toBeInTheDocument();
      fireEvent.click(cancelButton);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should allow custom exercise name input', async () => {
    render(
      <ExercisePickerDialog
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    await waitFor(() => {
      const customInput = screen.getByPlaceholderText(/custom|personalizado/i);
      expect(customInput).toBeInTheDocument();
    });

    const customInput = screen.getByPlaceholderText(/custom|personalizado/i);
    fireEvent.change(customInput, { target: { value: 'My Custom Exercise' } });

    const confirmButton = screen.getByRole('button', { name: /add|agregar|confirm/i });
    fireEvent.click(confirmButton);

    expect(mockOnSelect).toHaveBeenCalledWith('My Custom Exercise');
  });

  it('should show loading state while fetching exercises', () => {
    render(
      <ExercisePickerDialog
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText(/loading|cargando/i)).toBeInTheDocument();
  });

  it('should limit visible exercises to 50', async () => {
    // Mock many exercises
    const manyExercises = Array.from({ length: 100 }, (_, i) => ({
      id: `ex-${i}`,
      name: `Exercise ${i}`,
      category: 'Test',
      equipment: 'Barbell',
    }));

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: manyExercises,
        }),
      } as Response)
    );

    render(
      <ExercisePickerDialog
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    await waitFor(() => {
      const exerciseButtons = screen.queryAllByRole('button', { name: /Exercise \d+/ });
      expect(exerciseButtons.length).toBeLessThanOrEqual(50);
    });
  });
});
