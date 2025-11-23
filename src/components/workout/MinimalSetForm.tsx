'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Set } from '@/types';

interface MinimalSetFormProps {
  onSave: (setData: Partial<Set>) => void;
  onCancel?: () => void;
  initialData?: Partial<Set>;
  isSubmitting?: boolean;
}

export function MinimalSetForm({ 
  onSave, 
  onCancel, 
  initialData = {},
  isSubmitting = false 
}: MinimalSetFormProps) {
  const [formData, setFormData] = useState({
    weight: initialData.weight?.toString() || '',
    repetitions: initialData.repetitions?.toString() || '',
    intensity: initialData.intensity?.toString() || '',
    notes: initialData.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.weight && parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Weight must be positive';
    }

    if (formData.repetitions && parseInt(formData.repetitions) <= 0) {
      newErrors.repetitions = 'Repetitions must be positive';
    }

    if (formData.intensity && (parseFloat(formData.intensity) < 1 || parseFloat(formData.intensity) > 10)) {
      newErrors.intensity = 'Intensity must be between 1 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const setData: Partial<Set> = {
      ...(formData.weight && { weight: parseFloat(formData.weight) }),
      ...(formData.repetitions && { repetitions: parseInt(formData.repetitions) }),
      ...(formData.intensity && { intensity: parseFloat(formData.intensity) }),
      ...(formData.notes && { notes: formData.notes }),
    };

    onSave(setData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="p-4 bg-black rounded-lg border border-neutral-800">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="weight-input" className="block text-sm font-medium text-neutral-300 mb-1">
            Weight (kg)
          </label>
          <Input
            id="weight-input"
            type="number"
            step="0.5"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            placeholder="Enter weight"
            className="bg-neutral-900 border-neutral-700 text-white"
            data-testid="weight-input"
          />
          {errors.weight && (
            <p className="text-red-400 text-xs mt-1" data-testid="weight-error">
              {errors.weight}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="repetitions-input" className="block text-sm font-medium text-neutral-300 mb-1">
            Repetitions
          </label>
          <Input
            id="repetitions-input"
            type="number"
            value={formData.repetitions}
            onChange={(e) => handleInputChange('repetitions', e.target.value)}
            placeholder="Enter repetitions"
            className="bg-neutral-900 border-neutral-700 text-white"
            data-testid="repetitions-input"
          />
          {errors.repetitions && (
            <p className="text-red-400 text-xs mt-1" data-testid="repetitions-error">
              {errors.repetitions}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="intensity-input" className="block text-sm font-medium text-neutral-300 mb-1">
            Intensity (RPE 1-10)
          </label>
          <Input
            id="intensity-input"
            type="number"
            min="1"
            max="10"
            step="0.5"
            value={formData.intensity}
            onChange={(e) => handleInputChange('intensity', e.target.value)}
            placeholder="Enter intensity"
            className="bg-neutral-900 border-neutral-700 text-white"
            data-testid="intensity-input"
          />
          {errors.intensity && (
            <p className="text-red-400 text-xs mt-1" data-testid="intensity-error">
              {errors.intensity}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="notes-input" className="block text-sm font-medium text-neutral-300 mb-1">
            Notes (optional)
          </label>
          <Input
            id="notes-input"
            type="text"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add notes about this set"
            className="bg-neutral-900 border-neutral-700 text-white"
            data-testid="notes-input"
          />
        </div>

        <div className="flex space-x-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-white hover:bg-neutral-200 text-black"
            data-testid="save-button"
          >
            {isSubmitting ? 'Saving...' : 'Save Set'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              data-testid="cancel-button"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default MinimalSetForm;