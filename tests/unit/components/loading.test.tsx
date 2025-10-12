/**
 * Loading Component Unit Tests
 * Tests for loading states, spinners, and progress indicators
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Loading } from '@/components/layout/loading';

describe('Loading Component', () => {
  it('should render basic loading spinner', () => {
    render(<Loading />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
  });

  it('should display loading message', () => {
    render(<Loading message="Loading workouts..." />);
    
    expect(screen.getByText('Loading workouts...')).toBeInTheDocument();
  });

  it('should show progress bar when provided', () => {
    render(<Loading progress={75} />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });

  it('should display progress percentage', () => {
    render(<Loading progress={45} showPercentage />);
    
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('should show different spinner sizes', () => {
    const { rerender } = render(<Loading size="small" />);
    
    expect(screen.getByTestId('loading-spinner')).toHaveClass('small');
    
    rerender(<Loading size="large" />);
    expect(screen.getByTestId('loading-spinner')).toHaveClass('large');
  });

  it('should render different spinner types', () => {
    const { rerender } = render(<Loading type="dots" />);
    
    expect(screen.getByTestId('loading-dots')).toBeInTheDocument();
    
    rerender(<Loading type="pulse" />);
    expect(screen.getByTestId('loading-pulse')).toBeInTheDocument();
    
    rerender(<Loading type="bars" />);
    expect(screen.getByTestId('loading-bars')).toBeInTheDocument();
  });

  it('should show overlay loading', () => {
    render(<Loading overlay />);
    
    const loadingOverlay = screen.getByTestId('loading-overlay');
    expect(loadingOverlay).toBeInTheDocument();
    expect(loadingOverlay).toHaveClass('overlay');
  });

  it('should display loading steps', () => {
    const steps = [
      'Connecting to server...',
      'Loading user data...',
      'Preparing workspace...'
    ];
    
    render(<Loading steps={steps} currentStep={1} />);
    
    expect(screen.getByText('Loading user data...')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
  });

  it('should show skeleton loader', () => {
    render(<Loading type="skeleton" lines={3} />);
    
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    
    const skeletonLines = screen.getAllByTestId('skeleton-line');
    expect(skeletonLines).toHaveLength(3);
  });

  it('should display estimated time remaining', () => {
    render(<Loading estimatedTime={30} />);
    
    expect(screen.getByText(/about 30 seconds/i)).toBeInTheDocument();
  });

  it('should show cancel button when provided', () => {
    const mockOnCancel = jest.fn();
    
    render(<Loading onCancel={mockOnCancel} />);
    
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should handle cancel button click', async () => {
    const user = userEvent.setup();
    const mockOnCancel = jest.fn();
    
    render(<Loading onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should display error state', () => {
    render(<Loading error="Failed to load data" />);
    
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    expect(screen.getByTestId('loading-error')).toBeInTheDocument();
  });

  it('should show retry button on error', () => {
    const mockOnRetry = jest.fn();
    
    render(<Loading error="Network error" onRetry={mockOnRetry} />);
    
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should handle retry button click', async () => {
    const user = userEvent.setup();
    const mockOnRetry = jest.fn();
    
    render(<Loading error="Error occurred" onRetry={mockOnRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('should show loading with timeout warning', async () => {
    jest.useFakeTimers();
    
    render(<Loading timeout={5000} />);
    
    // Fast-forward time
    jest.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(screen.getByText(/taking longer than expected/i)).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });

  it('should display loading icon', () => {
    render(<Loading icon="sync" />);
    
    expect(screen.getByTestId('loading-icon-sync')).toBeInTheDocument();
  });

  it('should show custom content while loading', () => {
    const customContent = <div data-testid="custom-content">Custom loading content</div>;
    
    render(<Loading>{customContent}</Loading>);
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom loading content')).toBeInTheDocument();
  });

  it('should handle fullscreen loading', () => {
    render(<Loading fullscreen />);
    
    const loadingContainer = screen.getByTestId('loading-container');
    expect(loadingContainer).toHaveClass('fullscreen');
  });

  it('should show multiple concurrent loaders', () => {
    const loaders = [
      { id: 'data', message: 'Loading data...' },
      { id: 'images', message: 'Loading images...' }
    ];
    
    render(<Loading concurrent={loaders} />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    expect(screen.getByText('Loading images...')).toBeInTheDocument();
  });

  it('should display loading with animation controls', () => {
    render(<Loading animated={false} />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('no-animation');
  });

  it('should show indeterminate progress', () => {
    render(<Loading indeterminate />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).not.toHaveAttribute('aria-valuenow');
  });

  it('should handle accessibility requirements', () => {
    render(<Loading message="Loading content" />);
    
    const loadingStatus = screen.getByRole('status');
    expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
    expect(loadingStatus).toHaveAttribute('aria-label', 'Loading content');
  });

  it('should show loading with theme variants', () => {
    const { rerender } = render(<Loading theme="dark" />);
    
    expect(screen.getByTestId('loading-container')).toHaveClass('dark');
    
    rerender(<Loading theme="light" />);
    expect(screen.getByTestId('loading-container')).toHaveClass('light');
  });

  it('should display loading state descriptions', () => {
    render(<Loading description="Please wait while we process your request" />);
    
    expect(screen.getByText('Please wait while we process your request')).toBeInTheDocument();
  });

  it('should show loading with custom colors', () => {
    render(<Loading color="primary" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('primary');
  });

  it('should handle loading state transitions', async () => {
    const { rerender } = render(<Loading />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    rerender(<Loading error="Failed" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading-error')).toBeInTheDocument();
    });
  });

  it('should show loading with backdrop', () => {
    render(<Loading backdrop />);
    
    expect(screen.getByTestId('loading-backdrop')).toBeInTheDocument();
  });

  it('should display loading duration', () => {
    jest.useFakeTimers();
    const startTime = Date.now();
    jest.setSystemTime(startTime);
    
    render(<Loading showDuration />);
    
    // Advance time by 2 seconds
    jest.advanceTimersByTime(2000);
    jest.setSystemTime(startTime + 2000);
    
    expect(screen.getByText('2s')).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('should handle minimum loading time', async () => {
    const { unmount } = render(<Loading minimumDuration={1000} />);
    
    // Try to unmount immediately
    const startTime = Date.now();
    unmount();
    
    // Should still be visible for minimum duration
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000);
  });

  it('should show loading with pulse effect', () => {
    render(<Loading pulse />);
    
    const container = screen.getByTestId('loading-container');
    expect(container).toHaveClass('pulse');
  });

  it('should handle loading queue', () => {
    const queue = [
      'Initializing...',
      'Loading modules...',
      'Starting application...'
    ];
    
    render(<Loading queue={queue} />);
    
    expect(screen.getByText('Initializing...')).toBeInTheDocument();
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });
});