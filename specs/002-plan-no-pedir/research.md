# Research Summary: Auto-Named Routine Flow

## Decision Record

### 1. Routine Naming Strategy

- **Decision**: Derive routine names from the most recently used templates or past routine sessions for the current user. When there are no prior routines, generate a default name in the format "Rutina <día de la semana>" with an incremental suffix when duplicates appear.
- **Rationale**: Keeps the experience frictionless while ensuring names remain recognizable and unique without manual typing.
- **Alternatives Considered**:
  - **Free-text input fallback**: Rejected to preserve the "no typing" requirement.
  - **Fixed static list**: Rejected because it would not adapt to user-created routines.

### 2. Routine Name Confirmation Options

- **Decision**: Present the auto-selected name along with up to four alternative suggestions; users can choose any suggestion but cannot type a custom name.
- **Rationale**: Aligns with the request to avoid manual naming while giving the user limited control.
- **Alternatives Considered**:
  - **Forced auto-name with no choice**: Rejected to avoid locking users into unexpected names.
  - **Allowing manual rename**: Rejected to satisfy the explicit "no manual name" requirement.

### 3. Handling Newly Added Exercises

- **Decision**: Allow users to add a new exercise during routine start and offer a toggle to persist it into the underlying routine template; if the toggle is off, the exercise is session-only.
- **Rationale**: Meets the "optional new exercise" requirement while keeping templates up to date when desired.
- **Alternatives Considered**:
  - **Always persist**: Rejected to prevent template clutter when users just need a one-off exercise.
  - **Never persist**: Rejected because users often want to grow their routines over time.

### 4. Suggestion Ordering Logic

- **Decision**: Rank routine name suggestions by recency of use, then by frequency, with a deterministic fallback alphabetical order.
- **Rationale**: Recency plus frequency mirrors typical user intent and keeps the UI predictable.
- **Alternatives Considered**:
  - **Alphabetical only**: Rejected because it ignores actual usage patterns.
  - **Random selection**: Rejected to avoid confusion.

### 5. Duplicate Name Resolution

- **Decision**: When the chosen name conflicts with an active routine session started within the last 24 hours, append an incrementing suffix "(2)", "(3)", etc.
- **Rationale**: Maintains uniqueness without bothering the user for input.
- **Alternatives Considered**:
  - **Blocking duplicate starts**: Rejected to avoid unnecessary friction.
  - **Silently reusing the name**: Rejected because it complicates reporting.

## References

- Feature specification `specs/002-plan-no-pedir/spec.md`
- Constitution `./.specify/memory/constitution.md`
