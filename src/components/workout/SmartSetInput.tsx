'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { Minus, Plus, Check, X } from 'lucide-react';

interface SmartSetInputProps {
  initialReps?: number;
  initialWeight?: number;
  onConfirm: (reps: number, weight?: number) => void;
  onCancel: () => void;
}

export function SmartSetInput({
  initialReps = 10,
  initialWeight = 0,
  onConfirm,
  onCancel,
}: SmartSetInputProps) {
  const [reps, setReps] = useState(initialReps);
  const [weight, setWeight] = useState(initialWeight);
  const [editingField, setEditingField] = useState<'reps' | 'weight' | null>(null);

  const repsInputRef = useRef<HTMLInputElement | null>(null);
  const weightInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setReps(initialReps);
  }, [initialReps]);

  useEffect(() => {
    setWeight(initialWeight);
  }, [initialWeight]);

  const REPS_STEP = 1;
  const WEIGHT_STEP = 2.5;

  const handleIncrement = (type: 'reps' | 'weight', direction: 1 | -1) => {
    if (type === 'reps') {
      setReps((prev) => Math.max(0, prev + REPS_STEP * direction));
    } else {
      setWeight((prev) => Math.max(0, prev + WEIGHT_STEP * direction));
    }
  };

  const handleConfirm = () => {
    onConfirm(reps, weight);
  };

  return (
    <div className="relative p-3 bg-black border border-neutral-800 rounded-xl space-y-4 shadow-lg">
      <button
        onClick={onCancel}
        className="absolute top-2 right-2 p-2 text-neutral-500 hover:text-white transition-colors"
        aria-label="Close set input"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center justify-between gap-2 pr-8">
        <div className="text-xs uppercase tracking-[0.08em] text-neutral-500">Registrar set</div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleIncrement('reps', -1)}
            className="w-12 h-12 border-neutral-800 text-white"
            aria-label="Decrease reps"
          >
            <Minus className="w-5 h-5" />
          </Button>
          <div
            className="flex-1 text-center"
            data-testid="reps-display"
            onClick={() => {
              setEditingField('reps');
              requestAnimationFrame(() => {
                repsInputRef.current?.focus();
                repsInputRef.current?.select();
              });
            }}
          >
            {editingField === 'reps' ? (
              <input
                ref={repsInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
                aria-label="Reps input"
                value={String(reps)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) setReps(val);
                  else if (e.target.value === '') setReps(0);
                }}
                onFocus={(e) => e.target.select()}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setEditingField(null);
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setEditingField(null);
                  }
                }}
                className="w-full min-h-12 bg-transparent text-4xl font-bold text-white text-center border border-neutral-800 rounded-md outline-none ring-0 p-1 cursor-text touch-manipulation caret-white"
                autoFocus
              />
            ) : (
              <div className="text-4xl font-bold text-white leading-none" aria-label="Reps value">
                {reps}
              </div>
            )}
            <div className="text-[11px] uppercase tracking-widest text-neutral-500 mt-1">Reps</div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleIncrement('reps', 1)}
            className="w-12 h-12 border-neutral-800 text-white"
            aria-label="Increase reps"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleIncrement('weight', -1)}
            className="w-12 h-12 border-neutral-800 text-white"
            aria-label="Decrease weight"
          >
            <Minus className="w-5 h-5" />
          </Button>
          <div
            className="flex-1 text-center"
            data-testid="weight-display"
            onClick={() => {
              setEditingField('weight');
              requestAnimationFrame(() => {
                weightInputRef.current?.focus();
                weightInputRef.current?.select();
              });
            }}
          >
            {editingField === 'weight' ? (
              <input
                ref={weightInputRef}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
                aria-label="Weight input"
                value={String(weight)}
                onChange={(e) => {
                  const normalized = e.target.value.replace(',', '.');
                  const val = parseFloat(normalized);
                  if (!isNaN(val) && val >= 0) setWeight(val);
                  else if (e.target.value === '') setWeight(0);
                }}
                onFocus={(e) => e.target.select()}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setEditingField(null);
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setEditingField(null);
                  }
                }}
                className="w-full min-h-12 bg-transparent text-4xl font-bold text-white text-center border border-neutral-800 rounded-md outline-none ring-0 p-1 cursor-text touch-manipulation caret-white"
                autoFocus
              />
            ) : (
              <div className="text-4xl font-bold text-white leading-none" aria-label="Weight value">
                {weight}
              </div>
            )}
            <div className="text-[11px] uppercase tracking-widest text-neutral-500 mt-1">
              Kg
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleIncrement('weight', 1)}
            className="w-12 h-12 border-neutral-800 text-white"
            aria-label="Increase weight"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="pt-1 flex items-center gap-2">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-neutral-800 text-neutral-300"
        >
          Cancelar
        </Button>
        <div className="flex-1 h-10">
          <ShimmerButton
            onClick={handleConfirm}
            className="w-full h-full"
            background="black"
            shimmerColor="#ffffff"
          >
            <div className="flex items-center justify-center gap-2 text-white text-sm font-semibold">
              <Check className="w-4 h-4" />
              Guardar set
            </div>
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}
