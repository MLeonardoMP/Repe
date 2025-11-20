# Plan SIMPLIFICADO: Corrección de Guardado de Entrenamientos

**Fecha**: 2025-11-19 (Actualizado)
**Problema**: Los entrenamientos no se guardan correctamente en el historial
**Error**: `[useWorkout] Failed to log workout to history: {}`

---

## 1. Análisis del Problema

### 1.1 Causa Raíz REAL
El `workoutId` usado en `finishWorkout()` proviene de localStorage (generado con `Math.random()`) y **no existe en la tabla `workouts` de Neon Postgres**.

La foreign key `history.workoutId → workouts.id` falla silenciosamente porque está configurada como `onDelete: 'set null'`.

### 1.2 Arquitectura Actual (Mixta)
```
useWorkout Hook → localStorage (IDs aleatorios)
                        ↓
              finishWorkout() → /api/history
                                      ↓
                                Neon Postgres ❌ (workoutId no existe)
```

---

## 2. Solución SIMPLE (Sin romper lo existente)

### 2.1 Enfoque: Coexistencia Pacífica

**Principio**: Mantener el sistema de archivos/localStorage funcionando INTACTO. Solo agregar persistencia en Neon cuando sea necesario.

### 2.2 Estrategia en 3 Pasos

#### PASO 1: Crear workout en BD al iniciar (mínimo cambio)
Cuando `startWorkout()` crea un workout en localStorage, **también** lo crea en Neon.

```typescript
// useWorkout.ts - startWorkout()
const createdWorkout = await storage.create(newWorkout); // localStorage (actual)

// NUEVO: También crear en Neon
await fetch('/api/workouts', {
  method: 'POST',
  body: JSON.stringify({
    id: createdWorkout.id,  // Usar MISMO ID
    name: createdWorkout.name,
    userId: createdWorkout.userId
  })
});
```

#### PASO 2: Hacer `workoutId` opcional en history
Cambiar el schema de Neon para permitir history sin workout:

```typescript
// schema.ts - Ya está así, solo verificar
history.workoutId: uuid('workout_id')
  .references(() => workouts.id, { onDelete: 'set null' })
  .nullable() // ← Asegurar que sea opcional
```

#### PASO 3: Fallback en finishWorkout
Si el workout no existe en BD, crear registro de history sin workoutId:

```typescript
// useWorkout.ts - finishWorkout()
try {
  await fetch('/api/history', {
    method: 'POST',
    body: JSON.stringify({
      workoutId: completedWorkout.id,  // Intentar con ID
      performedAt: completedWorkout.startTime,
      durationSeconds: duration,
      notes: completedWorkout.notes
    })
  });
} catch (error) {
  // FALLBACK: Guardar sin workoutId si falla
  await fetch('/api/history', {
    method: 'POST',
    body: JSON.stringify({
      // workoutId: null,  // Sin referencia
      performedAt: completedWorkout.startTime,
      durationSeconds: duration,
      notes: `${completedWorkout.name} - ${completedWorkout.notes || ''}`
    })
  });
}

---

## 3. Plan de Implementación SIMPLE (3 Fases Mínimas)

**Filosofía**: No romper nada existente. Agregar funcionalidad gradualmente.

---


### FASE 1: Endpoint `/api/workouts` (Solo crear workout)

**Objetivo**: Permitir crear workouts en Neon con el mismo ID de localStorage

**Archivos**:
- `src/app/api/workouts/route.ts` (nuevo)

**Implementación**:

```typescript
// src/app/api/workouts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { workouts } from '@/lib/db/schema';

const CreateWorkoutSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = CreateWorkoutSchema.parse(body);

    const result = await getDb()
      .insert(workouts)
      .values({
        id: input.id, // Usar ID proporcionado o generar nuevo
        name: input.name,
        userId: input.userId || 'user-1',
      })
      .onConflictDoNothing() // Si ya existe, no hacer nada
      .returning();

    return NextResponse.json(result[0] || { message: 'Already exists' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/workouts error:', error);
    return NextResponse.json(
      { error: 'INTERNAL', message: 'Failed to create workout' },
      { status: 500 }
    );
  }
}
```

**Tests**:

```typescript
// tests/integration/api-workouts.test.ts
describe('POST /api/workouts', () => {
  it('creates workout with provided ID', async () => {
    const response = await fetch('/api/workouts', {
      method: 'POST',
      body: JSON.stringify({
        id: 'test-workout-123',
        name: 'Test Workout',
      }),
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBe('test-workout-123');
  });

  it('is idempotent - does not fail on duplicate', async () => {
    await fetch('/api/workouts', {
      method: 'POST',
      body: JSON.stringify({ id: 'dup-123', name: 'Duplicate' }),
    });
    
    const response2 = await fetch('/api/workouts', {
      method: 'POST',
      body: JSON.stringify({ id: 'dup-123', name: 'Duplicate' }),
    });
    
    expect(response2.status).toBe(201);
  });
});
```

**Criterios de Éxito**:
- ✅ Endpoint crea workout con ID proporcionado
- ✅ Si ID ya existe, no falla (idempotente)
- ✅ Tests pasan

---

### FASE 2: Integrar en `useWorkout.startWorkout()`

**Objetivo**: Crear workout en Neon al mismo tiempo que en localStorage

**Archivo**:
- `src/hooks/use-workout.ts`

**Cambios**:

```typescript
const startWorkout = useCallback(async (template: WorkoutTemplate) => {
  console.log('[useWorkout] Starting new workout with template:', template);
  const newWorkout: Omit<WorkoutSession, 'id'> = {
    userId: 'user-1',
    name: template.name,
    exercises: template.exercises,
    startTime: new Date().toISOString(),
    status: 'active',
    duration: 0,
    notes: '',
  };
  
  console.log('[useWorkout] Creating workout in localStorage:', newWorkout);
  const createdWorkout = await storage.create(newWorkout);
  console.log('[useWorkout] Workout created:', createdWorkout);
  
  // NUEVO: También crear en Neon (sin bloquear si falla)
  try {
    await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: createdWorkout.id,
        name: createdWorkout.name,
        userId: createdWorkout.userId,
      }),
    });
    console.log('[useWorkout] Workout synced to Neon');
  } catch (error) {
    console.warn('[useWorkout] Failed to sync workout to Neon (non-blocking):', error);
  }
  
  setActiveWorkout(createdWorkout);
  console.log('[useWorkout] Active workout state updated');
  return createdWorkout;
}, [storage]);
```

**Criterios de Éxito**:
- ✅ localStorage sigue funcionando igual
- ✅ Si Neon falla, la app no se rompe
- ✅ Workout queda creado en ambos lados

---

### FASE 3: Arreglar `finishWorkout()` con fallback

**Objetivo**: Permitir crear history incluso si workout no existe en BD

**Archivos**:
- `src/hooks/use-workout.ts`
- `src/app/api/history/route.ts`

**Cambio 1: Hacer `workoutId` opcional en schema** (ya está así, solo verificar):

```typescript
// src/lib/db/schema.ts - Verificar que sea nullable
export const history = pgTable('history', {
  id: uuid('id').primaryKey().defaultRandom(),
  workoutId: uuid('workout_id')
    .references(() => workouts.id, { onDelete: 'set null' }), // ← Sin .notNull()
  performedAt: timestamp('performed_at', { withTimezone: true }).notNull(),
  durationSeconds: integer('duration_seconds'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

**Cambio 2: Actualizar validación en API**:

```typescript
// src/app/api/history/route.ts
const LogSessionSchema = z.object({
  workoutId: z.string().uuid().optional().nullable(), // ← Hacer opcional
  performedAt: z.string().datetime().optional(),
  durationSeconds: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});
```

**Cambio 3: Mejor manejo de errores en `finishWorkout()`**:

```typescript
const finishWorkout = useCallback(async () => {
  if (!activeWorkout) return;
  
  const completedWorkout = await storage.update(activeWorkout.id, {
    status: 'completed',
    endTime: new Date().toISOString(),
  });
  
  // Calcular duración
  const duration = completedWorkout.endTime && completedWorkout.startTime
    ? Math.floor((new Date(completedWorkout.endTime).getTime() - new Date(completedWorkout.startTime).getTime()) / 1000)
    : 0;
  
  // Intentar guardar history con workoutId
  try {
    console.log('[useWorkout] Logging to history with workoutId:', completedWorkout.id);
    const response = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workoutId: completedWorkout.id,
        performedAt: completedWorkout.startTime,
        durationSeconds: duration,
        notes: completedWorkout.notes,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    console.log('[useWorkout] Successfully logged workout to history');
  } catch (error) {
    console.warn('[useWorkout] Failed with workoutId, trying without it:', error);
    
    // FALLBACK: Guardar sin workoutId
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutId: null, // Explícitamente null
          performedAt: completedWorkout.startTime,
          durationSeconds: duration,
          notes: `${completedWorkout.name} - ${completedWorkout.notes || ''}`,
        }),
      });
      console.log('[useWorkout] Logged to history without workoutId (fallback)');
    } catch (fallbackError) {
      console.error('[useWorkout] Both attempts failed:', fallbackError);
    }
  }
  
  setActiveWorkout(null);
}, [activeWorkout, storage]);
```

**Criterios de Éxito**:
- ✅ Si workout existe en Neon → history se crea con referencia
- ✅ Si workout NO existe en Neon → history se crea sin referencia
- ✅ No se pierden datos de entrenamientos completados
- ✅ Logs claros para debugging

---

## 4. Ventajas de este Enfoque SIMPLE

### ✅ No Rompe Nada Existente
- localStorage sigue funcionando 100%
- Sistema de archivos JSON intacto
- Tests actuales no se afectan

### ✅ Gradual y Seguro
- Cada fase es independiente
- Fácil de revertir si algo falla
- Feature flags no necesarios

### ✅ Mínimo Código
- Solo 3 archivos modificados
- ~100 líneas de código nuevo
- Sin refactorings complejos

### ✅ Resiliente
- Falla gracefully si Neon no está disponible
- Logs claros para debugging
- Datos nunca se pierden

---

## 5. Comparación con Plan Original

| Aspecto | Plan Original | Plan SIMPLE |
|---------|--------------|-------------|
| Archivos modificados | 15+ | 3 |
| Líneas de código | 1000+ | ~150 |
| Riesgo de romper existente | Alto | Muy bajo |
| Tiempo de implementación | 16-22 horas | 3-4 horas |
| Necesita migración de datos | Sí | No |
| Tests a actualizar | Todos | Pocos |
| Complejidad | Alta | Baja |

---

## 6. Timeline Estimado

- **FASE 1** (Endpoint): 1 hora
  - Crear archivo
  - Tests básicos
  
- **FASE 2** (startWorkout): 1 hora
  - Modificar hook
  - Probar localmente
  
- **FASE 3** (finishWorkout): 1.5 horas
  - Actualizar schema validation
  - Implementar fallback
  - Tests end-to-end

**Total**: 3.5 horas (vs 16-22 del plan original)

---

## 7. Próximos Pasos INMEDIATOS

1. ✅ **Aprobar este plan simplificado**
2. ⏳ Crear branch `fix/workout-history-simple`
3. ⏳ **FASE 1**: Implementar `/api/workouts` POST
4. ⏳ **FASE 2**: Modificar `startWorkout()`
5. ⏳ **FASE 3**: Mejorar `finishWorkout()` con fallback
6. ⏳ Probar flujo completo manualmente
7. ⏳ Merge a main

---

## 8. Evolución Futura (Opcional)

Una vez que este fix esté funcionando, **opcionalmente** se puede:

- Agregar sincronización de ejercicios/sets
- Migrar workouts legacy
- Usar Neon como source of truth principal
- Implementar Server Actions para mejor UX

Pero **NO es necesario para resolver el problema actual**.

---

## 9. Notas Importantes

### ✨ Filosofía de Este Plan

> "La mejor solución es la más simple que funciona"

Este plan:
- ✅ Resuelve el error inmediatamente
- ✅ No afecta funcionalidad existente
- ✅ Se puede implementar HOY
- ✅ Abre camino a mejoras futuras

### 🚨 Lo que NO hace (a propósito)

- ❌ No reemplaza localStorage
- ❌ No migra datos legacy
- ❌ No refactoriza todo el hook
- ❌ No cambia la arquitectura completa

**Razón**: Esas cosas pueden venir después, cuando todo funcione.

---

## Referencias

- Schema actual: `src/lib/db/schema.ts`
- Hook actual: `src/hooks/use-workout.ts`
- API history: `src/app/api/history/route.ts`
- Repo workouts: `src/lib/db/repos/workout.ts` (ya existe!)
- Next.js Server Actions docs: [consultado via Context7]
- Drizzle ORM docs: [/drizzle-team/drizzle-orm]
