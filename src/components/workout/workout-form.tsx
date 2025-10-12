'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkoutSession } from '@/types';

interface WorkoutFormProps {
  workout?: WorkoutSession;
  onSubmit: (workoutData: Partial<WorkoutSession>) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export function WorkoutForm({ 
  workout, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  className = '' 
}: WorkoutFormProps) {
  const [formData, setFormData] = useState({
    name: workout?.name || '',
    notes: workout?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Workout name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const workoutData: Partial<WorkoutSession> = {
      name: formData.name.trim(),
      notes: formData.notes.trim() || undefined,
    };

    onSubmit(workoutData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`} data-testid="workout-form">
      <CardHeader>
        <CardTitle className="text-white">
          {workout ? 'Edit Workout' : 'New Workout'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="workout-name"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Workout Name *
            </label>
            <Input
              id="workout-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter workout name"
              className="bg-gray-900 border-gray-600 text-white"
              data-testid="workout-name-input"
              autoComplete="off"
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1" data-testid="name-error">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label 
              htmlFor="workout-notes"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Notes (optional)
            </label>
            <Input
              id="workout-notes"
              type="text"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add workout notes"
              className="bg-gray-900 border-gray-600 text-white"
              data-testid="workout-notes-input"
              autoComplete="off"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              data-testid="submit-button"
            >
              {isSubmitting ? 'Saving...' : (workout ? 'Update Workout' : 'Create Workout')}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default WorkoutForm;