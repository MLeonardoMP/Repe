import { NextRequest, NextResponse } from 'next/server';
import { workoutStorage } from '@/lib/storage';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// POST /api/workouts/[id]/exercises - Add exercise to session
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

    // Validate required fields
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Exercise name is required',
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

    // Create new exercise
    const newExercise = {
      id: `exercise-${Date.now()}`,
      sessionId: id,
      name: body.name.trim(),
      category: body.category || '',
      sets: [],
      notes: body.notes || '',
      order: workout.exercises.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add exercise to workout
    const updatedWorkout = await workoutStorage.update(id, {
      exercises: [...workout.exercises, newExercise],
    });

    if (!updatedWorkout) {
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

    // Find and return the newly created exercise
    const createdExercise = updatedWorkout.exercises.find(ex => ex.id === newExercise.id);

    return NextResponse.json(
      {
        success: true,
        data: createdExercise,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding exercise:', error);
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