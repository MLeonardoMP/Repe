import { NextRequest, NextResponse } from 'next/server';
import { workoutStorage } from '@/lib/storage';
import type { WorkoutSession } from '@/types';

// POST /api/workouts - Create new workout session
export async function POST(request: NextRequest) {
  // On Vercel, filesystem is read-only. All data operations must be client-side via localStorage.
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'NOT_SUPPORTED',
        message: 'Server-side storage not available. Use client-side localStorage instead.',
      },
    },
    { status: 501 }
  );
}

// GET /api/workouts - Get workout sessions for user
export async function GET() {
  // On Vercel, return empty data - client will use localStorage directly
  return NextResponse.json({
    success: true,
    data: {
      workouts: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
    },
  });
}
