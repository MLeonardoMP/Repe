import { NextRequest, NextResponse } from 'next/server';
import { workoutStorage } from '@/lib/storage';

type RouteParams = {
  params: Promise<{
    id: string;
    exerciseId: string;
  }>;
};

// POST /api/workouts/[id]/exercises/[exerciseId]/sets - Add set to exercise
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Find the exercise
    const exerciseIndex = workout.exercises.findIndex(ex => ex.id === exerciseId);
    if (exerciseIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Exercise not found in workout',
          },
        },
        { status: 404 }
      );
    }

    const exercise = workout.exercises[exerciseIndex];

    // Create new set
    const newSet = {
      id: `set-${Date.now()}`,
      exerciseId,
      weight: body.weight || undefined,
      repetitions: body.repetitions || body.reps || 0,
      intensity: body.intensity || undefined,
      notes: body.notes || '',
      isCompleted: true,
      order: exercise.sets.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add set to exercise
    const updatedExercises = [...workout.exercises];
    updatedExercises[exerciseIndex] = {
      ...exercise,
      sets: [...exercise.sets, newSet],
      updatedAt: new Date().toISOString(),
    };

    // Update workout
    const updatedWorkout = await workoutStorage.update(id, {
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

    return NextResponse.json(
      {
        success: true,
        data: newSet,
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

// GET /api/workouts/[id]/exercises/[exerciseId]/sets - Get all sets for an exercise
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, exerciseId } = await params;
    
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

    const exercise = workout.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Exercise not found in workout',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: exercise.sets,
    });
  } catch (error) {
    console.error('Error fetching sets:', error);
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
