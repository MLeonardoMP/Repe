/**
 * Settings Component Unit Tests
 * Tests for user settings management and preferences
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from '@/components/user/settings';
import { UserSettings } from '@/types';

// Mock settings data
const mockSettings: UserSettings = {
  units: 'kg',
  defaultRestTime: 120,
  theme: 'dark',
  notifications: true,
  autoStart: false,
  soundEnabled: true,
  vibrationEnabled: true
};

describe('Settings Component', () => {
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all settings sections', () => {
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText(/units/i)).toBeInTheDocument();
    expect(screen.getByText(/rest time/i)).toBeInTheDocument();
    expect(screen.getByText(/theme/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications/i)).toBeInTheDocument();
  });

  it('should display current weight units selection', () => {
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const kgRadio = screen.getByRole('radio', { name: /kg/i });
    const lbsRadio = screen.getByRole('radio', { name: /lbs/i });
    
    expect(kgRadio).toBeChecked();
    expect(lbsRadio).not.toBeChecked();
  });

  it('should change weight units', async () => {
    const user = userEvent.setup();
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const lbsRadio = screen.getByRole('radio', { name: /lbs/i });
    await user.click(lbsRadio);
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockSettings,
      units: 'lbs'
    });
  });

  it('should display default rest time value', () => {
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const restTimeInput = screen.getByLabelText(/default rest time/i) as HTMLInputElement;
    expect(restTimeInput.value).toBe('120');
  });

  it('should update default rest time', async () => {
    const user = userEvent.setup();
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const restTimeInput = screen.getByLabelText(/default rest time/i);
    await user.clear(restTimeInput);
    await user.type(restTimeInput, '90');
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockSettings,
      defaultRestTime: 90
    });
  });

  it('should validate rest time range', async () => {
    const user = userEvent.setup();
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const restTimeInput = screen.getByLabelText(/default rest time/i);
    await user.clear(restTimeInput);
    await user.type(restTimeInput, '600');
    
    expect(screen.getByText(/rest time must be between/i)).toBeInTheDocument();
  });

  it('should display theme selection', () => {
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const themeSelect = screen.getByLabelText(/theme/i) as HTMLSelectElement;
    expect(themeSelect.value).toBe('dark');
  });

  it('should change theme', async () => {
    const user = userEvent.setup();
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const themeSelect = screen.getByLabelText(/theme/i);
    await user.selectOptions(themeSelect, 'light');
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockSettings,
      theme: 'light'
    });
  });

  it('should toggle notifications', async () => {
    const user = userEvent.setup();
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const notificationsToggle = screen.getByRole('checkbox', { name: /notifications/i });
    expect(notificationsToggle).toBeChecked();
    
    await user.click(notificationsToggle);
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockSettings,
      notifications: false
    });
  });

  it('should toggle auto start workouts', async () => {
    const user = userEvent.setup();
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const autoStartToggle = screen.getByRole('checkbox', { name: /auto start/i });
    expect(autoStartToggle).not.toBeChecked();
    
    await user.click(autoStartToggle);
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockSettings,
      autoStart: true
    });
  });

  it('should toggle sound effects', async () => {
    const user = userEvent.setup();
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const soundToggle = screen.getByRole('checkbox', { name: /sound/i });
    expect(soundToggle).toBeChecked();
    
    await user.click(soundToggle);
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockSettings,
      soundEnabled: false
    });
  });

  it('should toggle vibration', async () => {
    const user = userEvent.setup();
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const vibrationToggle = screen.getByRole('checkbox', { name: /vibration/i });
    expect(vibrationToggle).toBeChecked();
    
    await user.click(vibrationToggle);
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockSettings,
      vibrationEnabled: false
    });
  });

  it('should show preset rest time buttons', () => {
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByRole('button', { name: '60s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '90s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '120s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '180s' })).toBeInTheDocument();
  });

  it('should set rest time using preset buttons', async () => {
    const user = userEvent.setup();
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const preset90Button = screen.getByRole('button', { name: '90s' });
    await user.click(preset90Button);
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockSettings,
      defaultRestTime: 90
    });
  });

  it('should show save confirmation when settings change', async () => {
    const user = userEvent.setup();
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const lbsRadio = screen.getByRole('radio', { name: /lbs/i });
    await user.click(lbsRadio);
    
    expect(screen.getByText(/settings saved/i)).toBeInTheDocument();
  });

  it('should show loading state during save', () => {
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} isLoading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display error messages', () => {
    render(
      <Settings 
        settings={mockSettings} 
        onUpdate={mockOnUpdate}
        error="Failed to save settings"
      />
    );
    
    expect(screen.getByText('Failed to save settings')).toBeInTheDocument();
  });

  it('should have reset to defaults button', () => {
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByRole('button', { name: /reset to defaults/i })).toBeInTheDocument();
  });

  it('should reset to default settings', async () => {
    const user = userEvent.setup();
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
    await user.click(resetButton);
    
    // Should show confirmation dialog
    expect(screen.getByText(/reset all settings/i)).toBeInTheDocument();
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      units: 'kg',
      defaultRestTime: 120,
      theme: 'dark',
      notifications: true,
      autoStart: false,
      soundEnabled: true,
      vibrationEnabled: true
    });
  });

  it('should show app version in settings', () => {
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText(/version/i)).toBeInTheDocument();
  });

  it('should have export data option', () => {
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByRole('button', { name: /export data/i })).toBeInTheDocument();
  });

  it('should handle data export', async () => {
    const user = userEvent.setup();
    const mockOnExport = jest.fn();
    
    render(
      <Settings 
        settings={mockSettings} 
        onUpdate={mockOnUpdate}
        onExportData={mockOnExport}
      />
    );
    
    const exportButton = screen.getByRole('button', { name: /export data/i });
    await user.click(exportButton);
    
    expect(mockOnExport).toHaveBeenCalledTimes(1);
  });

  it('should have import data option', () => {
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByLabelText(/import data/i)).toBeInTheDocument();
  });

  it('should handle data import', async () => {
    const user = userEvent.setup();
    const mockOnImport = jest.fn();
    
    render(
      <Settings 
        settings={mockSettings} 
        onUpdate={mockOnUpdate}
        onImportData={mockOnImport}
      />
    );
    
    const importInput = screen.getByLabelText(/import data/i);
    const file = new File(['{"settings": {}}'], 'backup.json', { type: 'application/json' });
    
    await user.upload(importInput, file);
    
    expect(mockOnImport).toHaveBeenCalledWith(file);
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const kgRadio = screen.getByRole('radio', { name: /kg/i });
    const lbsRadio = screen.getByRole('radio', { name: /lbs/i });
    
    await user.click(kgRadio);
    await user.tab();
    
    expect(lbsRadio).toHaveFocus();
  });

  it('should show settings categories', () => {
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText(/general/i)).toBeInTheDocument();
    expect(screen.getByText(/workout/i)).toBeInTheDocument();
    expect(screen.getByText(/appearance/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications/i)).toBeInTheDocument();
  });

  it('should validate numeric inputs only', async () => {
    const user = userEvent.setup();
    render(<Settings settings={mockSettings} onUpdate={mockOnUpdate} />);
    
    const restTimeInput = screen.getByLabelText(/default rest time/i);
    await user.clear(restTimeInput);
    await user.type(restTimeInput, 'abc');
    
    expect(screen.getByText(/must be a number/i)).toBeInTheDocument();
  });
});