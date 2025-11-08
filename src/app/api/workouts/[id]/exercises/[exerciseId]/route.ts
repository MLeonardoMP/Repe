import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { workoutExercises } from '@/lib/db/schema';
import { StorageError, errorToHttpStatus } from '@/lib/storage-errors';
import { eq } from 'drizzle-orm';

type RouteParams = {
  params: Promise<{
    id: string;
    exerciseId: string;
  }>;
};

const UpdateExerciseSchema = z.object({
  orderIndex: z.number().int().nonnegative().optional(),
  targetSets: z.number().int().positive().optional().nullable(),
  targetReps: z.number().int().positive().optional().nullable(),
  targetWeight: z.number().positive().optional().nullable(),
});

// PUT /api/workouts/[id]/exercises/[exerciseId] - Update workout exercise
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { exerciseId } = await params;
    const body = await request.json();
    
    if (!exerciseId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Exercise ID is required',
          },
        },
        { status: 400 }
      );
    }

    const input = UpdateExerciseSchema.parse(body);

    // Build update object with only provided fields
    const updateData: any = {};
    if (input.orderIndex !== undefined) updateData.orderIndex = input.orderIndex;
    if (input.targetSets !== undefined) updateData.targetSets = input.targetSets;
    if (input.targetReps !== undefined) updateData.targetReps = input.targetReps;
    if (input.targetWeight !== undefined) {
      updateData.targetWeight = input.targetWeight ? parseFloat(input.targetWeight.toString()) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No fields to update',
          },
        },
        { status: 400 }
      );
    }

    // Update workout exercise
    const result = await getDb()
      .update(workoutExercises)
      .set(updateData)
      .where(eq(workoutExercises.id, exerciseId))
      .returning();

    if (!result[0]) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Workout exercise not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });
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

    console.error('PUT /api/workouts/[id]/exercises/[exerciseId] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update exercise',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/workouts/[id]/exercises/[exerciseId] - Remove exercise from workout
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { exerciseId } = await params;
    
    if (!exerciseId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Exercise ID is required',
          },
        },
        { status: 400 }
      );
    }

    await getDb()
      .delete(workoutExercises)
      .where(eq(workoutExercises.id, exerciseId));

    return NextResponse.json({
      success: true,
      message: 'Exercise removed from workout',
    });
  } catch (error) {
    if (error instanceof StorageError) {
      return NextResponse.json(
        { success: false, error: { code: error.type, message: error.message } },
        { status: errorToHttpStatus(error) }
      );
    }

    console.error('DELETE /api/workouts/[id]/exercises/[exerciseId] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to remove exercise from workout',
        },
      },
      { status: 500 }
    );
  }
}