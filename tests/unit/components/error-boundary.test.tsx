/**
 * ErrorBoundary Component Unit Tests
 * Tests for error boundary with fallback UI and error reporting
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Mock console.error to avoid noisy test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Component that throws during render
const ProblematicComponent = () => {
  throw new Error('Render error');
};

describe('ErrorBoundary Component', () => {
  const mockOnError = jest.fn();
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <div data-testid="child-component">Working component</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('should catch and display error', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Render error'
      }),
      expect.any(Object)
    );
  });

  it('should display custom fallback UI', () => {
    const CustomFallback = () => (
      <div data-testid="custom-fallback">Custom error message</div>
    );

    render(
      <ErrorBoundary fallback={<CustomFallback />} onError={mockOnError}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should show retry button when onRetry is provided', () => {
    render(
      <ErrorBoundary onError={mockOnError} onRetry={mockOnRetry}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should handle retry button click', async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary onError={mockOnError} onRetry={mockOnRetry}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('should show error details when provided', () => {
    render(
      <ErrorBoundary onError={mockOnError} showErrorDetails={true}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Render error')).toBeInTheDocument();
    expect(screen.getByTestId('error-details')).toBeInTheDocument();
  });

  it('should show report error button', () => {
    render(
      <ErrorBoundary onError={mockOnError} allowErrorReporting={true}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /report error/i })).toBeInTheDocument();
  });

  it('should handle report error click', async () => {
    const user = userEvent.setup();
    const mockReportError = jest.fn();

    render(
      <ErrorBoundary 
        onError={mockOnError} 
        allowErrorReporting={true}
        onReportError={mockReportError}
      >
        <ProblematicComponent />
      </ErrorBoundary>
    );

    const reportButton = screen.getByRole('button', { name: /report error/i });
    await user.click(reportButton);

    expect(mockReportError).toHaveBeenCalledTimes(1);
  });

  it('should reset error state on retry', () => {
    const { rerender } = render(
      <ErrorBoundary onError={mockOnError} onRetry={mockOnRetry}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

    // Simulate retry with fixed component
    rerender(
      <ErrorBoundary onError={mockOnError} onRetry={mockOnRetry}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Should still show error until manually reset
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('should display different error types', () => {
    const NetworkError = () => {
      throw new TypeError('Network error');
    };

    render(
      <ErrorBoundary onError={mockOnError} showErrorDetails={true}>
        <NetworkError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText(/TypeError/)).toBeInTheDocument();
  });

  it('should handle development vs production modes', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-stack')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should show user-friendly message in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/we're sorry, something went wrong/i)).toBeInTheDocument();
    expect(screen.queryByTestId('error-stack')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should display error boundary title', () => {
    render(
      <ErrorBoundary title="Workout Error" onError={mockOnError}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Workout Error')).toBeInTheDocument();
  });

  it('should show refresh page option', () => {
    render(
      <ErrorBoundary onError={mockOnError} showRefreshOption={true}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
  });

  it('should handle refresh page click', async () => {
    const user = userEvent.setup();
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    render(
      <ErrorBoundary onError={mockOnError} showRefreshOption={true}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByRole('button', { name: /refresh page/i });
    await user.click(refreshButton);

    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it('should display error ID for tracking', () => {
    render(
      <ErrorBoundary onError={mockOnError} generateErrorId={true}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/error id:/i)).toBeInTheDocument();
    expect(screen.getByTestId('error-id')).toBeInTheDocument();
  });

  it('should show contact support option', () => {
    render(
      <ErrorBoundary 
        onError={mockOnError} 
        supportEmail="support@repe.com"
      >
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/contact support/i)).toBeInTheDocument();
    expect(screen.getByText('support@repe.com')).toBeInTheDocument();
  });

  it('should handle async errors', async () => {
    const AsyncError = () => {
      React.useEffect(() => {
        setTimeout(() => {
          throw new Error('Async error');
        }, 100);
      }, []);
      return <div>Async component</div>;
    };

    render(
      <ErrorBoundary onError={mockOnError}>
        <AsyncError />
      </ErrorBoundary>
    );

    // Note: Error boundaries don't catch async errors by default
    // This test documents the limitation
    expect(screen.getByText('Async component')).toBeInTheDocument();
  });

  it('should provide error context information', () => {
    render(
      <ErrorBoundary 
        onError={mockOnError} 
        contextInfo={{ page: 'workout', action: 'save' }}
        showErrorDetails={true}
      >
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/context/i)).toBeInTheDocument();
    expect(screen.getByText(/page: workout/)).toBeInTheDocument();
    expect(screen.getByText(/action: save/)).toBeInTheDocument();
  });

  it('should handle multiple child errors', () => {
    const MultiError = () => {
      const [counter, setCounter] = React.useState(0);
      
      React.useEffect(() => {
        if (counter > 0) {
          throw new Error(`Error ${counter}`);
        }
      }, [counter]);

      return (
        <button onClick={() => setCounter(c => c + 1)}>
          Trigger Error
        </button>
      );
    };

    render(
      <ErrorBoundary onError={mockOnError}>
        <MultiError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: 'Trigger Error' })).toBeInTheDocument();
  });

  it('should maintain accessibility standards', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    const errorContainer = screen.getByTestId('error-boundary');
    expect(errorContainer).toHaveAttribute('role', 'alert');
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
  });

  it('should support custom error messages by error type', () => {
    const NetworkError = () => {
      const error = new Error('Failed to fetch');
      error.name = 'NetworkError';
      throw error;
    };

    const customMessages = {
      NetworkError: 'Please check your internet connection',
      TypeError: 'A programming error occurred'
    };

    render(
      <ErrorBoundary 
        onError={mockOnError}
        customMessages={customMessages}
      >
        <NetworkError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Please check your internet connection')).toBeInTheDocument();
  });

  it('should handle error recovery strategies', () => {
    const { rerender } = render(
      <ErrorBoundary 
        onError={mockOnError}
        maxRetries={2}
        autoRetry={true}
      >
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show retry attempt
    expect(screen.getByText(/retrying/i)).toBeInTheDocument();
    
    // After max retries, should show error
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });
});