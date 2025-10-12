'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { WorkoutSessionCard } from '@/components/workout/WorkoutSessionCard';
import type { WorkoutSession } from '@/types/workout';

export default function HistoryPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalWorkouts, setTotalWorkouts] = useState(0);

  const ITEMS_PER_PAGE = 10;

  const loadWorkouts = async (pageNum: number = 1, query: string = '') => {
    try {
      const searchParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(query && { search: query }),
      });

      const response = await fetch(`/api/workouts?${searchParams}`);
      if (response.ok) {
        const data = await response.json();
        
        if (pageNum === 1) {
          setWorkouts(data.data.workouts || []);
        } else {
          setWorkouts(prev => [...prev, ...(data.data.workouts || [])]);
        }
        
        setTotalWorkouts(data.data.total || 0);
        setHasMore((data.data.workouts?.length || 0) === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts(1, searchQuery);
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (page > 1) {
      loadWorkouts(page, searchQuery);
    }
  }, [page]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const handleViewWorkout = (workoutId: string) => {
    router.push(`/workout/${workoutId}`);
  };

  const handleEditWorkout = (workoutId: string) => {
    router.push(`/workout/active?id=${workoutId}`);
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (window.confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/workouts/${workoutId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove the workout from the list
          setWorkouts(prev => prev.filter(w => w.id !== workoutId));
          setTotalWorkouts(prev => prev - 1);
        } else {
          console.error('Failed to delete workout');
        }
      } catch (error) {
        console.error('Error deleting workout:', error);
      }
    }
  };

  if (loading && workouts.length === 0) {
    return (
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/">
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
            <h1 className="text-2xl font-bold text-white">Workout History</h1>
            {totalWorkouts > 0 && (
              <p className="text-sm text-gray-400">{totalWorkouts} total workouts</p>
            )}
          </div>
        </div>

        {/* Search */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={handleSearch}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pl-10"
              />
              <svg 
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {workouts.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-white">{totalWorkouts}</div>
                <div className="text-xs text-gray-400">Total</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {workouts.filter(w => w.endTime).length}
                </div>
                <div className="text-xs text-gray-400">Completed</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {workouts.filter(w => !w.endTime).length}
                </div>
                <div className="text-xs text-gray-400">Active</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Workouts List */}
        {workouts.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {workouts.map((workout) => (
                <WorkoutSessionCard
                  key={workout.id}
                  session={workout}
                  onView={handleViewWorkout}
                  onEdit={!workout.endTime ? handleEditWorkout : undefined}
                  onDelete={handleDeleteWorkout}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={loadMore}
                  disabled={loading}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="text-center py-8 space-y-4">
              <div className="text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h9.5l1-1V7a2 2 0 00-2-2H13m-4 0V3h4v2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchQuery ? 'No workouts found' : 'No workouts yet'}
                </h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery 
                    ? `No workouts match "${searchQuery}"`
                    : 'Start your first workout to see it here'
                  }
                </p>
                {!searchQuery && (
                  <Link href="/workout/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Start Your First Workout
                    </Button>
                  </Link>
                )}
                {searchQuery && (
                  <Button
                    variant="ghost"
                    onClick={() => setSearchQuery('')}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}