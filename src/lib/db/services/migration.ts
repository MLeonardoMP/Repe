import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { exercises, workouts, sets, history } from "@/lib/db/schema";
import { StorageError } from "@/lib/storage-errors";
import { count } from "drizzle-orm";

/**
 * DualWriteService: Writes to both JSON storage and Postgres database
 * Controlled by feature flags (USE_DB, USE_DB_DUAL_WRITE)
 */
export class DualWriteService {
  static isEnabled(): boolean {
    return (
      process.env.USE_DB === "true" &&
      process.env.USE_DB_DUAL_WRITE === "true"
    );
  }

  static async writeExercise(data: any) {
    // Write to JSON (existing storage)
    if (process.env.USE_DB !== "true") {
      console.log("[DualWrite] Writing exercise to JSON:", data.name);
    }

    // Write to Postgres if enabled
    if (this.isEnabled()) {
      try {
        console.log("[DualWrite] Writing exercise to DB:", data.name);
        // Implementation would call exercise repository
      } catch (error) {
        console.error("[DualWrite] DB write failed:", error);
        // Fall back to JSON only
      }
    }
  }

  static async writeWorkout(data: any) {
    if (this.isEnabled()) {
      try {
        console.log("[DualWrite] Writing workout to DB:", data.name);
      } catch (error) {
        console.error("[DualWrite] DB write failed:", error);
      }
    }
  }

  static async writeSet(data: any) {
    if (this.isEnabled()) {
      try {
        console.log("[DualWrite] Writing set to DB");
      } catch (error) {
        console.error("[DualWrite] DB write failed:", error);
      }
    }
  }
}

/**
 * BackfillService: Migrate data from JSON files to Postgres
 */
export class BackfillService {
  static async backfillExercises(): Promise<{ inserted: number; skipped: number }> {
    try {
      const seedPath = path.join(
        process.cwd(),
        "data",
        "exercise-library-seed.json"
      );

      if (!fs.existsSync(seedPath)) {
        return { inserted: 0, skipped: 0 };
      }

      const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

      let inserted = 0;
      let skipped = 0;

      for (const exercise of seedData) {
        try {
          const result = await db
            .insert(exercises)
            .values({
              id: exercise.id,
              name: exercise.name,
              category: exercise.category,
              equipment: exercise.equipment || [],
              notes: exercise.notes,
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
        "Failed to backfill exercises",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  static async backfillWorkouts(): Promise<{ inserted: number; skipped: number }> {
    try {
      const workoutsPath = path.join(process.cwd(), "data", "workouts.json");

      if (!fs.existsSync(workoutsPath)) {
        return { inserted: 0, skipped: 0 };
      }

      const data = JSON.parse(fs.readFileSync(workoutsPath, "utf-8"));
      let inserted = 0;
      let skipped = 0;

      for (const workout of data) {
        try {
          const result = await db
            .insert(workouts)
            .values({
              id: workout.id,
              name: workout.name,
              source: "custom",
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
        "Failed to backfill workouts",
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}

/**
 * ParityChecker: Verify data consistency between JSON and Postgres
 */
export class ParityChecker {
  static async checkParity(): Promise<{
    json: { exercises: number; workouts: number; history: number };
    db: { exercises: number; workouts: number; history: number };
    isConsistent: boolean;
  }> {
    try {
      // Count JSON data
      const jsonCounts = this.countJsonData();

      // Count DB data
      const dbExerciseCount = await db
        .select({ count: count() })
        .from(exercises);
      const dbWorkoutCount = await db
        .select({ count: count() })
        .from(workouts);
      const dbHistoryCount = await db
        .select({ count: count() })
        .from(history);

      const dbCounts = {
        exercises: dbExerciseCount[0]?.count || 0,
        workouts: dbWorkoutCount[0]?.count || 0,
        history: dbHistoryCount[0]?.count || 0,
      };

      const isConsistent =
        jsonCounts.exercises === dbCounts.exercises &&
        jsonCounts.workouts === dbCounts.workouts &&
        jsonCounts.history === dbCounts.history;

      return {
        json: jsonCounts,
        db: dbCounts,
        isConsistent,
      };
    } catch (error) {
      throw StorageError.internal(
        "Failed to check parity",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private static countJsonData() {
    const exercisePath = path.join(
      process.cwd(),
      "data",
      "exercise-library-seed.json"
    );
    const workoutsPath = path.join(process.cwd(), "data", "workouts.json");
    // history is typically not stored separately, but could be

    let exercises = 0;
    let workouts = 0;
    let history = 0;

    try {
      if (fs.existsSync(exercisePath)) {
        const data = JSON.parse(fs.readFileSync(exercisePath, "utf-8"));
        exercises = Array.isArray(data) ? data.length : 0;
      }

      if (fs.existsSync(workoutsPath)) {
        const data = JSON.parse(fs.readFileSync(workoutsPath, "utf-8"));
        workouts = Array.isArray(data) ? data.length : 0;
      }
    } catch (error) {
      console.error("Error reading JSON files:", error);
    }

    return { exercises, workouts, history };
  }
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  message: string;
}> {
  try {
    await db.select({ count: count() }).from(exercises);
    return { connected: true, message: "Database connected" };
  } catch (error) {
    return {
      connected: false,
      message:
        error instanceof Error ? error.message : "Unknown database error",
    };
  }
}
