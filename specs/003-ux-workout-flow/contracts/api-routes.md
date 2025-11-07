# API Contract: Exercise Library

## GET /api/exercise-library

Retorna la lista de ejercicios disponibles.

**Response 200**
```typescript
type ExerciseItem = {
  id?: string;
  name: string;
  category?: string;
  equipment?: string[] | string;
};

interface ExerciseLibraryResponse {
  success: true;
  data: ExerciseItem[];
}
```

**Response 500**
```typescript
interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string; details?: any };
}
```
