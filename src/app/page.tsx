'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Components ---

const GridLine = ({
  direction,
  className,
  delay = 0,
}: {
  direction: 'horizontal' | 'vertical';
  className?: string;
  delay?: number;
}) => {
  const isHorizontal = direction === 'horizontal';

  return (
    <motion.div
      initial={isHorizontal ? { width: 0 } : { height: 0 }}
      animate={isHorizontal ? { width: '100%' } : { height: '100%' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
      className={cn(
        'absolute overflow-hidden',
        isHorizontal ? 'h-[1px] left-0' : 'w-[1px] top-0',
        className
      )}
    >
      <div
        className={cn(
          isHorizontal ? 'dotted-line-h' : 'dotted-line-v',
          'absolute inset-0'
        )}
      />
    </motion.div>
  );
};

const Cross = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay }}
    className={cn('absolute text-neutral-700', className)}
  >
    <Plus className="w-3 h-3" />
  </motion.div>
);

const CornerCircle = ({ className, delay = 0, id }: { className?: string; delay?: number; id: string }) => (
  <div className={cn("absolute pointer-events-none", className)}>
    <svg className="w-[16rem] h-[16rem] -rotate-90" viewBox="0 0 256 256">
      <defs>
        <mask id={id}>
          <motion.circle
            cx="128"
            cy="128"
            r="128"
            fill="none"
            stroke="white"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay, ease: "easeInOut" }}
          />
        </mask>
      </defs>
      <circle
        cx="128"
        cy="128"
        r="127"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="6 6"
        className="text-[#333]"
        mask={`url(#${id})`}
      />
    </svg>
  </div>
);

// --- Main Page ---

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden selection:bg-white/20">
      
      {/* Background Grid (Subtle) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-4xl w-full px-6 md:px-12">
        
        {/* The "Architectural" Box */}
        <div className="relative">
          
          {/* Grid Lines - The Reveal */}
          <GridLine direction="horizontal" className="top-0" delay={0} />
          <GridLine direction="horizontal" className="bottom-0" delay={0} />
          <GridLine direction="vertical" className="left-0" delay={0.4} />
          <GridLine direction="vertical" className="right-0" delay={0.4} />

          {/* Corner Crosses */}
          <Cross className="-top-1.5 -left-1.5" delay={0.8} />
          <Cross className="-top-1.5 -right-1.5" delay={0.8} />
          <Cross className="-bottom-1.5 -left-1.5" delay={0.8} />
          <Cross className="-bottom-1.5 -right-1.5" delay={0.8} />

          {/* Geometric Circles (Next.js Conf Style) */}
          <CornerCircle id="circle-top" className="-top-[8rem] -left-[8rem]" delay={1.6} />
          <CornerCircle id="circle-bottom" className="-bottom-[8rem] -right-[8rem]" delay={1.6} />

          {/* Content Container */}
          <div className="flex flex-col">
            
            {/* Top Section: Title & Subtitle */}
            <div className="py-16 md:py-24 px-8 md:px-16 flex flex-col items-center text-center space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="text-7xl md:text-9xl font-bold tracking-tighter text-white"
              >
                Repe
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                className="text-neutral-400 text-lg md:text-xl max-w-xl font-light leading-relaxed"
              >
                The minimalist strength tracker for serious lifters.
              </motion.p>
            </div>

            {/* Separator Line */}
            <div className="relative w-full h-[1px] overflow-hidden">
               <motion.div
                 initial={{ width: 0 }}
                 animate={{ width: '100%' }}
                 transition={{ duration: 1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
                 className="h-full w-full"
               >
                 <div className="dotted-line-h absolute inset-0" />
               </motion.div>
            </div>

            {/* Bottom Section: Buttons */}
            <div className="relative grid grid-cols-1 md:grid-cols-2">
              
              {/* Vertical Divider (Desktop) */}
              <GridLine direction="vertical" className="left-1/2 hidden md:block" delay={1.5} />
              
              {/* Horizontal Divider (Mobile) */}
              <GridLine direction="horizontal" className="top-1/2 md:hidden" delay={1.5} />

              {/* Button 1 */}
              <div className="flex items-center justify-center py-10 md:py-14">
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                 >
                    <Link 
                      href="/workout/new"
                      className="h-12 px-10 rounded-full bg-white text-black font-medium flex items-center justify-center hover:bg-neutral-200 transition-colors"
                    >
                      Start Workout
                    </Link>
                 </motion.div>
              </div>

              {/* Button 2 */}
              <div className="flex items-center justify-center py-10 md:py-14">
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.8 }}
                 >
                    <Link 
                      href="/history"
                      className="h-12 px-10 rounded-full border border-white/20 text-white font-medium flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      View History
                    </Link>
                 </motion.div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

