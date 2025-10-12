/**
 * ExerciseForm Component Unit Tests
 * Tests for exercise form with sets management and validation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseForm } from '@/components/workout/exercise-form';
import { ExerciseTemplate, WorkoutExercise } from '@/types';

// Mock exercise templates
const mockExerciseTemplates: ExerciseTemplate[] = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'chest',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: 'barbell',
    instructions: 'Lie on bench...'
  },
  {
    id: 'squat',
    name: 'Squat',
    category: 'legs',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['glutes'],
    equipment: 'barbell',
    instructions: 'Stand with feet...'
  }
];

// Mock workout exercise
const mockWorkoutExercise: WorkoutExercise = {
  templateId: 'bench-press',
  sets: [
    { reps: 10, weight: 80, intensity: 8, restTime: 120, completed: true },
    { reps: 8, weight: 85, intensity: 9, restTime: 120, completed: false }
  ]
};

describe('ExerciseForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnUpdateSet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render exercise selector when no exercise is selected', () => {
    render(
      <ExerciseForm 
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText(/select exercise/i)).toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Squat')).toBeInTheDocument();
  });

  it('should render exercise form when exercise is selected', () => {
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText(/sets/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add set/i })).toBeInTheDocument();
  });

  it('should display existing sets data', () => {
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    const weightInputs = screen.getAllByLabelText(/weight/i);
    const repsInputs = screen.getAllByLabelText(/reps/i);
    
    expect(weightInputs).toHaveLength(2);
    expect(repsInputs).toHaveLength(2);
    expect(weightInputs[0]).toHaveValue(80);
    expect(repsInputs[0]).toHaveValue(10);
  });

  it('should select exercise template', async () => {
    const user = userEvent.setup();
    render(
      <ExerciseForm 
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    const benchPressOption = screen.getByText('Bench Press');
    await user.click(benchPressOption);
    
    expect(screen.getByText('Primary: chest')).toBeInTheDocument();
    expect(screen.getByText('Secondary: shoulders, triceps')).toBeInTheDocument();
  });

  it('should add new set', async () => {
    const user = userEvent.setup();
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    const addSetButton = screen.getByRole('button', { name: /add set/i });
    await user.click(addSetButton);
    
    const weightInputs = screen.getAllByLabelText(/weight/i);
    expect(weightInputs).toHaveLength(3);
  });

  it('should remove set', async () => {
    const user = userEvent.setup();
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    const removeButtons = screen.getAllByRole('button', { name: /remove set/i });
    await user.click(removeButtons[0]);
    
    const weightInputs = screen.getAllByLabelText(/weight/i);
    expect(weightInputs).toHaveLength(1);
  });

  it('should update set weight', async () => {
    const user = userEvent.setup();
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        onUpdateSet={mockOnUpdateSet}
      />
    );
    
    const weightInput = screen.getAllByLabelText(/weight/i)[0];
    await user.clear(weightInput);
    await user.type(weightInput, '85');
    
    expect(mockOnUpdateSet).toHaveBeenCalledWith(
      0, 
      expect.objectContaining({ weight: 85 })
    );
  });

  it('should update set reps', async () => {
    const user = userEvent.setup();
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        onUpdateSet={mockOnUpdateSet}
      />
    );
    
    const repsInput = screen.getAllByLabelText(/reps/i)[0];
    await user.clear(repsInput);
    await user.type(repsInput, '12');
    
    expect(mockOnUpdateSet).toHaveBeenCalledWith(
      0, 
      expect.objectContaining({ reps: 12 })
    );
  });

  it('should update set intensity (RPE)', async () => {
    const user = userEvent.setup();
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        onUpdateSet={mockOnUpdateSet}
      />
    );
    
    const intensitySlider = screen.getAllByLabelText(/intensity/i)[0];
    fireEvent.change(intensitySlider, { target: { value: '9' } });
    
    expect(mockOnUpdateSet).toHaveBeenCalledWith(
      0, 
      expect.objectContaining({ intensity: 9 })
    );
  });

  it('should toggle set completion', async () => {
    const user = userEvent.setup();
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        onUpdateSet={mockOnUpdateSet}
      />
    );
    
    const completedCheckbox = screen.getAllByRole('checkbox', { name: /completed/i })[1];
    await user.click(completedCheckbox);
    
    expect(mockOnUpdateSet).toHaveBeenCalledWith(
      1, 
      expect.objectContaining({ completed: true })
    );
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    const submitButton = screen.getByRole('button', { name: /save exercise/i });
    const weightInput = screen.getAllByLabelText(/weight/i)[0];
    
    await user.clear(weightInput);
    await user.click(submitButton);
    
    expect(screen.getByText(/weight is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid exercise data', async () => {
    const user = userEvent.setup();
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    const submitButton = screen.getByRole('button', { name: /save exercise/i });
    await user.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: 'bench-press',
        sets: expect.arrayContaining([
          expect.objectContaining({ weight: 80, reps: 10 })
        ])
      })
    );
  });

  it('should handle form cancellation', async () => {
    const user = userEvent.setup();
    render(
      <ExerciseForm 
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should show exercise details', () => {
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText(/barbell/i)).toBeInTheDocument();
    expect(screen.getByText(/chest/i)).toBeInTheDocument();
  });

  it('should display rest timer for active set', () => {
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        activeSetIndex={0}
        restTimer={90}
      />
    );
    
    expect(screen.getByText(/rest: 1:30/i)).toBeInTheDocument();
  });

  it('should handle keyboard navigation between sets', async () => {
    const user = userEvent.setup();
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    const firstWeightInput = screen.getAllByLabelText(/weight/i)[0];
    const firstRepsInput = screen.getAllByLabelText(/reps/i)[0];
    
    await user.click(firstWeightInput);
    await user.tab();
    
    expect(firstRepsInput).toHaveFocus();
  });

  it('should show loading state during submission', () => {
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );
    
    const submitButton = screen.getByRole('button', { name: /save exercise/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should validate numeric inputs', async () => {
    const user = userEvent.setup();
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    const weightInput = screen.getAllByLabelText(/weight/i)[0];
    await user.clear(weightInput);
    await user.type(weightInput, 'invalid');
    
    expect(screen.getByText(/weight must be a number/i)).toBeInTheDocument();
  });

  it('should copy previous set data', async () => {
    const user = userEvent.setup();
    render(
      <ExerciseForm 
        exercise={mockWorkoutExercise}
        exerciseTemplates={mockExerciseTemplates}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
      />
    );
    
    const copyButtons = screen.getAllByRole('button', { name: /copy previous/i });
    await user.click(copyButtons[1]);
    
    const weightInputs = screen.getAllByLabelText(/weight/i);
    expect(weightInputs[1]).toHaveValue(80);
  });
});