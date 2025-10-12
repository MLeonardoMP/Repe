/**
 * Footer Component Unit Tests
 * Tests for app footer with navigation and utility actions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Footer } from '@/components/layout/footer';

describe('Footer Component', () => {
  const mockOnNavigate = jest.fn();
  const mockOnAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render footer with navigation', () => {
    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'home' },
      { id: 'workouts', label: 'Workouts', icon: 'fitness' },
      { id: 'profile', label: 'Profile', icon: 'user' }
    ];
    
    render(<Footer navigation={navItems} onNavigate={mockOnNavigate} />);
    
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Workouts')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should handle navigation item clicks', async () => {
    const user = userEvent.setup();
    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'home' }
    ];
    
    render(<Footer navigation={navItems} onNavigate={mockOnNavigate} />);
    
    const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
    await user.click(dashboardButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('dashboard');
  });

  it('should show active navigation item', () => {
    const navItems = [
      { id: 'workouts', label: 'Workouts', icon: 'fitness', active: true },
      { id: 'profile', label: 'Profile', icon: 'user' }
    ];
    
    render(<Footer navigation={navItems} />);
    
    const workoutsButton = screen.getByRole('button', { name: /workouts/i });
    expect(workoutsButton).toHaveAttribute('aria-current', 'page');
  });

  it('should display badge on navigation items', () => {
    const navItems = [
      { id: 'notifications', label: 'Notifications', icon: 'bell', badge: 5 }
    ];
    
    render(<Footer navigation={navItems} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByTestId('nav-badge')).toBeInTheDocument();
  });

  it('should show floating action button', () => {
    const fab = {
      icon: 'plus',
      label: 'Start Workout',
      onClick: mockOnAction
    };
    
    render(<Footer fab={fab} />);
    
    expect(screen.getByRole('button', { name: /start workout/i })).toBeInTheDocument();
    expect(screen.getByTestId('fab')).toBeInTheDocument();
  });

  it('should handle FAB click', async () => {
    const user = userEvent.setup();
    const fab = { icon: 'plus', label: 'Add', onClick: mockOnAction };
    
    render(<Footer fab={fab} />);
    
    const fabButton = screen.getByRole('button', { name: /add/i });
    await user.click(fabButton);
    
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it('should show quick actions', () => {
    const quickActions = [
      { icon: 'timer', label: 'Rest Timer', onClick: mockOnAction },
      { icon: 'camera', label: 'Take Photo', onClick: mockOnAction }
    ];
    
    render(<Footer quickActions={quickActions} />);
    
    expect(screen.getByRole('button', { name: /rest timer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /take photo/i })).toBeInTheDocument();
  });

  it('should handle quick action clicks', async () => {
    const user = userEvent.setup();
    const quickActions = [
      { icon: 'timer', label: 'Timer', onClick: mockOnAction }
    ];
    
    render(<Footer quickActions={quickActions} />);
    
    const timerButton = screen.getByRole('button', { name: /timer/i });
    await user.click(timerButton);
    
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it('should show current workout indicator', () => {
    const currentWorkout = {
      name: 'Push Day',
      duration: '00:45:30',
      progress: 0.6
    };
    
    render(<Footer currentWorkout={currentWorkout} />);
    
    expect(screen.getByText('Push Day')).toBeInTheDocument();
    expect(screen.getByText('00:45:30')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should handle current workout tap', async () => {
    const user = userEvent.setup();
    const mockOnWorkoutTap = jest.fn();
    const currentWorkout = { name: 'Leg Day' };
    
    render(
      <Footer 
        currentWorkout={currentWorkout}
        onCurrentWorkoutTap={mockOnWorkoutTap}
      />
    );
    
    const workoutIndicator = screen.getByTestId('current-workout');
    await user.click(workoutIndicator);
    
    expect(mockOnWorkoutTap).toHaveBeenCalledTimes(1);
  });

  it('should be sticky at bottom', () => {
    render(<Footer sticky />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('sticky', 'bottom-0');
  });

  it('should show offline indicator', () => {
    render(<Footer isOffline={true} />);
    
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
    expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
  });

  it('should display sync status', () => {
    render(<Footer syncStatus="pending" syncCount={3} />);
    
    expect(screen.getByText(/3 pending/i)).toBeInTheDocument();
    expect(screen.getByTestId('sync-status')).toBeInTheDocument();
  });

  it('should show workout timer in compact mode', () => {
    const timer = {
      type: 'rest',
      remaining: 45,
      total: 90
    };
    
    render(<Footer timer={timer} compact />);
    
    expect(screen.getByText('00:45')).toBeInTheDocument();
    expect(screen.getByTestId('timer-compact')).toBeInTheDocument();
  });

  it('should handle timer controls', async () => {
    const user = userEvent.setup();
    const mockOnTimerAction = jest.fn();
    const timer = { type: 'rest', remaining: 30 };
    
    render(<Footer timer={timer} onTimerAction={mockOnTimerAction} />);
    
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    await user.click(pauseButton);
    
    expect(mockOnTimerAction).toHaveBeenCalledWith('pause');
  });

  it('should adapt to safe area insets', () => {
    render(<Footer safeArea />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('pb-safe');
  });

  it('should handle swipe gestures', async () => {
    const mockOnSwipe = jest.fn();
    
    render(<Footer onSwipe={mockOnSwipe} />);
    
    const footer = screen.getByRole('contentinfo');
    
    // Simulate touch events for swipe
    fireEvent.touchStart(footer, {
      touches: [{ clientX: 100, clientY: 100 }]
    });
    
    fireEvent.touchMove(footer, {
      touches: [{ clientX: 200, clientY: 100 }]
    });
    
    fireEvent.touchEnd(footer);
    
    await waitFor(() => {
      expect(mockOnSwipe).toHaveBeenCalledWith('right');
    });
  });

  it('should show contextual actions', () => {
    const contextActions = [
      { icon: 'edit', label: 'Edit Set', onClick: mockOnAction, context: 'exercise' }
    ];
    
    render(<Footer contextActions={contextActions} currentContext="exercise" />);
    
    expect(screen.getByRole('button', { name: /edit set/i })).toBeInTheDocument();
  });

  it('should hide non-contextual actions', () => {
    const contextActions = [
      { icon: 'edit', label: 'Edit Set', onClick: mockOnAction, context: 'exercise' }
    ];
    
    render(<Footer contextActions={contextActions} currentContext="dashboard" />);
    
    expect(screen.queryByRole('button', { name: /edit set/i })).not.toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<Footer isLoading={true} />);
    
    expect(screen.getByTestId('footer-loading')).toBeInTheDocument();
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    const navItems = [
      { id: 'item1', label: 'Item 1', icon: 'icon1' },
      { id: 'item2', label: 'Item 2', icon: 'icon2' }
    ];
    
    render(<Footer navigation={navItems} />);
    
    const item1 = screen.getByRole('button', { name: /item 1/i });
    const item2 = screen.getByRole('button', { name: /item 2/i });
    
    await user.click(item1);
    await user.tab();
    
    expect(item2).toHaveFocus();
  });

  it('should show version info when enabled', () => {
    render(<Footer showVersion versionInfo="v1.2.3" />);
    
    expect(screen.getByText('v1.2.3')).toBeInTheDocument();
  });

  it('should display copyright info', () => {
    render(<Footer copyright="© 2024 Repe Gym App" />);
    
    expect(screen.getByText('© 2024 Repe Gym App')).toBeInTheDocument();
  });

  it('should show connection quality indicator', () => {
    render(<Footer connectionQuality="poor" />);
    
    expect(screen.getByTestId('connection-quality')).toBeInTheDocument();
    expect(screen.getByLabelText(/poor connection/i)).toBeInTheDocument();
  });

  it('should handle double tap for quick access', async () => {
    const user = userEvent.setup();
    const mockOnDoubleTap = jest.fn();
    
    render(<Footer onDoubleTap={mockOnDoubleTap} />);
    
    const footer = screen.getByRole('contentinfo');
    
    await user.dblClick(footer);
    
    expect(mockOnDoubleTap).toHaveBeenCalledTimes(1);
  });

  it('should show emergency controls', () => {
    const emergencyActions = [
      { icon: 'emergency', label: 'Emergency Stop', onClick: mockOnAction }
    ];
    
    render(<Footer emergencyActions={emergencyActions} />);
    
    expect(screen.getByRole('button', { name: /emergency stop/i })).toBeInTheDocument();
    expect(screen.getByTestId('emergency-controls')).toBeInTheDocument();
  });

  it('should maintain accessibility standards', () => {
    const navItems = [
      { id: 'home', label: 'Home', icon: 'home' }
    ];
    
    render(<Footer navigation={navItems} />);
    
    const footer = screen.getByRole('contentinfo');
    const navButton = screen.getByRole('button', { name: /home/i });
    
    expect(footer).toBeInTheDocument();
    expect(navButton).toHaveAttribute('aria-label');
  });

  it('should support haptic feedback', async () => {
    const user = userEvent.setup();
    const mockHaptic = jest.fn();
    global.navigator.vibrate = mockHaptic;
    
    const fab = { icon: 'plus', label: 'Add', onClick: mockOnAction };
    
    render(<Footer fab={fab} hapticFeedback />);
    
    const fabButton = screen.getByRole('button', { name: /add/i });
    await user.click(fabButton);
    
    expect(mockHaptic).toHaveBeenCalledWith(10);
  });
});