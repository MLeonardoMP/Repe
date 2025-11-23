'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPreferences } from '@/types';

// Backwards compatibility type alias
export interface UserSettings extends UserPreferences {
  units: 'kg' | 'lbs';
  defaultRestTime: number;
  theme: 'dark';
  notifications: boolean;
}

interface SettingsProps {
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  onSave?: () => void;
  className?: string;
}

export function Settings({ 
  settings, 
  onSettingsChange, 
  onSave, 
  className = '' 
}: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: keyof UserSettings, value: string | number | boolean) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasChanges(true);
    onSettingsChange(newSettings);
  };

  const handleSave = () => {
    onSave?.();
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
    onSettingsChange(settings);
  };

  return (
    <div className={`space-y-6 ${className}`} data-testid="settings-component">
      <Card className="bg-black border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Workout Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Weight Units
            </label>
            <select
              value={localSettings.units}
              onChange={(e) => handleSettingChange('units', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-white focus:outline-none"
              data-testid="units-select"
              aria-label="Weight units selection"
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="lbs">Pounds (lbs)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Default Rest Time (seconds)
            </label>
            <Input
              type="number"
              min="30"
              max="600"
              step="15"
              value={localSettings.defaultRestTime}
              onChange={(e) => handleSettingChange('defaultRestTime', parseInt(e.target.value) || 0)}
              className="bg-neutral-900 border-neutral-700 text-white"
              data-testid="rest-time-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Theme
            </label>
            <select
              value={localSettings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-white focus:outline-none"
              data-testid="theme-select"
              aria-label="Theme selection"
              disabled
            >
              <option value="dark">Dark Theme</option>
            </select>
            <p className="text-xs text-neutral-500 mt-1">Only dark theme is available in this version</p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="notifications"
              checked={localSettings.notifications}
              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              className="w-4 h-4 text-white bg-neutral-900 border-neutral-700 rounded focus:ring-2 focus:ring-white"
              data-testid="notifications-checkbox"
            />
            <label 
              htmlFor="notifications" 
              className="text-sm font-medium text-neutral-400"
            >
              Enable notifications
            </label>
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex space-x-2">
          <Button
            onClick={handleSave}
            className="flex-1 bg-white hover:bg-neutral-200 text-black"
            data-testid="save-button"
          >
            Save Changes
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            data-testid="reset-button"
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}

export default Settings;