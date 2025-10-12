/**
 * Badge Component Unit Tests
 * Tests for badge component with different variants and sizes
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge Component', () => {
  it('should render with default props', () => {
    render(<Badge>Default Badge</Badge>);
    
    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('inline-flex', 'px-2', 'py-1', 'rounded-full');
  });

  it('should handle different variants', () => {
    const { rerender } = render(<Badge variant="primary">Primary</Badge>);
    expect(screen.getByText('Primary')).toHaveClass('bg-black', 'text-white');

    rerender(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-gray-100', 'text-gray-900');

    rerender(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-green-100', 'text-green-800');

    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100', 'text-yellow-800');

    rerender(<Badge variant="error">Error</Badge>);
    expect(screen.getByText('Error')).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('should handle different sizes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('px-1.5', 'py-0.5', 'text-xs');

    rerender(<Badge size="md">Medium</Badge>);
    expect(screen.getByText('Medium')).toHaveClass('px-2', 'py-1', 'text-sm');

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('px-3', 'py-1.5', 'text-base');
  });

  it('should support custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('custom-badge');
  });

  it('should render with icon', () => {
    render(
      <Badge>
        <span data-testid="icon">🏋️</span>
        Workout
      </Badge>
    );
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Workout')).toBeInTheDocument();
  });

  it('should handle dot variant', () => {
    render(<Badge variant="dot" />);
    
    const badge = screen.getByRole('status', { hidden: true });
    expect(badge).toHaveClass('w-2', 'h-2', 'rounded-full');
  });

  it('should handle outlined style', () => {
    render(<Badge outlined>Outlined</Badge>);
    
    const badge = screen.getByText('Outlined');
    expect(badge).toHaveClass('border', 'bg-transparent');
  });

  it('should render badge for workout categories', () => {
    const categories = ['Chest', 'Back', 'Legs', 'Shoulders'];
    
    render(
      <div>
        {categories.map((category) => (
          <Badge key={category} variant="secondary">
            {category}
          </Badge>
        ))}
      </div>
    );
    
    categories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('should handle clickable badge', () => {
    const handleClick = jest.fn();
    render(<Badge onClick={handleClick}>Clickable</Badge>);
    
    const badge = screen.getByText('Clickable');
    expect(badge).toHaveClass('cursor-pointer');
    
    badge.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', () => {
    render(<Badge role="status" aria-label="Exercise category">Chest</Badge>);
    
    const badge = screen.getByText('Chest');
    expect(badge).toHaveAttribute('role', 'status');
    expect(badge).toHaveAttribute('aria-label', 'Exercise category');
  });

  it('should render removable badge', () => {
    const handleRemove = jest.fn();
    render(
      <Badge removable onRemove={handleRemove}>
        Removable
        <button data-testid="remove-btn">×</button>
      </Badge>
    );
    
    const removeButton = screen.getByTestId('remove-btn');
    removeButton.click();
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });
});