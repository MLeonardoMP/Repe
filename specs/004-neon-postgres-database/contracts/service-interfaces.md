# Service Interfaces: Neon Postgres Repositories

Las capas de servicio estarán en `src/lib/db/repos/**`. Cada repositorio expone funciones puramente asincrónicas que devuelven objetos tipados (utilizando tipos de `src/types`). Las funciones deben ejecutarse en el servidor y nunca importarse en Client Components.

## ExerciseRepository

| Método | Firma | Descripción |
|--------|-------|-------------|
| `listExercises` | `listExercises(params: { search?: string; category?: string; limit?: number; offset?: number }): Promise<{ data: Exercise[]; total: number }>` | Aplica filtros y paginación usando SQL dinámico controlado. |
| `createExercise` | `createExercise(input: NewExercise): Promise<Exercise>` | Inserta ejercicio personalizado; valida unicidad (`lower(name)`). |
| `getExerciseById` | `getExerciseById(id: UUID): Promise<Exercise | null>` | Lookup simple. |
| `bulkSeedExercises` | `bulkSeedExercises(exercises: NewExerciseSeed[]): Promise<number>` | Inserta seeds idempotentes con `ON CONFLICT DO NOTHING`. |

**Errores**: Lanza `StorageError` (en `src/lib/storage-errors.ts`) con códigos `VALIDATION`, `CONFLICT`, `NOT_FOUND`, `INTERNAL`.

## WorkoutRepository

| Método | Firma | Descripción |
|--------|-------|-------------|
| `listWorkouts` | `listWorkouts(params: { limit?: number; offset?: number; includeHistory?: boolean }): Promise<WorkoutWithExercises[]>` | Devuelve workouts con sus `workoutExercises`. |
| `getWorkout` | `getWorkout(id: UUID): Promise<WorkoutDetail>` | Incluye sets actuales y últimos históricos. |
| `upsertWorkout` | `upsertWorkout(input: UpsertWorkoutPayload): Promise<WorkoutDetail>` | Ejecuta transacción: crea/actualiza workout y reorganiza ejercicios preservando sets. |
| `deleteWorkout` | `deleteWorkout(id: UUID): Promise<void>` | Opcional (no se usa en v1, pero se documenta). |

**Notas**:
- `UpsertWorkoutPayload` contiene arrays de ejercicios con orden; se normaliza dentro de la transacción.
- Uso de `db.transaction(async (tx) => { ... })` para asegurar atomicidad.

## WorkoutExerciseRepository (interno)
- `attachExercises(workoutId, payload[])`
- `reorderExercises(workoutId, payload[])`
- `detachMissingExercises(workoutId, keepIds[])`

Este repositorio opera dentro de transacciones iniciadas por `WorkoutRepository`.

## SetRepository

| Método | Firma | Descripción |
|--------|-------|-------------|
| `addSet` | `addSet(input: NewSetPayload): Promise<Set>` | Inserta set y recalcula totales opcionales. |
| `updateSet` | `updateSet(id: UUID, patch: Partial<SetUpdate>): Promise<Set>` | Actualiza campos con validación de límites. |
| `deleteSet` | `deleteSet(id: UUID): Promise<void>` | Hard delete. |
| `listSetsByWorkout` | `listSetsByWorkout(workoutId: UUID): Promise<Set[]>` | Utilizado por vistas de detalle. |

## HistoryRepository

| Método | Firma | Descripción |
|--------|-------|-------------|
| `logSession` | `logSession(input: NewHistoryEntry): Promise<History>` | Registra sesión finalizada; se usa durante cutover. |
| `listHistory` | `listHistory(params: { cursor?: HistoryCursor; limit?: number; from?: Date; to?: Date }): Promise<HistoryPage>` | Paginación keyset. |
| `backfillHistory` | `backfillHistory(entries: LegacyHistoryEntry[]): Promise<BackfillResult>` | Inserción por lotes con `ON CONFLICT DO NOTHING`. |

## PreferenceRepository

| Método | Firma | Descripción |
|--------|-------|-------------|
| `getPreferences` | `getPreferences(userId?: string): Promise<UserSettings | null>` |
| `savePreferences` | `savePreferences(input: UserSettingsInput): Promise<UserSettings>` |

## MigrationServices

| Servicio | Función |
|----------|---------|
| `DualWriteService` | Intercepta mutaciones (set/workout/exercise) y ejecuta JSON + DB cuando `USE_DB_DUAL_WRITE=true`. |
| `BackfillService` | Lee archivos `data/*.json`, normaliza y llama a repositorios. |
| `ParityChecker` | Compara conteos y hashes entre JSON y Postgres, expone resultados.

## Error Handling Contract
- Todas las funciones lanzan `StorageError` con forma `{ type: 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL', cause?: unknown }`.
- Las capas superiores (Server Actions/API) traducen a códigos HTTP y mensajes amigables.

## Observability Hooks
- Incluir utilidades `logDbEvent({ entity, action, durationMs, success })` para instrumentación ligera.
- Integrar con consola/Logflare en producción (solo si `process.env.LOG_LEVEL !== 'silent'`).
