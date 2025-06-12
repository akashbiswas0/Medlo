'use client';

import { useState } from 'react';

export default function TestPage() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState('');

  const enhancePrompt = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to enhance');
      return;
    }

    setEnhancing(true);
    setError('');

    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const data = await response.json();
      setPrompt(data.enhancedPrompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setEnhancing(false);
    }
  };

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      console.log('Response data:', data);
      console.log('Image URL:', data.imageUrl);
      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          AI Image Generator
        </h1>
        
        <form onSubmit={generateImage} className="mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                Enter your prompt
              </label>
              <textarea
                id="prompt"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="An astronaut riding a rainbow unicorn, cinematic, dramatic"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading || enhancing}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={enhancePrompt}
                disabled={loading || enhancing || !prompt.trim()}
                className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enhancing ? 'Enhancing...' : '✨ Enhance Prompt'}
              </button>
              
              <button
                type="submit"
                disabled={loading || enhancing}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Image'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Generating your image...</p>
          </div>
        )}

        {imageUrl && (
          <div className="text-center">
            <img
              src={imageUrl}
              alt="Generated image"
              className="mx-auto max-w-full h-auto rounded-lg shadow-lg"
              onLoad={() => console.log('Image loaded successfully')}
              onError={(e) => {
                console.error('Image failed to load:', e);
                console.error('Image URL that failed:', imageUrl);
                setError('Failed to load the generated image. The image URL might be invalid.');
              }}
            />
            <p className="mt-4 text-gray-600">
              Prompt: "{prompt}"
            </p>
            <p className="mt-2 text-xs text-gray-400 break-all">
              Image URL: {imageUrl}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 