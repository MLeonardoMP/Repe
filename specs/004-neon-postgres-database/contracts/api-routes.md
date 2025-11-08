# API Contracts: Neon Postgres Migration

All route handlers live under `src/app/api/**/route.ts` using the Next.js App Router. Runtime defaults to `nodejs` to leverage the Neon serverless driver. All responses use JSON (`application/json; charset=utf-8`). Errors follow the structure `{ "error": { "code": string, "message": string } }`.

## Endpoint Summary

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/exercises` | Lista ejercicios con filtros opcionales | n/a |
| POST | `/api/exercises` | Crea ejercicio personalizado | n/a |
| GET | `/api/workouts` | Lista workouts con ejercicios asociados | n/a |
| POST | `/api/workouts` | Crea/actualiza workout + ejercicios asociados | n/a |
| GET | `/api/workouts/{id}` | Obtiene workout con sets/historial reciente | n/a |
| POST | `/api/workouts/{id}/sets` | Añade set a workout activo | n/a |
| PATCH | `/api/sets/{id}` | Actualiza set existente (peso, reps, notas) | n/a |
| DELETE | `/api/sets/{id}` | Elimina set | n/a |
| GET | `/api/history` | Historial paginado por fecha | n/a |
| POST | `/api/migration/verify` | Ejecuta verificación de paridad JSON vs DB (solo dev) | protegida vía `VERCEL_ENV` check |

## GET `/api/exercises`
- **Query params**:
  - `search` (string, optional) → aplica `ILIKE '%search%'`
  - `category` (string, optional)
  - `limit` (int, default 50, max 100)
  - `offset` (int, default 0)
- **Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Bench Press",
      "category": "strength",
      "equipment": ["barbell"],
      "notes": "",
      "createdAt": "2025-11-07T18:32:00Z"
    }
  ],
  "paging": { "total": 240, "limit": 50, "offset": 0 }
}
```
- **Errors**: 400 (limit/offset inválidos, validación Zod), 500 (fallo DB)

## POST `/api/exercises`
- **Body** (`application/json`):
```json
{
  "name": "Nordic Curl",
  "category": "strength",
  "equipment": ["bodyweight"],
  "notes": "Optional"
}
```
- **Validation**: Zod `name` 1-120 chars, `category` existente, `equipment` <= 5 tags.
- **Response 201**: ejercicio creado con timestamps.
- **Side effects**: Invalidar `revalidateTag('exercises')`.

## GET `/api/workouts`
- **Query params**: `limit`, `offset`, `includeHistory` (bool) → si true, adjunta último registro de `history` por workout.
- **Response 200**: array de workouts con `exercises` anidados (sin sets).
- **Notes**: Controlar N+1 con `LEFT JOIN` + `array_agg` o 2 queries controladas.

## POST `/api/workouts`
- **Body**:
```json
{
  "id": "uuid | null",
  "name": "Push Day",
  "exercises": [
    {
      "exerciseId": "uuid",
      "order": 0,
      "targetSets": 3,
      "targetReps": 10,
      "targetWeight": 70.5
    }
  ]
}
```
- **Behavior**:
  - Si `id` null → crear workout y relaciones.
  - Si `id` existe → `UPSERT` con transacción: actualizar nombre, reordenar ejercicios (DELETE + INSERT con preservación de sets existentes).
- **Response 200/201**: workout persistido.
- **Errors**: 409 si se intenta duplicar `order` en payload (validación previa); 422 si faltan ejercicios.

## GET `/api/workouts/{id}`
- **Path params**: `id` (uuid)
- **Response 200**:
```json
{
  "id": "uuid",
  "name": "Push Day",
  "exercises": [
    {
      "id": "uuid",
      "order": 0,
      "exercise": { "id": "uuid", "name": "Bench Press" },
      "sets": [
        { "id": "uuid", "reps": 10, "weight": 70.5, "rpe": 8, "performedAt": "2025-11-07T18:40:00Z" }
      ]
    }
  ],
  "history": [
    { "id": "uuid", "performedAt": "2025-11-06T17:00:00Z", "durationSeconds": 3600 }
  ]
}
```
- **Errors**: 404 si workout no existe.

## POST `/api/workouts/{id}/sets`
- **Body**:
```json
{
  "workoutExerciseId": "uuid",
  "reps": 8,
  "weight": 72.5,
  "rpe": 8.5,
  "restSeconds": 120,
  "notes": "felt strong"
}
```
- **Behavior**:
  - Verificar que `workoutExerciseId` pertenezca al workout.
  - Insertar set y retornar estado actualizado.
  - Invalidar tags `workout:{id}`, `history`.
- **Response 201**: set creado con `performedAt`.

## PATCH `/api/sets/{id}`
- **Body**: campos parciales (`reps`, `weight`, `rpe`, `notes`, `restSeconds`).
- **Behavior**: Actualización parcial; recalcular `updated_at` y devolver registro completo.
- **Response 200**.
- **Errors**: 404 si no existe; 409 si se intenta reducir `reps` a valor negativo.

## DELETE `/api/sets/{id}`
- **Behavior**: Soft delete vs hard delete (decisión: hard delete, cascada natural) + invalidación de caches.
- **Response 204**.

## GET `/api/history`
- **Query params**: `from`, `to` (ISO strings opcionales), `limit` (default 20), `cursor` (UUID + timestamp para paginación keyset).
- **Response 200**: lista de entradas ordenadas descendentemente, con workout asociado (`id`, `name`).
- **Performance**: Usar índice `(performed_at DESC)` y `WHERE performed_at < cursorTimestamp` para keyset.

## POST `/api/migration/verify`
- **Uso**: Solo en entornos `development` o `preview`.
- **Body**: `{ "maxRecords": 100 }` (opcional) limita sample.
- **Proceso**:
  1. Lee datos desde JSON legacy.
  2. Consulta DB y compara `id`, `counts`, `hash` de payload.
  3. Devuelve summary.
- **Response 200**:
```json
{
  "status": "ok",
  "mismatches": [],
  "jsonCount": { "exercises": 180, "workouts": 42 },
  "dbCount": { "exercises": 180, "workouts": 42 }
}
```
- **Errors**: 503 si la verificación excede tiempo configurado (timeout 20s).

## Error Codes
- `BAD_REQUEST`: validaciones Zod fallidas.
- `NOT_FOUND`: recurso no existe.
- `CONFLICT`: payload inconsistente (duplicados, reorden no válido).
- `INTERNAL_ERROR`: fallback general; log estructurado con `requestId`.
- `SERVICE_UNAVAILABLE`: DB no accesible o verificación inhabilitada.

## Runtime & Caching Guidelines
- Exportar `export const runtime = 'nodejs';` en rutas críticas.
- Para listados (`/api/exercises`, `/api/history`), usar `cache: 'no-store'` y `revalidateTag` manual.
- Mantener responses serializables (sin tipos Date directos, usar ISO string).
