import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  numeric,
  index,
  jsonb,
  unique,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Exercises table
export const exercises = pgTable(
  'exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    equipment: text('equipment').array().notNull().default(sql`ARRAY[]::text[]`),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: text('created_by'),
  },
  (table) => ({
    nameIdx: index('exercises_name_idx').on(sql`lower(${table.name})`),
    categoryIdx: index('exercises_category_idx').on(table.category),
    nameUniqueIdx: unique('exercises_name_unique').on(table.name),
  })
);

// Workouts table
export const workouts = pgTable(
  'workouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    userId: text('user_id'),
    source: text('source').notNull().default('custom'),
  },
  (table) => ({
    userIdx: index('workouts_user_idx').on(table.userId),
    createdIdx: index('workouts_created_idx').on(sql`${table.createdAt} DESC`),
  })
);

// Workout exercises pivot table
export const workoutExercises = pgTable(
  'workout_exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workoutId: uuid('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    orderIndex: integer('order_index').notNull(),
    targetSets: integer('target_sets'),
    targetReps: integer('target_reps'),
    targetWeight: numeric('target_weight', { precision: 8, scale: 2 }),
  },
  (table) => ({
    workoutIdIdx: index('workout_exercises_workout_idx').on(table.workoutId),
    exerciseIdIdx: index('workout_exercises_exercise_idx').on(table.exerciseId),
    orderUniqueIdx: unique('workout_exercises_order_unique').on(table.workoutId, table.orderIndex),
  })
);

// Sets table
export const sets = pgTable(
  'sets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workoutExerciseId: uuid('workout_exercise_id')
      .notNull()
      .references(() => workoutExercises.id, { onDelete: 'cascade' }),
    performedAt: timestamp('performed_at', { withTimezone: true }).notNull().defaultNow(),
    reps: integer('reps').notNull(),
    weight: numeric('weight', { precision: 8, scale: 2 }),
    rpe: numeric('rpe', { precision: 3, scale: 1 }),
    restSeconds: integer('rest_seconds'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    workoutExerciseIdx: index('sets_workout_exercise_idx').on(table.workoutExerciseId),
    performedIdx: index('sets_performed_idx').on(sql`${table.performedAt} DESC`),
    repsCheck: check('reps_check', sql`${table.reps} >= 0`),
    weightCheck: check('weight_check', sql`${table.weight} >= 0`),
    rpeCheck: check('rpe_check', sql`${table.rpe} >= 0 AND ${table.rpe} <= 10`),
    restCheck: check('rest_check', sql`${table.restSeconds} >= 0`),
  })
);

// History table
export const history = pgTable(
  'history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workoutId: uuid('workout_id')
      .references(() => workouts.id, { onDelete: 'set null' }),
    performedAt: timestamp('performed_at', { withTimezone: true }).notNull(),
    durationSeconds: integer('duration_seconds'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    performedIdx: index('history_performed_idx').on(sql`${table.performedAt} DESC`),
    workoutIdx: index('history_workout_idx').on(table.workoutId),
    durationCheck: check('duration_check', sql`${table.durationSeconds} >= 0`),
  })
);

// User settings table
export const userSettings = pgTable(
  'user_settings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    units: text('units').notNull().default('metric'),
    preferencesJson: jsonb('preferences_json').notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    userId: text('user_id'),
  },
  (table) => ({
    userIdx: index('user_settings_user_idx').on(table.userId),
  })
);

// Type exports for use in repositories
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;

export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;

export type History = typeof history.$inferSelect;
export type NewHistory = typeof history.$inferInsert;

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
