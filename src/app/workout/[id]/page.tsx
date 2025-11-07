'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import type { WorkoutSession } from '@/types/workout';

export default function WorkoutDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;
  
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkout = async () => {
      if (!workoutId) return;

      try {
        const response = await fetch(`/api/workouts/${workoutId}`);
        if (response.ok) {
          const data = await response.json();
          setWorkout(data.data);
        } else {
          router.push('/history');
        }
      } catch (error) {
        console.error('Error loading workout:', error);
        router.push('/history');
      } finally {
        setLoading(false);
      }
    };

    loadWorkout();
  }, [workoutId, router]);

  const formatDuration = (startTime: string, endTime?: string): string => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleContinue = () => {
    router.push(`/workout/active?id=${workout!.id}`);
  };

  const handleDelete = async () => {
    if (!workout) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this workout? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/history');
      } else {
        console.error('Failed to delete workout');
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
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

  if (!workout) {
    return (
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto text-center space-y-4">
          <h1 className="text-xl font-semibold text-white">Workout not found</h1>
          <Link href="/history">
            <Button>Back to History</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isActive = !workout.endTime;
  const totalSets = workout.exercises.reduce((total, ex) => total + ex.sets.length, 0);
  const completedSets = workout.exercises.reduce((total, ex) => 
    total + ex.sets.filter(set => set.isCompleted).length, 0
  );

  return (
    <div className="flex-1 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/history">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{workout.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {isActive && (
                  <Badge variant="success" className="bg-green-900 text-green-300">
                    Active
                  </Badge>
                )}
                <span className="text-sm text-gray-400">
                  {formatDate(workout.startTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Workout Summary */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{workout.exercises.length}</div>
                  <div className="text-xs text-gray-400">Exercises</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{totalSets}</div>
                  <div className="text-xs text-gray-400">Total Sets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{completedSets}</div>
                  <div className="text-xs text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {formatDuration(workout.startTime, workout.endTime)}
                  </div>
                  <div className="text-xs text-gray-400">Duration</div>
                </div>
              </div>

              {workout.notes && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Notes</h3>
                  <p className="text-sm text-gray-400">{workout.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Exercises</h2>
          {workout.exercises.length > 0 ? (
            workout.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onEditExercise={() => {}}
                onAddSet={() => {}}
                onEditSet={() => {}}
                onDeleteSet={() => {}}
                isActive={false}
              />
            ))
          ) : (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="text-center py-8">
                <div className="text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No exercises</h3>
                <p className="text-gray-400">This workout doesn&apos;t have any exercises yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {isActive && (
            <Button
              onClick={handleContinue}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-lg"
            >
              Continue Workout
            </Button>
          )}
          
          <div className="flex gap-3">
            <Link href="/history" className="flex-1">
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                Back to History
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}