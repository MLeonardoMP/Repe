# Tasks: Aplicación de Seguimiento de Entrenamientos

**Input**: Design documents from `/specs/001-contruye-una-aplicacion/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Summary
NextJS 15.5.3 web application for gym workout tracking. Mobile-first design with TypeScript, shadcn/ui, and JSON storage.

**Core Features (v1.0)**: Create workout sessions, track exercises with sets (weight, reps, intensity, timing), view history.

**Enhanced Features (v1.1 - NEW)**: Exercise library with 100+ exercises, enhanced rest timer with auto-start, workout templates, exercise history & PR tracking, statistics dashboard, quick actions, data export/import.

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

## Phase 3.10: Exercise Library Feature (NEW - Based on Research)
⚠️ **HIGH PRIORITY**: Essential for faster workout entry and consistency
- [ ] T054 Create ExerciseTemplate TypeScript interface in src/types/exercise-template.ts
- [ ] T055 Load exercise library seed data (data/exercise-library-seed.json) on app init
- [ ] T056 Create ExerciseLibraryService in src/lib/exercise-library.ts with search/filter methods
- [ ] T057 Create ExerciseLibraryBrowser component in src/components/exercise/ExerciseLibraryBrowser.tsx
- [ ] T058 Create ExerciseCard component in src/components/exercise/ExerciseLibraryCard.tsx
- [ ] T059 Create ExerciseSearchBar component with category/equipment filters
- [ ] T060 [P] Implement favorite/bookmark exercises functionality
- [ ] T061 Add "Select from Library" option in workout session
- [ ] T062 Create exercise library page at src/app/exercises/page.tsx
- [ ] T063 Write tests for exercise library search and filter
- [ ] T064 Add custom exercise creation UI (user-added exercises)

## Phase 3.11: Enhanced Rest Timer (NEW - Based on Research)
⚠️ **HIGH PRIORITY**: Critical for workout flow and recovery
- [ ] T065 Update UserPreferences interface with rest timer settings
- [ ] T066 Enhance useTimer hook with auto-start and notification support
- [ ] T067 Create RestTimerConfig component in src/components/workout/RestTimerConfig.tsx
- [ ] T068 Add audio notification when rest completes (Web Audio API)
- [ ] T069 Add visual notification overlay/toast when rest completes
- [ ] T070 [P] Create quick rest time adjustment buttons (30s, 60s, 90s, 120s, 180s)
- [ ] T071 Implement exercise-specific rest time overrides
- [ ] T072 Add rest timer to lock screen (PWA notification)
- [ ] T073 Write tests for rest timer auto-start and notifications
- [ ] T074 Add rest timer preferences page at src/app/settings/rest-timer/page.tsx

## Phase 3.12: Workout Templates (NEW - Based on Research)
⚠️ **HIGH PRIORITY**: Major time-saver for users
- [ ] T075 Create WorkoutTemplate TypeScript interface in src/types/workout-template.ts
- [ ] T076 Create WorkoutTemplateService in src/lib/workout-template.ts
- [ ] T077 Create SaveTemplateDialog component in src/components/workout/SaveTemplateDialog.tsx
- [ ] T078 Create TemplateLibrary component in src/components/workout/TemplateLibrary.tsx
- [ ] T079 Add "Save as Template" button to completed workouts
- [ ] T080 [P] Add "Start from Template" option on workout creation
- [ ] T081 Implement "Repeat Last Workout" quick action
- [ ] T082 Create workout templates management page at src/app/templates/page.tsx
- [ ] T083 Add template usage tracking (increment usageCount)
- [ ] T084 Write tests for template save/load/edit/delete operations
- [ ] T085 [P] Create 3 pre-built templates (Push/Pull/Legs) for beginners

## Phase 3.13: Exercise History & Progress (NEW - Based on Research)
⚠️ **HIGH PRIORITY**: Key motivational feature
- [ ] T086 Create ExerciseHistory TypeScript interfaces in src/types/exercise-history.ts
- [ ] T087 Create ExerciseHistoryService in src/lib/exercise-history.ts
- [ ] T088 Implement personal records (PR) calculation logic
- [ ] T089 Create ExerciseHistoryView component in src/components/exercise/ExerciseHistoryView.tsx
- [ ] T090 Create PRBadge component for celebrating new records
- [ ] T091 [P] Create ProgressChart component with Chart.js or Recharts
- [ ] T092 Add volume calculation (sets × reps × weight) to workout sessions
- [ ] T093 Implement automatic PR detection after workout completion
- [ ] T094 Create exercise detail page at src/app/exercises/[id]/page.tsx with history
- [ ] T095 Add "View History" link from exercise cards
- [ ] T096 Write tests for PR calculation and history aggregation
- [ ] T097 [P] Add one-rep max (1RM) calculation using Epley formula

## Phase 3.14: Statistics Dashboard (NEW - Based on Research)
🔥 **MEDIUM PRIORITY**: Motivational and analytics feature
- [ ] T098 Create WorkoutStatistics TypeScript interface in src/types/statistics.ts
- [ ] T099 Create StatisticsService in src/lib/statistics.ts with caching
- [ ] T100 Implement workout streak calculation logic
- [ ] T101 Create StatisticsDashboard component in src/components/stats/StatisticsDashboard.tsx
- [ ] T102 Create StatCard component for displaying individual metrics
- [ ] T103 [P] Create MuscleGroupChart component (pie/bar chart)
- [ ] T104 Implement workout frequency calculation (workouts per week)
- [ ] T105 Add total volume calculation (all-time, monthly, weekly)
- [ ] T106 Create statistics page at src/app/stats/page.tsx
- [ ] T107 Add statistics summary to home/dashboard page
- [ ] T108 Implement statistics caching in JSON storage
- [ ] T109 Write tests for statistics calculations
- [ ] T110 [P] Add workout calendar heatmap component

## Phase 3.15: Quick Actions & UX Enhancements (NEW - Based on Research)
🔥 **MEDIUM PRIORITY**: Improves workout flow
- [ ] T111 Add "Duplicate Last Set" quick action button
- [ ] T112 Create QuickWeightAdjust component with +2.5kg, +5kg buttons
- [ ] T113 Implement swipe-to-delete gesture for sets/exercises
- [ ] T114 Add "Copy from Previous Workout" feature
- [ ] T115 [P] Implement haptic feedback for mobile interactions
- [ ] T116 Add keyboard shortcuts for desktop users (optional)
- [ ] T117 Create BottomSheet component for mobile-optimized quick actions
- [ ] T118 Add quick exercise reorder with drag-and-drop
- [ ] T119 Implement optimistic UI updates for better perceived performance
- [ ] T120 Write tests for quick actions and gestures

## Phase 3.16: Data Export/Import (NEW - Based on Research)
🔥 **MEDIUM PRIORITY**: Data portability and backup
- [ ] T121 Create DataExportService in src/lib/data-export.ts
- [ ] T122 Implement JSON export for all workout data
- [ ] T123 Implement CSV export for individual workouts
- [ ] T124 Create DataImportService in src/lib/data-import.ts with validation
- [ ] T125 Create ExportDialog component in src/components/data/ExportDialog.tsx
- [ ] T126 Create ImportDialog component in src/components/data/ImportDialog.tsx
- [ ] T127 Add export/import options to settings page
- [ ] T128 Implement data validation during import
- [ ] T129 Add backup reminder notifications (weekly)
- [ ] T130 Write tests for export/import functionality
- [ ] T131 [P] Add "Share Workout" feature (export as text/image)

## Phase 3.17: Data Migration & Seed (NEW - Required for v1.1)
⚠️ **CRITICAL**: Must complete before releasing new features
- [ ] T132 Create data migration script from v1.0 to v1.1 schema
- [ ] T133 Test migration with existing workout data
- [ ] T134 Load exercise library seed data into workouts.json
- [ ] T135 Initialize empty workoutTemplates array in storage
- [ ] T136 Calculate and cache initial statistics for existing workouts
- [ ] T137 Update UserPreferences with default rest timer values
- [ ] T138 Write migration tests
- [ ] T139 Create migration documentation
- [ ] T140 Implement rollback mechanism for failed migrations

## Dependencies
**Critical Path (Original)**:
- Setup (T001-T006) → TypeScript (T007-T011) → Storage (T012-T015) → Component Tests (T016-T021) → Components (T022-T028) → Hooks (T029-T032) → API Routes (T033-T039) → Pages (T040-T045) → Integration (T046-T053)

**Critical Path (New Features - v1.1)**:
- Migration (T132-T140) → Exercise Library (T054-T064) → Templates (T075-T085) → Enhanced Timer (T065-T074) → History (T086-T097) → Statistics (T098-T110) → Quick Actions (T111-T120) → Export/Import (T121-T131)

**Parallel Groups**:
- Group A: T003, T004, T005 (configuration tasks)
- Group B: T007, T008, T009, T010, T011 (TypeScript interfaces)
- Group C: T016, T017, T018, T019, T020, T021 (component tests)
- Group D: T022, T023, T024, T025, T026, T027, T028 (React components)
- Group E: T047, T048, T049 (polish tasks)
- Group F: T051, T052, T053 (final optimizations)
- Group G: T054, T065, T075, T086, T098 (new feature TypeScript interfaces)
- Group H: T056, T066, T076, T087, T099 (new feature services)
- Group I: T057-T059, T067-T069, T077-T079, T089-T091, T101-T103 (new feature components)
- Group J: T063, T073, T084, T096, T109, T120, T130 (new feature tests)
- Group K: T111-T120 (quick actions - can be done in parallel)

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

### Original Features (v1.0)
- [ ] All TypeScript interfaces match data model specifications
- [ ] All components have corresponding tests that initially fail
- [ ] All API routes handle error cases gracefully
- [ ] Mobile-first responsive design implemented correctly
- [ ] Performance targets met (<200ms response, <2s load time)
- [ ] Accessibility standards followed (WCAG AA)
- [ ] JSON storage operations are atomic and validated
- [ ] Dark theme applied consistently across all components

### New Features (v1.1) - Additional Checks
- [ ] Exercise library loads in <100ms (in-memory caching)
- [ ] Rest timer notifications work on all mobile browsers
- [ ] Workout templates save/load correctly with all exercise data
- [ ] Exercise history calculations accurate for 100+ workouts
- [ ] Statistics dashboard renders in <500ms
- [ ] Quick actions have haptic feedback on supported devices
- [ ] Data export/import maintains data integrity
- [ ] Migration from v1.0 to v1.1 completes without data loss
- [ ] Bundle size remains under 250KB (new target with features)
- [ ] All new features work offline after initial load
- [ ] Personal records (PRs) detected accurately
- [ ] Workout volume calculations correct for all exercises