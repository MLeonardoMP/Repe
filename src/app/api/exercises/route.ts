import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { listExercises, createExercise } from '@/lib/db/repos/exercise';
import { StorageError, errorToHttpStatus } from '@/lib/storage-errors';

// Validation schemas
const QuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().int().positive().default(20).pipe(z.number().max(100)),
  offset: z.coerce.number().int().nonnegative().default(0),
});

const CreateExerciseSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1),
  equipment: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = QuerySchema.parse({
      search: searchParams.get('search'),
      category: searchParams.get('category'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    const result = await listExercises(query);

    return NextResponse.json(
      {
        data: result.data,
        pagination: {
          total: result.total,
          limit: query.limit,
          offset: query.offset,
          hasMore: query.offset + query.limit < result.total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'VALIDATION',
          message: 'Invalid query parameters',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    if (error instanceof StorageError) {
      return NextResponse.json(
        { error: error.type, message: error.message },
        { status: errorToHttpStatus(error) }
      );
    }

    console.error('GET /api/exercises error:', error);
    return NextResponse.json(
      { error: 'INTERNAL', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = CreateExerciseSchema.parse(body);

    const exercise = await createExercise(input);

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'VALIDATION',
          message: 'Invalid request body',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    if (error instanceof StorageError) {
      return NextResponse.json(
        { error: error.type, message: error.message },
        { status: errorToHttpStatus(error) }
      );
    }

    console.error('POST /api/exercises error:', error);
    return NextResponse.json(
      { error: 'INTERNAL', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
