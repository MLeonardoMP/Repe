import { getDb } from "@/lib/db";
import { sets } from "@/lib/db/schema";
import { StorageError } from "@/lib/storage-errors";
import { eq, desc } from "drizzle-orm";

export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;

export interface NewSetPayload {
  workoutExerciseId: string;
  reps: number;
  weight?: number;
  rpe?: number;
  restSeconds?: number;
  notes?: string;
}

export interface SetUpdate {
  reps?: number;
  weight?: number;
  rpe?: number;
  restSeconds?: number;
  notes?: string;
}

/**
 * Add a new set
 */
export async function addSet(input: NewSetPayload): Promise<Set> {
  try {
    // Validate input
    if (!input.workoutExerciseId) {
      throw StorageError.validation("Workout exercise ID is required");
    }
    if (typeof input.reps !== "number" || input.reps < 0) {
      throw StorageError.validation("Reps must be a non-negative number");
    }

    // Validate optional fields
    if (input.weight !== undefined && input.weight !== null && input.weight < 0) {
      throw StorageError.validation("Weight must be non-negative");
    }
    if (input.rpe !== undefined && input.rpe !== null) {
      const rpeNum = typeof input.rpe === "string" ? parseFloat(input.rpe) : input.rpe;
      if (rpeNum < 0 || rpeNum > 10) {
        throw StorageError.validation("RPE must be between 0 and 10");
      }
    }
    if (input.restSeconds !== undefined && input.restSeconds !== null && input.restSeconds < 0) {
      throw StorageError.validation("Rest seconds must be non-negative");
    }

    // Create set
    const payload: NewSet = {
      workoutExerciseId: input.workoutExerciseId,
      reps: input.reps,
      weight:
        input.weight !== undefined && input.weight !== null
          ? parseFloat(input.weight.toString())
          : null,
      rpe:
        input.rpe !== undefined && input.rpe !== null
          ? parseFloat(input.rpe.toString())
          : null,
      restSeconds: input.restSeconds,
      notes: input.notes,
    };

    const result = await getDb().insert(sets).values(payload).returning();

    if (!result[0]) {
      throw new Error("Failed to create set");
    }

    return result[0];
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw StorageError.internal(
      "Failed to add set",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Update a set
 */
export async function updateSet(
  id: string,
  patch: SetUpdate
): Promise<Set> {
  try {
    // Validate input
    if (patch.reps !== undefined && (typeof patch.reps !== "number" || patch.reps < 0)) {
      throw StorageError.validation("Reps must be a non-negative number");
    }
    if (patch.weight !== undefined && patch.weight !== null && patch.weight < 0) {
      throw StorageError.validation("Weight must be non-negative");
    }
    if (patch.rpe !== undefined && patch.rpe !== null) {
      const rpeNum = typeof patch.rpe === "string" ? parseFloat(patch.rpe) : patch.rpe;
      if (rpeNum < 0 || rpeNum > 10) {
        throw StorageError.validation("RPE must be between 0 and 10");
      }
    }
    const updatePayload: Partial<NewSet> = {
      reps: patch.reps ?? undefined,
      weight:
        patch.weight !== undefined
          ? patch.weight !== null
            ? parseFloat(patch.weight.toString())
            : null
          : undefined,
      rpe:
        patch.rpe !== undefined
          ? patch.rpe !== null
            ? parseFloat(patch.rpe.toString())
            : null
          : undefined,
      restSeconds: patch.restSeconds ?? undefined,
      notes: patch.notes ?? undefined,
    };

    const result = await getDb()
      .update(sets)
      .set(updatePayload)
      .where(eq(sets.id, id))
      .returning();

    if (!result[0]) {
      throw StorageError.notFound(`Set with ID ${id} not found`);
    }

    return result[0];
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw StorageError.internal(
      "Failed to update set",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Delete a set
 */
export async function deleteSet(id: string): Promise<void> {
  try {
    await getDb().delete(sets).where(eq(sets.id, id));
  } catch (error) {
    throw StorageError.internal(
      "Failed to delete set",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * List sets for a workout
 */
export async function listSetsByWorkout(
  workoutExerciseId: string,
  options?: { limit?: number; offset?: number }
): Promise<Set[]> {
  try {
    const baseQuery = getDb()
      .select()
      .from(sets)
      .where(eq(sets.workoutExerciseId, workoutExerciseId))
      .orderBy(desc(sets.performedAt));
    let query = baseQuery;

    if (options?.limit) {
      query = query.limit(Math.max(1, options.limit));
    }
    if (options?.offset) {
      query = query.offset(Math.max(0, options.offset));
    }

    return await query;
  } catch (error) {
    throw StorageError.internal(
      "Failed to list sets",
      error instanceof Error ? error.message : String(error)
    );
  }
}
