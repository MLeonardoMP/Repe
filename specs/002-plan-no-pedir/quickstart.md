# Quickstart Test Plan: Auto-Named Routine Flow

## Prerequisites

- Development server available locally (`npm run dev`).
- Seed data includes at least one prebuilt routine and one user-created routine for the default user (`user-1`).
- Jest test runner configured via `npm test`.

## Test Scenarios

### QS-01: Auto Name Appears Without Typing

1. Start the app locally.
2. Navigate to the routine planner screen.
3. Click "Crear rutina".
4. **Verify** that the modal displays a pre-selected routine name without any text input field.
5. **Verify** that alternative suggestions are shown in a list of chips/buttons.

### QS-02: Select Existing Exercise From Auto-Named Routine

1. Continue from QS-01.
2. Select one of the exercises listed for the routine.
3. Click "Iniciar rutina".
4. **Verify** that the session starts with the selected exercise displayed in the active workout view.

### QS-03: Add New Exercise Before Starting

1. From the routine start modal, click "Agregar ejercicio".
2. Fill in the exercise details and leave the "Guardar en la rutina" toggle OFF.
3. **Verify** that the new exercise appears in the session exercise list only for the current run.
4. Restart the routine setup flow and confirm the exercise is absent from the template list.

### QS-04: Persist New Exercise Into Template

1. Repeat the add exercise flow but toggle "Guardar en la rutina" ON.
2. Complete the routine start.
3. Reopen the routine planner.
4. **Verify** that the newly added exercise now appears in the routine's exercise list.

### QS-05: No Templates Available Fallback

1. Remove all routine templates for `user-1` (or mock empty state).
2. Open the routine planner.
3. **Verify** that the system proposes a default name "Rutina <día>" and an empty exercise list with an invitation to add the first exercise.

## Regression Checks

- Existing workout creation flow (`/api/workouts`) still accepts and stores sessions with explicit names when provided by legacy paths.
- Exercise library search remains responsive after the new suggestion logic executes.

## Cleanup

- Reset any test data mutations by re-running the storage seeding script or restoring the default fixtures in `tests/fixtures/data`.

## Automation Hooks

- Add integration coverage under `tests/integration/routine-autoname.test.tsx` following scenarios QS-01 to QS-05.
- Add API contract tests under `tests/integration/api-routines-autoname.test.ts` once endpoints are implemented.
