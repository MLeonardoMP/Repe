'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface TimerDisplayProps {
  time?: number; // Time in seconds
  initialTime?: number; // Initial time for countdown
  isRunning?: boolean;
  showControls?: boolean;
  size?: 'small' | 'medium' | 'large';
  mode?: 'stopwatch' | 'countdown';
  showProgress?: boolean;
  maxTime?: number;
  label?: string;
  status?: string;
  showLaps?: boolean;
  laps?: number[];
  compact?: boolean;
  color?: 'primary' | 'warning' | 'critical';
  autoStart?: boolean;
  showMilliseconds?: boolean;
  warningThreshold?: number;
  criticalThreshold?: number;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  onTick?: (time: number) => void;
  onLap?: (time: number) => void;
  className?: string;
}

export function TimerDisplay({
  time = 0,
  initialTime = 0,
  isRunning = false,
  showControls = true,
  size = 'medium',
  mode = 'stopwatch',
  showProgress = false,
  maxTime = 0,
  label,
  status,
  showLaps = false,
  laps = [],
  compact = false,
  color = 'primary',
  autoStart = false,
  showMilliseconds = false,
  warningThreshold = 10,
  criticalThreshold = 5,
  onStart,
  onPause,
  onStop,
  onReset,
  onTick,
  onLap,
  className = '',
}: TimerDisplayProps) {
  const [currentTime, setCurrentTime] = useState(time || initialTime);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (autoStart && !started) {
      onStart?.();
      setStarted(true);
    }
  }, [autoStart, started, onStart]);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = mode === 'countdown' ? Math.max(0, prev - 1) : prev + 1;
          onTick?.(newTime);
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, mode, onTick]);

  const formatTime = useCallback((seconds: number, includeMs: boolean = showMilliseconds) => {
    if (isNaN(seconds)) {
      return 'NaN:NaN';
    }

    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const hours = Math.floor(absSeconds / 3600);
    const mins = Math.floor((absSeconds % 3600) / 60);
    const secs = Math.floor(absSeconds % 60);
    const ms = Math.floor((absSeconds % 1) * 10);

    const sign = isNegative ? '-' : '';
    
    if (hours > 0) {
      return `${sign}${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    const baseTime = `${sign}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return includeMs ? `${baseTime}.${ms}` : baseTime;
  }, [showMilliseconds]);

  const getDisplayTime = () => {
    if (mode === 'countdown') {
      return initialTime > 0 ? Math.max(0, initialTime - currentTime) : currentTime;
    }
    return currentTime;
  };

  const displayTime = getDisplayTime();

  const sizeClasses = {
    small: compact ? 'text-lg' : 'text-2xl',
    medium: compact ? 'text-2xl' : 'text-4xl',
    large: compact ? 'text-3xl' : 'text-6xl',
  };

  const colorClasses = {
    primary: 'bg-gray-800 border-gray-600 text-white',
    warning: 'bg-yellow-800 border-yellow-600 text-yellow-100',
    critical: 'bg-red-800 border-red-600 text-red-100',
  };

  const getCurrentColor = () => {
    if (mode === 'countdown' && displayTime <= criticalThreshold) {
      return 'critical';
    }
    if (mode === 'countdown' && displayTime <= warningThreshold) {
      return 'warning';
    }
    return color;
  };

  const currentColor = getCurrentColor();
  const isCompleted = mode === 'countdown' && displayTime === 0;
  const isOverflow = mode === 'countdown' && displayTime < 0;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {label && (
        <div className="text-sm text-gray-400" data-testid="timer-label">
          {label}
        </div>
      )}

      <div 
        className={`${sizeClasses[size]} font-mono font-bold px-6 py-3 rounded-lg border ${colorClasses[currentColor]} ${
          compact ? 'compact' : ''
        } ${size === 'small' ? 'small' : size === 'large' ? 'large' : ''} ${
          currentColor === 'warning' ? 'warning' : currentColor === 'critical' ? 'critical' : ''
        }`}
        data-testid="timer-display"
        role="timer"
        aria-label={`Timer showing ${formatTime(displayTime)}`}
        aria-live="polite"
      >
        {formatTime(displayTime)}
      </div>

      {showProgress && maxTime > 0 && (
        <div 
          className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden"
          data-testid="timer-progress"
        >
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${Math.min(100, (currentTime / maxTime) * 100)}%` }}
            role="progressbar"
            aria-label="Timer progress"
            aria-valuenow={Math.round((currentTime / maxTime) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      {status && (
        <div className="text-sm text-gray-300" data-testid="timer-status">
          {status}
        </div>
      )}

      {isCompleted && (
        <div 
          className="text-center text-green-400 font-semibold"
          data-testid="timer-completed"
        >
          Time's Up! ⏰
        </div>
      )}

      {mode === 'countdown' && displayTime <= warningThreshold && displayTime > criticalThreshold && (
        <div 
          className="text-yellow-400 text-sm"
          data-testid="timer-warning"
        >
          ⚠️ Warning: Time running low
        </div>
      )}

      {mode === 'countdown' && displayTime <= criticalThreshold && displayTime > 0 && (
        <div 
          className="text-red-400 text-sm font-bold animate-pulse"
          data-testid="timer-critical"
        >
          🚨 Critical: Time almost up!
        </div>
      )}

      {isOverflow && (
        <div 
          className="text-red-400 text-sm font-bold"
          data-testid="timer-overflow"
        >
          ⏰ Timer Overflow
        </div>
      )}

      {showLaps && laps.length > 0 && (
        <div 
          className="w-full max-w-xs space-y-1"
          data-testid="lap-times"
        >
          <h4 className="text-sm font-medium text-gray-300">Lap Times:</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {laps.map((lap, index) => (
              <div 
                key={index}
                className="text-xs text-gray-400 flex justify-between"
              >
                <span>Lap {index + 1}</span>
                <span>{formatTime(lap)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showControls && (
        <div className="flex space-x-2">
          {!isRunning ? (
            <button
              onClick={onStart}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              data-testid="start-button"
              aria-label="Start timer"
            >
              Start
            </button>
          ) : (
            <button
              onClick={onPause}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              data-testid="pause-button"
              aria-label="Pause timer"
            >
              Pause
            </button>
          )}
          
          <button
            onClick={onStop}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            data-testid="stop-button"
            aria-label="Stop timer"
          >
            Stop
          </button>
          
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            data-testid="reset-button"
            aria-label="Reset timer"
          >
            Reset
          </button>

          {showLaps && (
            <button
              onClick={() => onLap?.(currentTime)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              data-testid="lap-button"
              aria-label="Record lap time"
            >
              Lap
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default TimerDisplay;