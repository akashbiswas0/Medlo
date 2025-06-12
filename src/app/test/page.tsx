'use client';

import { useState } from 'react';
import Link from 'next/link';

const MODEL_OPTIONS = [
  { id: 'stable-diffusion', name: 'choose options', description: 'Best for general image generation' },
  { id: 'midjourney', name: 'Midjourney Style', description: 'Artistic and creative outputs' },
  { id: 'dall-e', name: 'DALL-E', description: 'Photorealistic and detailed images' },
  { id: 'custom', name: 'Custom Model', description: 'Use your own fine-tuned model' },
];

export default function TestPage() {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].id);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      setEnhancedPrompt(data.enhancedPrompt);
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
        body: JSON.stringify({ prompt: enhancedPrompt || prompt, model: selectedModel }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 border-b-2 border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold hover:text-[#A8FF60] transition-colors">
              Medlo
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Run Inference
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Transform your ideas into stunning visuals with our AI-powered image generator
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Prompt Input */}
            <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              {/* Model Selection Dropdown */}
              <div className="relative mb-6">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black text-left flex justify-between items-center hover:bg-[#A8FF60]/10 transition-all"
                >
                  <span className="font-bold">
                    {MODEL_OPTIONS.find(m => m.id === selectedModel)?.name}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-black border-2 border-black dark:border-white rounded-lg shadow-lg">
                    {MODEL_OPTIONS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-[#A8FF60]/10 transition-all border-b-2 border-black dark:border-white last:border-b-0"
                      >
                        <div className="font-bold">{model.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{model.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={generateImage} className="space-y-6">
                <div>
                  <label htmlFor="prompt" className="block text-lg font-bold mb-2">
                    Enter your prompt
                  </label>
                  <textarea
                    id="prompt"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-[#A8FF60] focus:border-transparent transition-all"
                    placeholder="An astronaut riding a rainbow unicorn, cinematic, dramatic"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading || enhancing}
                  />
                </div>
                
                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={enhancePrompt}
                    disabled={loading || enhancing || !prompt.trim()}
                    className="w-full px-6 py-3 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black text-black dark:text-white hover:bg-[#A8FF60] hover:text-black transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enhancing ? 'Enhancing...' : '✨ Enhance Prompt'}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || enhancing}
                    className="w-full px-6 py-3 border-2 border-black dark:border-white rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-[#A8FF60] hover:text-black transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generating...' : 'Generate Image'}
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-6 p-4 border-2 border-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              {enhancedPrompt && (
                <div className="mt-6 p-4 border-2 border-black dark:border-white rounded-lg bg-gray-50 dark:bg-gray-900">
                  <p className="font-medium">Enhanced Prompt:</p>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">"{enhancedPrompt}"</p>
                </div>
              )}
            </div>

            {/* Right Side - Generated Images */}
            <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#A8FF60] border-t-transparent"></div>
                  <p className="mt-4 text-lg font-medium">Generating your masterpiece...</p>
                </div>
              ) : imageUrl ? (
                <div>
                  <div className="border-2 border-black dark:border-white rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Generated image"
                      className="w-full h-auto"
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        setError('Failed to load the generated image. The image URL might be invalid.');
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <p className="text-lg">Your generated image will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 