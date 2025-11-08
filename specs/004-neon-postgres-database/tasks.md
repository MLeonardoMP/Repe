# Tasks: Neon Postgres Database Migration

**Input**: Design documents from `specs/004-neon-postgres-database/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅
**Branch**: `004-neon-postgres-database`
**Date Generated**: 2025-11-07

## Execution Flow Summary

This feature implements a phased migration from JSON-based storage to Neon Postgres with dual-write safety and comprehensive backfill validation. Tasks are ordered by dependency:

1. **Setup** (T001-T006): Project infrastructure, Drizzle configuration, DB schema
2. **Tests First** (T007-T015): Contract tests for all API routes and services; integration tests for migration flows
3. **Core Repositories** (T016-T021): Repository layer (Exercise, Workout, Set, History, Preference, Migration services)
4. **API Implementation** (T022-T027): Postgres-backed endpoints for exercises, workouts, history, and migration verification
5. **Server Actions** (T028-T032): Update existing Server Actions to use Drizzle repositories
6. **Migration Tooling** (T033-T037): Dual-write service, backfill scripts, parity checker, migration verification
7. **Polish** (T038-T043): Unit tests, performance profiling, documentation, cleanup

---

## Phase 3.1: Setup

- [x] **T001** Initialize Drizzle ORM configuration and Neon driver setup in `src/lib/db/drizzle.config.ts`, `src/lib/db/index.ts`
  - Install `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit` ✅
  - Export Drizzle client instance for use in repositories and tests ✅
  - Configure WebSocket proxy for local development (or Docker Postgres fallback) ✅
  - ⏱️ Depends on: None | Blocks: T002, T003, T016

- [x] **T002** Create database schema with Drizzle schema definitions in `src/lib/db/schema.ts`
  - Implement table definitions: `exercises`, `workouts`, `workout_exercises`, `sets`, `history`, `user_settings` ✅
  - Add all indexes per data-model.md (name index, category index, workout_id, performed_at, etc.) ✅
  - Include validation constraints (reps ≥ 0, rpe 0-10, duration_seconds ≥ 0, order_index uniqueness) ✅
  - ⏱️ Depends on: T001 | Blocks: T003, T004

- [x] **T003** Generate and apply initial Drizzle migrations in `drizzle/migrations/`
  - Run `drizzle-kit generate:pg` to create migration file from schema ✅
  - Test migration up/down cycles on local Postgres 🔄 (pending DB connection)
  - Verify all tables, indexes, and constraints created correctly 🔄 (pending DB connection)
  - ⏱️ Depends on: T002 | Blocks: T004, T005

- [x] **T004** [P] Create seed script for exercise library in `scripts/seed-exercises.ts`
  - Load `data/exercise-library-seed.json` ✅
  - Insert seed exercises into `exercises` table with `ON CONFLICT DO NOTHING` for idempotency ✅
  - Log seeded count and any conflicts; output to console ✅
  - ⏱️ Depends on: T003 | Blocks: T005

- [x] **T005** [P] Create test database setup utilities in `tests/setup/db-setup.ts`
  - Export `createTestDb()` that connects to temporary Postgres schema (or Docker container) ✅
  - Export `cleanupTestDb()` that rolls back transactions or drops schema ✅
  - Export fixtures for exercises, workouts, sets, history (use factory pattern with `faker`) ✅
  - ⏱️ Depends on: T003 | Blocks: T007, T008, T009

- [x] **T006** [P] Configure Jest test environment in `jest.setup.db.ts`
  - Add database URL environment variable handling for test suite ✅
  - Ensure transactional isolation (begin transaction, run tests, rollback) ✅
  - Set up `beforeAll` / `afterAll` hooks for test database lifecycle ✅
  - ⏱️ Depends on: T005 | Blocks: T007

---

## Phase 3.2: Tests First (TDD) — MUST FAIL Before Phase 3.3

**⚠️ CRITICAL: Write all tests and verify they FAIL before implementing any repository logic.**

### Contract Tests: API Routes

- [ ] **T007** [P] Contract test suite for `/api/exercises` routes in `tests/contracts/exercises-contract.test.ts`
  - Test `GET /api/exercises?search=...&category=...&limit=...&offset=...` → 200 with paginated data
  - Test `POST /api/exercises` with valid and invalid payloads → 201/400
  - Test `GET /api/exercises/:id` → 200/404
  - Test error cases: VALIDATION, NOT_FOUND, CONFLICT
  - ⏱️ Depends on: T006 | Blocks: T016, T022

- [ ] **T008** [P] Contract test suite for `/api/workouts` routes in `tests/contracts/workouts-contract.test.ts`
  - Test `GET /api/workouts?limit=...&offset=...` → 200 with list
  - Test `GET /api/workouts/:id` → 200 with full details (exercises + sets + history)
  - Test `POST /api/workouts` with exercise array → 201 with ID
  - Test `PUT /api/workouts/:id` to reorder exercises → 200
  - Test `DELETE /api/workouts/:id` → 204/404
  - Test error cases (VALIDATION, NOT_FOUND, CONFLICT)
  - ⏱️ Depends on: T006 | Blocks: T017, T023

- [ ] **T009** [P] Contract test suite for `/api/workouts/:id/sets` routes in `tests/contracts/sets-contract.test.ts`
  - Test `GET /api/workouts/:id/sets` → 200 with paginated sets
  - Test `POST /api/workouts/:id/sets` with valid set data → 201
  - Test `PUT /api/workouts/:id/sets/:setId` → 200
  - Test `DELETE /api/workouts/:id/sets/:setId` → 204/404
  - Test error cases and validation
  - ⏱️ Depends on: T006 | Blocks: T018, T024

- [ ] **T010** [P] Contract test suite for `/api/history` routes in `tests/contracts/history-contract.test.ts`
  - Test `GET /api/history?cursor=...&limit=...&from=...&to=...` → 200 with keyset pagination
  - Test `POST /api/history` to log a completed session → 201
  - Test filtering by date range → 200 with filtered data
  - Test error cases (NOT_FOUND, VALIDATION)
  - ⏱️ Depends on: T006 | Blocks: T019, T025

- [ ] **T011** [P] Contract test suite for `/api/exercises/migrate/verify` in `tests/contracts/migration-contract.test.ts`
  - Test `GET /api/exercises/migrate/verify` → 200 with parity report (JSON vs DB counts)
  - Test `POST /api/exercises/migrate/backfill` → 200 with backfill results
  - Test `POST /api/exercises/migrate/dual-write/toggle` → 200 with current feature flag state
  - Test error cases (INTERNAL if DB unreachable)
  - ⏱️ Depends on: T006 | Blocks: T020, T026

### Service Interface Tests (Repositories)

- [ ] **T012** [P] Contract test for `ExerciseRepository` in `tests/contracts/exercise-repository.contract.test.ts`
  - Test `listExercises({ search, category, limit, offset })` → returns paginated Exercise[]
  - Test `createExercise(input)` → returns Exercise with unique validation
  - Test `getExerciseById(id)` → returns Exercise or null
  - Test `bulkSeedExercises(exercises)` → returns count, idempotent
  - Test error handling: throws StorageError for VALIDATION, CONFLICT, NOT_FOUND
  - ⏱️ Depends on: T006 | Blocks: T016

- [ ] **T013** [P] Contract test for `WorkoutRepository` in `tests/contracts/workout-repository.contract.test.ts`
  - Test `listWorkouts({ limit, offset, includeHistory })` → returns WorkoutWithExercises[]
  - Test `getWorkout(id)` → returns WorkoutDetail with exercises, sets, history
  - Test `upsertWorkout(input)` → transactional creation/update with exercise reordering
  - Test `deleteWorkout(id)` → soft or hard delete per plan
  - Test error handling: throws StorageError appropriately
  - ⏱️ Depends on: T006 | Blocks: T017

- [ ] **T014** [P] Contract test for `SetRepository` in `tests/contracts/set-repository.contract.test.ts`
  - Test `addSet(input)` → creates set with validations (reps ≥ 0, rpe 0-10)
  - Test `updateSet(id, patch)` → updates set fields
  - Test `deleteSet(id)` → removes set
  - Test `listSetsByWorkout(workoutId)` → returns Set[]
  - Test error handling and constraint violations
  - ⏱️ Depends on: T006 | Blocks: T018

- [ ] **T015** [P] Contract test for `HistoryRepository` in `tests/contracts/history-repository.contract.test.ts`
  - Test `logSession(input)` → creates history entry
  - Test `listHistory({ cursor, limit, from, to })` → keyset pagination
  - Test `backfillHistory(entries)` → batch insert with idempotency
  - Test error handling
  - ⏱️ Depends on: T006 | Blocks: T019

---

## Phase 3.3: Core Implementation (ONLY after T007-T015 written and FAILING)

### Repository Layer

- [ ] **T016** [P] Implement `ExerciseRepository` in `src/lib/db/repos/exercise.ts`
  - Implement `listExercises()` with search and category filtering
  - Implement `createExercise()` with unique name validation
  - Implement `getExerciseById()`
  - Implement `bulkSeedExercises()` with `ON CONFLICT DO NOTHING`
  - Throw `StorageError` with appropriate codes (VALIDATION, NOT_FOUND, CONFLICT, INTERNAL)
  - Update T012 contract test to verify all functions pass
  - ⏱️ Depends on: T007, T012 | Blocks: T022

- [ ] **T017** [P] Implement `WorkoutRepository` in `src/lib/db/repos/workout.ts`
  - Implement `listWorkouts()` with optional history inclusion
  - Implement `getWorkout()` returning full detail with exercises and sets
  - Implement `upsertWorkout()` using `db.transaction()` for atomicity
  - Handle exercise reordering and preservation of existing sets
  - Throw `StorageError` appropriately
  - Update T013 contract test to verify all functions pass
  - ⏱️ Depends on: T008, T013 | Blocks: T023

- [ ] **T018** [P] Implement `SetRepository` in `src/lib/db/repos/set.ts`
  - Implement `addSet()` with constraint validation
  - Implement `updateSet()` for field updates
  - Implement `deleteSet()`
  - Implement `listSetsByWorkout()`
  - Throw `StorageError` appropriately
  - Update T014 contract test to verify all functions pass
  - ⏱️ Depends on: T009, T014 | Blocks: T024

- [ ] **T019** [P] Implement `HistoryRepository` in `src/lib/db/repos/history.ts`
  - Implement `logSession()` for session logging
  - Implement `listHistory()` with keyset pagination (cursor-based)
  - Implement `backfillHistory()` for batch import
  - Throw `StorageError` appropriately
  - Update T015 contract test to verify all functions pass
  - ⏱️ Depends on: T010, T015 | Blocks: T025

- [ ] **T020** [P] Implement `PreferenceRepository` in `src/lib/db/repos/preference.ts`
  - Implement `getPreferences()` and `savePreferences()`
  - Support JSONB field for extensible preference storage
  - Validate against Zod schema per existing UserSettings type
  - ⏱️ Depends on: T002 | Blocks: T032

- [ ] **T021** [P] Implement migration services in `src/lib/db/services/`
  - Implement `DualWriteService` to intercept mutations and write to both JSON + DB
  - Implement `BackfillService` to read data/*.json and populate DB
  - Implement `ParityChecker` to compare JSON vs DB state (counts, hashes)
  - Export health check function for `/api/exercises/migrate/verify`
  - ⏱️ Depends on: T016-T020 | Blocks: T026, T033, T034, T035

---

## Phase 3.4: API Implementation

- [ ] **T022** Implement `/api/exercises` endpoints in `src/app/api/exercises/route.ts`
  - Implement `GET /api/exercises` → uses `ExerciseRepository.listExercises()`
  - Implement `POST /api/exercises` → uses `ExerciseRepository.createExercise()`
  - Add request validation with Zod
  - Map `StorageError` to HTTP responses (400, 404, 409, 500)
  - Add observability logging
  - Update T007 contract test to verify all endpoints pass
  - ⏱️ Depends on: T007, T016, T021 | Blocks: None

- [ ] **T023** Implement `/api/workouts` endpoints in `src/app/api/workouts/route.ts` and `[id]/route.ts`
  - Implement `GET /api/workouts` → uses `WorkoutRepository.listWorkouts()`
  - Implement `GET /api/workouts/:id` → uses `WorkoutRepository.getWorkout()`
  - Implement `POST /api/workouts` → uses `WorkoutRepository.upsertWorkout()`
  - Implement `PUT /api/workouts/:id` → exercise reordering
  - Implement `DELETE /api/workouts/:id`
  - Add request validation, error mapping, observability
  - Update T008 contract test to verify all endpoints pass
  - ⏱️ Depends on: T008, T017, T021 | Blocks: None

- [ ] **T024** Implement `/api/workouts/:id/sets` endpoints in `src/app/api/workouts/[id]/sets/route.ts`
  - Implement `GET /api/workouts/:id/sets` → uses `SetRepository.listSetsByWorkout()`
  - Implement `POST /api/workouts/:id/sets` → uses `SetRepository.addSet()`
  - Implement `PUT /api/workouts/:id/sets/:setId` → uses `SetRepository.updateSet()`
  - Implement `DELETE /api/workouts/:id/sets/:setId` → uses `SetRepository.deleteSet()`
  - Add validation, error mapping, observability
  - Update T009 contract test to verify all endpoints pass
  - ⏱️ Depends on: T009, T018, T021 | Blocks: None

- [ ] **T025** Implement `/api/history` endpoints in `src/app/api/history/route.ts`
  - Implement `GET /api/history` → uses `HistoryRepository.listHistory()` with cursor pagination
  - Implement `POST /api/history` → uses `HistoryRepository.logSession()`
  - Support date range filtering (`from`, `to` query params)
  - Add validation, error mapping, observability
  - Update T010 contract test to verify all endpoints pass
  - ⏱️ Depends on: T010, T019, T021 | Blocks: None

- [ ] **T026** Implement migration verification endpoints in `src/app/api/exercises/migrate/route.ts`
  - Implement `GET /api/exercises/migrate/verify` → returns parity report from `ParityChecker`
  - Implement `POST /api/exercises/migrate/backfill` → calls `BackfillService.backfill()`
  - Implement `POST /api/exercises/migrate/dual-write/toggle` → manages USE_DB_DUAL_WRITE flag
  - Add error handling and observability
  - Update T011 contract test to verify all endpoints pass
  - ⏱️ Depends on: T011, T021 | Blocks: None

- [ ] **T027** [P] Create API error handler in `src/lib/db/errors/api-error-mapper.ts`
  - Map `StorageError` types to HTTP status codes and messages
  - Centralize error response format for consistency across all routes
  - Export `mapStorageErrorToResponse(error)` utility
  - ⏱️ Depends on: T021 | Blocks: T022-T026

---

## Phase 3.5: Server Actions Update

- [ ] **T028** Update existing Server Action `src/app/actions/workout.ts` to use `WorkoutRepository`
  - Replace JSON file reads with `WorkoutRepository.listWorkouts()`
  - Replace JSON file writes with `WorkoutRepository.upsertWorkout()`
  - Maintain feature flag `USE_DB` for gradual rollout
  - ⏱️ Depends on: T017 | Blocks: None

- [ ] **T029** Update existing Server Action `src/app/actions/exercise.ts` to use `ExerciseRepository`
  - Replace JSON reads with `ExerciseRepository.listExercises()`
  - Support search and filtering via repository
  - ⏱️ Depends on: T016 | Blocks: None

- [ ] **T030** Update existing Server Action `src/app/actions/set.ts` to use `SetRepository`
  - Replace set creation/update with `SetRepository.addSet()` and `SetRepository.updateSet()`
  - ⏱️ Depends on: T018 | Blocks: None

- [ ] **T031** Update existing Server Action `src/app/actions/history.ts` to use `HistoryRepository`
  - Replace history logging with `HistoryRepository.logSession()`
  - ⏱️ Depends on: T019 | Blocks: None

- [ ] **T032** Update `src/app/actions/preferences.ts` to use `PreferenceRepository`
  - Replace preference reads/writes with `PreferenceRepository`
  - ⏱️ Depends on: T020 | Blocks: None

---

## Phase 3.6: Migration Tooling

- [ ] **T033** Create backfill script in `scripts/backfill-legacy-data.ts`
  - Load all JSON files (`data/workouts.json`, `data/exercise-library-seed.json`, etc.)
  - Insert into Postgres using `BackfillService`
  - Verify counts and data parity post-backfill
  - Support `--dry-run` flag to preview changes
  - ⏱️ Depends on: T021 | Blocks: T036, T037

- [ ] **T034** Create dual-write toggle utility in `scripts/toggle-dual-write.ts`
  - Enable/disable `USE_DB_DUAL_WRITE` flag in environment
  - Log state transitions for audit trail
  - ⏱️ Depends on: T021 | Blocks: None

- [ ] **T035** Create parity verification utility in `scripts/verify-parity.ts`
  - Run `ParityChecker.check()` and output detailed report
  - Compare counts, checksums, and identify missing/extra records
  - Support filtering by entity type (exercises, workouts, etc.)
  - ⏱️ Depends on: T021 | Blocks: None

- [ ] **T036** Create migration cutover script in `scripts/cutover-to-postgres.ts`
  - Sequence: disable dual-write, verify parity, enable USE_DB, monitor
  - Include rollback mechanism if parity check fails
  - Log all transitions for audit
  - ⏱️ Depends on: T033, T035 | Blocks: None

- [ ] **T037** Create data cleanup script in `scripts/cleanup-legacy-json.ts`
  - Archive JSON files after successful cutover
  - Support restoration if rollback needed
  - Verify all data migrated before deletion
  - ⏱️ Depends on: T033 | Blocks: None

---

## Phase 3.7: Polish & Documentation

- [ ] **T038** [P] Create comprehensive unit tests in `tests/unit/db/`
  - Test `ExerciseRepository` edge cases in `tests/unit/db/exercise-repo.test.ts`
  - Test `WorkoutRepository` transaction rollback in `tests/unit/db/workout-repo.test.ts`
  - Test `SetRepository` constraint validation in `tests/unit/db/set-repo.test.ts`
  - Test `HistoryRepository` pagination in `tests/unit/db/history-repo.test.ts`
  - Test error handling and edge cases for all services
  - ⏱️ Depends on: T016-T020 | Blocks: None

- [ ] **T039** [P] Performance profiling and optimization in `tests/performance/db-perf.test.ts`
  - Profile query performance: target p95 < 200ms for all reads
  - Profile cold start with DB initialization
  - Profile dual-write performance (JSON + DB)
  - Identify slow queries and add missing indexes
  - ⏱️ Depends on: T022-T026 | Blocks: None

- [ ] **T040** [P] Create quickstart validation flow in `specs/004-neon-postgres-database/quickstart.md`
  - Document environment variable setup for local/production
  - Document migration execution steps
  - Document backfill validation workflow
  - Document cutover checklist
  - Document rollback procedures
  - ⏱️ Depends on: T033-T037 | Blocks: None

- [ ] **T041** [P] Create component interface contracts in `specs/004-neon-postgres-database/contracts/component-interfaces.md`
  - Document Server Action props and return types
  - Document new Client Component props if any
  - Document error boundaries for DB-backed UI
  - Document loading states for async operations
  - ⏱️ Depends on: T028-T032 | Blocks: None

- [ ] **T042** [P] Update project documentation in `README.md` and new `docs/DATABASE.md`
  - Add database architecture overview
  - Document feature flag control (`USE_DB`, `USE_DB_DUAL_WRITE`)
  - Add troubleshooting section for common DB issues
  - Add links to Neon and Drizzle documentation
  - ⏱️ Depends on: T040 | Blocks: None

- [ ] **T043** Remove or archive deprecated JSON storage code
  - Archive old `src/lib/storage.ts` functions (after deprecation period)
  - Update imports across codebase to use new DB layer
  - Run full test suite to verify no broken references
  - Commit cleanup separately for easy revert if needed
  - ⏱️ Depends on: T028-T032 | Blocks: None

---

## Dependency Graph

```
T001 ──┬──→ T002 ──→ T003 ──┬──→ T004
       │                    ├──→ T005 ──→ T006 ──┬──→ T007-T015 ──┬──→ T016-T020
       │                    │                     │               │
       └──────────────────────────────────────────┘               ├──→ T021 ──┬──→ T022-T026
                                                                   │          │
                                                                   ├──→ T027 ─┘
                                                                   │
                                                                   ├──→ T028-T032
                                                                   │
                                                                   ├──→ T033-T037 ──→ T043
                                                                   │
                                                                   └──→ T038-T042
```

---

## Parallel Execution Groups

### Group A: Database Infrastructure (Sequential foundation)
```
T001 → T002 → T003 → (parallel: T004, T005) → T006
```

### Group B: Test Suite (Parallel before implementation)
```
After T006 complete:
T007 [P] Contract: /api/exercises
T008 [P] Contract: /api/workouts
T009 [P] Contract: /api/workouts/:id/sets
T010 [P] Contract: /api/history
T011 [P] Contract: Migration endpoints
T012 [P] Contract: ExerciseRepository
T013 [P] Contract: WorkoutRepository
T014 [P] Contract: SetRepository
T015 [P] Contract: HistoryRepository
```

### Group C: Repository Implementation (Parallel after tests)
```
After T007-T015 written and failing:
T016 [P] ExerciseRepository
T017 [P] WorkoutRepository
T018 [P] SetRepository
T019 [P] HistoryRepository
T020 [P] PreferenceRepository
T021 [P] Migration services

Note: T021 depends on T016-T020 complete
```

### Group D: API Endpoints (Parallel after repositories)
```
After T016-T020 complete and T021 complete:
T022 [P] /api/exercises
T023 [P] /api/workouts
T024 [P] /api/workouts/:id/sets
T025 [P] /api/history
T026 [P] Migration endpoints
T027 [P] Error mapper (shared by all)
```

### Group E: Server Actions (Parallel)
```
After repositories ready:
T028 [P] Update workout.ts
T029 [P] Update exercise.ts
T030 [P] Update set.ts
T031 [P] Update history.ts
T032 [P] Update preferences.ts
```

### Group F: Migration Scripts (Sequential dependency chain)
```
T033 → T035 → T036 → T037 → T043
T034 (parallel with others)
```

### Group G: Polish (Parallel)
```
T038 [P] Unit tests
T039 [P] Performance tests
T040 [P] Quickstart docs
T041 [P] Component interfaces
T042 [P] Update README
```

---

## Task Execution Commands

### Launch Phase 3.1 (Setup - Sequential)
```bash
npx specify-cli task run T001
# After T001 completes:
npx specify-cli task run T002
# After T002:
npx specify-cli task run T003
# After T003, parallel:
npx specify-cli task run T004 T005
# After T004/T005:
npx specify-cli task run T006
```

### Launch Phase 3.2 (Tests - All Parallel after T006)
```bash
npx specify-cli task run T007 T008 T009 T010 T011 T012 T013 T014 T015
```

### Launch Phase 3.3 (Repositories - All Parallel after tests written)
```bash
npx specify-cli task run T016 T017 T018 T019 T020
# After T016-T020 complete:
npx specify-cli task run T021
```

### Launch Phase 3.4 (API - All Parallel after repositories)
```bash
npx specify-cli task run T022 T023 T024 T025 T026 T027
```

### Launch Remaining Phases
```bash
npx specify-cli task run T028 T029 T030 T031 T032  # Server Actions
npx specify-cli task run T033 T034 T035 T036 T037  # Migration tooling
npx specify-cli task run T038 T039 T040 T041 T042  # Polish
npx specify-cli task run T043                      # Cleanup
```

---

## Validation Checklist

- [x] All 2 contract files have corresponding tests (T007-T011 for API, T012-T015 for services)
- [x] All 6 entities have repository and model tasks (exercises, workouts, sets, history, preferences, user_settings)
- [x] All tests (T007-T015) written BEFORE implementation (T016-T026)
- [x] Parallel tasks (marked [P]) operate on independent files
- [x] Each task specifies exact file paths
- [x] No task modifies same file as another parallel task within a group
- [x] Dependencies properly ordered: Setup → Tests → Repositories → API → Server Actions → Tooling → Polish
- [x] Error handling centralized (T027 error mapper)
- [x] Migration strategy sequential and rollback-safe (T033-T037)
- [x] Documentation and polish at end (T038-T042)

---

## Notes

- **Feature Flag Safety**: All database features are gated behind `USE_DB` and `USE_DB_DUAL_WRITE` flags; no rollback risk
- **Transactional Integrity**: `WorkoutRepository.upsertWorkout()` uses transactions; all repositories throw consistent `StorageError`
- **Test Database**: All contract tests use isolated test DB (T005 setup) with automatic rollback
- **Gradual Rollout**: Server Actions updated last (T028-T032) to allow full DB layer testing before touching existing code
- **Observability**: `logDbEvent()` utility added to all repositories for lightweight instrumentation
- **Cleanup**: JSON files archived (T037) only after successful cutover and parity verification

---

**Generated by tasks.prompt.md v2 | Neon Postgres Migration Feature | 2025-11-07**
