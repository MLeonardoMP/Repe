# Implementation Plan: Auto-Named Routine Flow

**Branch**: `002-plan-no-pedir` | **Date**: 2025-10-12 | **Spec**: specs/002-plan-no-pedir/spec.md
**Input**: Feature specification from `/specs/002-plan-no-pedir/spec.md`

## Execution Flow (/plan command scope)

```text
1. Load feature spec from Input path
   → DONE (spec parsed and summarized below)
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → DONE (all prior clarifications resolved in research)
3. Fill the Constitution Check section based on the content of the constitution document.
   → DONE (see Constitution Check)
4. Evaluate Constitution Check section below
   → PASS; no violations detected. Progress updated.
5. Execute Phase 0 → research.md
   → DONE (research findings recorded)
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file
   → DONE (artifacts generated; agent context update scheduled with future change)
7. Re-evaluate Constitution Check section
   → PASS; design honours modularity/minimalism. Progress updated.
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
   → DONE (see Phase 2 section)
9. STOP - Ready for /tasks command
```

## Summary

The feature lets users create workout routines without typing names by reusing and ranking previously saved routine templates. Users confirm an auto-suggested name, review the exercises attached to that routine, optionally add a new exercise, and start the session with their chosen exercise. New exercises can be persisted back to the template when requested.

## Technical Context

- **Language/Version**: TypeScript (Next.js 14, Node 22)
- **Primary Dependencies**: Next.js App Router, React, internal `workoutStorage`
- **Storage**: Local storage abstraction (`workoutStorage`) persisted via filesystem/json (per existing app)
- **Testing**: Jest + React Testing Library (already configured)
- **Target Platform**: Web (desktop & mobile browsers)
- **Project Type**: web (single repo with Next.js frontend + API routes)
- **Performance Goals**: Suggestion lookup under 50ms; routine start flow under existing workout creation latency
- **Constraints**: Avoid additional backend services; leverage existing storage utilities; maintain offline capability of local storage routines
- **Scale/Scope**: Single-user experience (default user) with dozens of routines and exercises

## Constitution Check

- **Modularidad**: New logic encapsulated in dedicated routine template service and UI components; avoids touching unrelated modules.
- **Minimalismo**: Reuses existing storage and API patterns; avoids introducing new backend infrastructure.
- **Rendimiento**: Suggestion ranking computed in-memory with capped lists to keep UI responsive.
- **Simplicidad**: Flow keeps a single modal with clear steps; no new navigation complexity.
- **Experiencia de Usuario**: Removes friction by avoiding manual typing while keeping optional control over added exercises.

Status: PASS (Initial) | PASS (Post-Design)

## Project Structure

### Documentation (this feature)

```text
specs/002-plan-no-pedir/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (auto-named-routines.openapi.yaml)
└── tasks.md             # To be produced by /tasks command
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   ├── workouts/
│   │   └── routines/            # new folder for templates + start endpoint
│   ├── components/
│   │   └── workout/             # new UI for routine modal & exercise selection
│   └── (existing pages)
├── hooks/
│   └── use-workout, useWorkoutHistory (extend with suggestion helpers)
└── lib/
    ├── storage.ts               # extend for template persistence
    ├── repositories/            # new file for routine templates (if needed)
    └── utils.ts

tests/
├── integration/
│   ├── routine-autoname.test.tsx
│   └── api-routines-autoname.test.ts
└── unit/
    ├── hooks/
    └── components/
```

**Structure Decision**: Option 2 (web) adapted to existing Next.js monorepo layout (single app directory).

## Phase 0: Outline & Research

- Consolidated naming rules, duplicate handling, and suggestion ranking in `research.md`.
- Resolved previously flagged clarifications:
   - Users choose from suggestions only (no free typing).
   - New exercises can be session-only or persisted when toggled.
   - Default naming fallback defined when no templates exist.
- Identified need for lightweight ranking logic and suffix-based dedupe.

## Phase 1: Design & Contracts

- Documented entities in `data-model.md` (templates, sessions, exercises, linkage).
- Authored API contract in `contracts/auto-named-routines.openapi.yaml` covering suggestion listing and routine start flow.
- Captured end-to-end scenarios in `quickstart.md` for manual and automated testing.
- Agent context update (copilot) will be run alongside implementation to keep instructions synchronized.

## Phase 2: Task Planning Approach

- `/tasks` will derive work items from:
   - **Contracts** → endpoint implementation & contract tests (`/api/routines/templates`, `/api/routines/start`).
   - **Data model** → storage updates (`RoutineTemplate`, ranking helpers).
   - **Quickstart** → integration/UI tests reflecting QS-01..QS-05.
- Ordering strategy:
   1. Extend storage layer (models & repository functions).
   2. Add contract tests before implementing API routes.
   3. Implement API handlers, then hook UI flow & hooks.
   4. Add integration/UI tests, followed by polish (accessibility, regression).
- Parallelization notes: contract vs UI tests can run in parallel once storage helpers exist; UI implementation tasks share files and stay sequential.

## Phase 3+: Future Implementation

- Phase 3: `/tasks` will generate executable task list.
- Phase 4: Implement features per tasks, ensuring modular commits and tests.
- Phase 5: Execute Jest suites and manual quickstart verification.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _None_ | — | — |

## Progress Tracking

- **Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

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
