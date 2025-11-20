/**
 * History types shared across client components
 */

export interface HistoryCursor {
  performedAt: string;
  id: string;
}

export interface HistoryEntry {
  id: string;
  workoutId: string | null;
  workoutName?: string | null;
  performedAt: string;
  durationSeconds?: number | null;
  notes?: string | null;
  createdAt: string;
}

export interface HistoryResponse {
  data: HistoryEntry[];
  cursor?: HistoryCursor;
  hasMore: boolean;
}
