import Replicate from "replicate";
import { NextResponse } from 'next/server';

const replicate = new Replicate();

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log("Enhancing prompt:", prompt);
    
    const enhancementPrompt = `Take this basic image prompt and enhance it to be more detailed, creative, and visually descriptive for an AI image generation model. Add artistic style, lighting, composition, and visual details. Keep it concise but vivid. Original prompt: "${prompt}"

Enhanced prompt:`;

    const output = await replicate.run(
      "meta/meta-llama-3.1-405b-instruct",
      {
        input: {
          prompt: enhancementPrompt,
          max_tokens: 150,
          temperature: 0.7
        }
      }
    );

    // Join the output array into a single string
    const enhancedPrompt = Array.isArray(output) ? output.join('').trim() : output.toString().trim();
    
    console.log("Enhanced prompt:", enhancedPrompt);

    return NextResponse.json({
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt
    });

  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return NextResponse.json(
      { error: 'Failed to enhance prompt. Please try again.' },
      { status: 500 }
    );
  }
} 