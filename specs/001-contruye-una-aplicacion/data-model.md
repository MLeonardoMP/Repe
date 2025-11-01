# Data Model: Workout Tracking Application

## Core Entities

### ExerciseTemplate (NEW)
**Purpose**: Pre-defined exercises from library for consistent naming and faster workout entry
**Persistence**: JSON file storage

```typescript
interface ExerciseTemplate {
  id: string;              // Unique identifier
  name: string;            // Exercise name (e.g., "Bench Press")
  category: string;        // "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core" | "Cardio"
  muscleGroups: string[];  // Primary and secondary muscles
  equipment: string[];     // Required equipment: "Barbell" | "Dumbbell" | "Machine" | "Bodyweight" | "Cable"
  description?: string;    // Brief description
  instructions?: string[]; // Step-by-step instructions
  difficulty?: string;     // "beginner" | "intermediate" | "advanced"
  isCustom: boolean;       // User-created vs system exercise
  isFavorite?: boolean;    // User has favorited this exercise
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
}
```

**Validation Rules**:
- id: required, unique
- name: required, non-empty, max 100 characters
- category: required, must be valid category
- muscleGroups: array, at least one muscle group
- equipment: array, can be empty for bodyweight
- isCustom: required boolean

### WorkoutTemplate (NEW)
**Purpose**: Saved workout configurations for quick start and consistency
**Relationships**: References ExerciseTemplate entities

```typescript
interface WorkoutTemplate {
  id: string;              // Unique identifier
  userId: string;          // Owner of template
  name: string;            // Template name (e.g., "Push Day A")
  description?: string;    // Optional description
  exercises: TemplateExercise[];
  isPublic: boolean;       // Share with community (future feature)
  usageCount: number;      // Number of times used
  lastUsed?: string;       // ISO date string
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
}

interface TemplateExercise {
  exerciseTemplateId: string;  // Reference to ExerciseTemplate
  order: number;               // Display order
  targetSets: number;          // Suggested number of sets
  targetReps?: number;         // Optional suggested reps
  targetWeight?: number;       // Optional suggested weight
  restTime?: number;           // Exercise-specific rest time (seconds)
  notes?: string;              // Exercise-specific notes
}
```

**Validation Rules**:
- id: required, UUID format
- userId: required
- name: required, non-empty, max 100 characters
- exercises: array, can be empty
- targetSets: positive integer
- restTime: positive integer if present

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
  defaultIntensityScale: 1 | 5 | 10;  // 1-1, 1-5, or 1-10 scale (changed to 5 for v1)
  theme: 'dark';           // Only dark theme for v1
  // NEW: Rest timer preferences
  defaultRestTime: number; // Default rest time in seconds (default: 90)
  autoStartRestTimer: boolean; // Auto-start timer after set completion
  restTimerSound: boolean; // Play sound when rest completes
  restTimesByExercise?: Record<string, number>; // Exercise type -> custom rest time
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

### ExerciseHistory (NEW)
**Purpose**: Aggregated historical data for a specific exercise showing progress and records
**Persistence**: Calculated on-demand, not stored directly

```typescript
interface ExerciseHistory {
  exerciseTemplateId: string;
  exerciseName: string;
  sessions: ExerciseSessionSummary[];
  personalRecords: {
    maxWeight: { value: number; date: string; sessionId: string };
    maxReps: { value: number; weight: number; date: string; sessionId: string };
    maxVolume: { value: number; date: string; sessionId: string };
    oneRepMax: { value: number; date: string }; // Calculated using Epley formula
  };
  totalSessions: number;
  totalSets: number;
  totalVolume: number;
  lastPerformed: string; // ISO date string
}

interface ExerciseSessionSummary {
  sessionId: string;
  date: string;
  sets: number;
  totalReps: number;
  totalVolume: number;
  avgWeight: number;
  maxWeight: number;
  avgIntensity: number;
}
```

### WorkoutStatistics (NEW)
**Purpose**: Aggregated statistics for user motivation and progress tracking
**Persistence**: Cached in JSON, recalculated periodically

```typescript
interface WorkoutStatistics {
  userId: string;
  period: 'all-time' | 'year' | 'month' | 'week';
  totalWorkouts: number;
  totalVolume: number; // in kg
  totalSets: number;
  totalReps: number;
  avgWorkoutDuration: number; // in minutes
  workoutFrequency: number; // per week
  currentStreak: number; // consecutive days with workouts
  longestStreak: number; // best streak ever
  muscleGroupDistribution: Record<string, number>; // muscle group -> percentage
  favoriteExercises: { exerciseId: string; name: string; count: number }[];
  recentWorkouts: string[]; // sessionIds of last 10 workouts
  calculatedAt: string; // ISO date string
}
```

**Validation Rules**:
- Statistics calculated from WorkoutSession data
- Cached for performance
- Recalculated on demand or after workout completion

## Data Relationships

```
User (1) ──────── (0..*) WorkoutSession
  │                        │
  │                        │ (1) ──── (0..*) Exercise ──references→ ExerciseTemplate
  │                                           │
  │                                           │ (1) ──── (0..*) Set
  │
  │ (1) ──────── (0..*) WorkoutTemplate ──references→ ExerciseTemplate
  │
  │ (1) ──────── (0..*) ExerciseTemplate (custom)
  │
  │ (1) ──────── (1) WorkoutStatistics (cached)

ExerciseHistory (derived from WorkoutSessions, not stored directly)
```

## JSON Storage Schema

### File Structure: `data/workouts.json` (UPDATED for v1.1)

```json
{
  "version": "1.1.0",
  "lastUpdated": "2025-11-01T10:30:00Z",
  "users": {
    "default": {
      "id": "default",
      "name": "Default User",
      "preferences": {
        "defaultWeightUnit": "kg",
        "defaultIntensityScale": 5,
        "theme": "dark",
        "defaultRestTime": 90,
        "autoStartRestTimer": true,
        "restTimerSound": true
      },
      "createdAt": "2025-09-19T10:00:00Z",
      "updatedAt": "2025-11-01T10:00:00Z"
    }
  },
  "exerciseLibrary": [
    {
      "id": "ex-lib-1",
      "name": "Bench Press",
      "category": "Chest",
      "muscleGroups": ["Pectorals", "Triceps", "Anterior Deltoids"],
      "equipment": ["Barbell", "Bench"],
      "description": "Compound exercise for chest development",
      "difficulty": "intermediate",
      "isCustom": false,
      "createdAt": "2025-11-01T00:00:00Z",
      "updatedAt": "2025-11-01T00:00:00Z"
    }
  ],
  "workoutTemplates": [
    {
      "id": "template-1",
      "userId": "default",
      "name": "Push Day A",
      "description": "Chest, shoulders, and triceps",
      "exercises": [
        {
          "exerciseTemplateId": "ex-lib-1",
          "order": 1,
          "targetSets": 4,
          "targetReps": 8,
          "restTime": 120
        }
      ],
      "isPublic": false,
      "usageCount": 0,
      "createdAt": "2025-11-01T00:00:00Z",
      "updatedAt": "2025-11-01T00:00:00Z"
    }
  ],
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
  "statistics": {
    "default": {
      "userId": "default",
      "period": "all-time",
      "totalWorkouts": 1,
      "totalVolume": 800,
      "totalSets": 1,
      "totalReps": 10,
      "avgWorkoutDuration": 90,
      "workoutFrequency": 3,
      "currentStreak": 1,
      "longestStreak": 1,
      "muscleGroupDistribution": {
        "Chest": 100
      },
      "favoriteExercises": [
        {
          "exerciseId": "ex-lib-1",
          "name": "Bench Press",
          "count": 1
        }
      ],
      "recentWorkouts": ["uuid-session-1"],
      "calculatedAt": "2025-11-01T07:30:00Z"
    }
  }
}
```

## Data Access Patterns

### Read Operations
- Load all workouts for user
- Get single workout session by ID
- Get workout history (paginated)
- Search workouts by exercise name or date range
- **NEW**: Load exercise library with filters (category, equipment, favorites)
- **NEW**: Get workout templates for user
- **NEW**: Get exercise history for specific exercise
- **NEW**: Load workout statistics (cached or calculated)
- **NEW**: Search exercises by name or muscle group

### Write Operations
- Create new workout session
- Update session (add exercises, update times)
- Add/update/delete exercises within session
- Add/update/delete sets within exercise
- Mark session as completed
- **NEW**: Create/update/delete workout templates
- **NEW**: Create custom exercise templates
- **NEW**: Mark exercises as favorites
- **NEW**: Export workout data to JSON/CSV
- **NEW**: Import workout data from JSON
- **NEW**: Update user preferences (rest times, etc.)

### Data Integrity Rules
- Cascade delete: Session deleted → all exercises deleted → all sets deleted
- Referential integrity: All foreign keys must reference existing entities
- Temporal consistency: endTime > startTime for all timed entities
- Unique constraints: IDs unique within their scope

## Migration Strategy

### Version 1.0.0 → 1.1.0 (Current Update)
**Changes**:
- Add `exerciseLibrary` array with pre-populated exercises
- Add `workoutTemplates` array for saved workout configurations
- Add `statistics` object for cached workout analytics
- Update `UserPreferences` with rest timer settings
- Exercise references now use `exerciseTemplateId` for consistency

**Migration Steps**:
1. Read existing `workouts.json` (v1.0.0)
2. Add `exerciseLibrary` with 100+ system exercises
3. Add empty `workoutTemplates` array
4. Calculate and cache initial `statistics` from existing workouts
5. Update `version` to "1.1.0"
6. Update `UserPreferences` with default rest timer settings
7. Write updated JSON file

**Backward Compatibility**:
- Existing `workoutSessions` data remains unchanged
- Old exercise names can be matched to library via fuzzy matching
- Custom exercises can be added to library with `isCustom: true`

### Version 1.1.0 → Future Versions
- Add migration scripts in `/lib/migrations/`
- Version field in JSON tracks schema version
- Backward compatibility maintained for at least 2 versions
- Migration runs automatically on app start if needed

## Performance Considerations

### Caching Strategy
- **Exercise Library**: Loaded once at startup, kept in memory
- **Workout Templates**: Lazy loaded, cached after first access
- **Statistics**: Cached in JSON, recalculated after workout completion
- **Exercise History**: Calculated on-demand, not persisted

### Optimization Notes
- Exercise library search uses in-memory filtering (fast for 100-500 exercises)
- Statistics cached to avoid recalculation on every page load
- Template usage updates asynchronously to avoid blocking
- History calculations paginated (last 50 sessions max)

This data model supports all functional requirements while maintaining simplicity, performance, and extensibility for future enhancements.