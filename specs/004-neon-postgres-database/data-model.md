# Data Model: Neon Postgres Migration

## Overview
El modelo relacional traslada la estructura existente en JSON a Postgres manteniendo UUIDs, timestamps y relaciones explícitas. Todos los registros usan `timestamptz` para soportar zonas horarias y `uuid` como PK. Se contemplan índices para las consultas más frecuentes (orden cronológico, lookup por workout, catálogo de ejercicios).

## exercises
**Propósito**: Catálogo de ejercicios disponibles (seed + personalizados).

| Campo | Tipo SQL | Restricciones | Notas |
|-------|----------|---------------|-------|
| id | uuid | PK, `DEFAULT gen_random_uuid()` | Conserva id JSON existente |
| name | text | NOT NULL, UNIQUE por usuario + nombre opcional en futuro | Normalizado a lowercase para búsquedas |
| category | text | NOT NULL | Ej. `strength`, `cardio`, `mobility` |
| equipment | text[] | NOT NULL DEFAULT '{}' | Se almacenan tags de equipamiento |
| notes | text | NULL | Descripciones opcionales |
| created_at | timestamptz | NOT NULL DEFAULT now() | Fecha de creación |
| updated_at | timestamptz | NOT NULL DEFAULT now() | Trigger para updates |
| created_by | text | NULL | Reservado para multiusuario futuro |

**Índices**:
- `CREATE INDEX exercises_name_idx ON exercises (lower(name));`
- `CREATE INDEX exercises_category_idx ON exercises (category);`

**Relaciones**: Referenciado por `workout_exercises.exercise_id`.

**Drizzle Sketch**:
```ts
export const exercises = pgTable('exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  equipment: textArray('equipment').notNull().default(sql`ARRAY[]::text[]`),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: text('created_by')
}, (table) => ({
  nameIdx: index('exercises_name_idx').on(sql`lower(${table.name})`),
  categoryIdx: index('exercises_category_idx').on(table.category)
}));
```

## workouts
**Propósito**: Representa rutinas guardadas o sesiones planificadas.

| Campo | Tipo SQL | Restricciones | Notas |
|-------|----------|---------------|-------|
| id | uuid | PK | UUID existente |
| name | text | NOT NULL | Nombre visible |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |
| user_id | text | NULL | Placeholder multiusuario |
| source | text | NOT NULL DEFAULT 'custom' | Permite distinguir plantillas | 

**Índices**:
- `CREATE INDEX workouts_user_idx ON workouts (user_id);`
- `CREATE INDEX workouts_created_idx ON workouts (created_at DESC);`

**Relaciones**: Uno a muchos con `workout_exercises`, `history`.

## workout_exercises
**Propósito**: Tabla pivote que define la secuencia de ejercicios por workout.

| Campo | Tipo SQL | Restricciones | Notas |
|-------|----------|---------------|-------|
| id | uuid | PK |
| workout_id | uuid | NOT NULL FK → workouts(id) ON DELETE CASCADE |
| exercise_id | uuid | NOT NULL FK → exercises(id) ON DELETE RESTRICT |
| order_index | integer | NOT NULL | Orden 0-based |
| target_sets | integer | NULL | Número sugerido de sets |
| target_reps | integer | NULL | Media sugerida |
| target_weight | numeric(8,2) | NULL | Peso sugerido |

**Índices**:
- `CREATE UNIQUE INDEX workout_exercises_order_idx ON workout_exercises (workout_id, order_index);`
- `CREATE INDEX workout_exercises_exercise_idx ON workout_exercises (exercise_id);`

## sets
**Propósito**: Registro granular de rendimiento.

| Campo | Tipo SQL | Restricciones | Notas |
|-------|----------|---------------|-------|
| id | uuid | PK |
| workout_exercise_id | uuid | NOT NULL FK → workout_exercises(id) ON DELETE CASCADE |
| performed_at | timestamptz | NOT NULL DEFAULT now() | Timestamp de registro |
| reps | integer | NOT NULL CHECK (reps >= 0) |
| weight | numeric(8,2) | NULL CHECK (weight >= 0) |
| rpe | numeric(3,1) | NULL CHECK (rpe BETWEEN 0 AND 10) |
| rest_seconds | integer | NULL |
| notes | text | NULL |
| created_at | timestamptz | NOT NULL DEFAULT now() |

**Índices**:
- `CREATE INDEX sets_workout_exercise_idx ON sets (workout_exercise_id);`
- `CREATE INDEX sets_performed_idx ON sets (performed_at DESC);`

## history
**Propósito**: Historial de sesiones completadas.

| Campo | Tipo SQL | Restricciones | Notas |
|-------|----------|---------------|-------|
| id | uuid | PK |
| workout_id | uuid | NOT NULL FK → workouts(id) ON DELETE SET NULL | Permite conservar historial aunque se borre workout |
| performed_at | timestamptz | NOT NULL | Inicio de la sesión |
| duration_seconds | integer | NULL CHECK (duration_seconds >= 0) |
| notes | text | NULL |
| created_at | timestamptz | NOT NULL DEFAULT now() |

**Índices**:
- `CREATE INDEX history_performed_idx ON history (performed_at DESC);`
- `CREATE INDEX history_workout_idx ON history (workout_id);`

## user_settings
**Propósito**: Preferencias por dispositivo/usuario.

| Campo | Tipo SQL | Restricciones | Notas |
|-------|----------|---------------|-------|
| id | uuid | PK |
| units | text | NOT NULL DEFAULT 'metric' | `'metric' | 'imperial'` |
| preferences_json | jsonb | NOT NULL DEFAULT '{}'::jsonb | Configuración adicional |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |
| user_id | text | NULL | Compatibilidad futuro |

**Índices**:
- `CREATE INDEX user_settings_user_idx ON user_settings (user_id);`

## Backfill & Data Parity Notes
- Mantener mapa `legacyId → newId` en memoria para verificar datos; como se conservan UUIDs, solo se valida existencia.
- Pre-cargar `exercises` con seed derivado de `data/exercise-library-seed.json` antes de copiar sets/historial.
- Backfill por lotes (por ejemplo, 100 registros) para reducir memoria; confirmar totales tras cada tabla.
- Scripts de verificación comparan conteos e ID lists (`SELECT count(*)`, `SELECT id ORDER BY id`) entre JSON y Postgres.

## Validation Rules Summary
- `name` de ejercicios y workouts <= 120 caracteres; usar validaciones Zod.
- `weight`, `rpe`, `duration_seconds` deben ser ≥ 0.
- `order_index` consecutivo sin gaps (validar en repositorio o constraint `EXCLUDE` si se requiere strictez futura).
- `preferences_json` debe validar contra esquema Zod actual (p.ej., unidades, timers, toggles).

## Migration Scripts Checklist
1. Crear extensiones necesarias (`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` y `pgcrypto` para `gen_random_uuid`).
2. Generar migración inicial con todas las tablas e índices.
3. Añadir migración para triggers `updated_at` si se requiere.
4. Scripts de seed/backfill separados para producción y previews.
