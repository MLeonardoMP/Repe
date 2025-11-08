/**
 * GET /api/exercise-library
 * Returns the list of available exercises from the database
 */

import { NextResponse } from 'next/server';
import { listExercises } from '@/lib/db/repos/exercise';
import { StorageError, errorToHttpStatus } from '@/lib/storage-errors';

export async function GET() {
  try {
    // Get all exercises from database with a high limit
    const result = await listExercises({
      limit: 1000,
      offset: 0,
    });

    // Return success response with exercises
    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    if (error instanceof StorageError) {
      return NextResponse.json(
        { error: error.type, message: error.message },
        { status: errorToHttpStatus(error) }
      );
    }

    console.error('GET /api/exercise-library error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load exercise library',
        },
      },
      { status: 500 }
    );
  }
}
