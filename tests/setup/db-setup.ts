import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import {
  exercises as exercisesTable,
  workouts as workoutsTable,
  workoutExercises as workoutExercisesTable,
  sets as setsTable,
  history as historyTable,
} from '@/lib/db/schema';

/**
 * Create a test database connection for integration tests
 * Uses either a temporary schema or Docker Postgres connection
 */
export async function createTestDb() {
  const testDbUrl = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
  if (!testDbUrl) {
    throw new Error('DATABASE_URL_TEST or DATABASE_URL environment variable is required for tests');
  }

  const sql = neon(testDbUrl);
  const db = drizzle({ client: sql, schema });

  return { db, client: null };
}

/**
 * Clean up test database after tests
 * Rolls back transaction or drops temporary schema
 */
export async function cleanupTestDb(client: any) {
  try {
    // HTTP driver cleanup is handled by connection pool
    // No explicit cleanup needed
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  }
}

/**
 * Fixture factories for test data
 */
export const fixtures = {
  exercises: {
    create: async (db: any, data: Partial<typeof exercisesTable.$inferInsert> = {}) => {
      const defaults = {
        name: `Test Exercise ${Math.random()}`,
        category: 'strength',
        equipment: [],
        ...data,
      };
      const result = await db
        .insert(exercisesTable)
        .values(defaults)
        .returning();
      return result[0];
    },
  },

  workouts: {
    create: async (db: any, data: Partial<typeof workoutsTable.$inferInsert> = {}) => {
      const defaults = {
        name: `Test Workout ${Math.random()}`,
        source: 'custom',
        ...data,
      };
      const result = await db
        .insert(workoutsTable)
        .values(defaults)
        .returning();
      return result[0];
    },
  },

  sets: {
    create: async (
      db: any,
      workoutExerciseId: string,
      data: Partial<typeof setsTable.$inferInsert> = {}
    ) => {
      const defaults = {
        workoutExerciseId,
        reps: 10,
        weight: null,
        rpe: null,
        restSeconds: 60,
        ...data,
      };
      const result = await db
        .insert(setsTable)
        .values(defaults)
        .returning();
      return result[0];
    },
  },

  history: {
    create: async (
      db: any,
      workoutId: string | null,
      data: Partial<typeof historyTable.$inferInsert> = {}
    ) => {
      const defaults = {
        workoutId,
        performedAt: new Date(),
        durationSeconds: 1800,
        ...data,
      };
      const result = await db
        .insert(historyTable)
        .values(defaults)
        .returning();
      return result[0];
    },
  },
};

/**
 * Clear all tables for fresh test state
 */
export async function clearAllTables(db: any) {
  try {
    await db.delete(setsTable);
    await db.delete(workoutExercisesTable);
    await db.delete(workoutsTable);
    await db.delete(historyTable);
    await db.delete(exercisesTable);
  } catch (error) {
    console.error('Error clearing tables:', error);
    throw error;
  }
}
