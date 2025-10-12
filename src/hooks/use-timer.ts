import { useState, useCallback, useEffect, useRef } from 'react';

export interface TimerConfig {
  mode?: 'stopwatch' | 'countdown';
  initialTime?: number;
  autoStart?: boolean;
  showMilliseconds?: boolean;
  onComplete?: () => void;
  onTick?: (time: number) => void;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onRestComplete?: () => void;
}

export interface UseTimerReturn {
  // Timer state
  time: number;
  isRunning: boolean;
  isPaused: boolean;
  mode: 'stopwatch' | 'countdown';
  
  // Timer controls
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  stop: () => void;
  
  // Countdown specific
  setCountdown: (milliseconds: number) => void;
  
  // Stopwatch features
  lap: () => void;
  laps: number[];
  
  // Rest timer
  startRestTimer: (duration: number) => void;
  cancelRestTimer: () => void;
  
  // Time formatting
  formatTime: (milliseconds: number) => string;
  formattedTime: string;
  
  // Configuration
  configure: (config: Partial<TimerConfig>) => void;
  
  // State management
  getState: () => TimerState;
  setState: (state: TimerState) => void;
  
  // Testing utilities
  setTime?: (time: number) => void;
}

export interface TimerState {
  time: number;
  isRunning: boolean;
  isPaused: boolean;
  mode: 'stopwatch' | 'countdown';
  laps: number[];
}

export function useTimer(config: TimerConfig = {}): UseTimerReturn {
  const {
    mode = 'stopwatch',
    initialTime = 0,
    autoStart = false,
    showMilliseconds = false,
    onComplete,
    onTick,
    onStart,
    onPause,
    onStop,
    onRestComplete,
  } = config;

  const [time, setTime] = useState(Math.max(0, initialTime)); // Ensure no negative values
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'countdown'>(mode);
  const [laps, setLaps] = useState<number[]>([]);
  const [initialTimeRef, setInitialTimeRef] = useState(Math.max(0, initialTime));
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number>(Math.max(0, initialTime));
  const lastTickRef = useRef<number>(0);

  // Auto start if configured
  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const start = useCallback(() => {
    if (isRunning && !isPaused) return;
    
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    
    if (onStart) {
      onStart();
    }
    
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - (startTimeRef.current || now);
      
      let newTime: number;
      if (timerMode === 'stopwatch') {
        newTime = pausedAtRef.current + elapsed;
      } else {
        newTime = Math.max(0, pausedAtRef.current - elapsed);
        
        // Check if countdown completed
        if (newTime <= 0) {
          setTime(0);
          setIsRunning(false);
          setIsPaused(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (onComplete) {
            onComplete();
          }
          return;
        }
      }
      
      setTime(newTime);
      
      // Throttle onTick calls to prevent excessive updates
      if (onTick && now - lastTickRef.current >= 100) { // Max 10 calls per second
        onTick(newTime);
        lastTickRef.current = now;
      }
    }, 16); // ~60fps for smooth updates
  }, [isRunning, isPaused, timerMode, onStart, onComplete, onTick]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;
    
    setIsRunning(false);
    setIsPaused(true);
    pausedAtRef.current = time;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (onPause) {
      onPause();
    }
  }, [isRunning, isPaused, time, onPause]);

  const resume = useCallback(() => {
    if (isRunning || !isPaused) return;
    start();
  }, [isRunning, isPaused, start]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const resetTime = timerMode === 'countdown' ? initialTimeRef : 0;
    setTime(resetTime);
    pausedAtRef.current = resetTime;
    setLaps([]);
  }, [timerMode, initialTimeRef]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const stopTime = timerMode === 'countdown' ? initialTimeRef : 0;
    setTime(stopTime);
    pausedAtRef.current = stopTime;
    setLaps([]);
    
    if (onStop) {
      onStop();
    }
  }, [timerMode, initialTimeRef, onStop]);

  const setCountdown = useCallback((milliseconds: number) => {
    setTimerMode('countdown');
    setInitialTimeRef(milliseconds);
    setTime(milliseconds);
    pausedAtRef.current = milliseconds;
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const lap = useCallback(() => {
    if (!isRunning || timerMode !== 'stopwatch') return;
    
    setLaps(prevLaps => [...prevLaps, time]);
  }, [isRunning, timerMode, time]);

  const startRestTimer = useCallback((duration: number) => {
    setTimerMode('countdown');
    setTime(duration);
    setInitialTimeRef(duration);
    pausedAtRef.current = duration;
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - (startTimeRef.current || now);
      const newTime = Math.max(0, duration - elapsed);
      
      setTime(newTime);
      
      if (newTime <= 0) {
        setIsRunning(false);
        setIsPaused(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (onRestComplete) {
          onRestComplete();
        }
      }
    }, 16);
  }, [onRestComplete]);

  const cancelRestTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimerMode('stopwatch');
    setTime(0);
    pausedAtRef.current = 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 100);
    
    if (showMilliseconds && hours === 0) {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms}`;
    }
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [showMilliseconds]);

  const configure = useCallback((newConfig: Partial<TimerConfig>) => {
    if (newConfig.mode !== undefined) {
      setTimerMode(newConfig.mode);
    }
    if (newConfig.initialTime !== undefined) {
      setInitialTimeRef(newConfig.initialTime);
      if (!isRunning) {
        setTime(newConfig.initialTime);
        pausedAtRef.current = newConfig.initialTime;
      }
    }
  }, [isRunning]);

  const getState = useCallback((): TimerState => {
    return {
      time,
      isRunning,
      isPaused,
      mode: timerMode,
      laps,
    };
  }, [time, isRunning, isPaused, timerMode, laps]);

  const setState = useCallback((state: TimerState) => {
    setTime(state.time);
    setIsRunning(state.isRunning);
    setIsPaused(state.isPaused);
    setTimerMode(state.mode);
    setLaps(state.laps);
    pausedAtRef.current = state.time;
  }, []);

  // Testing utility
  const setTimeForTesting = useCallback((newTime: number) => {
    setTime(newTime);
    pausedAtRef.current = newTime;
  }, []);

  const formattedTime = formatTime(time);

  return {
    time,
    isRunning,
    isPaused,
    mode: timerMode,
    start,
    pause,
    resume,
    reset,
    stop,
    setCountdown,
    lap,
    laps,
    startRestTimer,
    cancelRestTimer,
    formatTime,
    formattedTime,
    configure,
    getState,
    setState,
    setTime: setTimeForTesting,
  };
}