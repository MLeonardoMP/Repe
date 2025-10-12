/**
 * SetTracker Component Unit Tests
 * Tests for set tracking with timer and completion
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SetTracker } from '@/components/workout/set-tracker';
import { Set } from '@/types';

// Mock set data
const mockSet: Set = {
  reps: 10,
  weight: 80,
  intensity: 8,
  restTime: 120,
  completed: false
};

const mockCompletedSet: Set = {
  reps: 8,
  weight: 85,
  intensity: 9,
  restTime: 180,
  completed: true
};

describe('SetTracker Component', () => {
  const mockOnUpdate = jest.fn();
  const mockOnComplete = jest.fn();
  const mockOnStartRest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render set inputs correctly', () => {
    render(
      <SetTracker 
        set={mockSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByText('RPE: 8')).toBeInTheDocument();
  });

  it('should show completed state for finished sets', () => {
    render(
      <SetTracker 
        set={mockCompletedSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    expect(screen.getByTestId('set-completed-badge')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { checked: true })).toBeInTheDocument();
  });

  it('should update weight input', async () => {
    const user = userEvent.setup();
    render(
      <SetTracker 
        set={mockSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    const weightInput = screen.getByLabelText(/weight/i);
    await user.clear(weightInput);
    await user.type(weightInput, '85');
    
    expect(mockOnUpdate).toHaveBeenCalledWith(0, {
      ...mockSet,
      weight: 85
    });
  });

  it('should update reps input', async () => {
    const user = userEvent.setup();
    render(
      <SetTracker 
        set={mockSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    const repsInput = screen.getByLabelText(/reps/i);
    await user.clear(repsInput);
    await user.type(repsInput, '12');
    
    expect(mockOnUpdate).toHaveBeenCalledWith(0, {
      ...mockSet,
      reps: 12
    });
  });

  it('should update intensity with slider', async () => {
    const user = userEvent.setup();
    render(
      <SetTracker 
        set={mockSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    const intensitySlider = screen.getByRole('slider', { name: /intensity/i });
    fireEvent.change(intensitySlider, { target: { value: '9' } });
    
    expect(mockOnUpdate).toHaveBeenCalledWith(0, {
      ...mockSet,
      intensity: 9
    });
  });

  it('should mark set as completed', async () => {
    const user = userEvent.setup();
    render(
      <SetTracker 
        set={mockSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    const completeButton = screen.getByRole('button', { name: /complete set/i });
    await user.click(completeButton);
    
    expect(mockOnComplete).toHaveBeenCalledWith(0);
  });

  it('should start rest timer after completion', async () => {
    const user = userEvent.setup();
    render(
      <SetTracker 
        set={mockSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
        onStartRest={mockOnStartRest}
      />
    );
    
    const completeButton = screen.getByRole('button', { name: /complete set/i });
    await user.click(completeButton);
    
    expect(mockOnStartRest).toHaveBeenCalledWith(120);
  });

  it('should display rest timer countdown', () => {
    render(
      <SetTracker 
        set={mockCompletedSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
        restTimeRemaining={90}
        isResting={true}
      />
    );
    
    expect(screen.getByText('Rest: 1:30')).toBeInTheDocument();
  });

  it('should show skip rest button during rest', async () => {
    const user = userEvent.setup();
    const mockOnSkipRest = jest.fn();
    
    render(
      <SetTracker 
        set={mockCompletedSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
        restTimeRemaining={90}
        isResting={true}
        onSkipRest={mockOnSkipRest}
      />
    );
    
    const skipButton = screen.getByRole('button', { name: /skip rest/i });
    await user.click(skipButton);
    
    expect(mockOnSkipRest).toHaveBeenCalledTimes(1);
  });

  it('should validate numeric inputs', async () => {
    const user = userEvent.setup();
    render(
      <SetTracker 
        set={mockSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    const weightInput = screen.getByLabelText(/weight/i);
    await user.clear(weightInput);
    await user.type(weightInput, 'invalid');
    
    expect(screen.getByText(/must be a number/i)).toBeInTheDocument();
  });

  it('should prevent negative values', async () => {
    const user = userEvent.setup();
    render(
      <SetTracker 
        set={mockSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    const weightInput = screen.getByLabelText(/weight/i);
    await user.clear(weightInput);
    await user.type(weightInput, '-10');
    
    expect(screen.getByText(/must be positive/i)).toBeInTheDocument();
  });

  it('should show previous set data for comparison', () => {
    const previousSet = { reps: 8, weight: 75, intensity: 7, restTime: 120, completed: true };
    
    render(
      <SetTracker 
        set={mockSet}
        setIndex={1}
        exerciseName="Bench Press"
        previousSet={previousSet}
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    expect(screen.getByText('Previous: 8 × 75kg')).toBeInTheDocument();
  });

  it('should copy previous set values', async () => {
    const user = userEvent.setup();
    const previousSet = { reps: 8, weight: 75, intensity: 7, restTime: 120, completed: true };
    
    render(
      <SetTracker 
        set={mockSet}
        setIndex={1}
        exerciseName="Bench Press"
        previousSet={previousSet}
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    const copyButton = screen.getByRole('button', { name: /copy previous/i });
    await user.click(copyButton);
    
    expect(mockOnUpdate).toHaveBeenCalledWith(1, {
      ...mockSet,
      reps: 8,
      weight: 75,
      intensity: 7
    });
  });

  it('should disable inputs when completed', () => {
    render(
      <SetTracker 
        set={mockCompletedSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    const weightInput = screen.getByLabelText(/weight/i);
    const repsInput = screen.getByLabelText(/reps/i);
    
    expect(weightInput).toBeDisabled();
    expect(repsInput).toBeDisabled();
  });

  it('should show set number', () => {
    render(
      <SetTracker 
        set={mockSet}
        setIndex={2}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    expect(screen.getByText('Set 3')).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    render(
      <SetTracker 
        set={mockSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    const weightInput = screen.getByLabelText(/weight/i);
    const repsInput = screen.getByLabelText(/reps/i);
    
    await user.click(weightInput);
    await user.tab();
    
    expect(repsInput).toHaveFocus();
  });

  it('should show intensity description', () => {
    render(
      <SetTracker 
        set={mockSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    expect(screen.getByText(/RPE 8: 2 reps in reserve/i)).toBeInTheDocument();
  });

  it('should handle quick increment buttons', async () => {
    const user = userEvent.setup();
    render(
      <SetTracker 
        set={mockSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
        showQuickAdjust={true}
      />
    );
    
    const weightIncButton = screen.getByRole('button', { name: /\+2\.5/i });
    await user.click(weightIncButton);
    
    expect(mockOnUpdate).toHaveBeenCalledWith(0, {
      ...mockSet,
      weight: 82.5
    });
  });

  it('should handle quick decrement buttons', async () => {
    const user = userEvent.setup();
    render(
      <SetTracker 
        set={mockSet}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
        showQuickAdjust={true}
      />
    );
    
    const weightDecButton = screen.getByRole('button', { name: /-2\.5/i });
    await user.click(weightDecButton);
    
    expect(mockOnUpdate).toHaveBeenCalledWith(0, {
      ...mockSet,
      weight: 77.5
    });
  });

  it('should show warmup indicator for warmup sets', () => {
    render(
      <SetTracker 
        set={{ ...mockSet, isWarmup: true }}
        setIndex={0}
        exerciseName="Bench Press"
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
      />
    );
    
    expect(screen.getByText('Warmup')).toBeInTheDocument();
  });
});