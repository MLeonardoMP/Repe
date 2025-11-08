import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { workoutExercises, workouts } from '@/lib/db/schema';
import { StorageError, errorToHttpStatus } from '@/lib/storage-errors';
import { eq } from 'drizzle-orm';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

const AddExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  orderIndex: z.number().int().nonnegative(),
  targetSets: z.number().int().positive().optional(),
  targetReps: z.number().int().positive().optional(),
  targetWeight: z.number().positive().optional(),
});

// POST /api/workouts/[id]/exercises - Add exercise to workout
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Workout ID is required',
          },
        },
        { status: 400 }
      );
    }

    const input = AddExerciseSchema.parse(body);

    // Verify workout exists
    const workout = await getDb()
      .select()
      .from(workouts)
      .where(eq(workouts.id, id))
      .limit(1);

    if (!workout[0]) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Workout not found',
          },
        },
        { status: 404 }
      );
    }

    // Insert workout exercise
    const result = await getDb()
      .insert(workoutExercises)
      .values({
        workoutId: id,
        exerciseId: input.exerciseId,
        orderIndex: input.orderIndex,
        targetSets: input.targetSets,
        targetReps: input.targetReps,
        targetWeight: input.targetWeight ? parseFloat(input.targetWeight.toString()) : null,
      } as any)
      .returning();

    if (!result[0]) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to add exercise to workout',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result[0],
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

    console.error('POST /api/workouts/[id]/exercises error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to add exercise to workout',
        },
      },
      { status: 500 }
    );
  }
}