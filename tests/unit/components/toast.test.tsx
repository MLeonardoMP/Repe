/**
 * Toast Component Unit Tests
 * Tests for toast notifications with different variants and actions
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '@/components/ui/toast';

describe('Toast Component', () => {
  const mockOnDismiss = jest.fn();
  const mockOnAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render toast with message', () => {
    render(
      <Toast
        visible={true}
        message="Workout saved successfully!"
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Workout saved successfully!')).toBeInTheDocument();
  });

  it('should not render when not visible', () => {
    render(
      <Toast
        visible={false}
        message="Hidden message"
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should show success variant', () => {
    render(
      <Toast
        visible={true}
        variant="success"
        message="Operation completed"
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByTestId('toast-success')).toBeInTheDocument();
  });

  it('should show error variant', () => {
    render(
      <Toast
        visible={true}
        variant="error"
        message="Something went wrong"
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByTestId('toast-error')).toBeInTheDocument();
  });

  it('should show warning variant', () => {
    render(
      <Toast
        visible={true}
        variant="warning"
        message="Please check your input"
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByTestId('toast-warning')).toBeInTheDocument();
  });

  it('should show info variant', () => {
    render(
      <Toast
        visible={true}
        variant="info"
        message="New feature available"
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByTestId('toast-info')).toBeInTheDocument();
  });

  it('should auto-dismiss after timeout', async () => {
    render(
      <Toast
        visible={true}
        message="Auto dismiss"
        duration={3000}
        onDismiss={mockOnDismiss}
      />
    );
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('should not auto-dismiss when duration is 0', async () => {
    render(
      <Toast
        visible={true}
        message="Persistent toast"
        duration={0}
        onDismiss={mockOnDismiss}
      />
    );
    
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    expect(mockOnDismiss).not.toHaveBeenCalled();
  });

  it('should show dismiss button', () => {
    render(
      <Toast
        visible={true}
        message="Dismissible toast"
        showDismiss={true}
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByRole('button', { name: /dismiss|close/i })).toBeInTheDocument();
  });

  it('should handle dismiss button click', async () => {
    const user = userEvent.setup();
    
    render(
      <Toast
        visible={true}
        message="Click to dismiss"
        showDismiss={true}
        onDismiss={mockOnDismiss}
      />
    );
    
    const dismissButton = screen.getByRole('button', { name: /dismiss|close/i });
    await user.click(dismissButton);
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('should show action button', () => {
    render(
      <Toast
        visible={true}
        message="Action available"
        actionLabel="Undo"
        onAction={mockOnAction}
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  it('should handle action button click', async () => {
    const user = userEvent.setup();
    
    render(
      <Toast
        visible={true}
        message="Action toast"
        actionLabel="Retry"
        onAction={mockOnAction}
        onDismiss={mockOnDismiss}
      />
    );
    
    const actionButton = screen.getByRole('button', { name: 'Retry' });
    await user.click(actionButton);
    
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it('should display title when provided', () => {
    render(
      <Toast
        visible={true}
        title="Success!"
        message="Workout completed"
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Workout completed')).toBeInTheDocument();
  });

  it('should show icon when provided', () => {
    render(
      <Toast
        visible={true}
        icon="check"
        message="Done!"
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByTestId('toast-icon-check')).toBeInTheDocument();
  });

  it('should pause auto-dismiss on hover', async () => {
    const user = userEvent.setup();
    
    render(
      <Toast
        visible={true}
        message="Hover to pause"
        duration={2000}
        pauseOnHover={true}
        onDismiss={mockOnDismiss}
      />
    );
    
    const toast = screen.getByRole('alert');
    
    await user.hover(toast);
    
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(mockOnDismiss).not.toHaveBeenCalled();
    
    await user.unhover(toast);
    
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('should show progress bar', () => {
    render(
      <Toast
        visible={true}
        message="Progress toast"
        showProgress={true}
        duration={5000}
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should update progress bar over time', async () => {
    render(
      <Toast
        visible={true}
        message="Progress test"
        showProgress={true}
        duration={4000}
        onDismiss={mockOnDismiss}
      />
    );
    
    const progressBar = screen.getByRole('progressbar');
    
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(progressBar).toHaveAttribute('aria-valuenow', '25');
  });

  it('should handle swipe to dismiss', async () => {
    const user = userEvent.setup();
    
    render(
      <Toast
        visible={true}
        message="Swipe to dismiss"
        swipeToDismiss={true}
        onDismiss={mockOnDismiss}
      />
    );
    
    const toast = screen.getByRole('alert');
    
    // Simulate swipe gesture
    await user.pointer([
      { target: toast, coords: { x: 0, y: 0 } },
      { coords: { x: 100, y: 0 } }
    ]);
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('should show loading state', () => {
    render(
      <Toast
        visible={true}
        message="Processing..."
        isLoading={true}
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByTestId('toast-loading')).toBeInTheDocument();
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
  });

  it('should support multiline messages', () => {
    const multilineMessage = "Line 1\nLine 2\nLine 3";
    
    render(
      <Toast
        visible={true}
        message={multilineMessage}
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    expect(screen.getByText(/Line 2/)).toBeInTheDocument();
    expect(screen.getByText(/Line 3/)).toBeInTheDocument();
  });

  it('should show custom content', () => {
    const customContent = (
      <div data-testid="custom-toast-content">
        <h4>Custom Toast</h4>
        <p>With custom content</p>
        <button>Custom Action</button>
      </div>
    );
    
    render(
      <Toast
        visible={true}
        onDismiss={mockOnDismiss}
      >
        {customContent}
      </Toast>
    );
    
    expect(screen.getByTestId('custom-toast-content')).toBeInTheDocument();
    expect(screen.getByText('Custom Toast')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom Action' })).toBeInTheDocument();
  });

  it('should handle different positions', () => {
    const { rerender } = render(
      <Toast
        visible={true}
        message="Top position"
        position="top"
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByTestId('toast-container')).toHaveClass('top');
    
    rerender(
      <Toast
        visible={true}
        message="Bottom position"
        position="bottom"
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByTestId('toast-container')).toHaveClass('bottom');
  });

  it('should show timestamp', () => {
    const mockDate = new Date('2024-01-15T10:30:00Z');
    jest.setSystemTime(mockDate);
    
    render(
      <Toast
        visible={true}
        message="Timestamped toast"
        showTimestamp={true}
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
  });

  it('should handle accessibility requirements', () => {
    render(
      <Toast
        visible={true}
        variant="error"
        title="Error"
        message="Something went wrong"
        onDismiss={mockOnDismiss}
      />
    );
    
    const toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });

  it('should support rich text content', () => {
    render(
      <Toast
        visible={true}
        message="Rich text with <strong>bold</strong> and <em>italic</em>"
        allowHTML={true}
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <Toast
        visible={true}
        message="Keyboard navigation"
        actionLabel="Action"
        showDismiss={true}
        onAction={mockOnAction}
        onDismiss={mockOnDismiss}
      />
    );
    
    const actionButton = screen.getByRole('button', { name: 'Action' });
    const dismissButton = screen.getByRole('button', { name: /dismiss|close/i });
    
    await user.tab();
    expect(actionButton).toHaveFocus();
    
    await user.tab();
    expect(dismissButton).toHaveFocus();
  });

  it('should support sound notification', () => {
    const mockPlay = jest.fn();
    global.Audio = jest.fn().mockImplementation(() => ({
      play: mockPlay
    }));
    
    render(
      <Toast
        visible={true}
        message="Sound notification"
        playSound={true}
        soundUrl="/notification.mp3"
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it('should handle animation states', async () => {
    const { rerender } = render(
      <Toast
        visible={true}
        message="Animated toast"
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByTestId('toast-container')).toHaveClass('entering');
    
    await waitFor(() => {
      expect(screen.getByTestId('toast-container')).toHaveClass('visible');
    });
    
    rerender(
      <Toast
        visible={false}
        message="Animated toast"
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByTestId('toast-container')).toHaveClass('exiting');
  });
});