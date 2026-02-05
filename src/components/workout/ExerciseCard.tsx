/**
 * ExerciseCard Component
 * Displays exercise with sets management - Redesigned with Aceternity UI style
 */

import React from 'react';
import type { Exercise } from '@/types';
import { calculateExerciseStats } from '@/types/exercise';
import { cn } from '@/lib/utils';
import { Plus, X, Check, MoreHorizontal } from 'lucide-react';

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

  const reps = typeof set.repetitions === 'number'
    ? set.repetitions
    : typeof (set as LegacySet).repetitions === 'number'
      ? (set as LegacySet).repetitions || 0
      : 0;
  const weight = set.weight;
  const intensity = set.intensity;

  if (reps < 0 || (weight !== undefined && weight < 0)) {
    return (
      <li className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-sm text-destructive">
        Datos invalidos
      </li>
    );
  }

  return (
    <li
      data-testid={`set-${set.id}`}
      className={cn(
        "group relative flex items-center justify-between p-3 rounded-xl",
        "border border-border bg-card/50",
        "cursor-pointer transition-all duration-200",
        "hover:bg-secondary hover:border-accent/30",
        "focus:outline-none focus:ring-2 focus:ring-accent/50",
        set.isCompleted && "border-accent/50 bg-accent/5"
      )}
      role="listitem"
      tabIndex={0}
      onClick={handleSetClick}
      onKeyDown={handleKeyDown}
      aria-label={set.isCompleted ? "Serie completada" : "Serie pendiente"}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex items-center justify-center h-8 w-8 rounded-lg text-sm font-medium",
          set.isCompleted 
            ? "bg-accent text-accent-foreground" 
            : "bg-secondary text-muted-foreground"
        )}>
          {set.isCompleted ? <Check className="h-4 w-4" /> : index + 1}
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium text-foreground number-display">{reps} <span className="text-muted-foreground font-normal">reps</span></span>
          {weight !== undefined && weight > 0 && (
            <>
              <span className="text-border">·</span>
              <span className="font-medium text-foreground number-display">{weight} <span className="text-muted-foreground font-normal">kg</span></span>
            </>
          )}
          {intensity !== undefined && (
            <>
              <span className="text-border">·</span>
              <span className="text-muted-foreground">RPE {intensity}</span>
            </>
          )}
        </div>
      </div>

      <button
        onClick={handleDeleteClick}
        aria-label={`Eliminar set ${index + 1}`}
        className={cn(
          "flex items-center justify-center h-8 w-8 rounded-lg",
          "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
          "opacity-0 group-hover:opacity-100 transition-all duration-200"
        )}
      >
        <X className="h-4 w-4" />
      </button>
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
    <div
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300",
        "hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5",
        isActive && "ring-2 ring-accent ring-offset-2 ring-offset-background",
        className
      )}
      role="region"
      aria-label={`Ejercicio: ${exercise.name}`}
    >
      {/* Header */}
      <div
        data-testid="exercise-header"
        className="p-4 cursor-pointer transition-colors duration-200 hover:bg-secondary/50"
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
            <h3 className="text-lg font-semibold text-foreground">
              {exercise.name}
            </h3>
            {exercise.category && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {exercise.category}
              </p>
            )}
            {exercise.notes && (
              <p className="text-sm text-muted-foreground/80 mt-2 italic">
                {exercise.notes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isActive && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="text-xs font-medium text-accent">Activo</span>
              </div>
            )}
            <button className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        {completedSets.length > 0 && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{stats.totalReps || 0}</span> reps totales
            </div>
            {stats.personalBest?.maxWeight && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{stats.personalBest.maxWeight}</span> kg max
              </div>
            )}
            {stats.averageIntensity && (
              <div className="text-xs text-muted-foreground">
                RPE <span className="font-medium text-foreground">{stats.averageIntensity.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sets */}
      <div className="px-4 pb-4">
        {exercise.sets.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {exercise.sets.length} {exercise.sets.length === 1 ? 'serie' : 'series'}
              </h4>
              <div className="h-px flex-1 ml-3 bg-gradient-to-r from-border to-transparent" />
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
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Sin series todavia</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Agrega tu primera serie</p>
          </div>
        )}

        {/* Add Set Button */}
        <button
          onClick={handleAddSetClick}
          className={cn(
            "w-full mt-3 h-11 rounded-xl border border-dashed border-border",
            "flex items-center justify-center gap-2",
            "text-sm font-medium text-muted-foreground",
            "transition-all duration-200",
            "hover:border-accent/50 hover:text-foreground hover:bg-accent/5"
          )}
          role="button"
          aria-label={`Agregar serie a ${exercise.name}`}
        >
          <Plus className="h-4 w-4" />
          Agregar serie
        </button>
      </div>
    </div>
  );
});

ExerciseCard.displayName = 'ExerciseCard';
