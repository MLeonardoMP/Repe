'use client';

/**
 * QuickSetForm Component
 * Dynamic inline form for quickly entering set data (reps and weight)
 * Can be used as a modal overlay or inline component
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QuickSetFormProps {
  onConfirm: (reps: number, weight?: number) => void;
  onCancel?: () => void;
  exerciseName?: string;
  autoFocus?: boolean;
}

export function QuickSetForm({
  onConfirm,
  onCancel,
  exerciseName,
  autoFocus = true,
}: QuickSetFormProps) {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState<{ reps?: string; weight?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { reps?: string; weight?: string } = {};

    // Reps is required
    if (!reps.trim()) {
      newErrors.reps = 'Las repeticiones son obligatorias';
      setErrors(newErrors);
      return false;
    }

    const repsValue = parseInt(reps);
    if (isNaN(repsValue) || repsValue <= 0) {
      newErrors.reps = 'Las repeticiones deben ser mayor que 0';
    }

    // Weight is optional, but if provided must be valid
    if (weight.trim()) {
      const weightValue = parseFloat(weight);
      if (isNaN(weightValue) || weightValue <= 0) {
        newErrors.weight = 'El peso debe ser mayor que 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) {
      return;
    }

    const repsValue = parseInt(reps);
    const weightValue = weight.trim() ? parseFloat(weight) : undefined;

    onConfirm(repsValue, weightValue);
    // Reset form after confirm
    setReps('');
    setWeight('');
    setErrors({});
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  const handleCancel = () => {
    setReps('');
    setWeight('');
    setErrors({});
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-4">
      {/* Header */}
      {exerciseName && (
        <div className="pb-2 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-300">
            Agregar Serie a <span className="text-blue-400">{exerciseName}</span>
          </h3>
        </div>
      )}

      {/* Reps Input */}
      <div>
        <label
          htmlFor="reps-input"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Repeticiones *
        </label>
        <Input
          id="reps-input"
          type="number"
          min="1"
          value={reps}
          onChange={(e) => {
            setReps(e.target.value);
            if (errors.reps) {
              setErrors((prev) => ({ ...prev, reps: undefined }));
            }
          }}
          onKeyPress={handleKeyPress}
          placeholder="Ej: 10"
          className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500"
          autoFocus={autoFocus}
        />
        {errors.reps && (
          <p className="text-red-400 text-sm mt-1">{errors.reps}</p>
        )}
      </div>

      {/* Weight Input */}
      <div>
        <label
          htmlFor="weight-input"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Peso (kg) - Opcional
        </label>
        <Input
          id="weight-input"
          type="number"
          min="0"
          step="0.5"
          value={weight}
          onChange={(e) => {
            setWeight(e.target.value);
            if (errors.weight) {
              setErrors((prev) => ({ ...prev, weight: undefined }));
            }
          }}
          onKeyPress={handleKeyPress}
          placeholder="Ej: 80"
          className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500"
        />
        {errors.weight && (
          <p className="text-red-400 text-sm mt-1">{errors.weight}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleConfirm}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Agregar
        </Button>
        {onCancel && (
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}

export default QuickSetForm;
