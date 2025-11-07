# Implementation Plan: UX Workout Flow Enhancements

**Branch**: `003-ux-workout-flow` | **Date**: 2025-11-07 | **Spec**: specs/003-ux-workout-flow/spec.md
**Input**: Feature specification from `C:\Users\USUARIO\OD\Documents\Repos\fit\Repe\specs\003-ux-workout-flow\spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → Found and parsed successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → No blockers; choices align with current stack
3. Fill the Constitution Check section based on constitution
4. Evaluate Constitution Check
   → No violations detected
5. Execute Phase 0 → research.md
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, copilot context update
7. Re-evaluate Constitution Check
   → PASS
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

## Summary
Implementar un flujo de creación de entrenamientos sin fricción: inicio inmediato sin solicitar nombre (se autogenera “Entrenamiento YYYY-MM-DD HH:mm”), botón de iniciar visible en la parte superior, selector de ejercicios basado en una biblioteca existente con búsqueda y opción de nombre personalizado solo cuando no exista en la lista, y reemplazo de prompts nativos por diálogos shadcn.

## Technical Context
**Language/Version**: TypeScript, Next.js 15 (App Router)  
**Primary Dependencies**: React, TailwindCSS, shadcn/ui  
**Storage**: Archivos JSON en `data/` (ej. `workouts.json`, `exercise-library-seed.json`)  
**Testing**: Jest + React Testing Library  
**Target Platform**: Web móvil (mobile-first, dark theme)  
**Project Type**: single web app (Next.js App Router)  
**Performance Goals**: UI reactiva (<200ms), carga lista de ejercicios paginada/limitada (≤50 visibles), TTI <3s móvil  
**Constraints**: Minimalismo (sin librerías pesadas), accesible (contraste, foco), sin DB externa  
**Scale/Scope**: Biblioteca 100–500 ejercicios; sesiones y sets por usuario único local

## Constitution Check
Cumple con: 
- Modularidad: nuevos componentes de diálogo aislados, endpoint de biblioteca separado.
- Minimalismo: sin nuevas dependencias; reutiliza shadcn/ui y almacenamiento JSON.
- Rendimiento: lista filtrable en memoria con límite de elementos visibles.
- Simplicidad: nombres auto-generados y UI directa.
- UX: botón de iniciar arriba, selector de ejercicios con búsqueda y sin prompts nativos.

## Project Structure

### Documentation (this feature)
```
specs/003-ux-workout-flow/
├── plan.md              # This file (/plan output)
├── research.md          # Phase 0 output (/plan)
├── data-model.md        # Phase 1 output (/plan)
├── quickstart.md        # Phase 1 output (/plan)
├── contracts/           # Phase 1 output (/plan)
└── tasks.md             # Phase 2 output (/tasks)
```

### Source Code (repository root)
```
src/
├── app/
│   ├── api/
│   │   └── exercise-library/route.ts   # NEW endpoint
│   └── ...
├── components/
│   └── workout/
│       ├── ExercisePickerDialog.tsx    # NEW dialog
│       └── QuickSetDialog.tsx          # NEW dialog
└── ...
```

**Structure Decision**: Web application (Next.js App Router)

## Phase 0: Outline & Research
1. shadcn/ui dialogs vs prompts nativos → usar `Dialog` y inputs controlados.
2. Estrategia de biblioteca de ejercicios: endpoint /api/exercise-library que lee de `data/exercise-library-seed.json` con forma `{ id, name, category, equipment? }`.
3. Autogeneración de nombres: formateo local “Entrenamiento YYYY-MM-DD HH:mm” (zona horaria local del dispositivo) y persistencia inmediata.
4. Rendimiento: filtrar en memoria con límite a 50 ítems visibles y debounce en búsqueda.

**Output**: research.md con decisiones, racionales y alternativas.

## Phase 1: Design & Contracts
1. Data Model: no requiere cambios de esquema; se documenta convención de nombre auto-generado y orden por timestamps.
2. API Contracts: `GET /api/exercise-library` (200 OK con lista; 500 error);
   sin cambios en rutas existentes de workouts.
3. Component Contracts: `ExercisePickerDialog` (props: `open`, `onClose`, `onSelect(name)`), `QuickSetDialog` (props: `open`, `onClose`, `onConfirm(reps, weight?)`).
4. Quickstart: escenarios para iniciar sin nombre, seleccionar ejercicio de lista y crear set vía diálogo.

## Phase 2: Task Planning Approach (for /tasks)
- Generar tasks desde contratos/componentes: 
  - Test de contrato de `GET /api/exercise-library` [P]
  - Tests de componentes `ExercisePickerDialog` y `QuickSetDialog` [P]
  - Integrations: flujo de inicio rápido y selección/alta de ejercicio [P]
- Implementación en orden TDD: tests → endpoint → componentes → wiring en páginas.
- Marcar [P] cuando toquen archivos distintos.

## Complexity Tracking
N/A (sin desviaciones)

## Progress Tracking
**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v1.1.0 - See `.specify/memory/constitution.md`*
