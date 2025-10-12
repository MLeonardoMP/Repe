'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onAction?: (action: string) => void;
  className?: string;
}

export function Footer({ onNavigate, onAction, className = '' }: FooterProps) {
  const handleNavigation = (path: string) => {
    onNavigate?.(path);
  };

  const handleAction = (action: string) => {
    onAction?.(action);
  };

  return (
    <footer 
      className={`fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 ${className}`}
      data-testid="app-footer"
    >
      <nav className="flex justify-around items-center max-w-md mx-auto">
        <Button
          variant="ghost"
          onClick={() => handleNavigation('/')}
          className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white"
          data-testid="nav-home"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Home</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => handleNavigation('/workout/new')}
          className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white"
          data-testid="nav-new-workout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs">New</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => handleNavigation('/history')}
          className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white"
          data-testid="nav-history"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs">History</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => handleAction('settings')}
          className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white"
          data-testid="nav-settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs">Settings</span>
        </Button>
      </nav>
    </footer>
  );
}

export default Footer;