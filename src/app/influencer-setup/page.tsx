"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function InfluencerSetupPage() {
  const [username, setUsername] = useState("");
  const [xUsername, setXUsername] = useState("");
  const [instaUsername, setInstaUsername] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [influencerAddress, setInfluencerAddress] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('/api/influencers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          x_username: xUsername,
          insta_username: instaUsername,
          follower_count: parseInt(followerCount),
          wallet_address: influencerAddress
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(data.error || data.details || 'Failed to save influencer data');
      }

      const data = await response.json();
      console.log('Success response:', data);

      if (data.data && data.data.length > 0) {
        const influencerId = data.data[0].id;
        localStorage.setItem('influencer_id', influencerId);
        console.log('Influencer ID stored in local storage:', influencerId);
      }
      
      router.push("/train");
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving data');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden" style={{ backgroundColor: '#181A1B' }}>
      {/* Grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true"
        style={{
          backgroundImage:
            `linear-gradient(to right, rgba(168,255,96,0.07) 1px, transparent 1px),` +
            `linear-gradient(to bottom, rgba(168,255,96,0.07) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      <div className="w-full max-w-lg bg-[#232426] rounded-xl shadow-2xl border border-[#393B3C] animate-fade-in relative overflow-hidden z-10 py-8 px-12">
        {/* Green gradient accent bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#A8FF60] via-[#C0FF8C] to-[#A8FF60]" />
        {/* Avatar/Icon */}
        <div className="flex flex-col items-center mt-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-[#181A1B] border-4 border-[#A8FF60] flex items-center justify-center shadow-lg mb-2">
            <span className="text-3xl" role="img" aria-label="influencer">🧑‍🎤</span>
          </div>
          <h1 className="text-2xl font-bold text-[#A8FF60] tracking-wider font-mono drop-shadow-lg" style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}>
            Influencer Setup
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          {/* Username */}
          <div className="relative">
            <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required
              className="peer w-full px-4 pt-6 pb-2 rounded-lg bg-[#181A1B] border border-[#393B3C] text-white font-mono focus:ring-2 focus:ring-[#A8FF60] outline-none transition-all duration-200 placeholder-transparent" placeholder="Username" style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }} />
            <label htmlFor="username" className="absolute left-4 top-2 text-[#A8FF60] text-xs font-mono pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#C0FF8C] peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400" style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}>
              Username
            </label>
          </div>
          {/* X Username */}
          <div className="relative">
            <input type="text" id="xUsername" value={xUsername} onChange={e => setXUsername(e.target.value)} required
              className="peer w-full px-4 pt-6 pb-2 rounded-lg bg-[#181A1B] border border-[#393B3C] text-white font-mono focus:ring-2 focus:ring-[#A8FF60] outline-none transition-all duration-200 placeholder-transparent" placeholder="X Username" style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }} />
            <label htmlFor="xUsername" className="absolute left-4 top-2 text-[#A8FF60] text-xs font-mono pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#C0FF8C] peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400" style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}>
              X Username
            </label>
          </div>
          {/* Instagram Username */}
          <div className="relative">
            <input type="text" id="instaUsername" value={instaUsername} onChange={e => setInstaUsername(e.target.value)} required
              className="peer w-full px-4 pt-6 pb-2 rounded-lg bg-[#181A1B] border border-[#393B3C] text-white font-mono focus:ring-2 focus:ring-[#A8FF60] outline-none transition-all duration-200 placeholder-transparent" placeholder="Instagram Username" style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }} />
            <label htmlFor="instaUsername" className="absolute left-4 top-2 text-[#A8FF60] text-xs font-mono pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#C0FF8C] peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400" style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}>
              Instagram Username
            </label>
          </div>
          {/* Follower Count */}
          <div className="relative">
            <input type="number" id="followerCount" value={followerCount} onChange={e => setFollowerCount(e.target.value)} required
              className="peer w-full px-4 pt-6 pb-2 rounded-lg bg-[#181A1B] border border-[#393B3C] text-white font-mono focus:ring-2 focus:ring-[#A8FF60] outline-none transition-all duration-200 placeholder-transparent" placeholder="Follower Count" style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }} />
            <label htmlFor="followerCount" className="absolute left-4 top-2 text-[#A8FF60] text-xs font-mono pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#C0FF8C] peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400" style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}>
              Follower Count
            </label>
          </div>
          {/* Influencer Wallet Address */}
          <div className="relative">
            <input 
              type="text" 
              id="influencerAddress" 
              value={influencerAddress} 
              onChange={e => setInfluencerAddress(e.target.value)} 
              required
              className="peer w-full px-4 pt-6 pb-2 rounded-lg bg-[#181A1B] border border-[#393B3C] text-white font-mono focus:ring-2 focus:ring-[#A8FF60] outline-none transition-all duration-200 placeholder-transparent" 
              placeholder="Wallet Address" 
              style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }} 
            />
            <label 
              htmlFor="influencerAddress" 
              className="absolute left-4 top-2 text-[#A8FF60] text-xs font-mono pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#C0FF8C] peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400" 
              style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}
            >
              Wallet Address
            </label>
          </div>
          {error && (
            <div className="text-red-500 text-sm font-mono" style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}>
              {error}
            </div>
          )}
          <button type="submit" className="mt-2 w-full py-3 rounded-lg bg-gradient-to-r from-[#A8FF60] to-[#C0FF8C] text-[#181A1B] font-bold font-mono text-lg hover:from-[#C0FF8C] hover:to-[#A8FF60] transition-all duration-200 shadow-md tracking-wider" style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}>
            Submit
          </button>
        </form>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  );
}
