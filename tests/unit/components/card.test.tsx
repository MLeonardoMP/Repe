/**
 * Card Component Unit Tests
 * Tests for card component with different variants and content
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

describe('Card Component', () => {
  it('should render basic card', () => {
    render(
      <Card data-testid="card">
        <CardContent>Card content</CardContent>
      </Card>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('border', 'rounded-lg', 'shadow-sm');
  });

  it('should render card with header, title, and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>
          This is the card content
        </CardContent>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('This is the card content')).toBeInTheDocument();
  });

  it('should render card with footer', () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );
    
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('should handle different variants', () => {
    const { rerender } = render(
      <Card variant="elevated" data-testid="card">
        <CardContent>Content</CardContent>
      </Card>
    );
    
    expect(screen.getByTestId('card')).toHaveClass('shadow-lg');

    rerender(
      <Card variant="outlined" data-testid="card">
        <CardContent>Content</CardContent>
      </Card>
    );
    
    expect(screen.getByTestId('card')).toHaveClass('border-2');
  });

  it('should support custom className', () => {
    render(
      <Card className="custom-card" data-testid="card">
        <CardContent>Content</CardContent>
      </Card>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-card');
  });

  it('should render clickable card', () => {
    const handleClick = jest.fn();
    render(
      <Card onClick={handleClick} data-testid="card">
        <CardContent>Clickable content</CardContent>
      </Card>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('cursor-pointer', 'hover:shadow-md');
    
    card.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should handle disabled state', () => {
    render(
      <Card disabled data-testid="card">
        <CardContent>Disabled content</CardContent>
      </Card>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should render card header with proper styling', () => {
    render(
      <Card>
        <CardHeader data-testid="card-header">
          <CardTitle>Header Title</CardTitle>
        </CardHeader>
      </Card>
    );
    
    const header = screen.getByTestId('card-header');
    expect(header).toHaveClass('p-6', 'pb-4');
  });

  it('should render card title with proper styling', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle data-testid="card-title">Title</CardTitle>
        </CardHeader>
      </Card>
    );
    
    const title = screen.getByTestId('card-title');
    expect(title).toHaveClass('font-semibold', 'text-lg');
  });

  it('should render card content with proper padding', () => {
    render(
      <Card>
        <CardContent data-testid="card-content">
          Content text
        </CardContent>
      </Card>
    );
    
    const content = screen.getByTestId('card-content');
    expect(content).toHaveClass('p-6');
  });

  it('should render card footer with proper styling', () => {
    render(
      <Card>
        <CardFooter data-testid="card-footer">
          Footer content
        </CardFooter>
      </Card>
    );
    
    const footer = screen.getByTestId('card-footer');
    expect(footer).toHaveClass('p-6', 'pt-4');
  });

  it('should handle complex card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Workout Session</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Push Day - Upper Body</p>
          <div>Duration: 45 minutes</div>
        </CardContent>
        <CardFooter>
          <button>View Details</button>
          <button>Edit</button>
        </CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Workout Session')).toBeInTheDocument();
    expect(screen.getByText('Push Day - Upper Body')).toBeInTheDocument();
    expect(screen.getByText('Duration: 45 minutes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View Details' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Card role="article" aria-label="Workout card" data-testid="card">
        <CardContent>Accessible content</CardContent>
      </Card>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('role', 'article');
    expect(card).toHaveAttribute('aria-label', 'Workout card');
  });
});