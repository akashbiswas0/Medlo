'use client';

import { useState } from 'react';
import Link from 'next/link';

const MODEL_OPTIONS = [
  { id: 'stable-diffusion', name: 'Stable Diffusion', description: 'Best for general image generation' },
  { id: 'midjourney', name: 'Midjourney Style', description: 'Artistic and creative outputs' },
  { id: 'dall-e', name: 'DALL-E', description: 'Photorealistic and detailed images' },
  { id: 'custom', name: 'Custom Model', description: 'Use your own fine-tuned model' },
];

const ASPECT_RATIO_OPTIONS = [
  { id: '1:1', name: '1:1 (Square)' },
  { id: '3:2', name: '3:2 (Landscape)' },
  { id: '2:3', name: '2:3 (Portrait)' },
  { id: '16:9', name: '16:9 (Widescreen)' },
  { id: 'custom', name: 'Custom' },
];

const ASPECT_RATIO_PRESETS: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '3:2': { width: 1152, height: 768 },
  '2:3': { width: 768, height: 1152 },
  '16:9': { width: 1280, height: 720 },
  // 'custom' is not included here
};

export default function TestPage() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].id);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(ASPECT_RATIO_OPTIONS[0].id);
  const [isAspectRatioDropdownOpen, setIsAspectRatioDropdownOpen] = useState(false);
  const [width, setWidth] = useState(768);
  const [height, setHeight] = useState(768);

  const enhancePrompt = async () => {
    if (!prompt.trim()) {
      setError('Prompt cannot be empty.');
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
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to enhance prompt');
      }

      const data = await response.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during prompt enhancement.');
    } finally {
      setEnhancing(false);
    }
  };

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt before generating an image.');
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
        body: JSON.stringify({
          prompt: prompt,
          model: selectedModel,
          aspectRatio: selectedAspectRatio,
          height: selectedAspectRatio === 'custom'
            ? height
            : ASPECT_RATIO_PRESETS[selectedAspectRatio]?.height,
          width: selectedAspectRatio === 'custom'
            ? width
            : ASPECT_RATIO_PRESETS[selectedAspectRatio]?.width,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate image');
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setImageUrl('');
    setError('');
    setLoading(false);
    setEnhancing(false);
    setSelectedModel(MODEL_OPTIONS[0].id);
    setSelectedAspectRatio(ASPECT_RATIO_OPTIONS[0].id);
    setHeight(768);
    setWidth(768);
  };

  return (
    <div className="min-h-screen bg-[#1F2023] text-gray-200 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-[#292A2D] border-b border-[#3E4044] z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-3xl font-bold text-gray-100 hover:text-[#A8FF60] transition-colors">
              Medlo
            </Link>
            <div className="flex items-center space-x-6 text-sm font-medium">
              <a href="#" className="text-gray-400 hover:text-[#A8FF60]">Dashboard</a>
              <a href="#" className="text-gray-400 hover:text-[#A8FF60]">Explore</a>
              <a href="#" className="text-gray-400 hover:text-[#A8FF60]">Pricing</a>
              <a href="#" className="text-gray-400 hover:text-[#A8FF60]">Docs</a>
              <a href="#" className="text-gray-400 hover:text-[#A8FF60]">Blog</a>
              <a href="#" className="text-gray-400 hover:text-[#A8FF60]">Changelog</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex min-h-screen pt-16">
        {/* Left Side - Input Panel */}
        <div className="w-full lg:w-2/5 border-r border-[#3E4044] p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            
          </div>
          {/* Prompt Input */}
          <div className="mb-6">
            <label htmlFor="prompt" className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
             user prompt
            </label>
            <textarea
              id="prompt"
              rows={8}
              className="w-full px-3 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#A8FF60] focus:border-transparent resize-y"
              placeholder="Enter a detailed prompt for image generation..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading || enhancing}
            />
          </div>

          {/* Image File Input (placeholder) */}
          <div className="mb-6">
            <label htmlFor="image-file" className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              D image file
            </label>
            <input
              type="text"
              id="image-file"
              className="w-full px-3 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#A8FF60] focus:border-transparent"
              placeholder="Enter a URL, paste a file, or drag a file over."
              disabled={true} // Placeholder for now
            />
          </div>

          {/* Mask File Input (placeholder) */}
          <div className="mb-6">
            <label htmlFor="mask-file" className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              D mask file
            </label>
            <input
              type="text"
              id="mask-file"
              className="w-full px-3 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#A8FF60] focus:border-transparent"
              placeholder="Enter a URL, paste a file, or drag a file over."
              disabled={true} // Placeholder for now
            />
          </div>

          {/* Aspect Ratio Dropdown */}
          <div className="mb-6">
            <label htmlFor="aspect-ratio" className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Aspect Ratio string
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAspectRatioDropdownOpen(!isAspectRatioDropdownOpen)}
                className="w-full px-3 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-left flex justify-between items-center text-gray-100 hover:border-[#A8FF60] transition-colors"
              >
                {ASPECT_RATIO_OPTIONS.find(ar => ar.id === selectedAspectRatio)?.name}
                <svg className={`w-4 h-4 transition-transform ${isAspectRatioDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isAspectRatioDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-[#2E3034] border border-[#3E4044] rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {ASPECT_RATIO_OPTIONS.map((ar) => (
                    <button
                      key={ar.id}
                      onClick={() => {
                        setSelectedAspectRatio(ar.id);
                        setIsAspectRatioDropdownOpen(false);
                        if (ar.id !== 'custom' && ASPECT_RATIO_PRESETS[ar.id]) {
                          setWidth(ASPECT_RATIO_PRESETS[ar.id].width);
                          setHeight(ASPECT_RATIO_PRESETS[ar.id].height);
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-gray-100 hover:bg-[#3A3A3A] transition-colors border-b border-[#3E4044] last:border-b-0"
                    >
                      {ar.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Aspect ratio for the generated image. The size will always be 1 megapixel, i.e. 1024x1024 if aspect ratio is 1:1. To use arbitrary width and height, set aspect ratio to 'custom'. Default: &quot;1:1&quot;</p>
          </div>

          {/* Width Input with Slider */}
          <div className="mb-6">
            <label htmlFor="width" className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              # width integer (minimum: 256, maximum: 1440)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                id="width"
                min={256}
                max={1440}
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                className="w-24 px-3 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#A8FF60] focus:border-transparent"
                disabled={loading || enhancing || selectedAspectRatio !== 'custom'}
              />
              <input
                type="range"
                min={256}
                max={1440}
                step={16} // Multiple of 16
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                className="flex-grow h-2 bg-[#3E4044] rounded-lg appearance-none cursor-pointer range-thumb-custom"
                style={{'--webkit-slider-thumb-bg': '#A8FF60', '--moz-range-thumb-bg': '#A8FF60'} as React.CSSProperties}
                disabled={loading || enhancing || selectedAspectRatio !== 'custom'}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Width of the generated image. Optional, only used when aspect_ratio=custom. Must be a multiple of 16 (if it's not, it will be rounded to nearest multiple of 16)</p>
          </div>

          {/* Height Input with Slider */}
          <div className="mb-6">
            <label htmlFor="height" className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              # height integer (minimum: 256, maximum: 1440)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                id="height"
                min={256}
                max={1440}
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="w-24 px-3 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#A8FF60] focus:border-transparent"
                disabled={loading || enhancing || selectedAspectRatio !== 'custom'}
              />
              <input
                type="range"
                min={256}
                max={1440}
                step={16} // Multiple of 16
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="flex-grow h-2 bg-[#3E4044] rounded-lg appearance-none cursor-pointer range-thumb-custom"
                style={{'--webkit-slider-thumb-bg': '#A8FF60', '--moz-range-thumb-bg': '#A8FF60'} as React.CSSProperties}
                disabled={loading || enhancing || selectedAspectRatio !== 'custom'}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Height of the generated image. Optional, only used when aspect_ratio=custom. Must be a multiple of 16 (if it's not, it will be rounded to nearest multiple of 16)</p>
          </div>

          {/* Model Selection Dropdown (moved here to match flow) */}
          <div className="mb-6">
            <label htmlFor="model" className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Model
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="w-full px-3 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-left flex justify-between items-center text-gray-100 hover:border-[#A8FF60] transition-colors"
              >
                {MODEL_OPTIONS.find(m => m.id === selectedModel)?.name}
                <svg className={`w-4 h-4 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isModelDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-[#2E3034] border border-[#3E4044] rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {MODEL_OPTIONS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setIsModelDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-gray-100 hover:bg-[#3A3A3A] transition-colors border-b border-[#3E4044] last:border-b-0"
                    >
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-400">{model.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-6">Prompt for generated image. If you include the &apos;trigger_word&apos; used in the training process you are more likely to activate the trained object, style, or concept in the resulting image.</p>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-700 text-red-400 rounded-md mb-4 flex items-center gap-2 text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-auto pt-6 border-t border-[#3E4044] flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-transparent text-gray-400 rounded-md hover:text-[#A8FF60] transition-colors text-sm font-medium"
            >
              Reset
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={enhancePrompt}
                disabled={loading || enhancing || !prompt.trim()}
                className="px-4 py-2 cursor-pointer bg-[#2E3034] border border-[#3E4044] rounded-md text-gray-100 hover:bg-[#3A3A3A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {enhancing ? 'Enhancing...' : '✨ Enhance'}
              </button>
              <button
                type="submit"
                onClick={generateImage}
                disabled={loading || enhancing || !prompt.trim()}
                className="px-4 py-2 bg-[#A8FF60] text-black rounded-md hover:bg-[#97E651] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base flex items-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Running...
                  </span>
                ) : (
                  <>
                    Run
                   
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Output Panel */}
        <div className="flex-grow p-6 flex flex-col items-center justify-center bg-[#1A1A1A]">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 border-4 border-[#A8FF60] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="w-20 h-20 border-4 border-[#444444] border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
              </div>
              <p className="text-lg font-medium">Generating your masterpiece...</p>
              <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
            </div>
          ) : imageUrl ? (
            <div className="flex flex-col items-center">
              <div className="relative w-full h-auto mb-6 -mt-60 flex justify-center items-center overflow-hidden max-h-[80vh]">
                <img
                  src={imageUrl}
                  alt="Generated image"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg border border-[#3E4044] shadow-lg"
                  onLoad={() => console.log('Image loaded.')}
                  onError={(e) => {
                    console.error('Image failed to load:', e);
                    setError('Failed to load image. URL might be invalid.');
                  }}
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <button className="px-3 py-1.5 bg-[#2E3034] text-gray-100 rounded-md hover:bg-[#3E4044] transition-colors text-xs font-medium border border-[#3E4044]">Tweak it</button>
                <button className="px-3 py-1.5 bg-[#2E3034] text-gray-100 rounded-md hover:bg-[#3E4044] transition-colors text-xs font-medium border border-[#3E4044]">Share</button>
                <button className="px-3 py-1.5 bg-[#2E3034] text-gray-100 rounded-md hover:bg-[#3E4044] transition-colors text-xs font-medium border border-[#3E4044]">Download</button>
                {/* <button className="px-3 py-1.5 bg-[#2E3034] text-gray-100 rounded-md hover:bg-[#3E4044] transition-colors text-xs font-medium border border-[#3E4044]">Report</button> */}
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {/* <button className="px-3 py-1.5 bg-[#2E3034] text-gray-100 rounded-md hover:bg-[#3E4044] transition-colors text-xs font-medium border border-[#3E4044]">Add to examples</button> */}
                <button className="px-3 py-1.5 bg-[#5C1A1A] text-red-300 rounded-md hover:bg-[#722020] transition-colors text-xs font-medium border border-[#722020] cursor-pointer">Delete</button>
              </div>
             
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <svg className="w-24 h-24 mb-4 text-[#3E4044]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-base font-medium text-gray-400">Your generated image will appear here</p>
              <p className="mt-1 text-sm text-gray-500">Enter a prompt and click &quot;Run&quot; to create your image</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}