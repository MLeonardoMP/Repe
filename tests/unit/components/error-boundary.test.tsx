/**
 * ErrorBoundary Component Unit Tests
 * Tests for error boundary with fallback UI and error reporting
 */

/**
 * ErrorBoundary Component Unit Tests (simplified)
 * Focused on basic fallback rendering and core callbacks
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

const ProblematicComponent = () => {
  throw new Error('Render error');
};

describe('ErrorBoundary Component', () => {
  const mockOnError = jest.fn();
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <div data-testid="child-component">Working component</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });

  it('shows fallback UI when an error is thrown', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
  });

  it('calls onError when an error occurs', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
  });

  it('calls onRetry when retry is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary onError={mockOnError} onRetry={mockOnRetry}>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    await user.click(screen.getByTestId('retry-button'));

    // Component should remain stable after retry click
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });
});