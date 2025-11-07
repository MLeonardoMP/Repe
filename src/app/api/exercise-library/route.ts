/**
 * GET /api/exercise-library
 * Returns the list of available exercises from the seed data
 */

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the exercise library seed file
    const filePath = path.join(process.cwd(), 'data', 'exercise-library-seed.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    // Extract exercises array from the seed data structure
    const exercises = data.exercises || [];

    // Return success response with exercises
    return NextResponse.json({
      success: true,
      data: exercises,
    });
  } catch (error: any) {
    console.error('Error loading exercise library:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load exercise library',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
