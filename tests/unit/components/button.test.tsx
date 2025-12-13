/**
 * Button Component Unit Tests
 * Tests for basic button component with variants and states
 * Updated to match current component API
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex');
  });

  it('should handle primary variant', () => {
    render(<Button variant="primary">Primary Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('should handle secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary');
  });

  it('should handle destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('should handle outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border', 'border-input');
  });

  it('should handle ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent');
  });

  it('should handle different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8', 'px-3', 'text-sm');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12', 'px-8');
    
    rerender(<Button size="default">Default</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10', 'px-4');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should show loading state', () => {
    render(<Button loading>Loading Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show custom loading text', () => {
    render(<Button loading loadingText="Saving...">Save</Button>);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should not call onClick when loading', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} loading>Loading</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    render(<Button aria-label="Custom label">Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
  });

  it('should support custom className', () => {
    render(<Button className="custom-class">Styled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should handle fullWidth prop', () => {
    render(<Button fullWidth>Full Width</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full');
  });

  it('should handle mobile size', () => {
    render(<Button size="mobile">Mobile</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-12');
  });

  it('should handle icon size', () => {
    render(<Button size="icon">🏋️</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10', 'w-10');
  });
});
