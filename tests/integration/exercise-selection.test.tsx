/**
 * T006: Integration test - Select exercise from library
 * Tests the exercise picker dialog integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkoutActivePage from '@/app/workout/active/page';

// Mock the storage module
jest.mock('@/lib/storage', () => ({
  getCurrentWorkoutSession: jest.fn(() =>
    Promise.resolve({
      id: 'test-session-id',
      name: 'Test Workout',
      startTime: new Date().toISOString(),
      exercises: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  ),
  addExerciseToSession: jest.fn((sessionId, data) =>
    Promise.resolve({
      id: 'test-exercise-id',
      sessionId,
      name: data.name,
      category: data.category,
      sets: [],
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  ),
}));

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

describe('Exercise Selection from Library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display add exercise button', async () => {
    render(<WorkoutActivePage />);

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add exercise|agregar ejercicio/i });
      expect(addButton).toBeInTheDocument();
    });
  });

  it('should open exercise picker dialog when add exercise clicked', async () => {
    render(<WorkoutActivePage />);

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add exercise|agregar ejercicio/i });
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should not show native prompt for exercise name', async () => {
    const mockPrompt = jest.spyOn(window, 'prompt');
    
    render(<WorkoutActivePage />);

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add exercise|agregar ejercicio/i });
      fireEvent.click(addButton);
    });

    expect(mockPrompt).not.toHaveBeenCalled();
  });

  it('should display exercise library in dialog', async () => {
    render(<WorkoutActivePage />);

    const addButton = screen.getByRole('button', { name: /add exercise|agregar ejercicio/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Squat')).toBeInTheDocument();
      expect(screen.getByText('Deadlift')).toBeInTheDocument();
    });
  });

  it('should add exercise when selected from library', async () => {
    const { addExerciseToSession } = require('@/lib/storage');
    
    render(<WorkoutActivePage />);

    const addButton = screen.getByRole('button', { name: /add exercise|agregar ejercicio/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });

    const benchPressButton = screen.getByText('Bench Press');
    fireEvent.click(benchPressButton);

    await waitFor(() => {
      expect(addExerciseToSession).toHaveBeenCalledWith(
        'test-session-id',
        expect.objectContaining({
          name: 'Bench Press',
        })
      );
    });
  });

  it('should close dialog after exercise selection', async () => {
    render(<WorkoutActivePage />);

    const addButton = screen.getByRole('button', { name: /add exercise|agregar ejercicio/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });

    const benchPressButton = screen.getByText('Bench Press');
    fireEvent.click(benchPressButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should filter exercises in search', async () => {
    render(<WorkoutActivePage />);

    const addButton = screen.getByRole('button', { name: /add exercise|agregar ejercicio/i });
    fireEvent.click(addButton);

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

  it('should allow custom exercise name when not in library', async () => {
    const { addExerciseToSession } = require('@/lib/storage');
    
    render(<WorkoutActivePage />);

    const addButton = screen.getByRole('button', { name: /add exercise|agregar ejercicio/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      const customInput = screen.getByPlaceholderText(/custom|personalizado/i);
      expect(customInput).toBeInTheDocument();
    });

    const customInput = screen.getByPlaceholderText(/custom|personalizado/i);
    fireEvent.change(customInput, { target: { value: 'My Custom Exercise' } });

    const confirmButton = screen.getByRole('button', { name: /add|agregar|confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(addExerciseToSession).toHaveBeenCalledWith(
        'test-session-id',
        expect.objectContaining({
          name: 'My Custom Exercise',
        })
      );
    });
  });

  it('should display added exercise in the session', async () => {
    const { getCurrentWorkoutSession } = require('@/lib/storage');
    
    // Update mock to return session with exercise
    getCurrentWorkoutSession.mockResolvedValueOnce({
      id: 'test-session-id',
      name: 'Test Workout',
      startTime: new Date().toISOString(),
      exercises: [
        {
          id: 'test-exercise-id',
          sessionId: 'test-session-id',
          name: 'Bench Press',
          category: 'Chest',
          sets: [],
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(<WorkoutActivePage />);

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });
  });
});
