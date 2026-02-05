"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { HistoryCursor, HistoryEntry, HistoryResponse } from "@/types/history";
import { 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  Calendar, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  Plus,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const averageDuration = totalWorkouts > 0 ? Math.round(totalDurationSeconds / totalWorkouts / 60) : 0;
  const lastWorkout = filteredEntries[0]?.performedAt ?? null;

  const loadMore = () => {
    if (!hasMore || loadingMore || !cursor) return;
    fetchHistory({ cursor, append: true });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center h-10 w-10 rounded-full border border-border bg-card transition-colors hover:bg-secondary hover:border-muted-foreground/30"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-sm text-muted-foreground">Tu progreso</p>
              <h1 className="text-2xl font-semibold tracking-tight">Historial</h1>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/workout/new')}
            className="flex items-center gap-2 h-10 px-4 rounded-full bg-foreground text-background text-sm font-medium transition-all hover:bg-foreground/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold number-display">{totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">Entrenamientos</p>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold number-display">{averageDuration}<span className="text-base font-normal text-muted-foreground">min</span></p>
            <p className="text-xs text-muted-foreground">Promedio</p>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold leading-tight">
              {lastWorkout ? formatDate(lastWorkout).split(',')[0] : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Ultimo</p>
          </div>
        </motion.div>

        {/* Search and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar entrenamientos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
            />
          </div>
          <button
            onClick={() => fetchHistory()}
            disabled={loading}
            className={cn(
              "flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-card transition-colors",
              "hover:bg-secondary hover:border-muted-foreground/30",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <RefreshCw className={cn("h-4 w-4 text-muted-foreground", loading && "animate-spin")} />
          </button>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-destructive"
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Cargando historial...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Sin entrenamientos</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              {searchQuery ? 'No se encontraron resultados' : 'Comienza tu primer entrenamiento para ver tu historial'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/workout/new')}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-background font-medium transition-all hover:bg-foreground/90"
              >
                <Plus className="h-4 w-4" />
                Comenzar ahora
              </button>
            )}
          </motion.div>
        ) : (
          /* History List */
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <Link
                    href={entry.workoutId ? `/workout/${entry.workoutId}` : '#'}
                    className={cn(
                      "group block rounded-xl border border-border bg-card p-4 transition-all duration-300",
                      "hover:border-accent/30 hover:shadow-md hover:shadow-accent/5",
                      !entry.workoutId && "pointer-events-none"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(entry.performedAt)}
                          </p>
                        </div>
                        <h3 className="font-medium text-foreground truncate group-hover:text-foreground/90 transition-colors">
                          {entry.workoutName || 'Entrenamiento'}
                        </h3>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {entry.durationSeconds !== undefined && entry.durationSeconds > 0 && (
                          <div className="text-right">
                            <p className="text-sm font-medium number-display">
                              {formatDuration(entry.durationSeconds)}
                            </p>
                          </div>
                        )}
                        {entry.workoutId && (
                          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load More Button */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="pt-4"
              >
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className={cn(
                    "w-full h-12 rounded-xl border border-border bg-card font-medium transition-all",
                    "hover:bg-secondary hover:border-muted-foreground/30",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    'Cargar mas'
                  )}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
