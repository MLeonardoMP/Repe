"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { HistoryCursor, HistoryEntry, HistoryResponse } from "@/types/history";

interface HistoryClientProps {
  initialEntries: HistoryEntry[];
  initialCursor?: HistoryCursor;
  initialHasMore: boolean;
  pageSize: number;
}

export function HistoryClient({ initialEntries, initialCursor, initialHasMore, pageSize }: HistoryClientProps) {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>(initialEntries);
  const [cursor, setCursor] = useState<HistoryCursor | null>(initialCursor ?? null);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHistory = useCallback(
    async (options?: { cursor?: HistoryCursor; append?: boolean }) => {
      const isLoadMore = Boolean(options?.append);
      setError(null);
      if (isLoadMore) setLoadingMore(true); else setLoading(true);

      try {
        const params = new URLSearchParams({ limit: pageSize.toString() });
        if (options?.cursor) params.set("cursor", JSON.stringify(options.cursor));

        const response = await fetch(`/api/history?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load history: ${response.status}`);
        }

        const payload: HistoryResponse = await response.json();
        setEntries(prev => (options?.append ? [...prev, ...payload.data] : payload.data));
        setCursor(payload.cursor ?? null);
        setHasMore(payload.hasMore);
      } catch (err) {
        console.error("Error loading history:", err);
        setError("No pudimos cargar tu historial. Intenta nuevamente.");
      } finally {
        if (isLoadMore) setLoadingMore(false); else setLoading(false);
      }
    },
    [pageSize]
  );

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
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
  const averageDuration = totalWorkouts > 0 ? Math.round(totalDurationSeconds / totalWorkouts) : 0;
  const lastWorkout = filteredEntries[0]?.performedAt ?? null;

  const loadMore = () => {
    if (!hasMore || loadingMore || !cursor) return;
    fetchHistory({ cursor, append: true });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-400">Historial</p>
            <h1 className="text-2xl font-semibold">Tus entrenamientos</h1>
          </div>
          <Button variant="outline" onClick={() => router.push('/workout/new')}>
            Nuevo entrenamiento
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-400">Entrenamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{totalWorkouts}</p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-400">Duración promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{averageDuration} s</p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-400">Último</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-sm">
                {lastWorkout ? new Date(lastWorkout).toLocaleString('es-ES') : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3">
            <Input
              placeholder="Buscar por nombre o notas"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white"
            />
            <Button variant="ghost" onClick={() => fetchHistory()} disabled={loading}>
              Recargar
            </Button>
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}

          {loading && entries.length === 0 ? (
            <div className="text-neutral-400 text-sm">Cargando historial...</div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map(entry => (
                <Card key={entry.id} className="bg-neutral-900 border-neutral-800">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-neutral-400">{new Date(entry.performedAt).toLocaleString('es-ES')}</p>
                      <p className="text-lg font-semibold">{entry.workoutName || 'Entrenamiento'}</p>
                      {entry.notes && <p className="text-sm text-neutral-400">{entry.notes}</p>}
                    </div>
                    {entry.durationSeconds !== undefined && (
                      <div className="text-right text-neutral-300">
                        <p className="text-sm">{entry.durationSeconds}s</p>
                        {entry.workoutId && (
                          <Link href={`/workout/${entry.workoutId}`} className="text-sm text-blue-400 hover:underline">
                            Ver detalle
                          </Link>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {hasMore && (
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full"
                >
                  {loadingMore ? 'Cargando...' : 'Cargar más'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
