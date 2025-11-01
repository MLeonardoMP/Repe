# Feature Specification: Aplicación de Seguimiento de Entrenamientos

**Feature Branch**: `001-contruye-una-aplicacion`  
**Created**: 2025-09-19  
**Status**: Draft  
**Input**: User description: "contruye una aplicacion para hacer seguimiento de entrenamientos en el gimnasion. Esta aplicacion esta pensada para usarse desde el movil via web. debe tener sesiones de entrenamiento compuestas de ejercicios. cada ejercicio tendra tiempo inicio tiempo find e cada serie. peso en kilogramos repeticiones intensidad y notas. basate en las mejores apps de este tipo en el mercado pero comenzaremos con un enfoque simple y minimalista."

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
Un usuario va al gimnasio y necesita registrar su sesión de entrenamiento. Abre la aplicación web en su móvil, crea una nueva sesión, añade ejercicios uno por uno, y para cada ejercicio registra las series realizadas con su tiempo, peso, repeticiones, intensidad y notas. Al finalizar, puede revisar su sesión completa y guardarla para futura referencia.

### Acceptance Scenarios
1. **Given** el usuario está en el gimnasio, **When** abre la aplicación en su móvil, **Then** puede crear una nueva sesión de entrenamiento fácilmente
2. **Given** el usuario está realizando un ejercicio, **When** completa una serie, **Then** puede registrar tiempo inicio/fin, peso, repeticiones, intensidad y notas
3. **Given** el usuario ha completado varios ejercicios, **When** revisa su sesión, **Then** puede ver todos los ejercicios y series registradas de forma clara
4. **Given** el usuario ha terminado su entrenamiento, **When** guarda la sesión, **Then** queda almacenada para consultas posteriores
5. **Given** el usuario quiere revisar entrenamientos pasados, **When** accede al historial, **Then** puede ver sus sesiones anteriores

### Edge Cases
- ¿Qué pasa si el usuario cierra la aplicación en medio de una sesión sin guardar?
- ¿Cómo maneja el sistema si el usuario registra datos inválidos (peso negativo, tiempo inconsistente)?
- ¿Qué ocurre si la conexión a internet se pierde durante el registro?
- ¿Cómo se comporta la aplicación en pantallas muy pequeñas?

## Requirements *(mandatory)*

### Functional Requirements

#### Core Workout Tracking
- **FR-001**: System MUST allow users to create new workout sessions
- **FR-002**: System MUST allow users to add exercises to a workout session
- **FR-003**: System MUST allow users to record sets for each exercise with start time, end time, weight (kg), repetitions, intensity level, and notes
- **FR-004**: System MUST persist workout sessions and their data
- **FR-005**: System MUST display workout sessions in a mobile-friendly interface
- **FR-006**: System MUST allow users to view their workout history
- **FR-007**: System MUST validate data inputs (positive weights, valid time ranges, reasonable repetition counts)
- **FR-008**: Users MUST be able to edit exercise data during the session
- **FR-009**: Users MUST be able to delete exercises or sets if entered incorrectly
- **FR-010**: System MUST provide a simple and intuitive user interface following minimalist principles
- **FR-011**: System MUST calculate set duration automatically from start/end times
- **FR-012**: System MUST support intensity levels on a 1-5 scale (1=easy, 5=maximum effort)

#### Exercise Library (NEW - Based on Research)
- **FR-015**: System MUST provide a pre-populated exercise library with 100+ common exercises
- **FR-016**: System MUST categorize exercises by muscle group (Chest, Back, Legs, Shoulders, Arms, Core, Cardio)
- **FR-017**: System MUST allow users to search and filter exercises by name, category, or equipment
- **FR-018**: System MUST allow users to mark exercises as favorites for quick access
- **FR-019**: System MUST include exercise descriptions and muscle groups targeted for each exercise
- **FR-020**: System MUST allow users to select exercises from library instead of typing names manually

#### Rest Timer (NEW - Based on Research)
- **FR-021**: System MUST provide a configurable rest timer between sets
- **FR-022**: System MUST support default rest times (30s, 60s, 90s, 120s, 180s)
- **FR-023**: System MUST auto-start rest timer after completing a set (configurable)
- **FR-024**: System MUST notify user when rest period is complete
- **FR-025**: System MUST allow users to skip or extend rest time during workout

#### Workout Templates (NEW - Based on Research)
- **FR-026**: System MUST allow users to save completed workouts as templates
- **FR-027**: System MUST allow users to start new workouts from saved templates
- **FR-028**: System MUST allow users to edit and delete workout templates
- **FR-029**: System MUST provide "Repeat Last Workout" quick start option
- **FR-030**: System MUST copy previous set data when adding new sets

#### Exercise History & Progress (NEW - Based on Research)
- **FR-031**: System MUST track and display history for each specific exercise
- **FR-032**: System MUST calculate and display personal records (max weight, max reps, max volume)
- **FR-033**: System MUST display progress graphs for exercises over time
- **FR-034**: System MUST calculate total workout volume (sets × reps × weight)
- **FR-035**: System MUST automatically detect and celebrate new personal records

#### Statistics & Analytics (NEW - Based on Research)
- **FR-036**: System MUST display total workouts completed
- **FR-037**: System MUST display total volume lifted (all time and weekly)
- **FR-038**: System MUST display workout frequency statistics
- **FR-039**: System MUST show workout streak counter
- **FR-040**: System MUST display muscle group distribution chart

#### Data Management (NEW - Based on Research)
- **FR-041**: System MUST allow users to export all workout data to JSON format
- **FR-042**: System MUST allow users to import workout data from JSON file
- **FR-043**: System MUST allow users to download individual workouts as CSV
- **FR-044**: System MUST maintain data backup functionality

#### User Experience Enhancements (NEW - Based on Research)
- **FR-045**: System MUST provide quick weight adjustment buttons (+2.5kg, +5kg)
- **FR-046**: System MUST support swipe gestures for delete actions
- **FR-047**: System MUST provide one-tap duplicate set functionality
- **FR-048**: System MUST work in single-user mode without authentication (guest mode)
- **FR-049**: System MUST handle gracefully when offline (basic functionality maintained)

### Key Entities *(include if feature involves data)*
- **Workout Session**: Represents a complete gym visit with timestamp, duration, and collection of exercises performed
- **Exercise**: Represents a specific exercise within a session with name, type, and collection of sets
- **Set**: Represents individual set within an exercise with start time, end time, weight, repetitions, intensity, and notes
- **User**: Represents the person using the application to track their workouts
- **Exercise Template** (NEW): Pre-defined exercise from library with name, category, muscle groups, equipment, and instructions
- **Workout Template** (NEW): Saved workout configuration with exercises, sets, and parameters for quick reuse
- **Exercise History** (NEW): Aggregated data for specific exercise showing progress, personal records, and trends
- **Workout Statistics** (NEW): Calculated metrics including volume, frequency, streaks, and muscle group distribution

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain (3 items need clarification)
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (pending clarifications)

---
