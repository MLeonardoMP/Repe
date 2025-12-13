/**
 * Settings Component Unit Tests
 * Tests for user settings and preferences
 * Updated to match current component API
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings, UserSettings } from '@/components/user/settings';

const mockSettings: UserSettings = {
  units: 'kg',
  defaultRestTime: 120,
  theme: 'dark',
  notifications: true,
};

describe('Settings Component', () => {
  const mockOnSettingsChange = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render settings component', () => {
    render(
      <Settings
        settings={mockSettings}
        onSettingsChange={mockOnSettingsChange}
      />
    );
    
    expect(screen.getByTestId('settings-component')).toBeInTheDocument();
  });

  it('should display workout settings card', () => {
    render(
      <Settings
        settings={mockSettings}
        onSettingsChange={mockOnSettingsChange}
      />
    );
    
    expect(screen.getByText('Workout Settings')).toBeInTheDocument();
  });

  it('should render units selection', () => {
    render(
      <Settings
        settings={mockSettings}
        onSettingsChange={mockOnSettingsChange}
      />
    );
    
    expect(screen.getByTestId('units-select')).toBeInTheDocument();
    expect(screen.getByText('Weight Units')).toBeInTheDocument();
  });

  it('should handle units change', async () => {
    const user = userEvent.setup();
    
    render(
      <Settings
        settings={mockSettings}
        onSettingsChange={mockOnSettingsChange}
      />
    );
    
    const unitsSelect = screen.getByTestId('units-select');
    await user.selectOptions(unitsSelect, 'lbs');
    
    expect(mockOnSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ units: 'lbs' })
    );
  });

  it('should render rest time input', () => {
    render(
      <Settings
        settings={mockSettings}
        onSettingsChange={mockOnSettingsChange}
      />
    );
    
    expect(screen.getByTestId('rest-time-input')).toBeInTheDocument();
    expect(screen.getByText(/Default Rest Time/i)).toBeInTheDocument();
  });

  it('should handle rest time change', async () => {
    const user = userEvent.setup();
    
    render(
      <Settings
        settings={mockSettings}
        onSettingsChange={mockOnSettingsChange}
      />
    );
    
    const restTimeInput = screen.getByTestId('rest-time-input');
    await user.clear(restTimeInput);
    await user.type(restTimeInput, '90');
    
    expect(mockOnSettingsChange).toHaveBeenCalled();
  });

  it('should render theme selection', () => {
    render(
      <Settings
        settings={mockSettings}
        onSettingsChange={mockOnSettingsChange}
      />
    );
    
    expect(screen.getByTestId('theme-select')).toBeInTheDocument();
    expect(screen.getByText(/Only dark theme is available/i)).toBeInTheDocument();
  });

  it('should render notifications checkbox', () => {
    render(
      <Settings
        settings={mockSettings}
        onSettingsChange={mockOnSettingsChange}
      />
    );
    
    expect(screen.getByTestId('notifications-checkbox')).toBeInTheDocument();
    expect(screen.getByText('Enable notifications')).toBeInTheDocument();
  });

  it('should handle notifications toggle', async () => {
    const user = userEvent.setup();
    
    render(
      <Settings
        settings={mockSettings}
        onSettingsChange={mockOnSettingsChange}
      />
    );
    
    const notificationsCheckbox = screen.getByTestId('notifications-checkbox');
    await user.click(notificationsCheckbox);
    
    expect(mockOnSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ notifications: false })
    );
  });

  it('should show save button when changes are made', async () => {
    const user = userEvent.setup();
    
    render(
      <Settings
        settings={mockSettings}
        onSettingsChange={mockOnSettingsChange}
        onSave={mockOnSave}
      />
    );
    
    const unitsSelect = screen.getByTestId('units-select');
    await user.selectOptions(unitsSelect, 'lbs');
    
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
  });

  it('should handle save button click', async () => {
    const user = userEvent.setup();
    
    render(
      <Settings
        settings={mockSettings}
        onSettingsChange={mockOnSettingsChange}
        onSave={mockOnSave}
      />
    );
    
    // Make a change first
    const unitsSelect = screen.getByTestId('units-select');
    await user.selectOptions(unitsSelect, 'lbs');
    
    // Click save
    const saveButton = screen.getByTestId('save-button');
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it('should handle reset button click', async () => {
    const user = userEvent.setup();
    
    render(
      <Settings
        settings={mockSettings}
        onSettingsChange={mockOnSettingsChange}
        onSave={mockOnSave}
      />
    );
    
    // Make a change first
    const unitsSelect = screen.getByTestId('units-select');
    await user.selectOptions(unitsSelect, 'lbs');
    
    // Click reset
    const resetButton = screen.getByTestId('reset-button');
    await user.click(resetButton);
    
    // Should reset to original settings
    expect(mockOnSettingsChange).toHaveBeenCalledWith(mockSettings);
  });

  it('should apply custom className', () => {
    render(
      <Settings
        settings={mockSettings}
        onSettingsChange={mockOnSettingsChange}
        className="custom-settings"
      />
    );
    
    const component = screen.getByTestId('settings-component');
    expect(component).toHaveClass('custom-settings');
  });

  it('should display current values from settings', () => {
    render(
      <Settings
        settings={mockSettings}
        onSettingsChange={mockOnSettingsChange}
      />
    );
    
    const unitsSelect = screen.getByTestId('units-select') as HTMLSelectElement;
    expect(unitsSelect.value).toBe('kg');
    
    const notificationsCheckbox = screen.getByTestId('notifications-checkbox') as HTMLInputElement;
    expect(notificationsCheckbox.checked).toBe(true);
  });
});
