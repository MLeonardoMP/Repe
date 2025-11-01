# Tasks: Auto-Named Routine Flow

**Input**: Design documents from `/specs/002-plan-no-pedir/`
**Prerequisites**: `plan.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 3.1: Setup

- [X] T001 Update `tests/fixtures/data/workouts.json` and related fixture files to seed routine templates, usage metadata, and default exercises required by the new flow.
- [X] T002 Create placeholder route handlers in `src/app/api/routines/templates/route.ts` and `src/app/api/routines/start/route.ts` that return `501` to unblock contract tests.

## Phase 3.2: Tests First (TDD)

- [ ] T003 \[P] Author failing contract tests for `GET /api/routines/templates` and `POST /api/routines/start` in `tests/integration/api-routines-autoname.test.ts` using the OpenAPI schema.
- [ ] T004 Capture user journey scenarios QS-01..QS-05 in `tests/integration/routine-autoname.test.tsx`, asserting UI behavior, fallback naming, and persistence toggle.

## Phase 3.3: Core Implementation

- [ ] T005 Extend `src/types/workout.ts` with `RoutineTemplate`, `RoutineNameSuggestion`, `RoutineExerciseLink`, and updated `RoutineSession` interfaces reflecting the data model.
- [ ] T006 Create `src/lib/repositories/routineTemplates.ts` to manage loading, ranking, and persisting routine templates based on `workoutStorage`.
- [ ] T007 Update `src/lib/storage.ts` and `src/lib/storage-errors.ts` to support routine template collections, session persistence, and duplicate name suffixing rules.
- [ ] T008 Implement naming utilities in `src/lib/utils.ts` for fallback name generation, recency/frequency ranking, and collision handling.
- [ ] T009 Enhance `src/hooks/useWorkoutHistory.ts` (and related hook exports) to expose routine suggestions, selection state, and template refresh.
- [ ] T010 Replace the `501` stub with the full implementation of `GET /api/routines/templates` in `src/app/api/routines/templates/route.ts`, wiring repository outputs and query validation.
- [ ] T011 Implement `POST /api/routines/start` in `src/app/api/routines/start/route.ts`, including validation, persistence of optional new exercises, and duplicate name resolution.
- [ ] T012 Update `src/app/components/workout/WorkoutCreationFlow.tsx` to render auto-generated names, suggestion options, and the new exercise toggle aligned with quickstart steps.
- [ ] T013 Add a reusable `RoutineSuggestionList` component in `src/app/components/workout/RoutineSuggestionList.tsx` and integrate it where suggestions are displayed.

## Phase 3.4: Integration

- [ ] T014 Wire the updated flow into `src/app/workout/new/page.tsx` and any launch points so the routine planner launches with the new modal behavior and persists session context.

## Phase 3.5: Polish

- [ ] T015 \[P] Add unit tests for the ranking and fallback utilities in `tests/unit/lib/routineSuggestions.test.ts`.
- [ ] T016 \[P] Update `README.md` (or feature docs) with instructions for the auto-named routine flow and quickstart coverage.

## Dependencies

- T003 → T010, T011 (contract tests must fail before endpoint implementation).
- T004 → T012, T014 (integration tests guide UI changes).
- T005 → T006, T007, T008 (type definitions precede repository and util work).
- T006 → T010, T011 (API handlers rely on repository functions).
- T007 → T011 (session persistence depends on storage updates).
- T008 → T010, T011, T015 (naming logic shared across endpoints and unit tests).
- T012 → T013 (component integration happens after new list component exists).

## Parallel Execution Example

```bash
# After completing T002 and T005, run tests in parallel:
/task start T003
/task start T015
/task start T016
```

## Notes

- Tasks marked \[P] touch independent files and can run concurrently once dependencies are met.
- Ensure contract and integration tests are red before implementing endpoints or UI logic.
- Commit after each task to maintain a clean history respecting modularity and minimalism.
