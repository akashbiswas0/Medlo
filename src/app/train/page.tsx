'use client';

import { useState, useEffect } from 'react';

export default function TrainPage() {
  const [images, setImages] = useState<File[]>([]);
  const [triggerWord, setTriggerWord] = useState('');
  const [steps, setSteps] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trainingStatus, setTrainingStatus] = useState('');
  const [trainingId, setTrainingId] = useState('');
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowPreloader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showPreloader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181A1B]">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="relative flex items-center justify-center mb-2">
            <span className="absolute inline-block w-32 h-32 rounded-full bg-gradient-to-tr from-[#A8FF60] via-[#232426] to-[#A8FF60] opacity-30 blur-xl animate-glow" />
            <svg className="w-20 h-20 text-[#A8FF60] animate-bounce-slow relative z-10" fill="none" viewBox="0 0 48 48" stroke="currentColor">
              <rect x="8" y="16" width="32" height="20" rx="6" fill="#232426" stroke="#A8FF60" strokeWidth="2" />
              <rect x="18" y="8" width="12" height="8" rx="3" fill="#232426" stroke="#A8FF60" strokeWidth="2" />
              <circle cx="16" cy="26" r="2.5" fill="#A8FF60" />
              <circle cx="32" cy="26" r="2.5" fill="#A8FF60" />
              <rect x="20" y="32" width="8" height="3" rx="1.5" fill="#A8FF60" />
              <rect x="6" y="22" width="4" height="8" rx="2" fill="#A8FF60" />
              <rect x="38" y="22" width="4" height="8" rx="2" fill="#A8FF60" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#A8FF60] via-white to-[#A8FF60] bg-clip-text text-transparent animate-gradient-move tracking-tight text-center drop-shadow-lg">
            now you can train your model!
          </h1>
        </div>
        <style jsx global>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: none; }
          }
          .animate-fade-in {
            animation: fade-in 0.5s cubic-bezier(0.4,0,0.2,1) both;
          }
          @keyframes gradient-move {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
          .animate-gradient-move {
            background-size: 200% 200%;
            animation: gradient-move 3s linear infinite alternate;
          }
          @keyframes glow {
            0%, 100% { opacity: 0.2; filter: blur(24px); }
            50% { opacity: 0.5; filter: blur(32px); }
          }
          .animate-glow {
            animation: glow 3s ease-in-out infinite;
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px) scale(1.08); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 1.4s infinite;
          }
        `}</style>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length < 2) {
      setError('Please select at least 2 images');
      return;
    }
    if (files.length > 10) {
      setError('Please select no more than 10 images');
      return;
    }
    const validFiles = files.filter((file: File) =>
      file.type === 'image/jpeg' || file.type === 'image/png'
    );
    if (validFiles.length !== files.length) {
      setError('Please only select JPEG or PNG images');
      return;
    }
    setImages(validFiles);
    setError('');
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const startTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length < 2) {
      setError('Please select at least 2 images');
      return;
    }
    if (!triggerWord.trim()) {
      setError('Please enter a trigger word');
      return;
    }
    setLoading(true);
    setError('');
    setTrainingStatus('Preparing training data...');
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });
      formData.append('triggerWord', triggerWord);
      formData.append('steps', steps.toString());
      const response = await fetch('/api/train-flux', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to start training');
      }
      const data = await response.json();
      setTrainingId(data.trainingId);
      setTrainingStatus(data.status);
      pollTrainingStatus(data.trainingId);
    } catch (err: any) {
      setError(err.message);
      setTrainingStatus('');
    } finally {
      setLoading(false);
    }
  };

  const pollTrainingStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/train-flux/status?id=${id}`);
      const data = await response.json();
      setTrainingStatus(data.status);
      if (data.status === 'succeeded' || data.status === 'failed' || data.status === 'canceled') {
        return;
      }
      setTimeout(() => pollTrainingStatus(id), 30000);
    } catch (err) {
      setTimeout(() => pollTrainingStatus(id), 30000);
    }
  };

  // Training overlay
  const TrainingOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 transition-opacity duration-300">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="relative flex items-center justify-center mb-2">
          <span className="absolute inline-block w-32 h-32 rounded-full bg-gradient-to-tr from-[#A8FF60] via-[#232426] to-[#A8FF60] opacity-30 blur-xl animate-glow" />
          <svg className="w-20 h-20 text-[#A8FF60] animate-bounce-slow relative z-10" fill="none" viewBox="0 0 48 48" stroke="currentColor">
            <rect x="8" y="16" width="32" height="20" rx="6" fill="#232426" stroke="#A8FF60" strokeWidth="2" />
            <rect x="18" y="8" width="12" height="8" rx="3" fill="#232426" stroke="#A8FF60" strokeWidth="2" />
            <circle cx="16" cy="26" r="2.5" fill="#A8FF60" />
            <circle cx="32" cy="26" r="2.5" fill="#A8FF60" />
            <rect x="20" y="32" width="8" height="3" rx="1.5" fill="#A8FF60" />
            <rect x="6" y="22" width="4" height="8" rx="2" fill="#A8FF60" />
            <rect x="38" y="22" width="4" height="8" rx="2" fill="#A8FF60" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#A8FF60] text-center drop-shadow-lg">Training in progress...</h2>
        <p className="text-gray-300 text-center max-w-xs">This may take a few minutes. Please wait while we fine-tune your model.</p>
      </div>
      <style jsx global>{`
        .animate-fade-in { animation: fade-in 0.5s cubic-bezier(0.4,0,0.2,1) both; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 1.4s infinite; }
      `}</style>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#181A1B] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#181A1B] border-b border-[#232426] h-18 flex items-center px-6 shadow-sm">
        <span className="text-3xl ml-10 font-bold text-[#A8FF60] tracking-tight">Medlo</span>
      </nav>
      {loading && <TrainingOverlay />}
      <div className={`max-w-4xl mx-auto pt-12 ${loading ? 'pointer-events-none select-none opacity-30' : ''}`}>
        <h1 className="text-3xl font-bold text-center text-gray-100 mb-8">Fine-tune your model</h1>
        <div className="bg-[#232426] shadow rounded-lg p-6 mb-8 border border-[#232426]">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-100 mb-2">Training Guidelines</h2>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Upload 2-10 high-quality images (JPEG or PNG)</li>
              <li>• Choose a unique trigger word (e.g., "TOK", "CYBRPNK")</li>
              <li>• Training typically takes 20-30 minutes and costs under $2</li>
              <li>• Use diverse images covering different aspects of your concept</li>
            </ul>
          </div>
        </div>
        <form onSubmit={startTraining} className="bg-[#232426] shadow rounded-lg p-6 border border-[#232426]">
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Training Images ({images.length}/10)
              </label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#232426] file:text-[#A8FF60] hover:file:bg-[#232426]/80 disabled:opacity-50"
              />
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Training image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-[#232426]"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Trigger Word */}
            <div>
              <label htmlFor="triggerWord" className="block text-sm font-medium text-gray-200">
                Trigger Word
              </label>
              <input
                type="text"
                id="triggerWord"
                value={triggerWord}
                onChange={(e) => setTriggerWord(e.target.value)}
                placeholder="e.g., TOK, CYBRPNK, MYSTYLE"
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-[#393B3C] bg-[#181A1B] text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-[#A8FF60] focus:border-[#A8FF60] placeholder-gray-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                A unique word to associate with your training concept
              </p>
            </div>
            {/* Steps */}
            <div>
              <label htmlFor="steps" className="block text-sm font-medium text-gray-200">
                Training Steps
              </label>
              <input
                type="number"
                id="steps"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value))}
                min="500"
                max="2000"
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-[#393B3C] bg-[#181A1B] text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-[#A8FF60] focus:border-[#A8FF60] placeholder-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended: 1000 steps (more steps = longer training but potentially better results)
              </p>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || images.length < 2 || !triggerWord.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold font-medium text-[#181A1B] bg-[#A8FF60] hover:bg-[#C0FF8C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A8FF60] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Starting Training...' : '🚀 Start Training'}
            </button>
          </div>
        </form>
        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded">
            {error}
          </div>
        )}
        {/* Training Status */}
        {trainingStatus && (
          <div className="mt-4 bg-[#232426] shadow rounded-lg p-6 border border-[#232426]">
            <h3 className="text-lg font-medium text-gray-100 mb-2">Training Status</h3>
            <div className="flex items-center space-x-2">
              {trainingStatus === 'succeeded' ? (
                <span className="text-green-400">✅</span>
              ) : trainingStatus === 'failed' ? (
                <span className="text-red-400">❌</span>
              ) : (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#A8FF60]"></div>
              )}
              <span className="text-gray-200">{trainingStatus}</span>
            </div>
            {trainingId && (
              <p className="mt-2 text-xs text-gray-500">
                Training ID: {trainingId}
              </p>
            )}
            {trainingStatus === 'succeeded' && (
              <div className="mt-4 p-4 bg-green-950 border border-green-800 rounded">
                <p className="text-green-400">
                  🎉 Training completed successfully! Your model is ready to use.
                </p>
                <p className="text-sm text-green-300 mt-1">
                  Model: akb
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <style jsx global>{`
        body { background: #181A1B !important; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.2; filter: blur(24px); }
          50% { opacity: 0.5; filter: blur(32px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px) scale(1.08); }
        }
      `}</style>
    </div>
  );
} 