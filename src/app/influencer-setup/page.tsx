"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function InfluencerSetupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/train");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden" style={{ backgroundColor: '#181A1B' }}>
      {/* Grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true"
        style={{
          backgroundImage:
            `linear-gradient(to right, rgba(96,168,255,0.07) 1px, transparent 1px),` +
            `linear-gradient(to bottom, rgba(96,168,255,0.07) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      <div className="w-full max-w-md bg-[#232426] rounded-2xl shadow-2xl border border-[#393B3C] animate-fade-in relative overflow-hidden z-10">
        {/* Blue gradient accent bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#60A8FF] via-[#7bbcff] to-[#60A8FF]" />
        {/* Avatar/Icon */}
        <div className="flex flex-col items-center mt-8 mb-4">
          <div className="w-16 h-16 rounded-full bg-[#181A1B] border-4 border-[#60A8FF] flex items-center justify-center shadow-lg mb-2">
            <span className="text-3xl" role="img" aria-label="influencer">🧑‍🎤</span>
          </div>
          <h1 className="text-2xl font-bold text-[#60A8FF] tracking-wider font-mono drop-shadow-lg" style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}>
            Influencer Setup
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="px-8 pb-8 flex flex-col gap-7">
          {/* Name */}
          <div className="relative">
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required
              className="peer w-full px-4 pt-6 pb-2 rounded-lg bg-[#181A1B] border border-[#393B3C] text-white font-mono focus:ring-2 focus:ring-[#60A8FF] outline-none transition-all duration-200 placeholder-transparent" placeholder="Name" />
            <label htmlFor="name" className="absolute left-4 top-2 text-[#60A8FF] text-xs font-mono pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#7bbcff] peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
              Name
            </label>
          </div>
          {/* Email */}
          <div className="relative">
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="peer w-full px-4 pt-6 pb-2 rounded-lg bg-[#181A1B] border border-[#393B3C] text-white font-mono focus:ring-2 focus:ring-[#60A8FF] outline-none transition-all duration-200 placeholder-transparent" placeholder="Email" />
            <label htmlFor="email" className="absolute left-4 top-2 text-[#60A8FF] text-xs font-mono pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#7bbcff] peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
              Email
            </label>
          </div>
          {/* Social Handle */}
          <div className="relative">
            <input type="text" id="handle" value={handle} onChange={e => setHandle(e.target.value)} required
              className="peer w-full px-4 pt-6 pb-2 rounded-lg bg-[#181A1B] border border-[#393B3C] text-white font-mono focus:ring-2 focus:ring-[#60A8FF] outline-none transition-all duration-200 placeholder-transparent" placeholder="Social Handle" />
            <label htmlFor="handle" className="absolute left-4 top-2 text-[#60A8FF] text-xs font-mono pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#7bbcff] peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
              Social Handle
            </label>
          </div>
          {/* Bio */}
          <div className="relative">
            <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} required
              className="peer w-full px-4 pt-6 pb-2 rounded-lg bg-[#181A1B] border border-[#393B3C] text-white font-mono focus:ring-2 focus:ring-[#60A8FF] outline-none transition-all duration-200 placeholder-transparent min-h-[80px] resize-y" placeholder="Bio" />
            <label htmlFor="bio" className="absolute left-4 top-2 text-[#60A8FF] text-xs font-mono pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#7bbcff] peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
              Bio
            </label>
          </div>
          <button type="submit" className="mt-2 w-full py-3 rounded-lg bg-gradient-to-r from-[#60A8FF] to-[#7bbcff] text-[#181A1B] font-bold font-mono text-lg hover:from-[#7bbcff] hover:to-[#60A8FF] transition-all duration-200 shadow-md tracking-wider">
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
