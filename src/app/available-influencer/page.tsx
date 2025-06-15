'use client';

import { useState, useEffect } from 'react';

interface Influencer {
  id: string;
  username: string;
  x_username: string;
  insta_username: string;
  follower_count: number;
}

interface ModelDetails {
  id: string;
  trigger: string;
  model_id: string;
}

export default function AvailableInfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [modelDetails, setModelDetails] = useState<ModelDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Influencer Data
        const influencerResponse = await fetch('http://localhost:3001/api/influencer/get');
        if (!influencerResponse.ok) {
          throw new Error(`Failed to fetch influencer data: ${influencerResponse.statusText}`);
        }
        const influencerData: Influencer[] = await influencerResponse.json();
        setInfluencers(influencerData);

        // Fetch Model Details Data
        const modelResponse = await fetch('http://localhost:3001/api/model/get');
        if (!modelResponse.ok) {
          throw new Error(`Failed to fetch model details: ${modelResponse.statusText}`);
        }
        const modelData: ModelDetails[] = await modelResponse.json();
        setModelDetails(modelData);

      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181A1B] text-gray-100 font-pixel">
        <p>Loading available influencers and models...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181A1B] text-red-400 font-pixel">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181A1B] py-12 px-4 sm:px-6 lg:px-8">
      <style jsx global>{`
        @font-face {
          font-family: 'Press Start 2P';
          src: url('/fonts/PressStart2P-Regular.ttf') format('truetype');
          font-display: swap;
        }
        .font-pixel {
          font-family: 'Press Start 2P', 'Fira Mono', monospace;
        }
        body { background: #181A1B !important; }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-[#A8FF60] mb-12 font-pixel tracking-tighter drop-shadow-lg">
          Available Influencers & Models
        </h1>

        {/* Influencer Cards */}
        <h2 className="text-2xl font-bold text-[#A8FF60] mb-6 font-pixel">Influencers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {influencers.length > 0 ? (
            influencers.map((influencer) => (
              <div key={influencer.id} className="bg-[#232426] border border-[#393B3C] rounded-lg shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
                <p className="text-gray-400 text-sm mb-2 font-pixel">ID: {influencer.id}</p>
                <h3 className="text-xl font-bold text-white mb-2 font-pixel">@{influencer.username}</h3>
                <p className="text-gray-300 mb-1 font-pixel">X: {influencer.x_username}</p>
                <p className="text-gray-300 mb-1 font-pixel">Insta: {influencer.insta_username}</p>
                <p className="text-gray-300 font-pixel">Followers: {influencer.follower_count.toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 font-pixel">No influencers found.</p>
          )}
        </div>

        {/* Model Details Cards */}
        <h2 className="text-2xl font-bold text-[#A8FF60] mb-6 font-pixel">Model Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modelDetails.length > 0 ? (
            modelDetails.map((model) => (
              <div key={model.id} className="bg-[#232426] border border-[#393B3C] rounded-lg shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
                <p className="text-gray-400 text-sm mb-2 font-pixel">ID: {model.id}</p>
                <h3 className="text-xl font-bold text-white mb-2 font-pixel">Trigger: {model.trigger}</h3>
                <p className="text-gray-300 font-pixel">Model ID: {model.model_id}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 font-pixel">No model details found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
