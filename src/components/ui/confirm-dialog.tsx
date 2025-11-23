'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  className = '',
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      data-testid="confirm-dialog"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        data-testid="dialog-backdrop"
      />
      
      {/* Dialog */}
      <div 
        className={`relative bg-black border border-neutral-800 rounded-lg p-6 max-w-md mx-4 w-full ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <h2 
          id="dialog-title"
          className="text-lg font-semibold text-white mb-2"
          data-testid="dialog-title"
        >
          {title}
        </h2>
        
        <p 
          id="dialog-description"
          className="text-neutral-400 mb-6"
          data-testid="dialog-description"
        >
          {description}
        </p>
        
        <div className="flex space-x-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white"
            data-testid="cancel-button"
          >
            {cancelText}
          </Button>
          
          <Button
            onClick={onConfirm}
            className="bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50"
            data-testid="confirm-button"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;