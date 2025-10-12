# NextJS App Router: API Route Contracts

## /api/workouts - Workout Sessions API

### POST /api/workouts
Create new workout session

**Request Body**:
```typescript
interface CreateWorkoutRequest {
  name?: string;
  startTime: string;  // ISO date
  notes?: string;
}
```

**Response**: 201 Created
```typescript
interface CreateWorkoutResponse {
  success: true;
  data: WorkoutSession;
}
```

**Error Responses**:
- 400: Invalid request data
- 500: Server error

### GET /api/workouts
Get workout sessions for user

**Query Parameters**:
- `limit?: number` (default: 20, max: 100)
- `offset?: number` (default: 0)  
- `start_date?: string` (ISO date)
- `end_date?: string` (ISO date)

**Response**: 200 OK
```typescript
interface GetWorkoutsResponse {
  success: true;
  data: WorkoutSession[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
}
```

### GET /api/workouts/[id]
Get single workout session

**Path Parameters**:
- `id: string` - Workout session UUID

**Response**: 200 OK
```typescript
interface GetWorkoutResponse {
  success: true;
  data: WorkoutSession;
}
```

**Error Response**: 404 Not Found

### PUT /api/workouts/[id]
Update workout session

**Request Body**:
```typescript
interface UpdateWorkoutRequest {
  name?: string;
  endTime?: string;  // ISO date
  notes?: string;
}
```

**Response**: 200 OK
```typescript
interface UpdateWorkoutResponse {
  success: true;
  data: WorkoutSession;
}
```

### DELETE /api/workouts/[id]
Delete workout session

**Response**: 204 No Content

## /api/workouts/[sessionId]/exercises - Exercise API

### POST /api/workouts/[sessionId]/exercises
Add exercise to session

**Request Body**:
```typescript
interface AddExerciseRequest {
  name: string;
  category?: string;
  notes?: string;
}
```

**Response**: 201 Created
```typescript
interface AddExerciseResponse {
  success: true;
  data: Exercise;
}
```

### PUT /api/workouts/[sessionId]/exercises/[exerciseId]
Update exercise

**Request Body**:
```typescript
interface UpdateExerciseRequest {
  name?: string;
  category?: string;
  notes?: string;
}
```

**Response**: 200 OK
```typescript
interface UpdateExerciseResponse {
  success: true;
  data: Exercise;
}
```

## /api/exercises/[exerciseId]/sets - Sets API

### POST /api/exercises/[exerciseId]/sets
Add set to exercise

**Request Body**:
```typescript
interface AddSetRequest {
  weight?: number;
  repetitions?: number;
  intensity?: number;
  notes?: string;
  startTime?: string;  // ISO date
  endTime?: string;    // ISO date
}
```

**Response**: 201 Created
```typescript
interface AddSetResponse {
  success: true;
  data: Set;
}
```

### PUT /api/exercises/[exerciseId]/sets/[setId]
Update set

**Request Body**: Same as AddSetRequest

**Response**: 200 OK
```typescript
interface UpdateSetResponse {
  success: true;
  data: Set;
}
```

## Error Response Format

All API errors follow consistent format:

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Request data validation failed
- `NOT_FOUND`: Resource not found
- `STORAGE_ERROR`: File system operation failed
- `INTERNAL_ERROR`: Unexpected server error