import { NextRequest, NextResponse } from 'next/server';
import { workoutStorage } from '@/lib/storage';
import type { WorkoutSession } from '@/types';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// GET /api/workouts/[id] - Get single workout session
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
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

    return NextResponse.json({
      success: true,
      data: workout,
    });
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch workout session',
        },
      },
      { status: 500 }
    );
  }
}

// PATCH /api/workouts/[id] - Update workout session (partial)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // Validate endTime if provided
    if (body.endTime) {
      const endTime = new Date(body.endTime);
      if (isNaN(endTime.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'endTime must be a valid ISO date string',
            },
          },
          { status: 400 }
        );
      }
    }

    // Check if workout exists
    const existingWorkout = await workoutStorage.findById(id);
    if (!existingWorkout) {
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

    // Update workout
    const updates: Partial<WorkoutSession> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.endTime !== undefined) updates.endTime = body.endTime;
    if (body.notes !== undefined) updates.notes = body.notes;

    const updatedWorkout = await workoutStorage.update(id, updates);

    if (!updatedWorkout) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update workout session',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedWorkout,
    });
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update workout session',
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/workouts/[id] - Update workout session (full replacement)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return PATCH(request, { params });
}

// DELETE /api/workouts/[id] - Delete workout session
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
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

    // Check if workout exists
    const existingWorkout = await workoutStorage.findById(id);
    if (!existingWorkout) {
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

    // Delete workout
    const deleted = await workoutStorage.delete(id);
    
    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to delete workout session',
          },
        },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete workout session',
        },
      },
      { status: 500 }
    );
  }
}