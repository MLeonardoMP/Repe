import { getDb } from "@/lib/db";
import { exercises } from "@/lib/db/schema";
import { StorageError } from "@/lib/storage-errors";
import { ilike, eq, count, and } from "drizzle-orm";

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export interface ListExercisesParams {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface ListExercisesResult {
  data: Exercise[];
  total: number;
}

/**
 * List exercises with filtering and pagination
 */
export async function listExercises(
  params: ListExercisesParams
): Promise<ListExercisesResult> {
  try {
    const { search, category, limit = 20, offset = 0 } = params;

    const filters = [] as Array<ReturnType<typeof ilike> | ReturnType<typeof eq>>;
    if (search && search.trim()) {
      filters.push(ilike(exercises.name, `%${search.trim()}%`));
    }
    if (category && category.trim()) {
      filters.push(eq(exercises.category, category.trim()));
    }

    const baseSelect = getDb().select().from(exercises);
    const query = (filters.length > 0
      ? baseSelect.where(filters.length === 1 ? filters[0] : and(...filters))
      : baseSelect
    )
      .limit(Math.max(1, limit))
      .offset(Math.max(0, offset));

    const baseCount = getDb().select({ count: count() }).from(exercises);
    const countQuery = filters.length > 0
      ? baseCount.where(filters.length === 1 ? filters[0] : and(...filters))
      : baseCount;

    const countResult = await countQuery;
    const total = countResult[0]?.count || 0;

    // Get paginated data
    const data = await query;

    return { data, total };
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError(
      "INTERNAL",
      "Failed to list exercises",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Create a new exercise with unique name validation
 */
export async function createExercise(input: {
  name: string;
  category: string;
  equipment?: string[];
  notes?: string;
}): Promise<Exercise> {
  try {
    // Validate input
    if (!input.name || !input.name.trim()) {
      throw StorageError.validation("Exercise name is required");
    }
    if (!input.category || !input.category.trim()) {
      throw StorageError.validation("Exercise category is required");
    }
    if (input.name.length > 120) {
      throw StorageError.validation("Exercise name must be less than 120 characters");
    }

    // Check for duplicate name
    const existing = await getDb()
      .select()
      .from(exercises)
      .where(eq(exercises.name, input.name.trim()))
      .limit(1);

    if (existing.length > 0) {
      throw StorageError.conflict(
        `Exercise with name "${input.name}" already exists`
      );
    }

    // Create exercise
    const result = await getDb()
      .insert(exercises)
      .values({
        name: input.name.trim(),
        category: input.category.trim(),
        equipment: input.equipment || [],
        notes: input.notes,
      })
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create exercise");
    }

    return result[0];
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw StorageError.internal(
      "Failed to create exercise",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Get exercise by ID
 */
export async function getExerciseById(id: string): Promise<Exercise | null> {
  try {
    const result = await getDb()
      .select()
      .from(exercises)
      .where(eq(exercises.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    throw StorageError.internal(
      "Failed to get exercise",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Bulk seed exercises with idempotency (ON CONFLICT DO NOTHING)
 */
export async function bulkSeedExercises(
  exerciseList: Array<{
    id?: string;
    name: string;
    category: string;
    equipment?: string[];
    notes?: string;
  }>
): Promise<number> {
  try {
    if (!Array.isArray(exerciseList) || exerciseList.length === 0) {
      return 0;
    }

    const result = await getDb()
      .insert(exercises)
      .values(
        exerciseList.map((e) => ({
          id: e.id,
          name: e.name,
          category: e.category,
          equipment: e.equipment || [],
          notes: e.notes,
        }))
      )
      .onConflictDoNothing()
      .returning();

    return result.length;
  } catch (error) {
    throw StorageError.internal(
      "Failed to seed exercises",
      error instanceof Error ? error.message : String(error)
    );
  }
}
