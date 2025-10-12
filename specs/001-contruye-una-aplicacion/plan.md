# Implementation Plan: Aplicación de Seguimiento de Entrenamientos

**Branch**: `001-contruye-una-aplicacion` | **Date**: 2025-09-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `C:\Users\USUARIO\OD\Documents\Repos\fit\Repe\specs\001-contruye-una-aplicacion\spec.md`

## Summary
Aplicación web móvil para seguimiento de entrenamientos en gimnasio. Permite crear sesiones de entrenamiento, registrar ejercicios con series detalladas (tiempo, peso, repeticiones, intensidad, notas) y mantener historial. Enfoque minimalista con diseño black/white usando NextJS 15.5.3, TypeScript, shadcn/ui y almacenamiento en JSON.

## Technical Context
**Language/Version**: TypeScript, NextJS 15.5.3  
**Primary Dependencies**: shadcn/ui (latest), React, TailwindCSS  
**Storage**: JSON files (primera versión, sin base de datos externa)  
**Testing**: Jest, React Testing Library  
**Target Platform**: Web móvil (responsive design)
**Project Type**: web - NextJS app con componentes UI  
**Performance Goals**: <200ms respuesta, <2s carga inicial, 60fps animaciones  
**Constraints**: Tema minimalista (negro/blanco), diseño Vercel/NextJS, mobile-first  
**Scale/Scope**: Single user por sesión, ~100 ejercicios diferentes, historial ilimitado

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Modularidad ✅
- Componentes React reutilizables (WorkoutSession, Exercise, Set)
- Servicios separados para JSON storage
- Hooks personalizados para lógica de estado

### Minimalismo ✅
- Solo funcionalidad esencial v1: crear sesiones, registrar ejercicios, ver historial
- Almacenamiento JSON (sin DB compleja)
- UI black/white sin colores decorativos
- Sin features premium iniciales

### Rendimiento ✅
- NextJS 15 optimizations (App Router, Server Components donde aplique)
- JSON storage = sin latencia de DB
- shadcn components son optimizados
- Mobile-first = menos assets, carga rápida

### Simplicidad ✅
- Estructura directa: pages → components → services
- JSON schema simple para datos
- Sin autenticación compleja v1
- Flujo lineal: nueva sesión → add ejercicios → guardar

### Experiencia de Usuario ✅
- Mobile-first design
- Interfaz táctil optimizada para gimnasio
- Tema dark = menos fatiga visual
- Navegación intuitiva
- Feedback inmediato en acciones

## Project Structure

### Documentation (this feature)
```
specs/001-contruye-una-aplicacion/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# NextJS Web Application Structure
src/
├── app/                 # NextJS 15 App Router
│   ├── page.tsx         # Landing/Dashboard
│   ├── workout/         # Workout pages
│   └── history/         # History pages
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── workout/         # Workout-specific components
│   └── common/          # Shared components
├── lib/
│   ├── storage.ts       # JSON file operations
│   ├── validation.ts    # Data validation
│   └── utils.ts         # Utilities
├── types/
│   └── workout.ts       # TypeScript definitions
└── hooks/
    └── useWorkout.ts    # Custom hooks

data/
└── workouts.json        # JSON storage

tests/
├── components/
├── integration/
└── unit/
```

**Structure Decision**: Option 2 (Web application) - NextJS app structure

## Phase 0: Outline & Research
1. **NextJS 15 Best Practices**:
   - App Router patterns for mobile web
   - Server vs Client Components strategy
   - Performance optimizations

2. **shadcn/ui Component Strategy**:
   - Mobile-friendly components selection
   - Theming for black/white design
   - Form components for workout data entry

3. **JSON Storage Patterns**:
   - File structure for workout data
   - Read/write operations efficiency
   - Data validation and error handling

4. **Mobile UX Research**:
   - Touch targets for gym environment (sweaty hands)
   - Dark theme accessibility standards
   - Responsive breakpoints for various devices

**Output**: research.md with technical decisions and patterns

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - WorkoutSession, Exercise, Set, User entities
   - JSON schema definitions
   - Validation rules and constraints

2. **Generate API contracts** from functional requirements:
   - Internal API routes for JSON operations
   - Component props interfaces
   - Hook return types and parameters

3. **Generate test scenarios** from user stories:
   - User creates workout session
   - User adds exercises and sets
   - User views workout history
   - Error handling scenarios

4. **Update .github/copilot-instructions.md**:
   - NextJS 15 + TypeScript context
   - shadcn/ui component patterns
   - Project-specific conventions

**Output**: data-model.md, /contracts/*, quickstart.md, .github/copilot-instructions.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Setup: NextJS project init, shadcn/ui installation, dark theme config
- Components: UI components for each entity (Session, Exercise, Set)
- Storage: JSON read/write services with validation
- Pages: App Router pages for main user flows
- Integration: Component integration and state management

**Ordering Strategy**:
- Setup → Types → Storage → Components → Pages → Integration
- Parallel [P] for independent components
- Sequential for interdependent features

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

## Complexity Tracking
*No constitutional violations detected - all choices align with principles*

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---
*Based on Constitution v1.1.0 - See `.specify/memory/constitution.md`*