'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onAction?: (action: string) => void;
  className?: string;
  version?: string;
}

const navItems = [
  { href: '/', icon: Home, label: 'Inicio' },
  { href: '/workout/new', icon: Plus, label: 'Nuevo' },
  { href: '/history', icon: Clock, label: 'Historial' },
];

export function Footer({ className = '', version }: FooterProps) {
  const pathname = usePathname();
  const versionLabel = version || process.env.NEXT_PUBLIC_APP_VERSION || '0.1.13';

  // Don't show footer on active workout page
  if (pathname === '/workout/active') {
    return null;
  }

  return (
    <footer 
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-background/80 backdrop-blur-xl border-t border-border',
        'safe-area-inset-bottom',
        className
      )}
      data-testid="app-footer"
    >
      <nav className="flex justify-around items-center max-w-md mx-auto px-6 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200',
                'touch-manipulation',
                isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground/80'
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <div className={cn(
                'flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200',
                isActive && 'bg-secondary'
              )}>
                <Icon className={cn(
                  'h-5 w-5 transition-transform',
                  isActive && 'scale-110'
                )} />
              </div>
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="text-center pb-2">
        <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/50">
          v{versionLabel}
        </span>
      </div>
    </footer>
  );
}

export default Footer;
