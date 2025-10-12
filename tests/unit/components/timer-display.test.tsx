/**
 * TimerDisplay Component Unit Tests
 * Tests for timer display with controls and formatting
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimerDisplay } from '@/components/ui/timer-display';

describe('TimerDisplay Component', () => {
  const mockOnStart = jest.fn();
  const mockOnPause = jest.fn();
  const mockOnStop = jest.fn();
  const mockOnReset = jest.fn();
  const mockOnTick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should display timer with initial time', () => {
    render(
      <TimerDisplay
        initialTime={300} // 5 minutes
        onStart={mockOnStart}
        onPause={mockOnPause}
        onStop={mockOnStop}
      />
    );
    
    expect(screen.getByText('05:00')).toBeInTheDocument();
    expect(screen.getByTestId('timer-display')).toBeInTheDocument();
  });

  it('should show start button when stopped', () => {
    render(
      <TimerDisplay
        initialTime={180}
        isRunning={false}
        onStart={mockOnStart}
        onPause={mockOnPause}
      />
    );
    
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('should show pause button when running', () => {
    render(
      <TimerDisplay
        initialTime={180}
        isRunning={true}
        onStart={mockOnStart}
        onPause={mockOnPause}
      />
    );
    
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('should handle start button click', async () => {
    const user = userEvent.setup();
    
    render(
      <TimerDisplay
        initialTime={60}
        isRunning={false}
        onStart={mockOnStart}
        onPause={mockOnPause}
      />
    );
    
    const startButton = screen.getByRole('button', { name: /start/i });
    await user.click(startButton);
    
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('should handle pause button click', async () => {
    const user = userEvent.setup();
    
    render(
      <TimerDisplay
        initialTime={60}
        isRunning={true}
        onStart={mockOnStart}
        onPause={mockOnPause}
      />
    );
    
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    await user.click(pauseButton);
    
    expect(mockOnPause).toHaveBeenCalledTimes(1);
  });

  it('should show stop button when provided', () => {
    render(
      <TimerDisplay
        initialTime={120}
        showStop={true}
        onStop={mockOnStop}
      />
    );
    
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('should handle stop button click', async () => {
    const user = userEvent.setup();
    
    render(
      <TimerDisplay
        initialTime={120}
        showStop={true}
        onStop={mockOnStop}
      />
    );
    
    const stopButton = screen.getByRole('button', { name: /stop/i });
    await user.click(stopButton);
    
    expect(mockOnStop).toHaveBeenCalledTimes(1);
  });

  it('should show reset button when provided', () => {
    render(
      <TimerDisplay
        initialTime={90}
        showReset={true}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('should handle reset button click', async () => {
    const user = userEvent.setup();
    
    render(
      <TimerDisplay
        initialTime={90}
        showReset={true}
        onReset={mockOnReset}
      />
    );
    
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);
    
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('should format time correctly for different durations', () => {
    const { rerender } = render(
      <TimerDisplay initialTime={65} />
    );
    
    expect(screen.getByText('01:05')).toBeInTheDocument();
    
    rerender(<TimerDisplay initialTime={3665} />); // 1 hour, 1 minute, 5 seconds
    expect(screen.getByText('1:01:05')).toBeInTheDocument();
    
    rerender(<TimerDisplay initialTime={45} />);
    expect(screen.getByText('00:45')).toBeInTheDocument();
  });

  it('should display progress ring when enabled', () => {
    render(
      <TimerDisplay
        initialTime={300}
        currentTime={150}
        showProgress={true}
      />
    );
    
    expect(screen.getByTestId('timer-progress')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should calculate progress correctly', () => {
    render(
      <TimerDisplay
        initialTime={200}
        currentTime={50}
        showProgress={true}
      />
    );
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75'); // 150/200 = 0.75
  });

  it('should show countdown mode', () => {
    render(
      <TimerDisplay
        initialTime={120}
        currentTime={75}
        mode="countdown"
      />
    );
    
    expect(screen.getByText('01:15')).toBeInTheDocument(); // Shows remaining time
  });

  it('should show stopwatch mode', () => {
    render(
      <TimerDisplay
        initialTime={0}
        currentTime={45}
        mode="stopwatch"
      />
    );
    
    expect(screen.getByText('00:45')).toBeInTheDocument(); // Shows elapsed time
  });

  it('should display timer label', () => {
    render(
      <TimerDisplay
        initialTime={90}
        label="Rest Time"
      />
    );
    
    expect(screen.getByText('Rest Time')).toBeInTheDocument();
  });

  it('should show timer status', () => {
    const { rerender } = render(
      <TimerDisplay
        initialTime={60}
        status="running"
        showStatus={true}
      />
    );
    
    expect(screen.getByText(/running/i)).toBeInTheDocument();
    
    rerender(
      <TimerDisplay
        initialTime={60}
        status="paused"
        showStatus={true}
      />
    );
    
    expect(screen.getByText(/paused/i)).toBeInTheDocument();
  });

  it('should handle different size variants', () => {
    const { rerender } = render(
      <TimerDisplay initialTime={60} size="small" />
    );
    
    expect(screen.getByTestId('timer-display')).toHaveClass('small');
    
    rerender(<TimerDisplay initialTime={60} size="large" />);
    expect(screen.getByTestId('timer-display')).toHaveClass('large');
  });

  it('should show timer completion notification', () => {
    render(
      <TimerDisplay
        initialTime={0}
        currentTime={0}
        isCompleted={true}
      />
    );
    
    expect(screen.getByTestId('timer-completed')).toBeInTheDocument();
    expect(screen.getByText(/time's up/i)).toBeInTheDocument();
  });

  it('should call onTick callback', async () => {
    render(
      <TimerDisplay
        initialTime={10}
        isRunning={true}
        onTick={mockOnTick}
      />
    );
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(mockOnTick).toHaveBeenCalledTimes(1);
  });

  it('should display warning when time is low', () => {
    render(
      <TimerDisplay
        initialTime={300}
        currentTime={10}
        warningThreshold={30}
        mode="countdown"
      />
    );
    
    expect(screen.getByTestId('timer-warning')).toBeInTheDocument();
    expect(screen.getByTestId('timer-display')).toHaveClass('warning');
  });

  it('should show critical state when time is very low', () => {
    render(
      <TimerDisplay
        initialTime={300}
        currentTime={3}
        warningThreshold={30}
        criticalThreshold={10}
        mode="countdown"
      />
    );
    
    expect(screen.getByTestId('timer-critical')).toBeInTheDocument();
    expect(screen.getByTestId('timer-display')).toHaveClass('critical');
  });

  it('should support millisecond precision', () => {
    render(
      <TimerDisplay
        initialTime={65.5}
        precision="milliseconds"
      />
    );
    
    expect(screen.getByText('01:05.5')).toBeInTheDocument();
  });

  it('should handle keyboard controls', async () => {
    const user = userEvent.setup();
    
    render(
      <TimerDisplay
        initialTime={60}
        keyboardControls={true}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onReset={mockOnReset}
      />
    );
    
    const timerDisplay = screen.getByTestId('timer-display');
    timerDisplay.focus();
    
    await user.keyboard(' '); // Space to start/pause
    expect(mockOnStart).toHaveBeenCalledTimes(1);
    
    await user.keyboard('r'); // R to reset
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('should show lap times when enabled', () => {
    const lapTimes = [65, 130, 195];
    
    render(
      <TimerDisplay
        initialTime={0}
        currentTime={200}
        mode="stopwatch"
        showLaps={true}
        lapTimes={lapTimes}
      />
    );
    
    expect(screen.getByTestId('lap-times')).toBeInTheDocument();
    expect(screen.getByText('01:05')).toBeInTheDocument(); // First lap
    expect(screen.getByText('02:10')).toBeInTheDocument(); // Second lap
  });

  it('should handle lap button click', async () => {
    const user = userEvent.setup();
    const mockOnLap = jest.fn();
    
    render(
      <TimerDisplay
        initialTime={0}
        currentTime={65}
        mode="stopwatch"
        showLapButton={true}
        onLap={mockOnLap}
      />
    );
    
    const lapButton = screen.getByRole('button', { name: /lap/i });
    await user.click(lapButton);
    
    expect(mockOnLap).toHaveBeenCalledWith(65);
  });

  it('should display timer in compact mode', () => {
    render(
      <TimerDisplay
        initialTime={125}
        compact={true}
      />
    );
    
    expect(screen.getByTestId('timer-display')).toHaveClass('compact');
    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  it('should show timer with custom colors', () => {
    render(
      <TimerDisplay
        initialTime={60}
        color="primary"
      />
    );
    
    expect(screen.getByTestId('timer-display')).toHaveClass('primary');
  });

  it('should handle touch gestures', async () => {
    const user = userEvent.setup();
    
    render(
      <TimerDisplay
        initialTime={60}
        touchGestures={true}
        onStart={mockOnStart}
        onPause={mockOnPause}
      />
    );
    
    const timerDisplay = screen.getByTestId('timer-display');
    
    // Simulate tap to start/pause
    await user.pointer({ target: timerDisplay, keys: '[TouchA]' });
    
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('should maintain accessibility standards', () => {
    render(
      <TimerDisplay
        initialTime={180}
        label="Exercise Timer"
        isRunning={true}
      />
    );
    
    const timerDisplay = screen.getByTestId('timer-display');
    const startButton = screen.getByRole('button', { name: /pause/i });
    
    expect(timerDisplay).toHaveAttribute('aria-label');
    expect(timerDisplay).toHaveAttribute('role', 'timer');
    expect(startButton).toHaveAttribute('aria-label');
  });

  it('should support auto-start feature', () => {
    render(
      <TimerDisplay
        initialTime={60}
        autoStart={true}
        onStart={mockOnStart}
      />
    );
    
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('should handle timer overflow', () => {
    render(
      <TimerDisplay
        initialTime={0}
        currentTime={-30}
        mode="countdown"
        allowOverflow={true}
      />
    );
    
    expect(screen.getByText('-00:30')).toBeInTheDocument();
    expect(screen.getByTestId('timer-overflow')).toBeInTheDocument();
  });
});