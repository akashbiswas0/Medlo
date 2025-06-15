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

interface CombinedData {
  id: string;
  trigger: string;
  model_id: string;
  x_username: string;
  insta_username: string;
  follower_count: number;
}

export default function AvailableInfluencersPage() {
  const [combinedData, setCombinedData] = useState<CombinedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const influencerResponse = await fetch('/api/influencer');
        if (!influencerResponse.ok) {
          throw new Error(`Failed to fetch influencer data: ${influencerResponse.statusText}`);
        }
        const influencerData: Influencer[] = await influencerResponse.json();

        const modelResponse = await fetch('/api/model');
        if (!modelResponse.ok) {
          throw new Error(`Failed to fetch model details: ${modelResponse.statusText}`);
        }
        const modelData: ModelDetails[] = await modelResponse.json();

        // Combine data - TEMPORARY ASSUMPTION: Pairing by index
        const combined: CombinedData[] = modelData.map((model, index) => {
          const influencer = influencerData[index]; // Get corresponding influencer by index
          return {
            id: model.id, // Using model ID as the primary ID for the combined card
            trigger: model.trigger,
            model_id: model.model_id,
            x_username: influencer?.x_username || 'N/A', // Fallback to N/A if no influencer
            insta_username: influencer?.insta_username || 'N/A',
            follower_count: influencer?.follower_count || 0,
          };
        });

        setCombinedData(combined);

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden" style={{ backgroundColor: '#181A1B' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel {
          font-family: 'Press Start 2P', 'Fira Mono', monospace;
        }
        body { background: #181A1B !important; }
      `}</style>
      {/* Grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true"
        style={{
          backgroundImage:
            `linear-gradient(to right, rgba(168,255,96,0.07) 1px, transparent 1px),` +
            `linear-gradient(to bottom, rgba(168,255,96,0.07) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      <div className="w-full max-w-4xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-center text-[#A8FF60] mb-12 font-pixel tracking-tighter drop-shadow-lg">
          Available Influencers & Models
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 ml-10justify-items-center">
          {combinedData.length > 0 ? (
            combinedData.map((data) => (
              <div key={data.id} className="relative bg-[#232426] border-2 border-[#A8FF60] rounded-none shadow-xl p-6 transform transition-transform duration-300 hover:scale-105 flex flex-col justify-between aspect-video">
                {/* Top-left corner */}
                <div className="absolute top-0 left-0 w-4 h-4 bg-[#A8FF60]"></div>
                {/* Top-right corner */}
                <div className="absolute top-0 right-0 w-4 h-4 bg-[#A8FF60]"></div>
                {/* Bottom-left corner */}
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#A8FF60]"></div>
                {/* Bottom-right corner */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#A8FF60]"></div>

                <div className="flex flex-col gap-2 z-10">
                  <h3 className="text-xl font-bold text-[#A8FF60] mb-2 font-pixel tracking-tighter" style={{ textShadow: '0 0 12px rgba(168,255,96,0.8)' }}>
                    {data.trigger}
                  </h3>
                  <p className="text-gray-300 font-pixel text-sm">Model ID: {data.model_id}</p>
                  <p className="text-gray-300 font-pixel text-sm">X Username: {data.x_username}</p>
                  <p className="text-gray-300 font-pixel text-sm">Insta Username: {data.insta_username}</p>
                  <p className="text-gray-300 font-pixel text-sm">Followers: {data.follower_count.toLocaleString()}</p>
                </div>
                <button className="mt-6 self-end py-2 px-6 rounded-lg bg-gradient-to-r from-[#A8FF60] to-[#C0FF8C] text-[#181A1B] font-bold font-pixel text-base hover:from-[#C0FF8C] hover:to-[#A8FF60] transition-all duration-200 shadow-md cursor-pointer">
                  Generate
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 font-pixel col-span-full text-center">No combined data found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
