import { getDb } from "@/lib/db";
import { history, workouts } from "@/lib/db/schema";
import { StorageError } from "@/lib/storage-errors";
import { eq, desc, gte, lte, and, or, lt } from "drizzle-orm";

export type History = typeof history.$inferSelect;

export interface HistoryListItem extends History {
  workoutName: string | null;
}

export interface HistoryCursor {
  performedAt: string;
  id: string;
}

export interface HistoryPage {
  data: HistoryListItem[];
  cursor?: HistoryCursor;
  hasMore: boolean;
}

export interface ListHistoryParams {
  cursor?: HistoryCursor;
  limit?: number;
  from?: Date | string;
  to?: Date | string;
}

export interface NewHistoryEntry {
  workoutId?: string | null;
  performedAt?: Date | string;
  durationSeconds?: number;
  notes?: string;
}

export interface LegacyHistoryEntry {
  id?: string;
  workoutId?: string;
  performedAt: Date | string;
  durationSeconds?: number;
  notes?: string;
}

/**
 * Log a completed workout session
 */
export async function logSession(input: NewHistoryEntry): Promise<History> {
  try {
    // Validate input
    if (input.durationSeconds !== undefined && input.durationSeconds < 0) {
      throw StorageError.validation("Duration must be non-negative");
    }

    const result = await getDb()
      .insert(history)
      .values({
        workoutId: input.workoutId,
        performedAt: input.performedAt
          ? new Date(input.performedAt)
          : new Date(),
        durationSeconds: input.durationSeconds,
        notes: input.notes,
      })
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create history entry");
    }

    return result[0];
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw StorageError.internal(
      "Failed to log session",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * List history with keyset pagination
 */
export async function listHistory(
  params: ListHistoryParams
): Promise<HistoryPage> {
  try {
    const limit = Math.min(Math.max(1, params.limit || 20), 100);
    let query = getDb()
      .select({
        id: history.id,
        workoutId: history.workoutId,
        performedAt: history.performedAt,
        durationSeconds: history.durationSeconds,
        notes: history.notes,
        createdAt: history.createdAt,
        workoutName: workouts.name,
      })
      .from(history)
      .leftJoin(workouts, eq(history.workoutId, workouts.id))
      .orderBy(desc(history.performedAt), desc(history.id)) as any;

    // Apply date range filters
    const conditions: any[] = [];
    if (params.from) {
      const fromDate = new Date(params.from);
      conditions.push(gte(history.performedAt, fromDate));
    }
    if (params.to) {
      const toDate = new Date(params.to);
      conditions.push(lte(history.performedAt, toDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply cursor for keyset pagination
    if (params.cursor) {
      const cursorDate = new Date(params.cursor.performedAt);
      query = query.where(
        (or(
          lt(history.performedAt, cursorDate),
          (and(
            eq(history.performedAt, cursorDate),
            lt(history.id, params.cursor.id)
          ) as any)
        ) as any)
      );
    }

    // Fetch limit + 1 to determine hasMore
    const results = await query.limit(limit + 1);
    const hasMore = results.length > limit;
    const data = results.slice(0, limit);

    let nextCursor: HistoryCursor | undefined;
    if (hasMore && data.length > 0) {
      const lastRecord = data[data.length - 1];
      nextCursor = {
        performedAt: lastRecord.performedAt.toISOString(),
        id: lastRecord.id,
      };
    }

    return {
      data,
      cursor: nextCursor,
      hasMore,
    };
  } catch (error) {
    throw StorageError.internal(
      "Failed to list history",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Backfill history from legacy data
 */
export async function backfillHistory(
  entries: LegacyHistoryEntry[]
): Promise<{ inserted: number; skipped: number }> {
  try {
    if (!Array.isArray(entries) || entries.length === 0) {
      return { inserted: 0, skipped: 0 };
    }

    let inserted = 0;
    let skipped = 0;

    // Insert with ON CONFLICT DO NOTHING for idempotency
    for (const entry of entries) {
      try {
        const result = await getDb()
          .insert(history)
          .values({
            id: entry.id,
            workoutId: entry.workoutId,
            performedAt: new Date(entry.performedAt),
            durationSeconds: entry.durationSeconds,
            notes: entry.notes,
          })
          .onConflictDoNothing()
          .returning();

        if (result.length > 0) {
          inserted++;
        } else {
          skipped++;
        }
      } catch (error) {
        skipped++;
      }
    }

    return { inserted, skipped };
  } catch (error) {
    throw StorageError.internal(
      "Failed to backfill history",
      error instanceof Error ? error.message : String(error)
    );
  }
}
