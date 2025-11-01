# Feature Specification: Auto-Named Routine Flow

**Feature Branch**: `002-plan-no-pedir`
**Created**: 2025-10-12
**Status**: Draft
**Input**: User description: "plan no pedir nomrbe para crear r rutina abssarse en el nombre de las rutinas rpe hechas o neuvas. cuandeodo se inica una rutinad ebe poderse seleccionar unod e lso ejercicios de esta rutina solamente como opcional sea agregar uno neuvo."

## Execution Flow (main)

```text
1. User opens the planner to create a workout routine.
	-> System derives a routine name from available templates or recent routines without asking the user to type one.
2. System displays the auto-selected routine name and allows the user to confirm or pick from other suggested names.
	-> \[NEEDS CLARIFICATION: Should users be allowed to override the auto name or must they accept suggestions only?]
3. System shows exercises already associated with the selected routine name.
4. User may start the routine by choosing one of the listed exercises.
5. User has the option to add a brand-new exercise before starting.
	-> \[NEEDS CLARIFICATION: Should newly added exercises persist for future routines or remain session-only?]
6. Routine session begins with the chosen exercise, reflecting any optional additions.
7. Review for missing information and surface questions prior to development.
```

---

## User Scenarios & Testing

### Primary User Story

As a fitness app user planning a workout, I want the system to handle routine naming automatically based on existing templates so that I can start quickly without typing names and immediately select an exercise to begin.

### Acceptance Scenarios

1. **Given** the user opens the routine planner, **When** they create a new routine, **Then** the system must present an auto-generated routine name sourced from existing or newly created routines without requiring manual input.

2. **Given** an auto-named routine is ready to start, **When** the user chooses to begin, **Then** the system must display the exercises linked to that routine and allow the user to select one to launch the session, with an option to add a new exercise before starting.

### Edge Cases

- What happens when there are no prior routines or templates to derive a name from?
- How does the system handle duplicate routine names generated from the same template?
- If the user adds a new exercise that partially matches an existing one, should the system merge or keep both?

## Requirements

### Functional Requirements

- **FR-001**: System MUST create new routines without prompting the user for a typed name, instead deriving the display name from existing predefined or user-made routines.
- **FR-002**: System MUST present a shortlist of suggested names when multiple candidate routines match the context. -> \[NEEDS CLARIFICATION: Criteria for selecting and ordering suggestions.]
- **FR-003**: Users MUST be able to review and confirm the auto-selected routine name before starting the session. -> \[NEEDS CLARIFICATION: Whether declining all suggestions cancels creation or requires another fallback?]
- **FR-004**: System MUST list only the exercises already associated with the confirmed routine when a session is initiated.
- **FR-005**: System MUST provide an option to add a new exercise during routine initiation without forcing the user to leave the start flow. -> \[NEEDS CLARIFICATION: Validation rules and data required for the new exercise entry.]
- **FR-006**: System MUST persist any newly added exercise according to business rules. -> \[NEEDS CLARIFICATION: Should persistence be routine-specific, user-wide, or temporary?]
- **FR-007**: System MUST prevent starting the routine until at least one exercise (existing or newly added) is selected.

### Key Entities

- **Routine Template/History Reference**: Represents existing routines (pre-built or previously created by the user) that contribute naming options and predefined exercise lists.
- **Routine Session**: Represents the instance of starting a routine, capturing the chosen routine name, selected exercise, optional new exercise additions, and start timestamp.
- **Exercise**: Represents an activity available within a routine, including metadata such as title, category, and any user-added details.

---

## Review & Acceptance Checklist

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [ ] No \[NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [x] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

---
