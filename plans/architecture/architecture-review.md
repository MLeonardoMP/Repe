# Revisión de Arquitectura - Repe App

> **Fecha:** 2025-12-13
> **Stack:** Next.js 16.0.10, React 19.2.3, Drizzle ORM, Neon PostgreSQL
> **Objetivo:** Identificar mejoras arquitectónicas para una base minimalista y escalable

---

## 📋 Resumen Ejecutivo

La aplicación Repe es un workout tracker con una arquitectura híbrida que combina:
- **Frontend:** Next.js 16 App Router con Client Components
- **Backend:** API Routes + Drizzle ORM con Neon PostgreSQL
- **Almacenamiento dual:** localStorage (legacy) + PostgreSQL (nuevo)

### Fortalezas Actuales
✅ Estructura de carpetas organizada siguiendo App Router  
✅ Uso correcto de Drizzle ORM con patrón Repository  
✅ Validación con Zod en API routes  
✅ Sistema de errores tipado (`StorageError`)  
✅ Configuración de seguridad en headers  
✅ TypeScript strict mode habilitado  

### Áreas de Mejora Identificadas
❌ Duplicación de tipos entre hooks y types/  
❌ Exceso de Client Components donde Server Components serían suficientes  
❌ Sistema de almacenamiento dual (localStorage vs DB) sin estrategia clara  
❌ Falta de Server Actions para mutaciones  
❌ Componentes de UI mezclados con lógica de negocio  
❌ Ausencia de capas de abstracción claras (services)  
❌ Naming inconsistente en hooks (`useWorkoutHistory.ts` vs `use-workout.ts`)  

---

## 🏗️ Análisis de Arquitectura Actual

### 1. Estructura de Carpetas

```
src/
├── app/                    # ✅ App Router correcto
│   ├── api/               # ✅ Route handlers bien organizados
│   ├── workout/           # ✅ Rutas dinámicas
│   └── history/           # ✅ Página de historial
├── components/            
│   ├── common/            # ⚠️ Vacío - sin uso
│   ├── layout/            # ⚠️ Poco utilizado
│   ├── magicui/           # ⚠️ Componentes externos duplicados
│   ├── ui/                # ✅ Shadcn/ui base
│   ├── user/              # ⚠️ Solo 1 archivo
│   └── workout/           # ⚠️ Muy grande, mezcla concerns
├── hooks/                 # ⚠️ Naming inconsistente
├── lib/                   
│   ├── db/               # ✅ Drizzle bien estructurado
│   │   ├── repos/        # ✅ Patrón Repository
│   │   └── services/     # ⚠️ Solo migración
│   └── storage.ts        # ❌ Legacy JSON storage
└── types/                 # ⚠️ Duplicación con hooks
```

### 2. Problemas de Duplicación de Tipos

**Problema crítico:** Los tipos están definidos en múltiples lugares:

```typescript
// src/types/workout.ts - Definición oficial
export interface WorkoutSession {
  id: string;
  userId: string;
  name?: string;
  startTime: string;
  endTime?: string;
  exercises: Exercise[];
  // ...
}

// src/hooks/use-workout.ts - Definición duplicada diferente
export interface WorkoutSession {
  id: string;
  userId: string;
  name: string;  // ❌ Diferente: no opcional
  exercises: Exercise[];
  status: 'active' | 'paused' | 'completed';  // ❌ Campo nuevo
  duration: number;  // ❌ Campo nuevo
  // ...
}
```

### 3. Exceso de Client Components

**Páginas que podrían ser Server Components:**

| Archivo | Estado Actual | Recomendación |
|---------|--------------|---------------|
| `app/page.tsx` | Client | ⚠️ Podría ser híbrido |
| `app/history/page.tsx` | Client | ❌ Debería ser Server + Client parcial |
| `app/workout/[id]/page.tsx` | Client | ❌ Debería ser Server Component |
| `app/workout/new/page.tsx` | Client | ⚠️ OK pero podría optimizarse |
| `app/workout/active/page.tsx` | Client | ✅ Correcto (interactividad) |

### 4. Sistema de Almacenamiento Dual

```
┌─────────────────────────────────────────────────────────────┐
│                    Estado Actual                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  useWorkout (hook)                                          │
│       │                                                     │
│       ▼                                                     │
│  useStorage (localStorage)  ←── ❌ Fuente primaria          │
│       │                                                     │
│       ▼                                                     │
│  API Routes                                                 │
│       │                                                     │
│       ▼                                                     │
│  Repositories (Drizzle)                                     │
│       │                                                     │
│       ▼                                                     │
│  Neon PostgreSQL           ←── ✅ Debería ser primaria     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5. Falta de Server Actions

Las mutaciones actualmente usan fetch() a API routes:

```typescript
// Actual - en history/page.tsx
const response = await fetch(`/api/history?${params.toString()}`);

// Recomendado - Server Actions
'use server';
export async function getHistory(cursor?: HistoryCursor) {
  const entries = await historyRepo.list({ cursor });
  return entries;
}
```

---

## 📐 Plan de Mejoras

### Fase 1: Consolidación de Tipos (Prioridad: ALTA)

**Objetivo:** Una única fuente de verdad para tipos

**Tareas:**
1. [ ] Eliminar tipos duplicados en hooks
2. [ ] Crear tipos derivados con `Omit`/`Pick` en lugar de redefinir
3. [ ] Agregar tipos para API responses unificados
4. [ ] Documentar contratos de datos

**Archivos a modificar:**
- `src/hooks/use-workout.ts` - Importar desde `@/types`
- `src/types/workout.ts` - Agregar campos faltantes (`status`, `duration`)
- `src/types/index.ts` - Exportar todo centralizado

### Fase 2: Migración a Server Components (Prioridad: ALTA)

**Objetivo:** Usar Server Components donde no hay interactividad

**Tareas:**
1. [ ] `app/workout/[id]/page.tsx` → Server Component con fetch directo
2. [ ] `app/history/page.tsx` → Server Component + Client para búsqueda
3. [ ] Crear pattern de composición Server/Client

**Ejemplo de migración:**

```typescript
// ANTES: app/workout/[id]/page.tsx (Client)
'use client';
export default function WorkoutDetailPage() {
  const [workout, setWorkout] = useState(null);
  useEffect(() => { fetch(`/api/workouts/${id}`) }, []);
}

// DESPUÉS: Server Component
import { getWorkout } from '@/lib/db/repos/workout';

export default async function WorkoutDetailPage({ params }: Props) {
  const { id } = await params;
  const workout = await getWorkout(id);
  
  if (!workout) notFound();
  
  return <WorkoutDetail workout={workout} />;
}
```

### Fase 3: Implementar Server Actions (Prioridad: MEDIA)

**Objetivo:** Reducir complejidad de API routes para mutaciones internas

**Tareas:**
1. [ ] Crear `src/app/actions/workout.ts`
2. [ ] Crear `src/app/actions/history.ts`
3. [ ] Migrar operaciones CRUD críticas

**Estructura propuesta:**
```
src/app/
├── actions/
│   ├── workout.ts    # createWorkout, updateWorkout, deleteWorkout
│   ├── exercise.ts   # addExercise, removeExercise
│   ├── set.ts        # addSet, updateSet
│   └── history.ts    # getHistory, saveHistory
```

### Fase 4: Eliminar Sistema de Storage Legacy (Prioridad: MEDIA)

**Objetivo:** Usar PostgreSQL como única fuente de verdad

**Tareas:**
1. [ ] Verificar que todas las operaciones usen repos
2. [ ] Deprecar `src/lib/storage.ts`
3. [ ] Eliminar `use-storage.ts` hook
4. [ ] Refactorizar `use-workout.ts` para usar API/Server Actions

### Fase 5: Reorganizar Componentes (Prioridad: BAJA)

**Objetivo:** Estructura clara y colocation

**Estructura propuesta:**
```
src/components/
├── ui/                  # Primitivos (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── shared/              # Componentes reutilizables con lógica
│   ├── error-boundary.tsx
│   ├── loading-spinner.tsx
│   └── timer-display.tsx
└── features/            # Componentes específicos de features
    ├── workout/
    │   ├── workout-card.tsx
    │   ├── exercise-card.tsx
    │   └── set-form.tsx
    └── history/
        └── history-list.tsx
```

### Fase 6: Naming Conventions (Prioridad: BAJA)

**Objetivo:** Consistencia en nomenclatura

**Cambios:**
```
ANTES                      DESPUÉS
─────────────────────────  ─────────────────────────
useWorkoutHistory.ts   →   use-workout-history.ts
ExerciseCard.tsx       →   exercise-card.tsx (opcional)
workout-form.tsx       →   (ya correcto)
```

---

## 📁 Estructura Final Propuesta

```
src/
├── app/
│   ├── (marketing)/           # Route group para landing
│   │   └── page.tsx
│   ├── (app)/                 # Route group para app
│   │   ├── layout.tsx         # App shell con nav
│   │   ├── workout/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx   # Server Component
│   │   │   ├── active/
│   │   │   │   └── page.tsx   # Client Component
│   │   │   └── new/
│   │   │       └── page.tsx   # Hybrid
│   │   └── history/
│   │       └── page.tsx       # Server + Client partial
│   ├── actions/               # Server Actions
│   │   ├── workout.ts
│   │   ├── exercise.ts
│   │   └── history.ts
│   └── api/                   # Solo para integraciones externas
│       └── webhooks/
│
├── components/
│   ├── ui/                    # Primitivos sin estado
│   ├── shared/                # Componentes reutilizables
│   └── features/              # Por feature
│       ├── workout/
│       └── history/
│
├── lib/
│   ├── db/
│   │   ├── index.ts           # Conexión
│   │   ├── schema.ts          # Drizzle schema
│   │   └── repos/             # Data access
│   ├── utils.ts               # Utilidades generales
│   └── validation.ts          # Schemas Zod
│
├── hooks/                     # Hooks de UI solamente
│   ├── use-timer.ts
│   └── use-media-query.ts
│
└── types/                     # Única fuente de tipos
    ├── index.ts
    ├── workout.ts
    ├── exercise.ts
    └── api.ts
```

---

## ⏱️ Estimación de Esfuerzo

| Fase | Complejidad | Tiempo Estimado | Riesgo |
|------|-------------|-----------------|--------|
| 1. Consolidación de Tipos | Media | 2-3 horas | Bajo |
| 2. Server Components | Alta | 4-6 horas | Medio |
| 3. Server Actions | Media | 3-4 horas | Bajo |
| 4. Eliminar Storage Legacy | Alta | 4-5 horas | Alto |
| 5. Reorganizar Componentes | Baja | 2-3 horas | Bajo |
| 6. Naming Conventions | Baja | 1 hora | Bajo |

**Total estimado:** 16-22 horas de trabajo

---

## 🎯 Orden de Ejecución Recomendado

```
1. Fase 1 (Tipos)     ──────►  Prerequisito para todo
      │
      ▼
2. Fase 2 (Server)    ──────►  Mayor impacto en rendimiento
      │
      ▼
3. Fase 3 (Actions)   ──────►  Simplifica código
      │
      ▼
4. Fase 4 (Storage)   ──────►  Requiere fases anteriores
      │
      ▼
5. Fase 5+6 (Polish)  ──────►  Mejoras cosméticas
```

---

## �� Quick Wins (Implementar Inmediatamente)

### 1. Unificar imports de tipos
```typescript
// En todos los archivos, usar:
import type { WorkoutSession, Exercise, Set } from '@/types';
// En lugar de definir tipos localmente
```

### 2. Agregar `loading.tsx` a rutas críticas
```
app/workout/[id]/loading.tsx  ← Agregar
app/history/loading.tsx       ← Agregar
```

### 3. Eliminar carpetas vacías
```bash
rm -rf src/components/common  # Vacío
```

### 4. Renombrar hook inconsistente
```bash
mv src/hooks/useWorkoutHistory.ts src/hooks/use-workout-history.ts
```

---

## 📝 Notas Finales

### Lo que NO cambiar (funciona bien):
- Estructura de `lib/db/` con repos
- Sistema de errores `StorageError`
- Configuración de Drizzle
- Componentes UI de shadcn

### Compatibilidad hacia atrás:
- Mantener API routes durante la migración
- Deprecar gradualmente localStorage
- Documentar breaking changes

### Testing:
- Agregar tests para Server Actions
- Mantener tests existentes funcionando
- Coverage mínimo: repos y validación

---

*Este documento debe revisarse cada sprint para actualizar el progreso.*
