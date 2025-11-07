import { NextRequest, NextResponse } from 'next/server';
import { workoutStorage } from '@/lib/storage';
import type { WorkoutSession } from '@/types';

// POST /api/workouts - Create new workout session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.startTime) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'startTime is required',
          },
        },
        { status: 400 }
      );
    }

    // Validate startTime is valid ISO date
    const startTime = new Date(body.startTime);
    if (isNaN(startTime.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'startTime must be a valid ISO date string',
          },
        },
        { status: 400 }
      );
    }

    // Create new workout session
    const newWorkout = await workoutStorage.create({
      userId: 'user-1', // For now, use default user
      name: body.name,
      startTime: body.startTime,
      exercises: [],
      notes: body.notes || '',
    });

    return NextResponse.json(
      {
        success: true,
        data: newWorkout,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating workout:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create workout session',
        },
      },
      { status: 500 }
    );
  }
}

// GET /api/workouts - Get workout sessions for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const searchQuery = searchParams.get('search')?.toLowerCase() || '';
    const offset = (page - 1) * limit;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Get all workouts for the user
    const allWorkouts = await workoutStorage.findByUserId('user-1');
    
    // Filter by search query if provided
    let filteredWorkouts = allWorkouts;
    if (searchQuery) {
      filteredWorkouts = allWorkouts.filter(workout => {
        const nameMatch = workout.name?.toLowerCase().includes(searchQuery);
        const notesMatch = workout.notes?.toLowerCase().includes(searchQuery);
        const exerciseMatch = workout.exercises.some(ex => 
          ex.name.toLowerCase().includes(searchQuery)
        );
        return nameMatch || notesMatch || exerciseMatch;
      });
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      filteredWorkouts = filteredWorkouts.filter(workout => {
        const workoutDate = new Date(workout.startTime);
        
        if (startDate) {
          const start = new Date(startDate);
          if (workoutDate < start) return false;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          if (workoutDate > end) return false;
        }
        
        return true;
      });
    }

    // Sort by start time (newest first)
    filteredWorkouts.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
    // Apply pagination
    const paginatedWorkouts = filteredWorkouts.slice(offset, offset + limit);
    
    return NextResponse.json({
      success: true,
      data: {
        workouts: paginatedWorkouts,
        total: filteredWorkouts.length,
        page,
        limit,
        hasMore: offset + limit < filteredWorkouts.length,
      },
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch workouts',
        },
      },
      { status: 500 }
    );
  }
}
