# Component Props Interface: Workout Session Components

## WorkoutSessionCard Component

```typescript
interface WorkoutSessionCardProps {
  session: WorkoutSession;
  onEdit?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
  onView: (sessionId: string) => void;
  variant?: 'default' | 'compact';
}
```

**Purpose**: Display workout session summary in lists
**Test Requirements**: Must render session name, date, duration, exercise count
**Validation**: session prop required, onView callback required

## WorkoutSessionForm Component

```typescript
interface WorkoutSessionFormProps {
  session?: WorkoutSession;        // Optional for edit mode
  onSave: (session: WorkoutSession) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface WorkoutSessionFormData {
  name: string;
  startTime: Date;
  endTime?: Date;
  notes?: string;
}
```

**Purpose**: Create or edit workout session basic info
**Test Requirements**: Form validation, submit handling, loading states
**Validation**: name max 100 chars, startTime required, endTime > startTime if present

## ExerciseCard Component

```typescript
interface ExerciseCardProps {
  exercise: Exercise;
  onAddSet: (exerciseId: string) => void;
  onEditSet: (setId: string) => void;
  onDeleteSet: (setId: string) => void;
  onEditExercise: (exerciseId: string) => void;
  isActive?: boolean;              // Currently being performed
}
```

**Purpose**: Display exercise with its sets, allow set management
**Test Requirements**: Render sets list, handle set CRUD operations
**Validation**: exercise prop required, callback functions required

## SetForm Component

```typescript
interface SetFormProps {
  set?: Set;                       // Optional for edit mode
  exerciseId: string;
  onSave: (set: Set) => Promise<void>;
  onCancel: () => void;
  userPreferences: UserPreferences;
  isLoading?: boolean;
}

interface SetFormData {
  weight?: number;
  repetitions?: number;
  intensity?: number;
  notes?: string;
  startTime?: Date;
  endTime?: Date;
}
```

**Purpose**: Create or edit individual set data
**Test Requirements**: Form validation, weight unit conversion, intensity scale
**Validation**: weight > 0, reps > 0, intensity within user's scale range