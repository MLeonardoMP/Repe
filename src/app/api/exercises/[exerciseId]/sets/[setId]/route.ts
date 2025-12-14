import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updateSet } from '@/lib/db/repos/set';
import { StorageError, errorToHttpStatus } from '@/lib/storage-errors';

type RouteParams = {
  params: Promise<{
    exerciseId: string; // workoutExerciseId for compatibility
    setId: string;
  }>;
};

const UpdateSetSchema = z.object({
  reps: z.number().int().nonnegative().optional(),
  weight: z.number().nonnegative().optional(),
  rpe: z.number().min(0).max(10).optional(),
  restSeconds: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { setId } = await params;
    const body = await request.json();
    const input = UpdateSetSchema.parse(body);

    const updated = await updateSet(setId, {
      reps: input.reps,
      weight: input.weight,
      rpe: input.rpe,
      restSeconds: input.restSeconds,
      notes: input.notes,
    });

    return NextResponse.json({ success: true, data: updated });
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

    console.error('PUT /api/exercises/[exerciseId]/sets/[setId] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update set',
        },
      },
      { status: 500 }
    );
  }
}