'use client';

/**
 * ExercisePickerComponent
 * Dynamic inline component for selecting exercises from the library or entering a custom name
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ExercisePickerComponentProps {
  onClose: () => void;
  onSelect: (name: string) => void;
}

interface ExerciseItem {
  id?: string;
  name: string;
  category?: string;
  equipment?: string[] | string;
}

export function ExercisePickerComponent({
  onClose,
  onSelect,
}: ExercisePickerComponentProps) {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customName, setCustomName] = useState('');

  // Load exercises on mount
  useEffect(() => {
    loadExercises();
    setSearchQuery('');
    setCustomName('');
  }, []);

  const loadExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/exercise-library');
      const data = await response.json();

      if (data.success) {
        setExercises(data.data);
      } else {
        setError(data.error?.message || 'Failed to load exercises');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load exercise library';
      setError(message);
      console.error('Error loading exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter exercises based on search query (case-insensitive)
  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) {
      return exercises.slice(0, 50); // Limit to 50 for performance
    }

    const query = searchQuery.toLowerCase();
    const filtered = exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(query)
    );

    return filtered.slice(0, 50); // Limit to 50 visible items
  }, [exercises, searchQuery]);

  const handleExerciseSelect = (exerciseName: string) => {
    onSelect(exerciseName);
    onClose();
  };

  const handleCustomNameSubmit = () => {
    if (customName.trim()) {
      onSelect(customName.trim());
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customName.trim()) {
      handleCustomNameSubmit();
    }
  };

  return (
    <div className="p-4 bg-black border border-neutral-800 rounded-lg space-y-4">
      {/* Header */}
      <div className="pb-2 border-b border-neutral-800">
        <h3 className="text-sm font-medium text-neutral-300 mb-1">
          Select Exercise
        </h3>
        <p className="text-xs text-neutral-400">
          Search for an exercise in the library or enter a custom name
        </p>
      </div>

      {/* Search Input */}
      <div>
        <Input
          type="text"
          placeholder="Search exercise..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
          autoFocus
        />
      </div>

      {/* Exercise List */}
      {loading ? (
        <div className="text-center py-8 text-neutral-400">
          Loading exercises...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">
          {error}
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto space-y-2 border border-neutral-800 rounded-md p-2">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-4 text-neutral-400">
              No exercises found
            </div>
          ) : (
            filteredExercises.map((exercise) => (
              <button
                key={exercise.id || exercise.name}
                onClick={() => handleExerciseSelect(exercise.name)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-900 transition-colors"
                aria-label={`Select ${exercise.name}`}
              >
                <div className="font-medium text-white">{exercise.name}</div>
                {exercise.category && (
                  <div className="text-sm text-neutral-400">
                    {exercise.category}
                    {exercise.equipment &&
                      ` ${
                        Array.isArray(exercise.equipment)
                          ? exercise.equipment.join(', ')
                          : exercise.equipment
                      }`}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Custom Name Input */}
      <div className="pt-4 border-t border-neutral-800">
        <label
          htmlFor="custom-exercise-name"
          className="block text-sm font-medium text-neutral-300 mb-2"
        >
          Or enter a custom name:
        </label>
        <div className="flex space-x-2">
          <Input
            id="custom-exercise-name"
            type="text"
            placeholder="Custom exercise name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
          />
          <Button
            onClick={handleCustomNameSubmit}
            disabled={!customName.trim()}
            className="bg-white hover:bg-neutral-200 text-black"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// Keep the Dialog version for backward compatibility (for non-dynamic usage)
export function ExercisePickerDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (name: string) => void;
}) {
  if (!open) return null;
  
  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-black border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle>Select Exercise</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Search for an exercise in the library or enter a custom name
          </DialogDescription>
        </DialogHeader>
        <ExercisePickerComponent onClose={onClose} onSelect={onSelect} />
      </DialogContent>
    </Dialog>
  );
}

export default ExercisePickerComponent;
