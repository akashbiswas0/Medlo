'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Influencer {
  id: string;
  username: string;
  x_username: string;
  insta_username: string;
  follower_count: number;
  influencer_address: string;
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
  influencer_address: string;
}

export default function AvailableInfluencersPage() {
  const [combinedData, setCombinedData] = useState<CombinedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedTriggerId, setCopiedTriggerId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTriggerId(id);
      setTimeout(() => setCopiedTriggerId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting to fetch data...');
        
        const influencerResponse = await fetch('/api/influencer');
        if (!influencerResponse.ok) {
          throw new Error(`Failed to fetch influencer data: ${influencerResponse.statusText}`);
        }
        const influencerData: Influencer[] = await influencerResponse.json();
        console.log('Raw influencer data:', influencerData);

        const modelResponse = await fetch('/api/model');
        if (!modelResponse.ok) {
          throw new Error(`Failed to fetch model details: ${modelResponse.statusText}`);
        }
        const modelData: ModelDetails[] = await modelResponse.json();
        console.log('Raw model data:', modelData);

        // Create multiple maps for different matching strategies
        const influencerByXUsername = new Map(
          influencerData.map(influencer => [influencer.x_username?.toLowerCase(), influencer])
        );
        console.log('Influencer by X username map:', Object.fromEntries(influencerByXUsername));
        
        const influencerByUsername = new Map(
          influencerData.map(influencer => [influencer.username?.toLowerCase(), influencer])
        );
        console.log('Influencer by username map:', Object.fromEntries(influencerByUsername));
        
        const influencerById = new Map(
          influencerData.map(influencer => [influencer.id, influencer])
        );
        console.log('Influencer by ID map:', Object.fromEntries(influencerById));

        // Function to find matching influencer
        const findMatchingInfluencer = (trigger: string): Influencer | null => {
          const lowerTrigger = trigger.toLowerCase();
          console.log('Finding match for trigger:', lowerTrigger);
          
          // Try matching by x_username
          let match = influencerByXUsername.get(lowerTrigger);
          if (match) {
            console.log('Found match by x_username:', match);
            return match;
          }
          
          // Try matching by username
          match = influencerByUsername.get(lowerTrigger);
          if (match) {
            console.log('Found match by username:', match);
            return match;
          }
          
          // Try matching by removing @ symbol if present
          const cleanTrigger = lowerTrigger.replace('@', '');
          match = influencerByXUsername.get(cleanTrigger);
          if (match) {
            console.log('Found match by clean x_username:', match);
            return match;
          }
          
          match = influencerByUsername.get(cleanTrigger);
          if (match) {
            console.log('Found match by clean username:', match);
            return match;
          }
          
          // Try matching by ID if trigger looks like an ID
          match = influencerById.get(trigger);
          if (match) {
            console.log('Found match by ID:', match);
            return match;
          }
          
          console.log('No match found for trigger:', lowerTrigger);
          return null;
        };

        // Combine data with improved matching
        const combined: CombinedData[] = modelData.map(model => {
          const influencer = findMatchingInfluencer(model.trigger);
          
          console.log(`Matching trigger "${model.trigger}" with influencer:`, influencer);
          
          if (!influencer) {
            console.log('No influencer found for model:', model);
          }
          
          return {
            id: model.id,
            trigger: model.trigger,
            model_id: model.model_id,
            x_username: influencer?.x_username || 'N/A',
            insta_username: influencer?.insta_username || 'N/A',
            follower_count: influencer?.follower_count || 0,
            influencer_address: influencer?.influencer_address || 'N/A'
          };
        });

        console.log('Combined data:', combined);
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#A8FF60] mb-8 text-center font-pixel tracking-wider">
          Available Influencers
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combinedData.length > 0 ? (
            combinedData.map((data) => (
              <div key={data.id} className="relative bg-[#232426] border-2 border-[#A8FF60] rounded-none shadow-xl p-6 transform transition-transform duration-300 flex flex-col justify-between aspect-video">
                <div className="flex flex-col gap-2 z-10">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-xl font-bold text-[#A8FF60] font-pixel tracking-tighter" style={{ textShadow: '0 0 12px rgba(168,255,96,0.8)' }}>
                      {data.trigger}
                    </h3>
                    <button
                      onClick={() => handleCopy(data.trigger, data.id)}
                      className="ml-4 px-3 py-1 rounded-md bg-[#393B3C] text-[#A8FF60] text-xs font-pixel hover:bg-[#393B3C]/50 transition-colors duration-200 cursor-pointer"
                    >
                      {copiedTriggerId === data.id ? 'Copied!' : 'Copy Trigger'}
                    </button>
                  </div>
                  <p className="text-gray-300 font-pixel text-sm">Model ID: {data.model_id}</p>
                  <p className="text-gray-300 font-pixel text-sm">X Username: {data.x_username}</p>
                  <p className="text-gray-300 font-pixel text-sm">Insta Username: {data.insta_username}</p>
                  <p className="text-gray-300 font-pixel text-sm">Followers: {data.follower_count.toLocaleString()}</p>
                  <p className="text-gray-300 font-pixel text-xs">Wallet: {data.influencer_address}</p>
                </div>
                <Link href={`/generate-campaigns`}>
                  <button className="mt-6 self-end py-2 px-6 rounded-lg bg-gradient-to-r from-[#A8FF60] to-[#C0FF8C] text-[#181A1B] font-bold font-pixel text-base hover:from-[#C0FF8C] hover:to-[#A8FF60] transition-all duration-200 shadow-md cursor-pointer hover:scale-105">
                    Generate Campaigns
                  </button>
                </Link>
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