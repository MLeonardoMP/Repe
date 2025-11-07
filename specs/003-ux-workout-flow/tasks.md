# Tasks: UX Workout Flow Enhancements

**Input**: Design documents from `C:\Users\USUARIO\OD\Documents\Repos\fit\Repe\specs\003-ux-workout-flow\`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory → Tech stack: TypeScript, Next.js 15, shadcn/ui
2. Load design documents:
   → data-model.md: No schema changes, conventions only
   → contracts/: GET /api/exercise-library, ExercisePickerDialog, QuickSetDialog
   → quickstart.md: 3 integration test scenarios
3. Generate tasks by category:
   → Setup: Create seed data file
   → Tests: API contract, component tests, integration tests
   → Core: Endpoint implementation, component implementation
   → Integration: Wire components to pages, replace prompts
   → Polish: Performance validation, accessibility checks
4. Apply task rules: Different files = [P], Tests before implementation
5. Number tasks sequentially (T001-T015)
6. Validation: All contracts have tests, all scenarios covered
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup

- [x] T001 Create exercise library seed data in `data/exercise-library-seed.json`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [x] T002 [P] Contract test GET /api/exercise-library in `tests/integration/api-routes.test.ts`
- [x] T003 [P] Component test ExercisePickerDialog in `tests/components/ExercisePickerDialog.test.tsx`
- [x] T004 [P] Component test QuickSetDialog in `tests/components/QuickSetDialog.test.tsx`
- [x] T005 [P] Integration test: Start workout without name in `tests/integration/workout-creation.test.tsx`
- [x] T006 [P] Integration test: Select exercise from library in `tests/integration/exercise-selection.test.tsx`
- [x] T007 [P] Integration test: Add set via dialog in `tests/integration/set-creation.test.tsx`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [x] T008 Implement GET /api/exercise-library endpoint in `src/app/api/exercise-library/route.ts`
- [x] T009 [P] Create ExercisePickerDialog component in `src/components/workout/ExercisePickerDialog.tsx`
- [x] T010 [P] Create QuickSetDialog component in `src/components/workout/QuickSetDialog.tsx`

## Phase 3.4: Integration

- [x] T011 Update workout creation flow to auto-generate name in `src/app/workout/new/page.tsx`
- [x] T012 Move "Start Workout" button to top of dashboard in `src/app/page.tsx`
- [x] T013 Replace native prompt with ExercisePickerDialog in workout session in `src/app/workout/active/page.tsx`
- [x] T014 Replace native prompt with QuickSetDialog for set entry in `src/components/workout/SetForm.tsx`

## Phase 3.5: Polish

- [x] T015 [P] Accessibility validation: keyboard navigation, focus management, ARIA labels
- [x] T016 [P] Performance validation: Exercise library load time <200ms, dialog render <100ms
- [x] T017 Run all quickstart scenarios from `specs/003-ux-workout-flow/quickstart.md`

## Dependencies

- T001 blocks T002, T008 (seed data needed for API tests/implementation)
- Tests (T002-T007) block implementation (T008-T010)
- T008 blocks T013 (API needed before picker integration)
- T009 blocks T013 (component needed before integration)
- T010 blocks T014 (component needed before integration)
- T011-T014 block T015-T017 (core features before polish)

## Parallel Execution Examples

### Round 1: Tests (after T001 complete)
```
Task: "Contract test GET /api/exercise-library in tests/integration/api-routes.test.ts"
Task: "Component test ExercisePickerDialog in tests/components/ExercisePickerDialog.test.tsx"
Task: "Component test QuickSetDialog in tests/components/QuickSetDialog.test.tsx"
Task: "Integration test: Start workout without name in tests/integration/workout-creation.test.tsx"
Task: "Integration test: Select exercise from library in tests/integration/exercise-selection.test.tsx"
Task: "Integration test: Add set via dialog in tests/integration/set-creation.test.tsx"
```

### Round 2: Core Components (after tests failing)
```
Task: "Create ExercisePickerDialog component in src/components/workout/ExercisePickerDialog.tsx"
Task: "Create QuickSetDialog component in src/components/workout/QuickSetDialog.tsx"
```

### Round 3: Polish (after integration complete)
```
Task: "Accessibility validation: keyboard navigation, focus management, ARIA labels"
Task: "Performance validation: Exercise library load time <200ms, dialog render <100ms"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify all tests fail before implementing (T002-T007 must show red)
- Seed data format: `[{ id, name, category, equipment }]` array in JSON
- Auto-generated name format: `Entrenamiento YYYY-MM-DD HH:mm`
- Exercise list limited to 50 visible items (performance constraint)
- Dark theme compliance required for all new components
- Commit after each task or logical group

## Task Details

### T001: Create exercise library seed data
**File**: `data/exercise-library-seed.json`
**Content**: Array of 50-100 exercises with fields: id, name, category, equipment
**Categories**: Chest, Back, Legs, Shoulders, Arms, Core, Cardio
**Equipment**: Barbell, Dumbbell, Machine, Bodyweight, Cable

### T008: Implement GET /api/exercise-library
**File**: `src/app/api/exercise-library/route.ts`
**Logic**: Read JSON file, return { success: true, data: Exercise[] }
**Error handling**: Return 500 with { success: false, error: { code, message } }

### T009: Create ExercisePickerDialog
**File**: `src/components/workout/ExercisePickerDialog.tsx`
**Props**: open, onClose, onSelect(name)
**Features**: Search input, scrollable list (max 50 visible), custom name input, dark theme
**State**: loading, exercises[], query, customName

### T010: Create QuickSetDialog
**File**: `src/components/workout/QuickSetDialog.tsx`
**Props**: open, onClose, onConfirm(reps, weight?)
**Features**: Reps input (required), weight input (optional), validation, dark theme
**Validation**: reps > 0, weight > 0 if provided

### T011: Update workout creation flow
**File**: `src/app/workout/new/page.tsx`
**Change**: Generate name with format "Entrenamiento YYYY-MM-DD HH:mm" if not provided
**Logic**: Use browser timezone, immediately create session

### T012: Move "Start Workout" button to top
**File**: `src/app/page.tsx`
**Change**: Reposition button from current location to header/top section
**Style**: Maintain shadcn button styling, ensure mobile tap target (44px min)

### T013: Replace native prompt with ExercisePickerDialog
**File**: `src/app/workout/active/page.tsx`
**Change**: Remove `prompt("Exercise name")` call, use ExercisePickerDialog state
**Integration**: Open dialog on "Add Exercise" click, pass selected name to addExercise

### T014: Replace native prompt with QuickSetDialog
**File**: `src/components/workout/SetForm.tsx`
**Change**: Remove `prompt("Reps", "Weight")` calls, use QuickSetDialog state
**Integration**: Open dialog on "Add Set" click, pass confirmed values to addSet

## Validation Checklist

- [x] All contracts have corresponding tests (T002: API, T003-T004: Components)
- [x] All quickstart scenarios have integration tests (T005-T007)
- [x] All tests come before implementation (T002-T007 before T008-T010)
- [x] Parallel tasks truly independent (different files, no shared state)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies documented and enforced

---
*Based on plan.md v2025-11-07 - Feature: UX Workout Flow Enhancements*
