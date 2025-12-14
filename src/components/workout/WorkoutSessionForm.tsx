/**
 * WorkoutSessionForm Component
 * Form for creating and editing workout sessions
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { WorkoutSession } from '@/types/workout';
import { cn } from '@/lib/utils';

interface WorkoutSessionFormProps {
  session?: WorkoutSession;        // Optional for edit mode
  onSave: (session: Partial<WorkoutSession>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

interface WorkoutSessionFormData {
  name: string;
  startTime: string;
  endTime?: string;
  notes?: string;
}

interface FormErrors {
  name?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  general?: string;
}

export const WorkoutSessionForm = React.memo<WorkoutSessionFormProps>(({
  session,
  onSave,
  onCancel,
  isLoading = false,
  className
}) => {
  const [formData, setFormData] = useState<WorkoutSessionFormData>({
    name: session?.name || '',
    startTime: session?.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : '',
    endTime: session?.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '',
    notes: session?.notes || ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Update form when session prop changes
  useEffect(() => {
    if (session) {
      setFormData({
        name: session.name || '',
        startTime: session.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : '',
        endTime: session.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '',
        notes: session.notes || ''
      });
    }
  }, [session]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Workout name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Workout name must be less than 100 characters';
    }

    // Start time validation
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    // End time validation
    if (formData.endTime && formData.startTime) {
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);
      
      if (endTime <= startTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof WorkoutSessionFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof WorkoutSessionFormData) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const sessionData: Partial<WorkoutSession> = {
        name: formData.name.trim(),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
        notes: formData.notes?.trim() || undefined
      };

      await onSave(sessionData);
    } catch {
      setErrors({ general: 'Failed to save workout session. Please try again.' });
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const calculateDuration = (): string => {
    if (!formData.startTime || !formData.endTime) return '';
    
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const duration = end.getTime() - start.getTime();
    
    if (duration <= 0) return '';
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const isEdit = !!session;
  const duration = calculateDuration();

  return (
    <Card className={cn("w-full bg-black border-neutral-800", className)}>
      <CardHeader>
        <CardTitle className="text-lg text-white">
          {isEdit ? 'Edit Workout Session' : 'New Workout Session'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div 
              className="p-3 bg-red-900/20 border border-red-600 rounded-lg text-red-300 text-sm"
              role="alert"
            >
              {errors.general}
            </div>
          )}

          {/* Workout Name */}
          <div className="space-y-2">
            <label 
              htmlFor="workout-name" 
              className="text-sm font-medium text-neutral-300"
            >
              Workout Name *
            </label>
            <Input
              id="workout-name"
              type="text"
              value={formData.name}
              onChange={handleInputChange('name')}
              onBlur={handleBlur('name')}
              placeholder="e.g., Morning Chest Workout"
              className="bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500"
              maxLength={100}
              disabled={isLoading}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {touched.name && errors.name && (
              <p id="name-error" className="text-red-400 text-sm" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <label 
              htmlFor="start-time" 
              className="text-sm font-medium text-neutral-300"
            >
              Start Time *
            </label>
            <Input
              id="start-time"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleInputChange('startTime')}
              onBlur={handleBlur('startTime')}
              className="bg-neutral-900 border-neutral-700 text-white"
              disabled={isLoading}
              aria-invalid={!!errors.startTime}
              aria-describedby={errors.startTime ? "start-time-error" : undefined}
            />
            {touched.startTime && errors.startTime && (
              <p id="start-time-error" className="text-red-400 text-sm" role="alert">
                {errors.startTime}
              </p>
            )}
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <label 
              htmlFor="end-time" 
              className="text-sm font-medium text-neutral-300"
            >
              End Time
              {duration && (
                <span className="ml-2 text-neutral-400 text-xs">
                  Duration: {duration}
                </span>
              )}
            </label>
            <Input
              id="end-time"
              type="datetime-local"
              value={formData.endTime}
              onChange={handleInputChange('endTime')}
              onBlur={handleBlur('endTime')}
              className="bg-neutral-900 border-neutral-700 text-white"
              disabled={isLoading}
              aria-invalid={!!errors.endTime}
              aria-describedby={errors.endTime ? "end-time-error" : undefined}
            />
            {touched.endTime && errors.endTime && (
              <p id="end-time-error" className="text-red-400 text-sm" role="alert">
                {errors.endTime}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label 
              htmlFor="notes" 
              className="text-sm font-medium text-neutral-300"
            >
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={handleInputChange('notes')}
              onBlur={handleBlur('notes')}
              placeholder="Optional notes about this workout session..."
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent resize-none"
              disabled={isLoading}
              maxLength={500}
            />
            <div className="text-xs text-neutral-500 text-right">
              {formData.notes?.length || 0}/500
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 bg-white hover:bg-neutral-200 text-black disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEdit ? 'Update Session' : 'Create Session'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 h-12 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

WorkoutSessionForm.displayName = 'WorkoutSessionForm';