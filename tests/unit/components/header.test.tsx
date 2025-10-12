/**
 * Header Component Unit Tests
 * Tests for app header with title, actions, and responsive behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/components/layout/header';

describe('Header Component', () => {
  const mockOnBack = jest.fn();
  const mockOnAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render header with title', () => {
    render(<Header title="Workout Session" />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Workout Session')).toBeInTheDocument();
  });

  it('should show back button when provided', () => {
    render(<Header title="Exercise Details" showBack onBack={mockOnBack} />);
    
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('should handle back button click', async () => {
    const user = userEvent.setup();
    render(<Header title="Exercise Details" showBack onBack={mockOnBack} />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should display action buttons', () => {
    const actions = [
      { icon: 'save', label: 'Save', onClick: mockOnAction },
      { icon: 'share', label: 'Share', onClick: mockOnAction }
    ];
    
    render(<Header title="Workout" actions={actions} />);
    
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('should handle action button clicks', async () => {
    const user = userEvent.setup();
    const actions = [
      { icon: 'save', label: 'Save', onClick: mockOnAction }
    ];
    
    render(<Header title="Workout" actions={actions} />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it('should show loading state', () => {
    render(<Header title="Loading..." isLoading={true} />);
    
    expect(screen.getByTestId('header-loading')).toBeInTheDocument();
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
  });

  it('should display subtitle when provided', () => {
    render(
      <Header 
        title="Current Workout" 
        subtitle="Started 45 minutes ago"
      />
    );
    
    expect(screen.getByText('Current Workout')).toBeInTheDocument();
    expect(screen.getByText('Started 45 minutes ago')).toBeInTheDocument();
  });

  it('should show progress indicator', () => {
    render(
      <Header 
        title="Workout Progress" 
        progress={{ current: 3, total: 5 }}
      />
    );
    
    expect(screen.getByText('3 of 5')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display timer when active', () => {
    render(
      <Header 
        title="Active Workout" 
        timer={{ minutes: 45, seconds: 30 }}
      />
    );
    
    expect(screen.getByText('45:30')).toBeInTheDocument();
    expect(screen.getByLabelText(/workout duration/i)).toBeInTheDocument();
  });

  it('should handle menu button for mobile', async () => {
    const user = userEvent.setup();
    const mockOnMenuToggle = jest.fn();
    
    render(
      <Header 
        title="Repe" 
        showMenu 
        onMenuToggle={mockOnMenuToggle}
      />
    );
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);
    
    expect(mockOnMenuToggle).toHaveBeenCalledTimes(1);
  });

  it('should show notification indicator', () => {
    render(
      <Header 
        title="Dashboard" 
        notifications={{ count: 3, hasUnread: true }}
      />
    );
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByLabelText(/3 notifications/i)).toBeInTheDocument();
  });

  it('should handle notification button click', async () => {
    const user = userEvent.setup();
    const mockOnNotifications = jest.fn();
    
    render(
      <Header 
        title="Dashboard" 
        notifications={{ count: 2, hasUnread: true }}
        onNotifications={mockOnNotifications}
      />
    );
    
    const notificationButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(notificationButton);
    
    expect(mockOnNotifications).toHaveBeenCalledTimes(1);
  });

  it('should display current date and time', () => {
    const mockDate = new Date('2024-01-15T10:30:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
    
    render(<Header title="Today's Workout" showDateTime />);
    
    expect(screen.getByText(/jan 15/i)).toBeInTheDocument();
    expect(screen.getByText(/10:30/i)).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('should show user avatar in header', () => {
    const user = {
      name: 'John Doe',
      avatar: '/avatar.jpg'
    };
    
    render(<Header title="Profile" user={user} />);
    
    expect(screen.getByAltText('John Doe avatar')).toBeInTheDocument();
  });

  it('should handle user avatar click', async () => {
    const userEvent = userEvent.setup();
    const mockOnUserClick = jest.fn();
    const user = { name: 'John Doe' };
    
    render(
      <Header 
        title="Dashboard" 
        user={user} 
        onUserClick={mockOnUserClick}
      />
    );
    
    const avatar = screen.getByRole('button', { name: /john doe/i });
    await userEvent.click(avatar);
    
    expect(mockOnUserClick).toHaveBeenCalledTimes(1);
  });

  it('should be sticky on scroll', () => {
    render(<Header title="Workout List" sticky />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky');
  });

  it('should adapt height for mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    });
    
    render(<Header title="Mobile View" />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('mobile');
  });

  it('should show workout status badge', () => {
    render(
      <Header 
        title="Current Session" 
        status={{ type: 'active', label: 'In Progress' }}
      />
    );
    
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toHaveClass('active');
  });

  it('should handle keyboard navigation', async () => {
    const userEvent = userEvent.setup();
    const actions = [
      { icon: 'save', label: 'Save', onClick: mockOnAction },
      { icon: 'share', label: 'Share', onClick: mockOnAction }
    ];
    
    render(<Header title="Workout" actions={actions} />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    const shareButton = screen.getByRole('button', { name: /share/i });
    
    await userEvent.click(saveButton);
    await userEvent.tab();
    
    expect(shareButton).toHaveFocus();
  });

  it('should show connection status', () => {
    render(<Header title="Workouts" isOffline={true} />);
    
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/no connection/i)).toBeInTheDocument();
  });

  it('should display sync indicator', () => {
    render(<Header title="Workouts" syncStatus="syncing" />);
    
    expect(screen.getByTestId('sync-indicator')).toBeInTheDocument();
    expect(screen.getByLabelText(/syncing/i)).toBeInTheDocument();
  });

  it('should handle long titles with truncation', () => {
    const longTitle = 'This is a very long workout session title that should be truncated';
    
    render(<Header title={longTitle} />);
    
    const titleElement = screen.getByText(longTitle);
    expect(titleElement).toHaveClass('truncate');
  });

  it('should show search button when enabled', () => {
    render(<Header title="Workout History" showSearch />);
    
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('should handle search button click', async () => {
    const userEvent = userEvent.setup();
    const mockOnSearch = jest.fn();
    
    render(
      <Header 
        title="History" 
        showSearch 
        onSearch={mockOnSearch}
      />
    );
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('should show filter button with count', () => {
    render(
      <Header 
        title="Exercises" 
        filter={{ active: true, count: 3 }}
      />
    );
    
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should maintain accessibility standards', () => {
    const actions = [{ icon: 'save', label: 'Save', onClick: mockOnAction }];
    
    render(
      <Header 
        title="Accessible Header" 
        showBack 
        onBack={mockOnBack}
        actions={actions}
      />
    );
    
    const header = screen.getByRole('banner');
    const backButton = screen.getByRole('button', { name: /back/i });
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    expect(header).toBeInTheDocument();
    expect(backButton).toHaveAttribute('aria-label');
    expect(saveButton).toHaveAttribute('aria-label');
  });
});