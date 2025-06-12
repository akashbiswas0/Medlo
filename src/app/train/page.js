'use client';

import { useState } from 'react';

export default function TrainPage() {
  const [images, setImages] = useState([]);
  const [triggerWord, setTriggerWord] = useState('');
  const [steps, setSteps] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trainingStatus, setTrainingStatus] = useState('');
  const [trainingId, setTrainingId] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length < 2) {
      setError('Please select at least 2 images');
      return;
    }
    
    if (files.length > 10) {
      setError('Please select no more than 10 images');
      return;
    }

    // Validate file types
    const validFiles = files.filter(file => 
      file.type === 'image/jpeg' || file.type === 'image/png'
    );

    if (validFiles.length !== files.length) {
      setError('Please only select JPEG or PNG images');
      return;
    }

    setImages(validFiles);
    setError('');
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const startTraining = async (e) => {
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
      
      // Add all images to formData
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
      
      // Poll for training status
      pollTrainingStatus(data.trainingId);
      
    } catch (err) {
      setError(err.message);
      setTrainingStatus('');
    } finally {
      setLoading(false);
    }
  };

  const pollTrainingStatus = async (id) => {
    try {
      const response = await fetch(`/api/train-flux/status?id=${id}`);
      const data = await response.json();
      
      setTrainingStatus(data.status);
      
      if (data.status === 'succeeded' || data.status === 'failed' || data.status === 'canceled') {
        return;
      }
      
      // Continue polling every 30 seconds
      setTimeout(() => pollTrainingStatus(id), 30000);
    } catch (err) {
      console.error('Error polling training status:', err);
      setTimeout(() => pollTrainingStatus(id), 30000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Fine-tune FLUX Model
        </h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Training Guidelines</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Upload 2-10 high-quality images (JPEG or PNG)</li>
              <li>• Choose a unique trigger word (e.g., "TOK", "CYBRPNK")</li>
              <li>• Training typically takes 20-30 minutes and costs under $2</li>
              <li>• Use diverse images covering different aspects of your concept</li>
            </ul>
          </div>
        </div>

        <form onSubmit={startTraining} className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Images ({images.length}/10)
              </label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
              />
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Training image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
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
              <label htmlFor="triggerWord" className="block text-sm font-medium text-gray-700">
                Trigger Word
              </label>
              <input
                type="text"
                id="triggerWord"
                value={triggerWord}
                onChange={(e) => setTriggerWord(e.target.value)}
                placeholder="e.g., TOK, CYBRPNK, MYSTYLE"
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                A unique word to associate with your training concept
              </p>
            </div>

            {/* Steps */}
            <div>
              <label htmlFor="steps" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended: 1000 steps (more steps = longer training but potentially better results)
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || images.length < 2 || !triggerWord.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Starting Training...' : '🚀 Start Training'}
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Training Status */}
        {trainingStatus && (
          <div className="mt-4 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Training Status</h3>
            <div className="flex items-center space-x-2">
              {trainingStatus === 'succeeded' ? (
                <span className="text-green-600">✅</span>
              ) : trainingStatus === 'failed' ? (
                <span className="text-red-600">❌</span>
              ) : (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              )}
              <span className="text-gray-700">{trainingStatus}</span>
            </div>
            {trainingId && (
              <p className="mt-2 text-xs text-gray-500">
                Training ID: {trainingId}
              </p>
            )}
            {trainingStatus === 'succeeded' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-700">
                  🎉 Training completed successfully! Your model is ready to use.
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Model: akb
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 