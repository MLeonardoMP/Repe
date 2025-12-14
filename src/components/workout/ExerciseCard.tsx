/**
 * ExerciseCard Component
 * Displays exercise with sets management
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Exercise } from '@/types';
import { calculateExerciseStats } from '@/types/exercise';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: Exercise;
  onAddSet: (exerciseId: string) => void;
  onEditSet: (setId: string) => void;
  onDeleteSet: (setId: string) => void;
  onEditExercise: (exerciseId: string) => void;
  isActive?: boolean;
  className?: string;
}

interface SetItemProps {
  set: Exercise['sets'][0];
  index: number;
  onEdit: (setId: string) => void;
  onDelete: (setId: string) => void;
}

type LegacySet = { repetitions?: number };

const SetItem = React.memo<SetItemProps>(({ set, index, onEdit, onDelete }) => {
  const [isSwipeActive, setIsSwipeActive] = React.useState(false);

  const handleSetClick = () => {
    onEdit(set.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(set.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit(set.id);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    
    const startX = touch.clientX;
    let moved = false;
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      const moveTouch = moveEvent.touches[0];
      if (!moveTouch) return;
      
      const currentX = moveTouch.clientX;
      const diff = startX - currentX;
      
      if (diff > 50 && !moved) { // Swipe left threshold
        moved = true;
        setIsSwipeActive(true);
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  // Handle invalid data gracefully
  // Support both 'reps' (localStorage) and 'repetitions' (API) field names
  const reps = typeof set.repetitions === 'number'
    ? set.repetitions
    : typeof (set as LegacySet).repetitions === 'number'
      ? (set as LegacySet).repetitions || 0
      : 0;
  const weight = set.weight;
  const intensity = set.intensity;

  if (reps < 0 || (weight !== undefined && weight < 0)) {
    return (
      <li className="p-3 bg-red-900/20 border border-red-500 rounded-lg">
        <span className="text-red-400 text-sm">Invalid set data</span>
      </li>
    );
  }

  return (
    <li
      data-testid={`set-${set.id}`}
      className={cn(
        "group relative p-3 bg-neutral-900 border border-neutral-800 rounded-lg",
        "cursor-pointer hover:bg-neutral-800 hover:border-neutral-700",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-white",
        set.isCompleted ? "border-white" : "border-neutral-800",
        isSwipeActive && "swipe-left-active"
      )}
      role="listitem"
      tabIndex={0}
      onClick={handleSetClick}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      aria-label={set.isCompleted ? "Completed set" : "Incomplete set"}
    >
      <div 
        data-testid={`set-${set.id}-${set.isCompleted ? 'completed' : 'incomplete'}`}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-neutral-400">
            Set {index + 1}
          </span>
          <div className="flex items-center space-x-2 text-sm text-neutral-200">
            <span>{reps} reps</span>
            {weight !== undefined && (
              <>
                <span className="text-neutral-500">•</span>
                <span>{weight} kg</span>
              </>
            )}
            {intensity !== undefined && (
              <>
                <span className="text-neutral-500">•</span>
                <span>RPE {intensity}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {set.isCompleted && (
            <div className="w-2 h-2 bg-white rounded-full" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            aria-label={`Delete set ${index + 1}`}
            className="min-h-[44px] min-w-[44px] opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Swipe indicator for mobile */}
      <div className="swipe-left-indicator absolute inset-y-0 right-0 w-0 bg-red-600 transition-all duration-300 rounded-r-lg" />
    </li>
  );
});

SetItem.displayName = 'SetItem';

export const ExerciseCard = React.memo<ExerciseCardProps>(({
  exercise,
  onAddSet,
  onEditSet,
  onDeleteSet,
  onEditExercise,
  isActive = false,
  className
}) => {
  const stats = calculateExerciseStats(exercise);
  const completedSets = exercise.sets.filter(set => set.isCompleted);

  const handleExerciseHeaderClick = () => {
    onEditExercise(exercise.id);
  };

  const handleAddSetClick = () => {
    onAddSet(exercise.id);
  };

  return (
    <Card
      className={cn(
        "w-full border-neutral-800 bg-black",
        isActive && "ring-2 ring-white ring-offset-2 ring-offset-black",
        className
      )}
      role="region"
      aria-label={`${exercise.name} exercise`}
    >
      <CardHeader className="pb-3">
        <div
          data-testid="exercise-header"
          className="cursor-pointer hover:bg-neutral-900 -m-3 p-3 rounded-lg transition-colors duration-200"
          onClick={handleExerciseHeaderClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onEditExercise(exercise.id);
            }
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">
                {exercise.name}
              </h3>
              {exercise.category && (
                <p className="text-sm text-neutral-400 mt-1">
                  {exercise.category}
                </p>
              )}
              {exercise.notes && (
                <p className="text-sm text-neutral-300 mt-2">
                  {exercise.notes}
                </p>
              )}
            </div>

            {isActive && (
              <div className="flex items-center ml-3">
                <div 
                  data-testid="active-exercise-indicator"
                  className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"
                />
                <Badge variant="default" className="bg-white text-black text-xs">
                  Currently active
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Exercise Statistics */}
        {completedSets.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs text-neutral-400 bg-neutral-900 p-3 rounded-lg">
            <span>Total: {stats.totalReps || 0} reps</span>
            {stats.personalBest?.maxWeight && (
              <span>Max: {stats.personalBest.maxWeight} kg</span>
            )}
            {stats.averageIntensity && (
              <span>Avg RPE: {stats.averageIntensity.toFixed(1)}</span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Sets List */}
        {exercise.sets.length > 0 ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-neutral-300">
                {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
              </h4>
            </div>
            <ul className="space-y-2" role="list">
              {exercise.sets
                .sort((a, b) => a.order - b.order)
                .map((set, index) => (
                <SetItem
                  key={set.id}
                  set={set}
                  index={index}
                  onEdit={onEditSet}
                  onDelete={onDeleteSet}
                />
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-6 text-neutral-400">
            <p className="text-sm">No sets yet</p>
            <p className="text-xs text-neutral-500 mt-1">Add your first set to get started</p>
          </div>
        )}

        {/* Add Set Button */}
        <Button
          onClick={handleAddSetClick}
          variant="outline"
          size="default"
          className="w-full min-h-[44px] border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800 text-neutral-300 hover:text-white"
          role="button"
          aria-label={`Add set to ${exercise.name}`}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Set
        </Button>
      </CardContent>
    </Card>
  );
});

ExerciseCard.displayName = 'ExerciseCard';