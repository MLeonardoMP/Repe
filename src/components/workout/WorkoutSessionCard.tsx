/**
 * WorkoutSessionCard Component
 * Displays workout session summary with interactions
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { WorkoutSession } from '@/types';
import { cn } from '@/lib/utils';

interface WorkoutSessionCardProps {
  session: WorkoutSession;
  onView: (sessionId: string) => void;
  onEdit?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

// Utility functions for formatting
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return 'Invalid date';
  }
}

function formatDuration(startTime: string, endTime?: string): string {
  try {
    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return 'Invalid duration';
    }

    if (!endTime) {
      // Active session - calculate elapsed time from now
      const now = new Date();
      const elapsed = now.getTime() - start.getTime();
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
      }
      return `${minutes}m`;
    }

    const end = new Date(endTime);
    if (isNaN(end.getTime())) {
      return 'Invalid duration';
    }

    const duration = end.getTime() - start.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0 && minutes === 0) {
      return '0m';
    }
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
    return `${minutes}m`;
  } catch {
    return 'Invalid duration';
  }
}

function formatExerciseCount(count: number): string {
  if (count === 0) return 'No exercises';
  if (count === 1) return '1 exercise';
  return `${count} exercises`;
}

export const WorkoutSessionCard = React.memo<WorkoutSessionCardProps>(({
  session,
  onView,
  onEdit,
  onDelete,
  variant = 'default',
  className
}) => {
  const isActive = !session.endTime;
  const sessionName = session.name || `Workout on ${formatDate(session.startTime)}`;
  const exerciseCount = session.exercises.length;
  const duration = formatDuration(session.startTime, session.endTime);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onView(session.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onView(session.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(session.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(session.id);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    onView(session.id);
  };

  return (
    <Card
      data-testid="workout-session-card"
      role="button"
      tabIndex={0}
      clickable
      className={cn(
        "w-full transition-all duration-200",
        "hover:shadow-md hover:scale-[1.02]",
        "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "touch-manipulation",
        className
      )}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onTouchEnd={handleTouchEnd}
      aria-label={`View ${sessionName} workout details`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">
              {sessionName}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {formatDate(session.startTime)} • {formatExerciseCount(exerciseCount)} • {duration}
            </p>
          </div>
          
          {isActive && (
            <div className="flex items-center ml-2">
              <div 
                data-testid="active-indicator"
                className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"
              />
              <Badge 
                variant="default"
                className="bg-green-600 text-white"
                aria-live="polite"
              >
                Active
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      {variant === 'default' && (
        <CardContent className="pt-0">
          {/* Exercise list preview */}
          {exerciseCount > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {session.exercises.slice(0, 3).map((exercise) => (
                  <span
                    key={exercise.id}
                    className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded"
                  >
                    {exercise.name}
                  </span>
                ))}
                {exerciseCount > 3 && (
                  <span className="text-xs text-gray-400 px-2 py-1">
                    +{exerciseCount - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Session notes */}
          {session.notes && (
            <p className="text-sm text-gray-300 mb-3 line-clamp-2">
              {session.notes}
            </p>
          )}

          {/* Action buttons */}
          {(onEdit || onDelete) && (
            <div className="flex gap-2 justify-end">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  aria-label="Edit workout"
                  className="min-h-[44px] min-w-[44px] text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  aria-label="Delete workout"
                  className="min-h-[44px] min-w-[44px] text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
});

WorkoutSessionCard.displayName = 'WorkoutSessionCard';