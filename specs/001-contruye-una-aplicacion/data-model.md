# Data Model: Workout Tracking Application

## Core Entities

### User
**Purpose**: Represents a person using the application to track workouts
**Persistence**: JSON file storage

```typescript
interface User {
  id: string;              // Unique identifier
  name?: string;           // Optional display name
  preferences: UserPreferences;
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
}

interface UserPreferences {
  defaultWeightUnit: 'kg' | 'lbs';
  defaultIntensityScale: 1 | 5 | 10;  // 1-1, 1-5, or 1-10 scale
  theme: 'dark';           // Only dark theme for v1
}
```

**Validation Rules**:
- id: required, non-empty string
- preferences.defaultWeightUnit: must be 'kg' or 'lbs'
- preferences.defaultIntensityScale: must be 1, 5, or 10
- createdAt/updatedAt: must be valid ISO date strings

### WorkoutSession
**Purpose**: Represents a complete gym visit with exercises and metadata
**Relationships**: Belongs to User, contains multiple Exercises

```typescript
interface WorkoutSession {
  id: string;              // Unique identifier (UUID)
  userId: string;          // Foreign key to User
  name?: string;           // Optional session name
  startTime: string;       // ISO date string when session started
  endTime?: string;        // ISO date string when session ended
  exercises: Exercise[];   // Array of exercises performed
  notes?: string;          // Optional session notes
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
}
```

**Validation Rules**:
- id: required, UUID format
- userId: required, must reference existing user
- startTime: required, valid ISO date
- endTime: optional, if present must be after startTime
- exercises: array, can be empty
- Duration calculated: endTime - startTime (if both present)

**State Transitions**:
- Created → Active (adding exercises)
- Active → Completed (endTime set)
- Completed → Archived (read-only)

### Exercise
**Purpose**: Represents a specific exercise within a workout session
**Relationships**: Belongs to WorkoutSession, contains multiple Sets

```typescript
interface Exercise {
  id: string;              // Unique identifier within session
  sessionId: string;       // Foreign key to WorkoutSession
  name: string;            // Exercise name (e.g., "Bench Press")
  category?: string;       // Optional category (e.g., "Chest", "Legs")
  sets: Set[];            // Array of sets performed
  notes?: string;          // Optional exercise notes
  order: number;           // Display order within session
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
}
```

**Validation Rules**:
- id: required, unique within session
- sessionId: required, must reference existing session
- name: required, non-empty string, max 100 characters
- sets: array, can be empty
- order: required, positive integer
- category: optional, max 50 characters

### Set
**Purpose**: Represents individual set within an exercise with performance data
**Relationships**: Belongs to Exercise

```typescript
interface Set {
  id: string;              // Unique identifier within exercise
  exerciseId: string;      // Foreign key to Exercise
  startTime?: string;      // ISO date string when set started
  endTime?: string;        // ISO date string when set ended
  weight?: number;         // Weight used (in user's preferred unit)
  repetitions?: number;    // Number of repetitions completed
  intensity?: number;      // Subjective intensity (1-5 or 1-10 scale)
  notes?: string;          // Optional set notes
  order: number;           // Display order within exercise
  isCompleted: boolean;    // Whether set was completed
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
}
```

**Validation Rules**:
- id: required, unique within exercise
- exerciseId: required, must reference existing exercise
- startTime/endTime: optional, if both present endTime > startTime
- weight: optional, if present must be positive number
- repetitions: optional, if present must be positive integer
- intensity: optional, must match user's scale preference
- order: required, positive integer
- Duration calculated: endTime - startTime (if both present)

**Derived Properties**:
- `duration: number` - Calculated from start/end times
- `restTime: number` - Time between this set's end and next set's start

## Data Relationships

```
User (1) ──────── (0..*) WorkoutSession
                           │
                           │ (1) ──── (0..*) Exercise
                                              │
                                              │ (1) ──── (0..*) Set
```

## JSON Storage Schema

### File Structure: `data/workouts.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-09-19T10:30:00Z",
  "users": {
    "default": {
      "id": "default",
      "name": "Default User",
      "preferences": {
        "defaultWeightUnit": "kg",
        "defaultIntensityScale": 5,
        "theme": "dark"
      },
      "createdAt": "2025-09-19T10:00:00Z",
      "updatedAt": "2025-09-19T10:00:00Z"
    }
  },
  "workoutSessions": [
    {
      "id": "uuid-session-1",
      "userId": "default",
      "name": "Morning Chest Workout",
      "startTime": "2025-09-19T06:00:00Z",
      "endTime": "2025-09-19T07:30:00Z",
      "exercises": [
        {
          "id": "ex-1",
          "sessionId": "uuid-session-1",
          "name": "Bench Press",
          "category": "Chest",
          "order": 1,
          "sets": [
            {
              "id": "set-1",
              "exerciseId": "ex-1",
              "startTime": "2025-09-19T06:05:00Z",
              "endTime": "2025-09-19T06:06:00Z",
              "weight": 80,
              "repetitions": 10,
              "intensity": 3,
              "order": 1,
              "isCompleted": true,
              "createdAt": "2025-09-19T06:05:00Z",
              "updatedAt": "2025-09-19T06:06:00Z"
            }
          ],
          "createdAt": "2025-09-19T06:05:00Z",
          "updatedAt": "2025-09-19T06:15:00Z"
        }
      ],
      "createdAt": "2025-09-19T06:00:00Z",
      "updatedAt": "2025-09-19T07:30:00Z"
    }
  ],
  "exerciseTemplates": [
    {
      "id": "template-1",
      "name": "Bench Press",
      "category": "Chest",
      "defaultWeightUnit": "kg"
    }
  ]
}
```

## Data Access Patterns

### Read Operations
- Load all workouts for user
- Get single workout session by ID
- Get workout history (paginated)
- Search workouts by exercise name or date range

### Write Operations
- Create new workout session
- Update session (add exercises, update times)
- Add/update/delete exercises within session
- Add/update/delete sets within exercise
- Mark session as completed

### Data Integrity Rules
- Cascade delete: Session deleted → all exercises deleted → all sets deleted
- Referential integrity: All foreign keys must reference existing entities
- Temporal consistency: endTime > startTime for all timed entities
- Unique constraints: IDs unique within their scope

## Migration Strategy

### Version 1.0.0 → Future Versions
- Add migration scripts in `/lib/migrations/`
- Version field in JSON tracks schema version
- Backward compatibility maintained for at least 2 versions
- Migration runs automatically on app start if needed

This data model supports all functional requirements while maintaining simplicity and extensibility for future enhancements.