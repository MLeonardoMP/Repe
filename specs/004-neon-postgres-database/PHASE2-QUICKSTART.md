# Quick Reference: Phase 2 Execution

## Overview
Phase 2 focuses on implementing the infrastructure and test suite for the Neon Postgres migration. Start with database setup (T001-T006), then write comprehensive contract tests (T007-T015) BEFORE any implementation code.

## T001-T003: Database Infrastructure (Sequential)

### T001: Initialize Drizzle Configuration
**File**: `src/lib/db/drizzle.config.ts`, `src/lib/db/index.ts`

```bash
npm install drizzle-orm @neondatabase/serverless drizzle-kit postgres
```

**Drizzle config** should:
- Export Drizzle client instance using `@neondatabase/serverless` driver
- Support environment variables: `DATABASE_URL`, `DATABASE_URL_LOCAL` (for dev fallback)
- Handle WebSocket proxy for local development (or Docker Postgres)

### T002: Create Schema Definition
**File**: `src/lib/db/schema.ts`

From `data-model.md`, implement 6 tables with Drizzle:
1. `exercises` table with indexes on `lower(name)` and `category`
2. `workouts` table with indexes on user_id and created_at
3. `workout_exercises` (pivot table) with order_index uniqueness
4. `sets` table with FK to workout_exercises
5. `history` table with performed_at DESC index
6. `user_settings` table with JSONB field

### T003: Generate Migrations
**Command**:
```bash
cd drizzle
drizzle-kit generate:pg --out=migrations
```

Verify:
- ✅ Migration file created in `drizzle/migrations/`
- ✅ All CREATE TABLE statements present
- ✅ All indexes defined
- ✅ Foreign keys with CASCADE/RESTRICT actions

---

## T004-T006: Test Database Setup (Parallel after T003)

### T004: Seed Script
**File**: `scripts/seed-exercises.ts`

Load `data/exercise-library-seed.json` and insert with `ON CONFLICT DO NOTHING`. Test locally:
```bash
npm run seed:exercises -- --dry-run
npm run seed:exercises  # actual insert
```

### T005: Test Database Utilities
**File**: `tests/setup/db-setup.ts`

Export:
- `createTestDb()` - spins up temporary schema or Docker container
- `cleanupTestDb()` - rolls back or drops schema
- Exercise/Workout/Set/History fixtures with `faker`

### T006: Jest Configuration
**File**: `jest.setup.db.ts`

Add to `jest.config.js`:
```js
setupFilesAfterEnv: ['<rootDir>/jest.setup.db.ts']
testTimeout: 10000  // DB operations may be slower
```

---

## T007-T015: Contract Tests (Parallel, ALL must FAIL initially)

### Writing Tests: Key Pattern

Each contract test file should:
1. **Setup**: Use `createTestDb()` to initialize test database
2. **Fixtures**: Create sample data (exercises, workouts, sets)
3. **Tests**: Import repository and call methods, verify return types and error handling
4. **Assertions**: Validate StorageError is thrown with correct type codes

### Example Test Structure (T007: Exercises API)

```typescript
// tests/contracts/exercises-contract.test.ts
import { createTestDb, cleanupTestDb } from '@/tests/setup/db-setup';
import { listExercises, createExercise } from '@/lib/db/repos/exercise'; // NOT IMPLEMENTED YET

describe('/api/exercises contract', () => {
  beforeAll(async () => { await createTestDb(); });
  afterAll(async () => { await cleanupTestDb(); });

  describe('GET /api/exercises', () => {
    it('returns paginated exercises', async () => {
      const result = await listExercises({ limit: 10, offset: 0 });
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('filters by search term', async () => {
      const result = await listExercises({ search: 'push' });
      // Should only return exercises matching 'push'
    });
  });

  describe('POST /api/exercises', () => {
    it('creates new exercise', async () => {
      const result = await createExercise({
        name: 'Custom Exercise',
        category: 'strength'
      });
      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Custom Exercise');
    });

    it('throws StorageError on duplicate name', async () => {
      await createExercise({ name: 'Duplicate', category: 'cardio' });
      expect(() => createExercise({ name: 'Duplicate', category: 'cardio' }))
        .toThrow(expect.objectContaining({ type: 'CONFLICT' }));
    });
  });
});
```

**Important**: These tests will FAIL because repositories don't exist yet. That's correct! Move to T016 to implement.

---

## T016-T021: Repository Implementation (Parallel after tests written)

### Pattern: StorageError Contract

All repositories throw `StorageError`:

```typescript
export class StorageError extends Error {
  constructor(
    public type: 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL',
    message: string,
    public cause?: unknown
  ) {
    super(message);
  }
}
```

### Implementation Example: ExerciseRepository

```typescript
// src/lib/db/repos/exercise.ts
import { db } from '@/lib/db';
import { exercises } from '@/lib/db/schema';
import { StorageError } from '@/lib/storage-errors';

export async function listExercises(params: {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Exercise[]; total: number }> {
  try {
    // Build WHERE clause
    let query = db.select().from(exercises);
    
    if (params.search) {
      query = query.where(ilike(exercises.name, `%${params.search}%`));
    }
    if (params.category) {
      query = query.where(eq(exercises.category, params.category));
    }

    const total = await db.select({ count: count() }).from(exercises);
    const data = await query.limit(params.limit || 20).offset(params.offset || 0);
    
    return { data, total: total[0].count };
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError('INTERNAL', 'Failed to list exercises', error);
  }
}
```

---

## Environment Setup for Local Development

### .env.local
```
DATABASE_URL=postgresql://user:password@localhost:5432/repe_postgres
DATABASE_URL_LOCAL=postgresql://user:password@localhost:5432/repe_test
USE_DB=false          # Start with JSON storage
USE_DB_DUAL_WRITE=false  # Disabled until backfill complete
```

### Docker Compose (Optional, for local Postgres)
```yaml
version: '3'
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: repe_postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run: `docker-compose up -d`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find @neondatabase/serverless" | Run `npm install @neondatabase/serverless` |
| Migration fails | Check DATABASE_URL is valid; run `drizzle-kit introspect:pg` to verify schema |
| Test timeout | Increase Jest timeout in jest.config.js; ensure DB is running |
| Duplicate exercise ID on seed | Use `ON CONFLICT DO NOTHING` in seed script |
| WebSocket proxy not working locally | Use Docker Postgres instead; update env vars |

---

## Acceptance Criteria Checklist

- [x] T001: Drizzle client exports properly, environment variables read correctly
- [x] T002: All 6 tables defined with correct constraints and indexes
- [x] T003: Migrations generate without errors; up/down cycles work
- [x] T004: Seed script runs idempotently; no duplicate key errors
- [x] T005: Test fixtures create data; cleanup removes it completely
- [x] T006: Jest runs tests with DB setup/teardown working
- [x] T007-T015: All contract tests written and FAIL (before implementation)
- [x] T016-T021: Repositories implemented; tests now PASS

---

**Next Steps After T006**:
1. Write all contract tests (T007-T015) — expect them to FAIL
2. Implement repositories (T016-T021) — make tests PASS
3. Proceed to API implementation (T022-T027)

**Monitor**: `npm test -- --watch` to iterate quickly
