import Replicate from "replicate";
import { NextResponse, NextRequest } from 'next/server';

const replicate = new Replicate();

export async function GET(request: NextRequest) {
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

    if (training.status === 'succeeded') {
      console.log('Training succeeded. Full response:', JSON.stringify(training, null, 2));

      const predictionGetUrl = (training.output as any)?.urls?.get;

      if (predictionGetUrl && typeof predictionGetUrl === 'string' && predictionGetUrl.includes('/predictions/')) {
        console.log(`Found prediction 'get' URL: ${predictionGetUrl}. Fetching result...`);
        try {
          const predictionResultResponse = await fetch(predictionGetUrl, {
            headers: {
              'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
            }
          });

          if (predictionResultResponse.ok) {
            const predictionResult = await predictionResultResponse.json();
            console.log("Fetched Prediction Result:", JSON.stringify(predictionResult, null, 2));
          } else {
            console.error(`Failed to fetch prediction result. Status: ${predictionResultResponse.status}`, await predictionResultResponse.text());
          }
        } catch (e) {
          console.error("Error fetching prediction result:", e);
        }
      }
    }

    return NextResponse.json({
      id: training.id,
      status: training.status,
      created_at: training.created_at,
      completed_at: training.completed_at,
      error: training.error,
      logs: training.logs,
      output: training.output
    });

  } catch (error) {
    console.error('Error fetching training status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to fetch training status: ${errorMessage}` },
      { status: 500 }
    );
  }
} 