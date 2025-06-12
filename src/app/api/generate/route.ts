import Replicate from "replicate";
import { NextResponse, NextRequest } from 'next/server';

interface ReplicateOutput {
  url?: string;
}

const replicate = new Replicate();

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log("Running the model with prompt:", prompt);
    
    const output = await replicate.run(
      "priyanshur66/priyanshur:b29bf3d696774ab66911a2208595f081d565a2e90649cc1c4a99339a446901df",
      {
        input: {
          prompt: prompt,
        },
      }
    );

    console.log("Image generated successfully");
    console.log("Full output from Replicate:", JSON.stringify(output, null, 2));
    console.log("Output type:", typeof output);
    console.log("Output length if array:", Array.isArray(output) ? output.length : 'Not an array');
    console.log("Object keys if object:", typeof output === 'object' ? Object.keys(output) : 'Not an object');
    
    // Handle different possible response formats
    let imageUrl;
    if (Array.isArray(output) && output.length > 0) {
      const firstOutput = output[0];
      
      // Check if it's a ReadableStream (image data)
      if (firstOutput instanceof ReadableStream) {
        console.log("Converting ReadableStream to base64...");
        
        // Convert ReadableStream to buffer
        const reader = firstOutput.getReader();
        const chunks = [];
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        
        // Combine chunks into a single buffer
        const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          buffer.set(chunk, offset);
          offset += chunk.length;
        }
        
        // Convert to base64 data URL
        const base64 = Buffer.from(buffer).toString('base64');
        imageUrl = `data:image/png;base64,${base64}`;
        
      } else if (typeof firstOutput === 'string') {
        imageUrl = firstOutput;
      } else if (firstOutput && firstOutput.url) {
        imageUrl = firstOutput.url;
      }
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else if (output && (output as ReplicateOutput).url) {
      imageUrl = (output as ReplicateOutput).url;
    } else {
      console.error("Unexpected output format:", output);
      throw new Error("Unexpected response format from Replicate API");
    }

    console.log("Final image URL type:", typeof imageUrl);
    console.log("Final image URL length:", imageUrl ? imageUrl.length : 0);

    return NextResponse.json({
      imageUrl: imageUrl,
      prompt: prompt
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    );
  }
} 