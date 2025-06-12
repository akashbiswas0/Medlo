import Replicate from "replicate";
import { NextResponse } from 'next/server';

const replicate = new Replicate();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainingId = searchParams.get('id');

    if (!trainingId) {
      return NextResponse.json(
        { error: 'Training ID is required' },
        { status: 400 }
      );
    }

    // Get training status from Replicate
    const training = await replicate.trainings.get(trainingId);

    return NextResponse.json({
      id: training.id,
      status: training.status,
      created_at: training.created_at,
      completed_at: training.completed_at,
      error: training.error,
      logs: training.logs
    });

  } catch (error) {
    console.error('Error fetching training status:', error);
    return NextResponse.json(
      { error: `Failed to fetch training status: ${error.message}` },
      { status: 500 }
    );
  }
} 