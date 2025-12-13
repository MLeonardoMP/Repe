/**
 * Badge Component Unit Tests
 * Tests for badge component with different variants and sizes
 * Updated to match current component API
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    expect(screen.getByText('Primary')).toHaveClass('bg-white', 'text-black');

    rerender(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-neutral-800', 'text-white');

    rerender(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-white', 'text-black');

    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toHaveClass('bg-neutral-900', 'text-white');

    rerender(<Badge variant="error">Error</Badge>);
    expect(screen.getByText('Error')).toHaveClass('text-red-400');
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
    
    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('w-2', 'h-2');
  });

  it('should handle outlined style', () => {
    render(<Badge outlined>Outlined</Badge>);
    
    const badge = screen.getByText('Outlined');
    expect(badge).toHaveClass('border');
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

  it('should handle clickable badge', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Badge onClick={handleClick}>Clickable</Badge>);
    
    const badge = screen.getByText('Clickable');
    await user.click(badge);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should add cursor-pointer when clickable', () => {
    const handleClick = jest.fn();
    render(<Badge onClick={handleClick}>Clickable</Badge>);
    
    const badge = screen.getByText('Clickable');
    expect(badge).toHaveClass('cursor-pointer');
  });

  it('should handle removable badge', async () => {
    const user = userEvent.setup();
    const handleRemove = jest.fn();
    
    render(<Badge removable onRemove={handleRemove}>Removable</Badge>);
    
    const badge = screen.getByText('Removable');
    await user.click(badge);
    
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it('should handle outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>);
    
    const badge = screen.getByText('Outline');
    expect(badge).toHaveClass('border', 'border-neutral-800');
  });

  it('should handle info variant', () => {
    render(<Badge variant="info">Info</Badge>);
    
    const badge = screen.getByText('Info');
    expect(badge).toHaveClass('bg-neutral-800', 'text-white');
  });
});
