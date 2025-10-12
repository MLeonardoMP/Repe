/**
 * Dashboard Component Unit Tests
 * Tests for user dashboard with statistics and recent activity
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '@/components/user/dashboard';
import { User, WorkoutSession } from '@/types';

// Mock user data
const mockUser: User = {
  id: 'user-123',
  name: 'John Doe',
  settings: {
    units: 'kg',
    defaultRestTime: 120,
    theme: 'dark'
  },
  createdAt: '2024-01-01T00:00:00Z'
};

// Mock recent workouts
const mockRecentWorkouts: WorkoutSession[] = [
  {
    id: 'workout-1',
    userId: 'user-123',
    name: 'Push Day',
    exercises: [
      {
        templateId: 'bench-press',
        sets: [
          { reps: 10, weight: 80, intensity: 8, restTime: 120, completed: true }
        ]
      }
    ],
    startTime: '2024-01-15T10:00:00Z',
    endTime: '2024-01-15T11:30:00Z',
    notes: 'Good session'
  }
];

// Mock workout statistics
const mockStats = {
  totalWorkouts: 25,
  totalWeight: 12500,
  averageDuration: 75,
  currentStreak: 5,
  longestStreak: 12,
  favoriteExercise: 'bench-press',
  weeklyProgress: [
    { day: 'Mon', workouts: 1 },
    { day: 'Tue', workouts: 0 },
    { day: 'Wed', workouts: 1 },
    { day: 'Thu', workouts: 0 },
    { day: 'Fri', workouts: 1 },
    { day: 'Sat', workouts: 0 },
    { day: 'Sun', workouts: 0 }
  ]
};

describe('Dashboard Component', () => {
  const mockOnStartWorkout = jest.fn();
  const mockOnViewWorkout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render welcome message with user name', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByText(/welcome back, john/i)).toBeInTheDocument();
  });

  it('should display workout statistics', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByText('25')).toBeInTheDocument(); // total workouts
    expect(screen.getByText('12,500 kg')).toBeInTheDocument(); // total weight
    expect(screen.getByText('75 min')).toBeInTheDocument(); // average duration
    expect(screen.getByText('5 days')).toBeInTheDocument(); // current streak
  });

  it('should show quick start workout button', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByRole('button', { name: /start workout/i })).toBeInTheDocument();
  });

  it('should handle quick start workout', async () => {
    const user = userEvent.setup();
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    const startButton = screen.getByRole('button', { name: /start workout/i });
    await user.click(startButton);
    
    expect(mockOnStartWorkout).toHaveBeenCalledTimes(1);
  });

  it('should display recent workouts section', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByText(/recent workouts/i)).toBeInTheDocument();
    expect(screen.getByText('Push Day')).toBeInTheDocument();
  });

  it('should show workout details in recent list', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByText(/1h 30m/i)).toBeInTheDocument(); // duration
    expect(screen.getByText(/1 exercise/i)).toBeInTheDocument();
  });

  it('should handle viewing workout details', async () => {
    const user = userEvent.setup();
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    const workoutCard = screen.getByText('Push Day');
    await user.click(workoutCard);
    
    expect(mockOnViewWorkout).toHaveBeenCalledWith('workout-1');
  });

  it('should show empty state when no recent workouts', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={[]}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByText(/no recent workouts/i)).toBeInTheDocument();
    expect(screen.getByText(/start your first workout/i)).toBeInTheDocument();
  });

  it('should display weekly progress chart', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByText(/this week/i)).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
  });

  it('should show current streak prominently', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByText(/streak/i)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should display favorite exercise', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByText(/favorite exercise/i)).toBeInTheDocument();
    expect(screen.getByText('bench-press')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={[]}
        statistics={null}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
        isLoading={true}
      />
    );
    
    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={[]}
        statistics={null}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
        error="Failed to load dashboard data"
      />
    );
    
    expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
  });

  it('should show workout templates section', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByText(/workout templates/i)).toBeInTheDocument();
  });

  it('should handle template selection', async () => {
    const user = userEvent.setup();
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    const pushTemplate = screen.getByText(/push workout/i);
    await user.click(pushTemplate);
    
    expect(mockOnStartWorkout).toHaveBeenCalledWith('push-template');
  });

  it('should display achievements section', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByText(/achievements/i)).toBeInTheDocument();
  });

  it('should show personal records', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByText(/personal records/i)).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByText(/jan 15/i)).toBeInTheDocument();
  });

  it('should show navigation shortcuts', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByRole('button', { name: /history/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /progress/i })).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    const startButton = screen.getByRole('button', { name: /start workout/i });
    const historyButton = screen.getByRole('button', { name: /history/i });
    
    await user.click(startButton);
    await user.tab();
    
    expect(historyButton).toHaveFocus();
  });

  it('should refresh data on pull-to-refresh', async () => {
    const mockOnRefresh = jest.fn();
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
        onRefresh={mockOnRefresh}
      />
    );
    
    // Simulate pull-to-refresh gesture
    fireEvent.touchStart(screen.getByTestId('dashboard-content'));
    fireEvent.touchEnd(screen.getByTestId('dashboard-content'));
    
    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('should show motivational messages', () => {
    render(
      <Dashboard 
        user={mockUser}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByText(/keep up the great work/i)).toBeInTheDocument();
  });

  it('should adapt to user preferences', () => {
    const userWithLbs = {
      ...mockUser,
      settings: { ...mockUser.settings, units: 'lbs' }
    };
    
    render(
      <Dashboard 
        user={userWithLbs}
        recentWorkouts={mockRecentWorkouts}
        statistics={mockStats}
        onStartWorkout={mockOnStartWorkout}
        onViewWorkout={mockOnViewWorkout}
      />
    );
    
    expect(screen.getByText('27,558 lbs')).toBeInTheDocument(); // converted weight
  });
});