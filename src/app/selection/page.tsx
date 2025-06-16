"use client";
import React from "react";
import Link from "next/link";

export default function SelectionPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center animate-fade-in px-4 relative overflow-hidden" style={{ backgroundColor: '#181A1B' }}>
      {/* Grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true"
        style={{
          backgroundImage:
            `linear-gradient(to right, rgba(168,255,96,0.07) 1px, transparent 1px),` +
            `linear-gradient(to bottom, rgba(168,255,96,0.07) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      <h1 className="text-7xl sm:text-5xl font-bold text-[#A8FF60] mb-12 mt-8 text-center tracking-wider font-mono drop-shadow-lg"
        style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}>
        which one is you?
      </h1>
      <div className="flex flex-col sm:flex-row gap-10 w-full max-w-3xl justify-center z-10">
        {/* community Box */}
        <Link href="/community-setup">
          <div
            className="w-full sm:w-[340px] h-32 bg-[#232426] rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-[#A8FF60] shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:ring-4 hover:ring-[#A8FF60]/30 cursor-pointer animate-fade-in-box font-mono border border-[#393B3C] tracking-widest"
            style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}
          >
            Community
          </div>
        </Link>
        {/* Influencer Box */}
        <Link href="/influencer-setup">
          <div
            className="w-full sm:w-[340px] h-32 bg-[#232426] rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-[#A8FF60] shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:ring-4 hover:ring-[#A8FF60]/30 cursor-pointer animate-fade-in-box delay-150 font-mono border border-[#393B3C] tracking-widest"
            style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}
          >
            influencer
          </div>
        </Link>
      </div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes fade-in-box {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-box {
          animation: fade-in-box 0.6s cubic-bezier(0.4,0,0.2,1) both;
        }
        .animate-fade-in-box.delay-150 {
          animation-delay: 0.15s;
        }
      `}</style>
    </div>
  );
}
