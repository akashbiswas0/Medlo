'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectedImagePage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  // Using a static dummy image URL
  const imageUrl = 'https://picsum.photos/800/800';

  const handleSendMessage = () => {
    // In a real application, you would send the message here
    console.log('Message sent:', message);
    // After sending, navigate back to the generate-campaigns page
    router.push('/generate-campaigns');
  };

  return (
    <div className="min-h-screen bg-[#1F2023] flex items-center justify-center p-4 relative">
      {/* Grid Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #3E4044 1px, transparent 1px),
            linear-gradient(to bottom, #3E4044 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Card container */}
      <div className="bg-[#2E3034] border border-[#3E4044] rounded-lg shadow-xl p-6 w-full max-w-md mx-auto relative z-10">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-gray-100 mb-4 font-['Press_Start_2P'] text-sm tracking-wider">
            SELECTED IMAGE
          </h2>
          
          {/* Image display */}
          <div className="w-full aspect-square rounded-md border border-[#3E4044] mb-4 overflow-hidden">
            <img 
              src={imageUrl} 
              alt="Selected" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2 font-['Press_Start_2P'] text-xs tracking-wider">
              MESSAGE
            </label>
            <textarea
              id="message"
              rows={4}
              className="w-full px-4 py-2 bg-[#1F2023] border border-[#3E4044] rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#A8FF60] focus:border-transparent resize-y  text-md tracking-wider"
              placeholder="ENTER YOUR MESSAGE HERE..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => router.push('/generate-campaigns')}
              className="flex-1 px-4 py-2 bg-transparent border cursor-pointer border-[#3E4044] text-gray-400 rounded-md hover:text-[#A8FF60] hover:border-[#A8FF60] transition-colors font-['Press_Start_2P'] text-xs tracking-wider"
            >
              CANCEL
            </button>
            <button
              onClick={handleSendMessage}
              className="flex-1 px-4 py-2 bg-[#A8FF60] text-black cursor-pointer rounded-md hover:bg-[#97E651] transition-colors font-['Press_Start_2P'] text-xs tracking-wider"
            >
              SEND
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