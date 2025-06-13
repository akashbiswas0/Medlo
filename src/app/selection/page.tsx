"use client";
import React from "react";
import Link from "next/link";

export default function SelectionPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181A1B] animate-fade-in px-4">
      <h1 className="text-7xl sm:text-5xl font-bold text-[#60A8FF] mb-12 mt-8 text-center tracking-wider font-mono drop-shadow-lg"
      style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}>
        which one is you?
      </h1>
      <div className="flex flex-col sm:flex-row gap-10 w-full max-w-3xl justify-center">
        {/* Brand Box */}
        <Link href="/brand-setup">
        <div
          className="w-full sm:w-[340px] h-32 bg-[#232426] rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-[#60A8FF] shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:ring-4 hover:ring-[#60A8FF]/30 cursor-pointer animate-fade-in-box font-mono border border-[#393B3C] tracking-widest"
          style={{ fontFamily: '"Press Start 2P", "Fira Mono", monospace' }}
        >
          brand
        </div>
        </Link>
        {/* Influencer Box */}
        <Link href="/influencer-setup">
        <div
          className="w-full sm:w-[340px] h-32 bg-[#232426] rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-[#60A8FF] shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:ring-4 hover:ring-[#60A8FF]/30 cursor-pointer animate-fade-in-box delay-150 font-mono border border-[#393B3C] tracking-widest"
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
