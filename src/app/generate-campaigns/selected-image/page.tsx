'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectedImagePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const imageUrl = 'https://picsum.photos/800/800';

  return (
    <div className="min-h-screen bg-[#1F2023] flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-[#292A2D] border-b border-[#3E4044] z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-3xl font-bold text-gray-100">
              Medlo
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 pt-20">
        <div className="max-w-2xl mx-auto w-full">
          <h1 className="text-2xl font-bold text-gray-100 mb-6 font-['Press_Start_2P'] text-sm tracking-wider">
            SELECTED IMAGE
          </h1>

          {/* Image display */}
          <div className="w-full aspect-square rounded-md border border-[#3E4044] mb-4 overflow-hidden">
            <img 
              src={imageUrl} 
              alt="Selected" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => router.push('/generate-campaigns')}
              className="flex-1 px-4 py-2 bg-transparent border cursor-pointer border-[#3E4044] text-gray-400 rounded-md hover:text-[#A8FF60] hover:border-[#A8FF60] transition-colors font-['Press_Start_2P'] text-xs tracking-wider"
            >
              BACK
            </button>
          </div>
        </div>
      </div>

      {/* Add Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        rel="stylesheet"
      />
    </div>
  );
} 