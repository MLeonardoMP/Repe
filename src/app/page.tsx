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
        // Load recent workouts
        const response = await fetch('/api/workouts?limit=5');
        if (response.ok) {
          const data = await response.json();
          setRecentWorkouts(data.data.workouts || []);
          
          // Check for active workout
          const activeWorkout = data.data.workouts?.find((w: WorkoutSession) => !w.endTime);
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
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-md mx-auto space-y-8 pt-4">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="text-center space-y-2">
              <div className="h-10 bg-neutral-900 rounded w-32 mx-auto"></div>
              <div className="h-4 bg-neutral-900 rounded w-48 mx-auto"></div>
            </div>
            {/* Button skeletons */}
            <div className="space-y-2">
              <div className="h-14 bg-neutral-900 rounded-lg"></div>
              <div className="h-12 bg-neutral-900 rounded-lg"></div>
            </div>
            {/* Card skeleton */}
            <div className="h-32 bg-neutral-900 rounded-xl border border-neutral-800"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header - Geist minimalist style */}
        <div className="text-center space-y-1 pt-4">
          <h1 className="text-4xl font-bold text-white tracking-tight">Repe</h1>
          <p className="text-neutral-400 text-sm">Track your strength training</p>
        </div>

        {/* Active Workout - Geist style with clean borders */}
        {activeWorkout && (
          <Card className="bg-[#0a0a0a] border-neutral-800 hover:border-neutral-700 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-white">Active Workout</CardTitle>
                <Badge variant="success" className="bg-emerald-950 text-emerald-400 border-emerald-900 text-xs font-medium">
                  In Progress
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-white text-lg">{activeWorkout.name}</h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Started {new Date(activeWorkout.startTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <div className="flex gap-6 text-sm text-neutral-400 font-mono">
                <span>{activeWorkout.exercises?.length || 0} exercises</span>
                <span>
                  {activeWorkout.exercises?.reduce((total, ex) => 
                    total + (ex.sets?.length || 0), 0) || 0} sets
                </span>
              </div>
              <Button
                onClick={() => handleContinueWorkout(activeWorkout)}
                className="w-full h-12 bg-white hover:bg-neutral-100 text-black font-semibold transition-colors"
              >
                Continue Workout
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions - Geist minimalist buttons */}
        <div className="space-y-2">
          {!activeWorkout && (
            <Link href="/workout/new">
              <Button className="w-full h-14 bg-white hover:bg-neutral-100 text-black text-base font-semibold transition-colors">
                Start New Workout
              </Button>
            </Link>
          )}
          
          <Link href="/history">
            <Button variant="outline" className="w-full h-12 border-neutral-800 text-neutral-200 hover:bg-[#0a0a0a] hover:border-neutral-700 transition-colors">
              View History
            </Button>
          </Link>
        </div>

        {/* Recent Workouts - Cleaner section header */}
        {recentWorkouts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white tracking-tight">Recent Workouts</h2>
            <div className="space-y-2">
              {recentWorkouts.slice(0, 3).map((workout) => (
                <WorkoutSessionCard
                  key={workout.id}
                  session={workout}
                  onView={(id) => window.location.href = `/workout/${id}`}
                  onEdit={workout.endTime ? undefined : () => handleContinueWorkout(workout)}
                />
              ))}
            </div>
            {recentWorkouts.length > 3 && (
              <Link href="/history">
                <Button variant="ghost" className="w-full text-neutral-400 hover:text-white hover:bg-[#0a0a0a] transition-colors">
                  View All Workouts →
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Empty State - Minimalist Geist style */}
        {recentWorkouts.length === 0 && !activeWorkout && (
          <Card className="bg-[#0a0a0a] border-neutral-800">
            <CardContent className="text-center py-12 space-y-4">
              <div className="text-neutral-600">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Ready to get started?</h3>
                <p className="text-sm text-neutral-400 mb-6">Create your first workout session</p>
                <Link href="/workout/new">
                  <Button className="h-12 px-8 bg-white hover:bg-neutral-100 text-black font-semibold transition-colors">
                    Start Your First Workout
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
