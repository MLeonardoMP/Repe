/**
 * TimerDisplay Component Unit Tests
 * Updated to reflect current component API
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimerDisplay } from '@/components/ui/timer-display';

describe('TimerDisplay Component', () => {
  const mockOnStart = jest.fn();
  const mockOnPause = jest.fn();
  const mockOnStop = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<TimerDisplay />);
    expect(screen.getByTestId('timer-display')).toBeInTheDocument();
  });

  it('renders formatted time in MM:SS format', () => {
    render(<TimerDisplay time={125} />);
    expect(screen.getByTestId('timer-display')).toHaveTextContent('02:05');
  });

  it('renders formatted time with hours when needed', () => {
    render(<TimerDisplay time={3665} />);
    expect(screen.getByTestId('timer-display')).toHaveTextContent('1:01:05');
  });

  it('shows start button when not running', async () => {
    const user = userEvent.setup();
    render(
      <TimerDisplay
        isRunning={false}
        onStart={mockOnStart}
        showControls={true}
      />
    );
    
    const startButton = screen.getByRole('button', { name: /start timer/i });
    await user.click(startButton);
    
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('shows pause button when running', async () => {
    const user = userEvent.setup();
    render(
      <TimerDisplay
        isRunning={true}
        onPause={mockOnPause}
        showControls={true}
      />
    );
    
    const pauseButton = screen.getByRole('button', { name: /pause timer/i });
    await user.click(pauseButton);
    
    expect(mockOnPause).toHaveBeenCalledTimes(1);
  });

  it('handles stop button click', async () => {
    const user = userEvent.setup();
    render(
      <TimerDisplay
        onStop={mockOnStop}
        showControls={true}
      />
    );
    
    const stopButton = screen.getByRole('button', { name: /stop timer/i });
    await user.click(stopButton);
    
    expect(mockOnStop).toHaveBeenCalledTimes(1);
  });

  it('handles reset button click', async () => {
    const user = userEvent.setup();
    render(
      <TimerDisplay
        onReset={mockOnReset}
        showControls={true}
      />
    );
    
    const resetButton = screen.getByRole('button', { name: /reset timer/i });
    await user.click(resetButton);
    
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('hides controls when showControls is false', () => {
    render(<TimerDisplay showControls={false} />);
    
    expect(screen.queryByRole('button', { name: /start timer/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /stop timer/i })).not.toBeInTheDocument();
  });

  it('shows progress bar when showProgress is true', () => {
    render(<TimerDisplay time={50} maxTime={100} showProgress={true} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('displays label when provided', () => {
    render(<TimerDisplay label="Rest Timer" />);
    
    expect(screen.getByText('Rest Timer')).toBeInTheDocument();
  });

  it('displays status when provided', () => {
    render(<TimerDisplay status="Running" />);
    
    expect(screen.getByText('Running')).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { rerender } = render(<TimerDisplay size="small" />);
    expect(screen.getByTestId('timer-display')).toHaveClass('text-2xl');
    
    rerender(<TimerDisplay size="medium" />);
    expect(screen.getByTestId('timer-display')).toHaveClass('text-4xl');
    
    rerender(<TimerDisplay size="large" />);
    expect(screen.getByTestId('timer-display')).toHaveClass('text-6xl');
  });

  it('renders laps when showLaps is true and laps provided', () => {
    render(<TimerDisplay showLaps={true} laps={[60, 120, 180]} />);
    
    expect(screen.getByTestId('lap-times')).toBeInTheDocument();
    expect(screen.getByText('Lap 1')).toBeInTheDocument();
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('handles countdown mode', () => {
    render(<TimerDisplay mode="countdown" initialTime={60} time={30} />);
    
    expect(screen.getByTestId('timer-display')).toHaveTextContent('00:30');
  });

  it('has timer role for accessibility', () => {
    render(<TimerDisplay />);
    
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });

  it('has aria-live for announcements', () => {
    render(<TimerDisplay />);
    
    const timer = screen.getByTestId('timer-display');
    expect(timer).toHaveAttribute('aria-live', 'polite');
  });
});
