import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getExerciseById } from '@/lib/db/repos/exercise';
import { StorageError, errorToHttpStatus } from '@/lib/storage-errors';

const ParamsSchema = z.object({
  exerciseId: z.string().uuid(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    const { exerciseId } = ParamsSchema.parse(await params);

    const exercise = await getExerciseById(exerciseId);

    if (!exercise) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(exercise, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'VALIDATION',
          message: 'Invalid exercise ID',
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

    console.error('GET /api/exercises/:exerciseId error:', error);
    return NextResponse.json(
      { error: 'INTERNAL', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
