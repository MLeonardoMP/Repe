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
  // On Vercel, filesystem is read-only. Client uses localStorage directly.
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

// PATCH /api/workouts/[id] - Update workout session (partial)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // On Vercel, filesystem is read-only. Client uses localStorage directly.
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

// PUT /api/workouts/[id] - Update workout session (full replacement)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return PATCH(request, { params });
}

// DELETE /api/workouts/[id] - Delete workout session
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // On Vercel, filesystem is read-only. Client uses localStorage directly.
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