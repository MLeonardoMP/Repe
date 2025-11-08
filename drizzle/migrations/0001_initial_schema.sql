CREATE TABLE IF NOT EXISTS "exercises" (
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
"name" text NOT NULL,
"category" text NOT NULL,
"equipment" text[] DEFAULT ARRAY[]::text[] NOT NULL,
"notes" text,
"created_at" timestamp with time zone DEFAULT now() NOT NULL,
"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
"created_by" text,
CONSTRAINT "exercises_name_unique" UNIQUE("name")
);

CREATE INDEX "exercises_name_idx" ON "exercises" (lower("name"));
CREATE INDEX "exercises_category_idx" ON "exercises" ("category");

CREATE TABLE IF NOT EXISTS "workouts" (
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
"name" text NOT NULL,
"created_at" timestamp with time zone DEFAULT now() NOT NULL,
"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
"user_id" text,
"source" text DEFAULT 'custom' NOT NULL
);

CREATE INDEX "workouts_user_idx" ON "workouts" ("user_id");
CREATE INDEX "workouts_created_idx" ON "workouts" ("created_at" DESC);

CREATE TABLE IF NOT EXISTS "workout_exercises" (
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
"workout_id" uuid NOT NULL,
"exercise_id" uuid NOT NULL,
"order_index" integer NOT NULL,
"target_sets" integer,
"target_reps" integer,
"target_weight" numeric(8, 2),
CONSTRAINT "workout_exercises_order_unique" UNIQUE("workout_id", "order_index")
);

CREATE INDEX "workout_exercises_workout_idx" ON "workout_exercises" ("workout_id");
CREATE INDEX "workout_exercises_exercise_idx" ON "workout_exercises" ("exercise_id");

ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE cascade;
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE restrict;

CREATE TABLE IF NOT EXISTS "sets" (
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
"workout_exercise_id" uuid NOT NULL,
"performed_at" timestamp with time zone DEFAULT now() NOT NULL,
"reps" integer NOT NULL,
"weight" numeric(8, 2),
"rpe" numeric(3, 1),
"rest_seconds" integer,
"notes" text,
"created_at" timestamp with time zone DEFAULT now() NOT NULL,
CONSTRAINT "reps_check" CHECK ("reps" >= 0),
CONSTRAINT "weight_check" CHECK ("weight" >= 0),
CONSTRAINT "rpe_check" CHECK ("rpe" >= 0 AND "rpe" <= 10),
CONSTRAINT "rest_check" CHECK ("rest_seconds" >= 0)
);

CREATE INDEX "sets_workout_exercise_idx" ON "sets" ("workout_exercise_id");
CREATE INDEX "sets_performed_idx" ON "sets" ("performed_at" DESC);

ALTER TABLE "sets" ADD CONSTRAINT "sets_workout_exercise_id_workout_exercises_id_fk" FOREIGN KEY ("workout_exercise_id") REFERENCES "workout_exercises"("id") ON DELETE cascade;

CREATE TABLE IF NOT EXISTS "history" (
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
"workout_id" uuid,
"performed_at" timestamp with time zone NOT NULL,
"duration_seconds" integer,
"notes" text,
"created_at" timestamp with time zone DEFAULT now() NOT NULL,
CONSTRAINT "duration_check" CHECK ("duration_seconds" >= 0)
);

CREATE INDEX "history_performed_idx" ON "history" ("performed_at" DESC);
CREATE INDEX "history_workout_idx" ON "history" ("workout_id");

ALTER TABLE "history" ADD CONSTRAINT "history_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE set null;

CREATE TABLE IF NOT EXISTS "user_settings" (
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
"units" text DEFAULT 'metric' NOT NULL,
"preferences_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
"created_at" timestamp with time zone DEFAULT now() NOT NULL,
"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
"user_id" text
);

CREATE INDEX "user_settings_user_idx" ON "user_settings" ("user_id");
