import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getWorkout, deleteWorkout, upsertWorkout } from '@/lib/db/repos/workout';
import { StorageError, errorToHttpStatus } from '@/lib/storage-errors';

const ParamsSchema = z.object({
  id: z.string().uuid(),
});

const UpdateWorkoutSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  exercises: z.array(
    z.object({
      id: z.string().uuid(),
      orderIndex: z.number().int().nonnegative(),
      targetSets: z.number().int().positive().optional(),
      targetReps: z.number().int().positive().optional(),
      targetWeight: z.number().positive().optional(),
    })
  ).optional(),
});

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = ParamsSchema.parse(await params);

    const workout = await getWorkout(id);

    if (!workout) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Workout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(workout, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'VALIDATION',
          message: 'Invalid workout ID',
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

    console.error('GET /api/workouts/:id error:', error);
    return NextResponse.json(
      { error: 'INTERNAL', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = ParamsSchema.parse(await params);
    const body = await request.json();
    const input = UpdateWorkoutSchema.parse(body);

    const workout = await upsertWorkout({
      id,
      name: input.name || '',
      exercises: input.exercises || [],
    });

    return NextResponse.json(workout, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'VALIDATION',
          message: 'Invalid request',
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

    console.error('PUT /api/workouts/:id error:', error);
    return NextResponse.json(
      { error: 'INTERNAL', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return PUT(request, { params });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = ParamsSchema.parse(await params);

    await deleteWorkout(id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'VALIDATION',
          message: 'Invalid workout ID',
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

    console.error('DELETE /api/workouts/:id error:', error);
    return NextResponse.json(
      { error: 'INTERNAL', message: 'Internal server error' },
      { status: 500 }
    );
  }
}