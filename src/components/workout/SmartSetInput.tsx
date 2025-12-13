'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { Minus, Plus, Check, X, Delete } from 'lucide-react';

interface SmartSetInputProps {
  initialReps?: number;
  initialWeight?: number;
  onConfirm: (reps: number, weight: number) => void;
  onCancel: () => void;
}

type InputMode = 'view' | 'edit-reps' | 'edit-weight';

export function SmartSetInput({
  initialReps = 10,
  initialWeight = 0,
  onConfirm,
  onCancel,
}: SmartSetInputProps) {
  const [reps, setReps] = useState(initialReps);
  const [weight, setWeight] = useState(initialWeight);
  const [mode, setMode] = useState<InputMode>('view');
  const [tempValue, setTempValue] = useState('');

  // Reset state when initial values change (if the component is reused)
  useEffect(() => {
    setReps(initialReps);
    setWeight(initialWeight);
  }, [initialReps, initialWeight]);

  const handleIncrement = (type: 'reps' | 'weight', amount: number) => {
    if (type === 'reps') {
      setReps(prev => Math.max(0, prev + amount));
    } else {
      setWeight(prev => Math.max(0, prev + amount));
    }
  };

  const handleOpenKeypad = (type: 'reps' | 'weight') => {
    setMode(type === 'reps' ? 'edit-reps' : 'edit-weight');
    setTempValue(''); // Start fresh or maybe stringify current value? Let's start fresh for speed.
  };

  const handleKeypadInput = (key: string) => {
    if (key === 'backspace') {
      setTempValue(prev => prev.slice(0, -1));
    } else if (key === '.') {
      if (!tempValue.includes('.')) {
        setTempValue(prev => prev + '.');
      }
    } else {
      setTempValue(prev => prev + key);
    }
  };

  const handleKeypadConfirm = () => {
    const val = parseFloat(tempValue);
    if (!isNaN(val)) {
      if (mode === 'edit-reps') {
        setReps(val);
      } else {
        setWeight(val);
      }
    }
    setMode('view');
  };

  const handleSave = () => {
    onConfirm(reps, weight);
  };

  if (mode !== 'view') {
    return (
      <div className="p-4 bg-black border-2 border-dashed border-neutral-800 rounded-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="text-sm text-neutral-400 uppercase tracking-wider mb-1">
            {mode === 'edit-reps' ? 'REPS' : 'WEIGHT (KG)'}
          </div>
          <div className="text-5xl font-bold text-white h-16 flex items-center justify-center">
            {tempValue || <span className="text-neutral-800">0</span>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((num) => (
            <button
              key={num}
              onClick={() => handleKeypadInput(num.toString())}
              className="h-16 bg-black border border-neutral-800 rounded-lg text-2xl font-medium text-white active:bg-neutral-900 transition-colors hover:border-neutral-600"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleKeypadInput('backspace')}
            className="h-16 bg-black border border-neutral-800 rounded-lg flex items-center justify-center text-white active:bg-neutral-900 transition-colors hover:border-neutral-600"
            aria-label="Backspace"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={() => setMode('view')}
            variant="outline" 
            className="flex-1 h-14 border-neutral-800 text-neutral-400 bg-black hover:bg-neutral-900 hover:text-white"
          >
            Cancel
          </Button>
          <div className="flex-1 h-14">
            <ShimmerButton 
              onClick={handleKeypadConfirm}
              className="w-full h-full"
              background="black"
              shimmerColor="#ffffff"
            >
              <span className="text-lg font-bold">OK</span>
            </ShimmerButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-4 bg-black border-2 border-dashed border-neutral-800 rounded-xl space-y-6 animate-in slide-in-from-top-2 duration-200">
      {/* Close Button (Top Right) */}
      <button
        onClick={onCancel}
        className="absolute top-0 right-0 m-1 p-3 text-neutral-500 hover:text-white transition-colors z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Reps Control */}
      <div className="flex items-center justify-between gap-4 pt-8">
        <button
          onClick={() => handleIncrement('reps', -1)}
          className="w-16 h-16 rounded-full bg-black border border-neutral-800 flex items-center justify-center text-white active:scale-95 transition-transform hover:border-neutral-600"
          aria-label="Decrease reps"
        >
          <Minus className="w-8 h-8" />
        </button>
        
        <div 
          onClick={() => handleOpenKeypad('reps')}
          className="flex-1 flex flex-col items-center justify-center cursor-pointer py-2 active:opacity-70 group"
        >
          <span className="text-5xl font-bold text-white leading-none group-hover:scale-110 transition-transform">{reps}</span>
          <span className="text-xs text-neutral-500 font-medium tracking-widest mt-1 group-hover:text-white transition-colors">REPS</span>
        </div>

        <button
          onClick={() => handleIncrement('reps', 1)}
          className="w-16 h-16 rounded-full bg-black border border-neutral-800 flex items-center justify-center text-white active:scale-95 transition-transform hover:border-neutral-600"
          aria-label="Increase reps"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Weight Control */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => handleIncrement('weight', -2.5)}
          className="w-16 h-16 rounded-full bg-black border border-neutral-800 flex items-center justify-center text-white active:scale-95 transition-transform hover:border-neutral-600"
          aria-label="Decrease weight"
        >
          <Minus className="w-8 h-8" />
        </button>
        
        <div 
          onClick={() => handleOpenKeypad('weight')}
          className="flex-1 flex flex-col items-center justify-center cursor-pointer py-2 active:opacity-70 group"
        >
          <span className="text-5xl font-bold text-white leading-none group-hover:scale-110 transition-transform">{weight}</span>
          <span className="text-xs text-neutral-500 font-medium tracking-widest mt-1 group-hover:text-white transition-colors">KG</span>
        </div>

        <button
          onClick={() => handleIncrement('weight', 2.5)}
          className="w-16 h-16 rounded-full bg-black border border-neutral-800 flex items-center justify-center text-white active:scale-95 transition-transform hover:border-neutral-600"
          aria-label="Increase weight"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Actions */}
      <div className="pt-2">
        <div className="h-12 w-full max-w-[200px] mx-auto">
          <ShimmerButton
            onClick={handleSave}
            className="w-full h-full text-white dark:text-white"
            background="black"
            shimmerColor="#ffffff"
          >
            <span className="flex items-center gap-2 text-base font-bold text-white">
              <Check className="w-5 h-5" />
              Save Set
            </span>
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}
