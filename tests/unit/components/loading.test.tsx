/**
 * Loading Component Unit Tests
 * Tests for loading spinner with size and text
 * Updated to match current component API
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Loading } from '@/components/layout/loading';

describe('Loading Component', () => {
  it('should render loading spinner', () => {
    render(<Loading />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display default loading text', () => {
    render(<Loading />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display custom loading text', () => {
    render(<Loading text="Please wait" />);
    
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });

  it('should render small size spinner', () => {
    render(<Loading size="sm" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('should render medium size spinner (default)', () => {
    render(<Loading size="md" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('should render large size spinner', () => {
    render(<Loading size="lg" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('should use medium size by default', () => {
    render(<Loading />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('should have loading role for accessibility', () => {
    render(<Loading />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should have aria-live for screen readers', () => {
    render(<Loading />);
    
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('should apply animation class to spinner', () => {
    render(<Loading />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('should center content', () => {
    render(<Loading />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('should apply custom className', () => {
    render(<Loading className="custom-class" />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveClass('custom-class');
  });
});
