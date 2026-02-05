'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Minus, Plus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="relative rounded-2xl border border-border bg-card p-4 space-y-4 shadow-lg">
      {/* Close button */}
      <button
        onClick={onCancel}
        className="absolute top-3 right-3 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="pr-10">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Registrar serie</p>
      </div>

      {/* Input Controls */}
      <div className="flex flex-col gap-4">
        {/* Reps Row */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => handleIncrement('reps', -1)}
            className={cn(
              "flex items-center justify-center h-12 w-12 rounded-xl",
              "border border-border bg-secondary text-foreground",
              "transition-all duration-200 hover:bg-accent hover:border-accent hover:text-accent-foreground",
              "active:scale-95"
            )}
            aria-label="Disminuir repeticiones"
          >
            <Minus className="w-5 h-5" />
          </button>
          
          <div
            className="flex-1 text-center cursor-pointer"
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
                aria-label="Entrada de repeticiones"
                value={String(reps)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) setReps(val);
                  else if (e.target.value === '') setReps(0);
                }}
                onFocus={(e) => e.target.select()}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Escape') {
                    e.preventDefault();
                    setEditingField(null);
                  }
                }}
                className={cn(
                  "w-full h-14 bg-transparent text-4xl font-bold text-foreground text-center",
                  "border border-accent rounded-xl outline-none",
                  "touch-manipulation caret-accent"
                )}
                autoFocus
              />
            ) : (
              <div className="py-2">
                <div className="text-4xl font-bold text-foreground number-display" aria-label="Valor de repeticiones">
                  {reps}
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Reps</div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => handleIncrement('reps', 1)}
            className={cn(
              "flex items-center justify-center h-12 w-12 rounded-xl",
              "border border-border bg-secondary text-foreground",
              "transition-all duration-200 hover:bg-accent hover:border-accent hover:text-accent-foreground",
              "active:scale-95"
            )}
            aria-label="Aumentar repeticiones"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Weight Row */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => handleIncrement('weight', -1)}
            className={cn(
              "flex items-center justify-center h-12 w-12 rounded-xl",
              "border border-border bg-secondary text-foreground",
              "transition-all duration-200 hover:bg-accent hover:border-accent hover:text-accent-foreground",
              "active:scale-95"
            )}
            aria-label="Disminuir peso"
          >
            <Minus className="w-5 h-5" />
          </button>
          
          <div
            className="flex-1 text-center cursor-pointer"
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
                aria-label="Entrada de peso"
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
                  if (e.key === 'Enter' || e.key === 'Escape') {
                    e.preventDefault();
                    setEditingField(null);
                  }
                }}
                className={cn(
                  "w-full h-14 bg-transparent text-4xl font-bold text-foreground text-center",
                  "border border-accent rounded-xl outline-none",
                  "touch-manipulation caret-accent"
                )}
                autoFocus
              />
            ) : (
              <div className="py-2">
                <div className="text-4xl font-bold text-foreground number-display" aria-label="Valor de peso">
                  {weight}
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Kg</div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => handleIncrement('weight', 1)}
            className={cn(
              "flex items-center justify-center h-12 w-12 rounded-xl",
              "border border-border bg-secondary text-foreground",
              "transition-all duration-200 hover:bg-accent hover:border-accent hover:text-accent-foreground",
              "active:scale-95"
            )}
            aria-label="Aumentar peso"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onCancel}
          className={cn(
            "flex-1 h-11 rounded-xl",
            "border border-border bg-card text-foreground font-medium",
            "transition-all duration-200 hover:bg-secondary"
          )}
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          className={cn(
            "flex-1 h-11 rounded-xl",
            "bg-foreground text-background font-medium",
            "transition-all duration-200 hover:bg-foreground/90",
            "flex items-center justify-center gap-2"
          )}
        >
          <Check className="w-4 h-4" />
          Guardar
        </button>
      </div>
    </div>
  );
}
