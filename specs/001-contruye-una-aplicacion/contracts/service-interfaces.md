# Service Interface: JSON Storage Operations

## StorageService Interface

```typescript
interface StorageService {
  // User operations
  getUser(userId: string): Promise<User | null>;
  updateUserPreferences(userId: string, preferences: UserPreferences): Promise<void>;
  
  // Workout session operations
  createWorkoutSession(session: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutSession>;
  getWorkoutSession(sessionId: string): Promise<WorkoutSession | null>;
  updateWorkoutSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession>;
  deleteWorkoutSession(sessionId: string): Promise<void>;
  getWorkoutSessions(userId: string, options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<WorkoutSession[]>;
  
  // Exercise operations within session
  addExercise(sessionId: string, exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<Exercise>;
  updateExercise(exerciseId: string, updates: Partial<Exercise>): Promise<Exercise>;
  deleteExercise(exerciseId: string): Promise<void>;
  
  // Set operations within exercise
  addSet(exerciseId: string, set: Omit<Set, 'id' | 'createdAt' | 'updatedAt'>): Promise<Set>;
  updateSet(setId: string, updates: Partial<Set>): Promise<Set>;
  deleteSet(setId: string): Promise<void>;
  
  // Exercise templates
  getExerciseTemplates(): Promise<ExerciseTemplate[]>;
  searchExercises(query: string): Promise<ExerciseTemplate[]>;
}

interface ExerciseTemplate {
  id: string;
  name: string;
  category: string;
  defaultWeightUnit: 'kg' | 'lbs';
}
```

**Error Handling**: All methods throw StorageError for file system issues
**Validation**: All input data validated before persistence
**Atomicity**: Write operations are atomic (temp file + rename pattern)

## Hook Interface: useWorkout

```typescript
interface UseWorkoutResult {
  // Current active session
  activeSession: WorkoutSession | null;
  isSessionActive: boolean;
  
  // Session operations
  startSession: (name?: string) => Promise<WorkoutSession>;
  endSession: () => Promise<void>;
  updateSessionInfo: (updates: Pick<WorkoutSession, 'name' | 'notes'>) => Promise<void>;
  
  // Exercise operations
  addExercise: (name: string, category?: string) => Promise<Exercise>;
  removeExercise: (exerciseId: string) => Promise<void>;
  
  // Set operations
  addSet: (exerciseId: string, setData: SetFormData) => Promise<Set>;
  updateSet: (setId: string, updates: Partial<SetFormData>) => Promise<Set>;
  removeSet: (setId: string) => Promise<void>;
  startSetTimer: (setId: string) => void;
  endSetTimer: (setId: string) => void;
  
  // State
  isLoading: boolean;
  error: string | null;
}
```

**Purpose**: Manage active workout session state and operations
**Test Requirements**: State updates, error handling, timer management
**Dependencies**: StorageService for persistence, timer utilities

## Hook Interface: useWorkoutHistory

```typescript
interface UseWorkoutHistoryResult {
  workouts: WorkoutSession[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  deleteWorkout: (sessionId: string) => Promise<void>;
  duplicateWorkout: (sessionId: string) => Promise<WorkoutSession>;
  
  // Filters
  setDateRange: (start: Date, end: Date) => void;
  setExerciseFilter: (exerciseName: string) => void;
  clearFilters: () => void;
}
```

**Purpose**: Manage workout history viewing and filtering
**Test Requirements**: Pagination, filtering, CRUD operations
**Dependencies**: StorageService for data access