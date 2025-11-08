import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { listHistory, logSession } from '@/lib/db/repos/history';
import { StorageError, errorToHttpStatus } from '@/lib/storage-errors';

// Validation schemas
const QuerySchema = z.object({
  cursor: z.object({
    performedAt: z.string(),
    id: z.string().uuid(),
  }).optional(),
  limit: z.coerce.number().int().positive().default(20).pipe(z.number().max(100)),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const LogSessionSchema = z.object({
  workoutId: z.string().uuid().optional(),
  performedAt: z.string().datetime().optional(),
  durationSeconds: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse cursor if provided
    let cursor: any = undefined;
    const cursorStr = searchParams.get('cursor');
    if (cursorStr) {
      try {
        cursor = JSON.parse(cursorStr);
      } catch {
        throw new z.ZodError([{
          code: 'custom',
          message: 'Invalid cursor format',
          path: ['cursor'],
        }]);
      }
    }

    const query = QuerySchema.parse({
      cursor,
      limit: searchParams.get('limit'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
    });

    const result = await listHistory(query);

    return NextResponse.json(
      {
        data: result.data,
        cursor: result.cursor,
        hasMore: result.hasMore,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'VALIDATION',
          message: 'Invalid query parameters',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    if (error instanceof StorageError) {
      return NextResponse.json(
        { error: error.type, message: error.message },
        { status: errorToHttpStatus(error) }
      );
    }

    console.error('GET /api/history error:', error);
    return NextResponse.json(
      { error: 'INTERNAL', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = LogSessionSchema.parse(body);

    const entry = await logSession(input);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'VALIDATION',
          message: 'Invalid request body',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    if (error instanceof StorageError) {
      return NextResponse.json(
        { error: error.type, message: error.message },
        { status: errorToHttpStatus(error) }
      );
    }

    console.error('POST /api/history error:', error);
    return NextResponse.json(
      { error: 'INTERNAL', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
