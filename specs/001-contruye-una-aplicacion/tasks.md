# Tasks: Aplicación de Seguimiento de Entrenamientos

**Input**: Design documents from `/specs/001-contruye-una-aplicacion/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Summary
NextJS 15.5.3 web application for gym workout tracking. Mobile-first design with TypeScript, shadcn/ui, and JSON storage. Features: create workout sessions, track exercises with sets (weight, reps, intensity, timing), view history.

## Path Conventions
**Web app structure**: NextJS App Router with `src/` directory at repository root
- `src/app/` - NextJS App Router pages
- `src/components/` - React components
- `src/lib/` - Utilities and services
- `src/types/` - TypeScript definitions
- `tests/` - All test files

## Phase 3.1: Setup
## Phase 3.1: Setup
- [X] T001 Initialize NextJS 15.5.3 project with TypeScript configuration
- [X] T002 Install and configure shadcn/ui with dark theme customization
- [X] T003 [P] Setup TailwindCSS with mobile-first responsive configuration
- [X] T004 [P] Configure Jest and React Testing Library for component testing
- [X] T005 [P] Setup ESLint and Prettier with NextJS/TypeScript rules
- [X] T006 Create project structure: src/app, src/components, src/lib, src/types directories

## Phase 3.2: TypeScript Definitions ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: Type definitions MUST be created before components and services**
- [X] T007 [P] Create User and UserPreferences interfaces in src/types/user.ts
- [X] T008 [P] Create WorkoutSession interface in src/types/workout.ts  
- [X] T009 [P] Create Exercise interface in src/types/exercise.ts
- [X] T010 [P] Create Set interface in src/types/set.ts
- [X] T011 [P] Create API response interfaces in src/types/api.ts

## Phase 3.3: Storage Service (Foundation Layer)
- [X] T012 Create JSON storage service in src/lib/storage.ts with file operations
- [X] T013 Create data validation utilities in src/lib/validation.ts with Zod schemas
- [X] T014 [P] Create storage error classes and error handling in src/lib/storage-errors.ts
- [X] T015 Write unit tests for storage service in tests/unit/storage.test.ts

## Phase 3.4: Component Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.5
**CRITICAL: These tests MUST be written and MUST FAIL before ANY component implementation**
- [X] T016 [P] Component test for WorkoutSessionCard in tests/components/WorkoutSessionCard.test.tsx
- [X] T017 [P] Component test for WorkoutSessionForm in tests/components/WorkoutSessionForm.test.tsx
- [X] T018 [P] Component test for ExerciseCard in tests/components/ExerciseCard.test.tsx
- [X] T019 [P] Component test for SetForm in tests/components/SetForm.test.tsx
- [X] T020 [P] Integration test for workout creation flow in tests/integration/workout-creation.test.tsx
- [X] T021 [P] Integration test for exercise management in tests/integration/exercise-management.test.tsx

## Phase 3.5: React Components (ONLY after tests are failing)
- [X] T022 [P] Create WorkoutSessionCard component in src/components/workout/WorkoutSessionCard.tsx
- [ ] T023 [P] Create WorkoutSessionForm component in src/components/workout/WorkoutSessionForm.tsx
- [X] T024 [P] Create ExerciseCard component in src/components/workout/ExerciseCard.tsx
- [X] T025 [P] Create SetForm component in src/components/workout/SetForm.tsx
- [X] T026 [P] Create shadcn/ui Button variations in src/components/ui/Button.tsx
- [X] T027 [P] Create shadcn/ui Input variations in src/components/ui/Input.tsx
- [X] T028 [P] Create mobile-optimized Card component in src/components/ui/Card.tsx

## Phase 3.6: Custom Hooks
- [X] T029 Create useWorkout hook in src/hooks/useWorkout.ts for session management
- [ ] T030 Create useWorkoutHistory hook in src/hooks/useWorkoutHistory.ts for history management
- [X] T031 [P] Create useTimer hook in src/hooks/useTimer.ts for set timing
- [X] T032 Write hook tests in tests/unit/hooks.test.ts

## Phase 3.7: API Routes
- [X] T033 Create POST /api/workouts route in src/app/api/workouts/route.ts
- [X] T034 Create GET /api/workouts route in src/app/api/workouts/route.ts
- [X] T035 Create GET /api/workouts/[id] route in src/app/api/workouts/[id]/route.ts
- [X] T036 Create PUT /api/workouts/[id] route in src/app/api/workouts/[id]/route.ts
- [X] T037 Create POST /api/workouts/[sessionId]/exercises route
- [X] T038 Create POST /api/exercises/[exerciseId]/sets route
- [ ] T039 Write API route tests in tests/integration/api-routes.test.ts

## Phase 3.8: NextJS App Router Pages
- [X] T040 Create root layout in src/app/layout.tsx with dark theme and mobile meta tags
- [X] T041 Create home/dashboard page in src/app/page.tsx
- [X] T042 Create new workout page in src/app/workout/new/page.tsx
- [X] T043 Create active workout page in src/app/workout/active/page.tsx
- [X] T044 Create workout history page in src/app/history/page.tsx
- [X] T045 Create workout detail page in src/app/history/[id]/page.tsx

## Phase 3.9: Integration & Polish
- [ ] T046 Connect components to API routes and test full data flow
- [ ] T047 [P] Add loading states and error boundaries to all pages
- [ ] T048 [P] Implement mobile-specific touch interactions and gestures
- [ ] T049 [P] Add form validation with user-friendly error messages
- [ ] T050 Create sample workout data in data/workouts.json for development
- [ ] T051 [P] Performance optimization: lazy loading and code splitting
- [ ] T052 [P] Mobile responsiveness testing on multiple device sizes
- [ ] T053 Run accessibility audit with Lighthouse and fix issues

## Dependencies
**Critical Path**:
- Setup (T001-T006) → TypeScript (T007-T011) → Storage (T012-T015) → Component Tests (T016-T021) → Components (T022-T028) → Hooks (T029-T032) → API Routes (T033-T039) → Pages (T040-T045) → Integration (T046-T053)

**Parallel Groups**:
- Group A: T003, T004, T005 (configuration tasks)
- Group B: T007, T008, T009, T010, T011 (TypeScript interfaces)
- Group C: T016, T017, T018, T019, T020, T021 (component tests)
- Group D: T022, T023, T024, T025, T026, T027, T028 (React components)
- Group E: T047, T048, T049 (polish tasks)
- Group F: T051, T052, T053 (final optimizations)

## Parallel Example
```bash
# Launch Group B together (TypeScript interfaces):
Task: "Create User and UserPreferences interfaces in src/types/user.ts"
Task: "Create WorkoutSession interface in src/types/workout.ts"
Task: "Create Exercise interface in src/types/exercise.ts"
Task: "Create Set interface in src/types/set.ts"
Task: "Create API response interfaces in src/types/api.ts"

# Launch Group C together (Component tests):
Task: "Component test for WorkoutSessionCard in tests/components/WorkoutSessionCard.test.tsx"
Task: "Component test for WorkoutSessionForm in tests/components/WorkoutSessionForm.test.tsx"
Task: "Component test for ExerciseCard in tests/components/ExerciseCard.test.tsx"
Task: "Component test for SetForm in tests/components/SetForm.test.tsx"
Task: "Integration test for workout creation flow in tests/integration/workout-creation.test.tsx"
```

## Notes
- [P] tasks = different files, no dependencies, can run in parallel
- Verify tests fail before implementing components (TDD)
- All file paths are relative to repository root
- Test mobile responsiveness on real devices when possible
- Follow constitutional principles: modularidad, minimalismo, rendimiento, simplicidad, UX
- Dark theme (black/white) throughout all components
- Commit after each task group completion

## Validation Checklist
*GATE: Checked before marking tasks complete*

- [ ] All TypeScript interfaces match data model specifications
- [ ] All components have corresponding tests that initially fail
- [ ] All API routes handle error cases gracefully
- [ ] Mobile-first responsive design implemented correctly
- [ ] Performance targets met (<200ms response, <2s load time)
- [ ] Accessibility standards followed (WCAG AA)
- [ ] JSON storage operations are atomic and validated
- [ ] Dark theme applied consistently across all components