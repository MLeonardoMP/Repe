'use client';

import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function Loading({ size = 'md', text = 'Loading...', className = '' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center space-y-2 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div 
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
        data-testid="loading-spinner"
      />
      {text && (
        <span 
          className="text-gray-400 text-sm"
          data-testid="loading-text"
        >
          {text}
        </span>
      )}
    </div>
  );
}

export default Loading;