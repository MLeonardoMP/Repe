'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { HistoryCursor, HistoryEntry, HistoryResponse } from '@/types/history';

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [cursor, setCursor] = useState<HistoryCursor | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch history using server-side cursor pagination so we always read the DB source of truth.
  const fetchHistory = useCallback(
    async (options?: { cursor?: HistoryCursor; append?: boolean }) => {
      const isLoadMore = Boolean(options?.append);
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({ limit: ITEMS_PER_PAGE.toString() });
        if (options?.cursor) {
          params.set('cursor', JSON.stringify(options.cursor));
        }

        const response = await fetch(`/api/history?${params.toString()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to load history: ${response.status}`);
        }

        const payload: HistoryResponse = await response.json();
        setEntries(prev => (options?.append ? [...prev, ...payload.data] : payload.data));
        setCursor(payload.cursor ?? null);
        setHasMore(payload.hasMore);
      } catch (err) {
        console.error('Error loading history:', err);
        setError('No pudimos cargar tu historial. Intenta nuevamente.');
      } finally {
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) {
      return entries;
    }
    const term = searchQuery.toLowerCase();
    return entries.filter(entry => {
      const inName = entry.workoutName?.toLowerCase().includes(term);
      const inNotes = entry.notes?.toLowerCase().includes(term);
      return Boolean(inName || inNotes);
    });
  }, [entries, searchQuery]);

  const totalWorkouts = filteredEntries.length;
  const totalDurationSeconds = filteredEntries.reduce(
    (sum, entry) => sum + (entry.durationSeconds || 0),
    0
  );
  const averageDuration = totalWorkouts > 0
    ? Math.round(totalDurationSeconds / totalWorkouts)
    : 0;
  const lastWorkout = filteredEntries[0]?.performedAt ?? null;

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const loadMore = () => {
    if (!hasMore || loadingMore || !cursor) return;
    fetchHistory({ cursor, append: true });
  };

  const handleViewWorkout = (workoutId: string | null) => {
    if (!workoutId) return;
    router.push(`/workout/${workoutId}`);
  };

  const formatDate = (value: string) => {
    try {
      return new Date(value).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return value;
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '—';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
  };

  if (loading && entries.length === 0) {
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
              <p className="text-sm text-gray-400">{totalWorkouts} recorded sessions</p>
            )}
          </div>
        </div>

        {/* Search */}
        <Card className="bg-black border-neutral-800">
          <CardContent className="pt-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={handleSearch}
                className="bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 pl-10"
              />
              <svg 
                className="w-5 h-5 text-neutral-500 absolute left-3 top-1/2 transform -translate-y-1/2"
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
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-black border-neutral-800">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-white">{totalWorkouts}</div>
                <div className="text-xs text-neutral-500">Stored</div>
              </CardContent>
            </Card>
            <Card className="bg-black border-neutral-800">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {formatDuration(averageDuration)}
                </div>
                <div className="text-xs text-neutral-500">Avg Duration</div>
              </CardContent>
            </Card>
            <Card className="bg-black border-neutral-800">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {lastWorkout ? new Date(lastWorkout).toLocaleDateString() : '—'}
                </div>
                <div className="text-xs text-neutral-500">Last Session</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-black border-red-900/50">
            <CardContent className="py-4 text-sm text-red-400">
              <p>{error}</p>
              <Button size="sm" className="mt-3 bg-white text-black hover:bg-neutral-200" onClick={() => fetchHistory()}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Workouts List */}
        {filteredEntries.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className="bg-black border-neutral-800 hover:border-neutral-600 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-base">
                          {entry.workoutName || 'Logged Session'}
                        </CardTitle>
                        <p className="text-xs text-neutral-500">{formatDate(entry.performedAt)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!entry.workoutId}
                        onClick={() => handleViewWorkout(entry.workoutId ?? null)}
                        className="text-neutral-400 hover:text-white"
                      >
                        View
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-neutral-400">
                      <span>Duration</span>
                      <span className="font-medium text-white">{formatDuration(entry.durationSeconds)}</span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-neutral-500 border-t border-neutral-800 pt-3">
                        {entry.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={loadMore}
                  disabled={loadingMore || !cursor}
                  className="text-neutral-400 hover:text-white"
                >
                  {loadingMore ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
          <Card className="bg-black border-neutral-800">
            <CardContent className="text-center py-8 space-y-4">
              <div className="text-neutral-600">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h9.5l1-1V7a2 2 0 00-2-2H13m-4 0V3h4v2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchQuery ? 'No sessions found' : 'No workouts yet'}
                </h3>
                <p className="text-neutral-500 mb-4">
                  {searchQuery 
                    ? `No sessions match "${searchQuery}"`
                    : 'Start your first workout to see it here'
                  }
                </p>
                {!searchQuery && (
                  <Link href="/workout/new">
                    <Button className="bg-white hover:bg-neutral-200 text-black font-semibold">
                      Start Your First Workout
                    </Button>
                  </Link>
                )}
                {searchQuery && (
                  <Button
                    variant="ghost"
                    onClick={() => setSearchQuery('')}
                    className="text-neutral-400 hover:text-white"
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