/**
 * Navigation Component Unit Tests
 * Tests for responsive navigation with mobile optimization
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navigation } from '@/components/layout/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
}));

describe('Navigation Component', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render main navigation items', () => {
    render(<Navigation onNavigate={mockOnNavigate} />);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /workouts/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /history/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    render(<Navigation currentPath="/workouts" onNavigate={mockOnNavigate} />);
    
    const workoutLink = screen.getByRole('link', { name: /workouts/i });
    expect(workoutLink).toHaveClass('active');
    expect(workoutLink).toHaveAttribute('aria-current', 'page');
  });

  it('should handle navigation item clicks', async () => {
    const user = userEvent.setup();
    render(<Navigation onNavigate={mockOnNavigate} />);
    
    const historyLink = screen.getByRole('link', { name: /history/i });
    await user.click(historyLink);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('/history');
  });

  it('should show mobile hamburger menu on small screens', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    });
    
    render(<Navigation onNavigate={mockOnNavigate} />);
    
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeVisible();
  });

  it('should toggle mobile menu', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    });
    
    render(<Navigation onNavigate={mockOnNavigate} />);
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);
    
    expect(screen.getByRole('navigation')).toBeVisible();
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should close mobile menu when clicking outside', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    });
    
    render(<Navigation onNavigate={mockOnNavigate} />);
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);
    
    // Click outside
    await user.click(document.body);
    
    expect(screen.queryByRole('navigation')).not.toBeVisible();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should show workout quick actions when on workout page', () => {
    render(<Navigation currentPath="/workouts" onNavigate={mockOnNavigate} />);
    
    expect(screen.getByRole('button', { name: /start workout/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /templates/i })).toBeInTheDocument();
  });

  it('should display user avatar and name', () => {
    const mockUser = {
      name: 'John Doe',
      avatar: '/avatar.jpg'
    };
    
    render(<Navigation user={mockUser} onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByAltText('User avatar')).toBeInTheDocument();
  });

  it('should handle user menu dropdown', async () => {
    const user = userEvent.setup();
    const mockUser = { name: 'John Doe' };
    
    render(<Navigation user={mockUser} onNavigate={mockOnNavigate} />);
    
    const userButton = screen.getByRole('button', { name: /john doe/i });
    await user.click(userButton);
    
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /logout/i })).toBeInTheDocument();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<Navigation onNavigate={mockOnNavigate} />);
    
    const homeLink = screen.getByRole('link', { name: /home/i });
    const workoutLink = screen.getByRole('link', { name: /workouts/i });
    
    await user.click(homeLink);
    await user.tab();
    
    expect(workoutLink).toHaveFocus();
  });

  it('should show notification badge when notifications exist', () => {
    render(<Navigation notificationCount={3} onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByLabelText(/3 unread notifications/i)).toBeInTheDocument();
  });

  it('should handle escape key to close mobile menu', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    });
    
    render(<Navigation onNavigate={mockOnNavigate} />);
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);
    await user.keyboard('{Escape}');
    
    expect(screen.queryByRole('navigation')).not.toBeVisible();
  });

  it('should show breadcrumb navigation on nested pages', () => {
    render(<Navigation currentPath="/workouts/123" onNavigate={mockOnNavigate} />);
    
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText('Workouts')).toBeInTheDocument();
    expect(screen.getByText('Workout Detail')).toBeInTheDocument();
  });

  it('should handle deep linking and back navigation', async () => {
    const user = userEvent.setup();
    const mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
    };
    
    render(<Navigation router={mockRouter} onNavigate={mockOnNavigate} />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);
    
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it('should show loading state during navigation', () => {
    render(<Navigation isNavigating={true} onNavigate={mockOnNavigate} />);
    
    expect(screen.getByTestId('navigation-loading')).toBeInTheDocument();
  });

  it('should adapt to dark theme', () => {
    render(<Navigation theme="dark" onNavigate={mockOnNavigate} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('dark');
  });

  it('should be optimized for touch interactions', () => {
    render(<Navigation onNavigate={mockOnNavigate} />);
    
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      // Check minimum touch target size (44px)
      expect(link).toHaveStyle('minHeight: 44px');
    });
  });

  it('should handle network connectivity status', () => {
    render(<Navigation isOffline={true} onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/no internet connection/i)).toBeInTheDocument();
  });

  it('should prevent navigation when workout is in progress', async () => {
    const user = userEvent.setup();
    render(<Navigation hasActiveWorkout={true} onNavigate={mockOnNavigate} />);
    
    const historyLink = screen.getByRole('link', { name: /history/i });
    await user.click(historyLink);
    
    expect(screen.getByText(/save current workout/i)).toBeInTheDocument();
    expect(mockOnNavigate).not.toHaveBeenCalled();
  });

  it('should show sync status indicator', () => {
    render(<Navigation syncStatus="syncing" onNavigate={mockOnNavigate} />);
    
    expect(screen.getByTestId('sync-indicator')).toBeInTheDocument();
    expect(screen.getByLabelText(/syncing data/i)).toBeInTheDocument();
  });
});