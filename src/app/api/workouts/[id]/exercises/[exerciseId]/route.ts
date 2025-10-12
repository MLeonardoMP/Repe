import { NextRequest, NextResponse } from 'next/server';
import { workoutStorage } from '@/lib/storage';

type RouteParams = {
  params: Promise<{
    id: string;
    exerciseId: string;
  }>;
};

// PUT /api/workouts/[id]/exercises/[exerciseId] - Update exercise
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, exerciseId } = await params;
    const body = await request.json();
    
    if (!id || !exerciseId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Workout ID and Exercise ID are required',
          },
        },
        { status: 400 }
      );
    }

    // Validate name if provided
    if (body.name !== undefined && body.name.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Exercise name cannot be empty',
          },
        },
        { status: 400 }
      );
    }

    // Get existing workout session
    const workout = await workoutStorage.findById(id);
    if (!workout) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Workout session not found',
          },
        },
        { status: 404 }
      );
    }

    // Find the exercise to update
    const exerciseIndex = workout.exercises.findIndex(ex => ex.id === exerciseId);
    if (exerciseIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Exercise not found in workout session',
          },
        },
        { status: 404 }
      );
    }

    // Update the exercise
    const updatedExercise = {
      ...workout.exercises[exerciseIndex],
      name: body.name !== undefined ? body.name.trim() : workout.exercises[exerciseIndex].name,
      category: body.category !== undefined ? body.category : workout.exercises[exerciseIndex].category,
      notes: body.notes !== undefined ? body.notes : workout.exercises[exerciseIndex].notes,
      updatedAt: new Date().toISOString(),
    };

    // Update the workout with the modified exercise
    const updatedExercises = [...workout.exercises];
    updatedExercises[exerciseIndex] = updatedExercise;

    const updatedWorkout = await workoutStorage.update(id, {
      exercises: updatedExercises,
    });

    if (!updatedWorkout) {
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

    // Find and return the updated exercise
    const resultExercise = updatedWorkout.exercises.find(ex => ex.id === exerciseId);

    return NextResponse.json({
      success: true,
      data: resultExercise,
    });
  } catch (error) {
    console.error('Error updating exercise:', error);
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