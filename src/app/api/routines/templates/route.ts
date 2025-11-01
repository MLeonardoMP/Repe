import { NextResponse } from 'next/server';

// GET /api/routines/templates - Placeholder until implementation in core phase
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Routine templates endpoint not implemented yet',
      },
    },
    { status: 501 }
  );
}
