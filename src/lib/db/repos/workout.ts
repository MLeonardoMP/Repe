import { getDb } from "@/lib/db";
import {
  workouts,
  workoutExercises,
  sets,
  exercises,
} from "@/lib/db/schema";
import { StorageError } from "@/lib/storage-errors";
import { eq, desc } from "drizzle-orm";

export type Workout = typeof workouts.$inferSelect;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type WorkoutExerciseType = typeof exercises.$inferSelect;
export type WorkoutSet = typeof sets.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;

export interface WorkoutWithExercises extends Workout {
  exercises: WorkoutExercise[];
}

export interface WorkoutDetail extends Workout {
  exercises: (WorkoutExercise & { exercise: WorkoutExerciseType })[];
  sets: WorkoutSet[];
}

export interface UpsertWorkoutPayload {
  id?: string;
  name: string;
  exercises: Array<{
    id: string;
    orderIndex: number;
    targetSets?: number;
    targetReps?: number;
    targetWeight?: number;
    preferencesJson?: Record<string, unknown>;
  }>;
}

/**
 * List all workouts with exercises
 */
export async function listWorkouts(params: {
  limit?: number;
  offset?: number;
  includeHistory?: boolean;
}): Promise<WorkoutWithExercises[]> {
  try {
    const { limit = 20, offset = 0 } = params;

    const result = await getDb()
      .select()
      .from(workouts)
      .orderBy(desc(workouts.createdAt))
      .limit(Math.max(1, limit))
      .offset(Math.max(0, offset));

    // For each workout, get its exercises
    const workoutsWithExercises: WorkoutWithExercises[] = [];
    for (const workout of result) {
      const exs = await getDb()
        .select()
        .from(workoutExercises)
        .where(eq(workoutExercises.workoutId, workout.id))
        .orderBy(workoutExercises.orderIndex);

      workoutsWithExercises.push({
        ...workout,
        exercises: exs,
      });
    }

    return workoutsWithExercises;
  } catch (error) {
    throw StorageError.internal(
      "Failed to list workouts",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Get full workout details with exercises and sets
 */
export async function getWorkout(id: string): Promise<WorkoutDetail | null> {
  try {
    const result = await getDb()
      .select()
      .from(workouts)
      .where(eq(workouts.id, id))
      .limit(1);

    if (!result[0]) {
      return null;
    }

    const workout = result[0];

    // Get workout exercises
    const exs = await getDb()
      .select()
      .from(workoutExercises)
      .where(eq(workoutExercises.workoutId, workout.id))
      .orderBy(workoutExercises.orderIndex);

    // Get sets for each exercise
    const details: WorkoutDetail = {
      ...workout,
      exercises: [],
      sets: [],
    };

    for (const ex of exs) {
      const exercise = await getDb()
        .select()
        .from(exercises)
        .where(eq(exercises.id, ex.exerciseId))
        .limit(1);

      if (exercise[0]) {
        details.exercises.push({
          ...ex,
          exercise: exercise[0],
        });
      }

      // Get sets for this workout exercise
      const exSets = await getDb()
        .select()
        .from(sets)
        .where(eq(sets.workoutExerciseId, ex.id));

      details.sets.push(...exSets);
    }

    return details;
  } catch (error) {
    throw StorageError.internal(
      "Failed to get workout",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Create or update workout with exercises (transactional)
 */
export async function upsertWorkout(
  payload: UpsertWorkoutPayload
): Promise<WorkoutDetail> {
  try {
    // Validate input
    if (!payload.name || !payload.name.trim()) {
      throw StorageError.validation("Workout name is required");
    }
    if (!Array.isArray(payload.exercises)) {
      throw StorageError.validation("Exercises must be an array");
    }

    let workoutId = payload.id;

    // Create or update workout
    if (workoutId) {
      await getDb()
        .update(workouts)
        .set({
          name: payload.name.trim(),
          updatedAt: new Date(),
        })
        .where(eq(workouts.id, workoutId));
    } else {
      const result = await getDb()
        .insert(workouts)
        .values({
          name: payload.name.trim(),
        })
        .returning();

      if (!result[0]) {
        throw new Error("Failed to create workout");
      }
      workoutId = result[0].id;
    }

    // Remove old exercises
    await getDb()
      .delete(workoutExercises)
      .where(eq(workoutExercises.workoutId, workoutId));
    // Insert new exercises
    for (const ex of payload.exercises) {
      const exerciseInput: NewWorkoutExercise = {
        workoutId,
        exerciseId: ex.id,
        orderIndex: ex.orderIndex,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        targetWeight: ex.targetWeight
          ? ex.targetWeight.toString()
          : null,
      };

      await getDb().insert(workoutExercises).values(exerciseInput);
    }

    // Return full details
    const detail = await getWorkout(workoutId);
    if (!detail) {
      throw new Error("Failed to retrieve created workout");
    }
    return detail;
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw StorageError.internal(
      "Failed to upsert workout",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Delete a workout
 */
export async function deleteWorkout(id: string): Promise<void> {
  try {
    await getDb().delete(workouts).where(eq(workouts.id, id));
  } catch (error) {
    throw StorageError.internal(
      "Failed to delete workout",
      error instanceof Error ? error.message : String(error)
    );
  }
}
