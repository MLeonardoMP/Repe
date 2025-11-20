import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { listWorkouts, upsertWorkout } from '@/lib/db/repos/workout';
import { StorageError, errorToHttpStatus } from '@/lib/storage-errors';

// Validation schemas
const QuerySchema = z.object({
  limit: z.coerce.number().int().positive().default(20).pipe(z.number().max(100)),
  offset: z.coerce.number().int().nonnegative().default(0),
});

const CreateWorkoutSchema = z.object({
  id: z.string().uuid().optional(), // Permite sincronizar con localStorage
  name: z.string().min(1).max(255),
  userId: z.string().optional(), // Para compatibilidad con useWorkout
  exercises: z.array(
    z.object({
      id: z.string().uuid(),
      orderIndex: z.number().int().nonnegative(),
      targetSets: z.number().int().positive().optional(),
      targetReps: z.number().int().positive().optional(),
      targetWeight: z.number().positive().optional(),
    })
  ).optional().default([]), // Permitir workout sin ejercicios al iniciar
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = QuerySchema.parse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    const workouts = await listWorkouts(query);

    return NextResponse.json(
      {
        data: workouts,
        pagination: {
          limit: query.limit,
          offset: query.offset,
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

    console.error('GET /api/workouts error:', error);
    return NextResponse.json(
      { error: 'INTERNAL', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = CreateWorkoutSchema.parse(body);

    const workout = await upsertWorkout(input);

    return NextResponse.json(workout, { status: 201 });
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

    console.error('POST /api/workouts error:', error);
    return NextResponse.json(
      { error: 'INTERNAL', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
