import Replicate from "replicate";
import { NextResponse, NextRequest } from 'next/server';
import JSZip from 'jszip';

const replicate = new Replicate();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const triggerWord = formData.get('triggerWord');
    const stepsValue = formData.get('steps');
    const steps = stepsValue ? parseInt(stepsValue.toString()) : 1000;
    const modelName = formData.get('influencer_id');

    if (!triggerWord || !modelName) {
      return NextResponse.json(
        { error: 'Trigger word and influencer_id are required' },
        { status: 400 }
      );
    }

    // Extract images from formData
    const images: File[] = [];
    for (let [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        images.push(value);
      }
    }

    if (images.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 images are required' },
        { status: 400 }
      );
    }

    console.log(`Starting training with ${images.length} images, trigger word: ${triggerWord}, steps: ${steps}`);
    console.log("Environment check:");
    console.log("- REPLICATE_API_TOKEN:", process.env.REPLICATE_API_TOKEN ? "Set" : "Not set");
    console.log("- REPLICATE_USERNAME:", process.env.REPLICATE_USERNAME || "Not set");

    // Create a zip file with the training images
    const zip = new JSZip();
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const arrayBuffer = await image.arrayBuffer();
      const fileName = `training_image_${i + 1}.${image.name.split('.').pop()}`;
      zip.file(fileName, arrayBuffer);
    }

    const zipBuffer = await zip.generateAsync({ type: 'uint8array' });

    // First, check if model exists or create it
    const ownerName = process.env.REPLICATE_USERNAME;
    
    if (!ownerName) {
      throw new Error("REPLICATE_USERNAME environment variable is required");
    }
    
    let model;
    
    try {
      // Try to get existing model
      model = await replicate.models.get(ownerName, modelName as string);
      console.log("Using existing model:", model.name);
    } catch (error) {
      // Model doesn't exist, create it
      console.log("Creating new model...");
      model = await replicate.models.create(
        ownerName,
        modelName as string,
        {
          visibility: "private",
          hardware: "gpu-h100",
          description: "A fine-tuned FLUX.1 model"
        }
      );
      console.log("Model created:", model.name);
    }

    // Upload the zip file to Replicate's file storage first
    console.log("Uploading training data to Replicate...");
    const fileResponse = await fetch('https://api.replicate.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: (() => {
        const formData = new FormData();
        formData.append('content', new Blob([zipBuffer], { type: 'application/zip' }), 'training_data.zip');
        return formData;
      })()
    });

    if (!fileResponse.ok) {
      throw new Error(`Failed to upload training data: ${fileResponse.statusText}`);
    }

    const fileData = await fileResponse.json();
    const trainingDataUrl = fileData.urls.get;
    console.log("Training data uploaded:", trainingDataUrl);

    // Start the training
    const training = await replicate.trainings.create(
      "ostris",
      "flux-dev-lora-trainer",
      "d995297071a44dcb72244e6c19462111649ec86a9646c32df56daa7f14801944", // version id of trainer
      {
        destination: `${ownerName}/${modelName}`,
        input: {
          input_images: trainingDataUrl,
          trigger_word: triggerWord,
          steps: steps,
          learning_rate: 0.0004,
          batch_size: 1,
          resolution: 512,
          autocaption: true
        }
      }
    );

    console.log("Training:", training);

    console.log("Training started:", training.id);
    console.log("Training status:", training.status);

    return NextResponse.json({
      trainingId: training.id,
      status: training.status,
      model: `${model.owner}/${model.name}`,
      message: "Training started successfully"
    });

  } catch (error) {
    console.error('Error starting training:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to start training: ${errorMessage}` },
      { status: 500 }
    );
  }
} 