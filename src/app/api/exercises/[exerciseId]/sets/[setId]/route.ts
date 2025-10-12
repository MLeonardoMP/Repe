import { NextRequest, NextResponse } from 'next/server';
import { workoutStorage } from '@/lib/storage';

type RouteParams = {
  params: Promise<{
    exerciseId: string;
    setId: string;
  }>;
};

// PUT /api/exercises/[exerciseId]/sets/[setId] - Update set
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { exerciseId, setId } = await params;
    const body = await request.json();
    
    if (!exerciseId || !setId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Exercise ID and Set ID are required',
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
    
    // Find the set to update
    const setIndex = exercise.sets.findIndex(set => set.id === setId);
    if (setIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Set not found in exercise',
          },
        },
        { status: 404 }
      );
    }

    // Update the set
    const existingSet = exercise.sets[setIndex];
    const updatedSet = {
      ...existingSet,
      startTime: body.startTime !== undefined ? body.startTime : existingSet.startTime,
      endTime: body.endTime !== undefined ? body.endTime : existingSet.endTime,
      weight: body.weight !== undefined ? body.weight : existingSet.weight,
      repetitions: body.repetitions !== undefined ? body.repetitions : existingSet.repetitions,
      intensity: body.intensity !== undefined ? body.intensity : existingSet.intensity,
      notes: body.notes !== undefined ? body.notes : existingSet.notes,
      isCompleted: body.repetitions !== undefined ? (body.repetitions > 0) : existingSet.isCompleted,
      updatedAt: new Date().toISOString(),
    };

    // Update the exercise with the modified set
    const updatedSets = [...exercise.sets];
    updatedSets[setIndex] = updatedSet;

    const updatedExercise = {
      ...exercise,
      sets: updatedSets,
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
            message: 'Failed to update set',
          },
        },
        { status: 500 }
      );
    }

    // Find and return the updated set
    const resultExercise = updatedWorkout.exercises.find(ex => ex.id === exerciseId);
    const resultSet = resultExercise?.sets.find(set => set.id === setId);

    return NextResponse.json({
      success: true,
      data: resultSet,
    });
  } catch (error) {
    console.error('Error updating set:', error);
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