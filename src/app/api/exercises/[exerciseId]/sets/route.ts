import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { addSet, listSetsByWorkout } from '@/lib/db/repos/set';
import { StorageError, errorToHttpStatus } from '@/lib/storage-errors';

type RouteParams = {
  params: Promise<{
    exerciseId: string; // Treated as workoutExerciseId for backward compatibility
  }>;
};

const AddSetSchema = z.object({
  reps: z.number().int().nonnegative(),
  weight: z.number().nonnegative().optional(),
  rpe: z.number().min(0).max(10).optional(),
  restSeconds: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { exerciseId } = await params;
    const body = await request.json();

    const input = AddSetSchema.parse(body);

    const set = await addSet({
      workoutExerciseId: exerciseId,
      reps: input.reps,
      weight: input.weight,
      rpe: input.rpe,
      restSeconds: input.restSeconds,
      notes: input.notes,
    });

    return NextResponse.json(
      {
        success: true,
        data: set,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    if (error instanceof StorageError) {
      return NextResponse.json(
        { success: false, error: { code: error.type, message: error.message } },
        { status: errorToHttpStatus(error) }
      );
    }

    console.error('POST /api/exercises/[exerciseId]/sets error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to add set to exercise',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { exerciseId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined;

    const data = await listSetsByWorkout(exerciseId, { limit, offset });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof StorageError) {
      return NextResponse.json(
        { success: false, error: { code: error.type, message: error.message } },
        { status: errorToHttpStatus(error) }
      );
    }

    console.error('GET /api/exercises/[exerciseId]/sets error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch sets',
        },
      },
      { status: 500 }
    );
  }
}