'use client';

/**
 * QuickSetDialog Component
 * Dialog for quickly entering set data (reps and weight)
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QuickSetDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reps: number, weight?: number) => void;
}

export function QuickSetDialog({
  open,
  onClose,
  onConfirm,
}: QuickSetDialogProps) {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState<{ reps?: string; weight?: string }>({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setReps('');
      setWeight('');
      setErrors({});
    }
  }, [open]);

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
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-black border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle>Agregar Serie</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Ingresa las repeticiones y peso (opcional)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Reps Input */}
          <div>
            <label
              htmlFor="reps-input"
              className="block text-sm font-medium text-neutral-300 mb-2"
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
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
              autoFocus
            />
            {errors.reps && (
              <p className="text-red-400 text-sm mt-1">{errors.reps}</p>
            )}
          </div>

          {/* Weight Input */}
          <div>
            <label
              htmlFor="weight-input"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Peso (kg)
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
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
            />
            {errors.weight && (
              <p className="text-red-400 text-sm mt-1">{errors.weight}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-white hover:bg-neutral-200 text-black"
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default QuickSetDialog;
