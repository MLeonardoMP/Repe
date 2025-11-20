'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkoutSessionCard } from '@/components/workout/WorkoutSessionCard';
import type { WorkoutSession } from '@/types/workout';

export default function HomePage() {
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load recent workouts from the DB-backed API
        const response = await fetch('/api/workouts?limit=5', { cache: 'no-store' });
        if (response.ok) {
          const payload: { data: WorkoutSession[] } = await response.json();
          const workouts = Array.isArray(payload.data) ? payload.data : [];
          setRecentWorkouts(workouts);

          const activeWorkout = workouts.find((workout) => !workout.endTime);
          setActiveWorkout(activeWorkout || null);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleContinueWorkout = (workout: WorkoutSession) => {
    window.location.href = `/workout/active?id=${workout.id}`;
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 min-h-screen">
        <div className="max-w-md mx-auto space-y-8 pt-8">
          <div className="space-y-8 fade-in">
            {/* Header skeleton */}
            <div className="text-center space-y-3">
              <div className="h-12 skeleton rounded-lg w-40 mx-auto"></div>
              <div className="h-4 skeleton rounded w-48 mx-auto"></div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="h-px w-8 skeleton"></div>
                <div className="h-1 w-1 rounded-full skeleton"></div>
                <div className="h-px w-8 skeleton"></div>
              </div>
            </div>
            {/* Button skeletons */}
            <div className="space-y-3">
              <div className="h-14 skeleton rounded-lg"></div>
              <div className="h-12 skeleton rounded-lg"></div>
            </div>
            {/* Card skeleton with more detail */}
            <div className="h-48 skeleton rounded-xl border border-neutral-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/10 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 min-h-screen smooth-scroll">
      <div className="max-w-md mx-auto space-y-8 fade-in">
        {/* Header - Modern minimalist style with subtle gradient */}
        <div className="text-center space-y-2 pt-8 pb-4">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Repe
            </span>
          </h1>
          <p className="text-neutral-400 text-sm font-medium">Track your strength training</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
            <div className="h-1 w-1 rounded-full bg-neutral-700"></div>
            <div className="h-px w-8 bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
          </div>
        </div>

        {/* Active Workout - Modern card with glass effect */}
        {activeWorkout && (
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-950/30 to-[#0a0a0a] border-emerald-900/30 card-hover slide-in-bottom">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
            
            <CardHeader className="pb-3 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-white">Active Workout</CardTitle>
                <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-medium backdrop-blur-sm">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-glow mr-1.5"></span>
                  In Progress
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <div>
                <h3 className="font-semibold text-white text-lg">{activeWorkout.name}</h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Started {new Date(activeWorkout.startTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <div className="flex gap-6 text-sm text-neutral-300 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>{activeWorkout.exercises?.length || 0} exercises</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>
                    {activeWorkout.exercises?.reduce((total, ex) => 
                      total + (ex.sets?.length || 0), 0) || 0} sets
                  </span>
                </div>
              </div>
              <Button
                onClick={() => handleContinueWorkout(activeWorkout)}
                className="w-full h-12 bg-white hover:bg-neutral-100 text-black font-semibold transition-all button-press hover:shadow-lg"
              >
                Continue Workout →
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions - Modern buttons with enhanced feedback */}
        <div className="space-y-3">
          {!activeWorkout && (
            <Link href="/workout/new">
              <Button className="group w-full h-14 bg-white hover:bg-neutral-100 text-black text-base font-semibold transition-all button-press hover:shadow-xl relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start New Workout
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                {/* Subtle shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </Button>
            </Link>
          )}
          
          <Link href="/history">
            <Button variant="outline" className="group w-full h-12 border-neutral-800 text-neutral-200 hover:bg-[#0a0a0a] hover:border-neutral-600 transition-all button-press relative overflow-hidden">
              <span className="relative z-10 flex items-center justify-center gap-2">
                View History
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Button>
          </Link>
        </div>

        {/* Recent Workouts - Modern section with subtle divider */}
        {recentWorkouts.length > 0 && (
          <div className="space-y-4 slide-in-bottom">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white tracking-tight">Recent Workouts</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-neutral-800 to-transparent"></div>
            </div>
            <div className="space-y-3">
              {recentWorkouts.slice(0, 3).map((workout, index) => (
                <div 
                  key={workout.id}
                  className="fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <WorkoutSessionCard
                    session={workout}
                    onView={(id) => window.location.href = `/workout/${id}`}
                    onEdit={workout.endTime ? undefined : () => handleContinueWorkout(workout)}
                  />
                </div>
              ))}
            </div>
            {recentWorkouts.length > 3 && (
              <Link href="/history">
                <Button variant="ghost" className="group w-full text-neutral-400 hover:text-white hover:bg-[#0a0a0a] transition-all button-press">
                  <span className="flex items-center justify-center gap-2">
                    View All Workouts
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Empty State - Modern with gradient accents */}
        {recentWorkouts.length === 0 && !activeWorkout && (
          <Card className="relative overflow-hidden bg-[#0a0a0a] border-neutral-800 card-hover slide-in-bottom">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/20 via-transparent to-transparent pointer-events-none"></div>
            
            <CardContent className="relative text-center py-16 space-y-6">
              {/* Icon with glow effect */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-neutral-700/20 blur-2xl rounded-full"></div>
                <div className="relative text-neutral-600 bg-neutral-900/50 rounded-full p-6 inline-block">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Ready to get started?</h3>
                <p className="text-sm text-neutral-400 mb-8 max-w-xs mx-auto">
                  Begin your fitness journey by creating your first workout session
                </p>
                <Link href="/workout/new">
                  <Button className="group h-14 px-10 bg-white hover:bg-neutral-100 text-black font-semibold transition-all button-press hover:shadow-xl relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      Start Your First Workout
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
