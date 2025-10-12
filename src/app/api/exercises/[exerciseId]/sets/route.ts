import { NextRequest, NextResponse } from 'next/server';
import { workoutStorage } from '@/lib/storage';

type RouteParams = {
  params: Promise<{
    exerciseId: string;
  }>;
};

// POST /api/exercises/[exerciseId]/sets - Add set to exercise
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Validate intensity if provided
    if (body.intensity !== undefined && (body.intensity < 1 || body.intensity > 10)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Intensity must be between 1 and 10',
          },
        },
        { status: 400 }
      );
    }

    // Find the workout containing this exercise
    const allWorkouts = await workoutStorage.findAll();
    let targetWorkout = null;
    let exerciseIndex = -1;

    for (const workout of allWorkouts) {
      const index = workout.exercises.findIndex(ex => ex.id === exerciseId);
      if (index !== -1) {
        targetWorkout = workout;
        exerciseIndex = index;
        break;
      }
    }

    if (!targetWorkout || exerciseIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Exercise not found',
          },
        },
        { status: 404 }
      );
    }

    const exercise = targetWorkout.exercises[exerciseIndex];

    // Create new set
    const newSet = {
      id: `set-${Date.now()}`,
      exerciseId,
      startTime: body.startTime,
      endTime: body.endTime,
      weight: body.weight,
      repetitions: body.repetitions,
      intensity: body.intensity,
      notes: body.notes || '',
      order: exercise.sets.length + 1,
      isCompleted: body.repetitions !== undefined && body.repetitions > 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add set to exercise
    const updatedExercise = {
      ...exercise,
      sets: [...exercise.sets, newSet],
      updatedAt: new Date().toISOString(),
    };

    // Update the workout with the modified exercise
    const updatedExercises = [...targetWorkout.exercises];
    updatedExercises[exerciseIndex] = updatedExercise;

    const updatedWorkout = await workoutStorage.update(targetWorkout.id, {
      exercises: updatedExercises,
    });

    if (!updatedWorkout) {
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

    // Find and return the newly created set
    const resultExercise = updatedWorkout.exercises.find(ex => ex.id === exerciseId);
    const createdSet = resultExercise?.sets.find(set => set.id === newSet.id);

    return NextResponse.json(
      {
        success: true,
        data: createdSet,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding set:', error);
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