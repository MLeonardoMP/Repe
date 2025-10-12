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
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-3/4"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Repe</h1>
          <p className="text-gray-400">Track your strength training</p>
        </div>

        {/* Active Workout */}
        {activeWorkout && (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Active Workout</CardTitle>
                <Badge variant="success" className="bg-green-900 text-green-300 border-green-600">
                  In Progress
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold text-white">{activeWorkout.name}</h3>
                <p className="text-sm text-gray-400">
                  Started {new Date(activeWorkout.startTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <div className="flex gap-4 text-xs text-gray-400">
                <span>{activeWorkout.exercises?.length || 0} exercises</span>
                <span>
                  {activeWorkout.exercises?.reduce((total, ex) => 
                    total + (ex.sets?.length || 0), 0) || 0} sets
                </span>
              </div>
              <Button
                onClick={() => handleContinueWorkout(activeWorkout)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue Workout
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          {!activeWorkout && (
            <Link href="/workout/new">
              <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-lg">
                Start New Workout
              </Button>
            </Link>
          )}
          
          <Link href="/history">
            <Button variant="outline" className="w-full h-12 border-gray-600 text-gray-300 hover:bg-gray-700">
              View History
            </Button>
          </Link>
        </div>

        {/* Recent Workouts */}
        {recentWorkouts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Recent Workouts</h2>
            <div className="space-y-3">
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
                <Button variant="ghost" className="w-full text-blue-400 hover:text-blue-300">
                  View All Workouts
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Empty State */}
        {recentWorkouts.length === 0 && !activeWorkout && (
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="text-center py-8 space-y-4">
              <div className="text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Ready to get started?</h3>
                <p className="text-gray-400 mb-4">Create your first workout session</p>
                <Link href="/workout/new">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
