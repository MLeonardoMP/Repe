/**
 * Footer Component Unit Tests
 * Tests for app footer with navigation and utility actions
 * Updated to match current component API
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Footer } from '@/components/layout/footer';

describe('Footer Component', () => {
  const mockOnNavigate = jest.fn();
  const mockOnAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render footer', () => {
    render(<Footer />);
    
    expect(screen.getByTestId('app-footer')).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    render(<Footer onNavigate={mockOnNavigate} />);
    
    expect(screen.getByTestId('nav-home')).toBeInTheDocument();
    expect(screen.getByTestId('nav-new-workout')).toBeInTheDocument();
    expect(screen.getByTestId('nav-history')).toBeInTheDocument();
    expect(screen.getByTestId('nav-settings')).toBeInTheDocument();
  });

  it('should show navigation labels', () => {
    render(<Footer />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should handle home navigation', async () => {
    const user = userEvent.setup();
    
    render(<Footer onNavigate={mockOnNavigate} />);
    
    await user.click(screen.getByTestId('nav-home'));
    
    expect(mockOnNavigate).toHaveBeenCalledWith('/');
  });

  it('should handle new workout navigation', async () => {
    const user = userEvent.setup();
    
    render(<Footer onNavigate={mockOnNavigate} />);
    
    await user.click(screen.getByTestId('nav-new-workout'));
    
    expect(mockOnNavigate).toHaveBeenCalledWith('/workout/new');
  });

  it('should handle history navigation', async () => {
    const user = userEvent.setup();
    
    render(<Footer onNavigate={mockOnNavigate} />);
    
    await user.click(screen.getByTestId('nav-history'));
    
    expect(mockOnNavigate).toHaveBeenCalledWith('/history');
  });

  it('should handle settings action', async () => {
    const user = userEvent.setup();
    
    render(<Footer onAction={mockOnAction} />);
    
    await user.click(screen.getByTestId('nav-settings'));
    
    expect(mockOnAction).toHaveBeenCalledWith('settings');
  });

  it('should not call callbacks if not provided', async () => {
    const user = userEvent.setup();
    
    render(<Footer />);
    
    await user.click(screen.getByTestId('nav-home'));
    await user.click(screen.getByTestId('nav-settings'));
    
    expect(mockOnNavigate).not.toHaveBeenCalled();
    expect(mockOnAction).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<Footer className="custom-footer" />);
    
    const footer = screen.getByTestId('app-footer');
    expect(footer).toHaveClass('custom-footer');
  });

  it('should have proper structure with nav element', () => {
    render(<Footer />);
    
    const footer = screen.getByTestId('app-footer');
    const nav = footer.querySelector('nav');
    
    expect(nav).toBeInTheDocument();
  });

  it('should render as contentinfo role', () => {
    render(<Footer />);
    
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
