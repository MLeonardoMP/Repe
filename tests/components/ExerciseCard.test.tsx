import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import type { Exercise } from '@/types';

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

  it('renders main exercise info', () => {
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
    expect(screen.getByText(/2\s+sets/i)).toBeInTheDocument();
  });

  it('shows empty state when no sets', () => {
    render(
      <ExerciseCard
        exercise={mockExerciseNoSets}
        onAddSet={mockOnAddSet}
        onEditSet={mockOnEditSet}
        onDeleteSet={mockOnDeleteSet}
        onEditExercise={mockOnEditExercise}
      />
    );

    expect(screen.getByText(/no sets yet/i)).toBeInTheDocument();
  });

  it('lists all sets', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        onAddSet={mockOnAddSet}
        onEditSet={mockOnEditSet}
        onDeleteSet={mockOnDeleteSet}
        onEditExercise={mockOnEditExercise}
      />
    );

    const sets = screen.getAllByRole('listitem');
    expect(sets).toHaveLength(2);
  });

  it('calls onAddSet when Add Set is clicked', async () => {
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

    const addSetButton = screen.getByRole('button', { name: /add set/i });
    await user.click(addSetButton);

    expect(mockOnAddSet).toHaveBeenCalledWith('ex-1');
  });
});