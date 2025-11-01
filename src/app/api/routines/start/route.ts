import { NextResponse } from 'next/server';

// POST /api/routines/start - Placeholder until implementation in core phase
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Routine start endpoint not implemented yet',
      },
    },
    { status: 501 }
  );
}
