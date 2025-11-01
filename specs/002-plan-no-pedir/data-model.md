# Data Model: Auto-Named Routine Flow

## Entities

### RoutineTemplate

- **Description**: Captures reusable workout routine definitions created by the product team or by the user through past sessions.
- **Attributes**:
  - `id` (string, UUID)
  - `name` (string, required, unique per user)
  - `origin` (enum: `prebuilt`, `user-session`)
  - `createdAt` (ISO datetime)
  - `updatedAt` (ISO datetime)
  - `exerciseIds` (string[], ordered)
- **Rules**:
  - Names must be unique per user; duplicates get suffixed automatically.
  - `exerciseIds` reflects the latest confirmed composition of the routine.

### RoutineNameSuggestion

- **Description**: Lightweight projection used to surface auto-name candidates based on usage history.
- **Attributes**:
  - `templateId` (string)
  - `displayName` (string)
  - `usageCount` (number)
  - `lastUsedAt` (ISO datetime)
- **Rules**:
  - Generated on demand by ranking templates; not persisted beyond caching layer.

### RoutineSession

- **Description**: Represents an instance of starting a routine with a selected exercise.
- **Attributes**:
  - `id` (string, UUID)
  - `userId` (string)
  - `routineTemplateId` (string, nullable when template created on the fly)
  - `routineName` (string)
  - `startedAt` (ISO datetime)
  - `initialExerciseId` (string)
  - `notes` (string, optional)
  - `createdExercises` (Exercise[]; session-scope additions)
- **Rules**:
  - `routineName` stores the final name shown to the user (including suffix when deduped).
  - `createdExercises` persist only when the user toggles "save to routine".

### Exercise

- **Description**: Canonical exercise definition available to routines.
- **Attributes**:
  - `id` (string, UUID)
  - `name` (string, required)
  - `category` (enum or string)
  - `equipment` (string, optional)
  - `defaultReps` (number, optional)
  - `defaultSets` (number, optional)
  - `createdBy` (string, `system` | `user`)
- **Rules**:
  - Exercise names may repeat; uniqueness is enforced through ID.
  - When created during a session, `createdBy` is `user`.

### RoutineExerciseLink

- **Description**: Association between `RoutineTemplate` and `Exercise` capturing order and user overrides.
- **Attributes**:
  - `templateId` (string)
  - `exerciseId` (string)
  - `position` (number)
  - `addedByUser` (boolean)
  - `addedAt` (ISO datetime)
- **Rules**:
  - Maintains the sequence displayed when starting a routine.
  - New exercises flagged with `addedByUser = true` for analytics.

## Relationships

- `RoutineTemplate` 1—* `RoutineExerciseLink`
- `RoutineExerciseLink` *—1 `Exercise`
- `RoutineSession` *—1 `RoutineTemplate`
- `RoutineSession` *—* `Exercise` via `createdExercises`

## Notes

- Persistence layer continues to leverage existing storage utilities (`workoutStorage`), extended to support templates and suggestions.
- Suggestion ranking can be computed in-memory from routine history to honor minimalism.
