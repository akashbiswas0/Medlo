'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SelectedImagePage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [error, setError] = useState('');
  const [brandId, setBrandId] = useState<string | null>(null);
  const imageUrl = 'https://picsum.photos/800/800';

  // Using valid UUIDs for testing
  const influencerId = '123e4567-e89b-12d3-a456-426614174001'; // Example influencer UUID

  // Fetch brand ID on component mount
  useEffect(() => {
    const fetchBrandId = async () => {
      try {
        const { data, error } = await supabase
          .from('brand')
          .select('id')
          .single();

        if (error) throw error;
        if (data) {
          setBrandId(data.id);
        }
      } catch (err) {
        console.error('Error fetching brand ID:', err);
        setError('Failed to load brand information');
      }
    };

    fetchBrandId();
  }, []);

  const handleSendMessage = async () => {
    try {
      setError('');
      
      if (!message.trim()) {
        setError('Message cannot be empty');
        return;
      }

      if (!brandId) {
        setError('Brand information not loaded');
        return;
      }

      const { data, error: insertError } = await supabase
        .from('messaging')
        .insert([
          {
            brand_id: brandId,
            influencer_id: influencerId,
            content: message.trim(),
            sender_type: 'brand',
            is_read: false
          }
        ])
        .select();

      if (insertError) throw insertError;

      setIsMessageSent(true);
      localStorage.setItem('messageSent', 'true');
      router.push('/generate-campaigns');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

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
      <div className="flex-1 flex items-center justify-center p-4 pt-20 relative">
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
                className="w-full px-4 py-2 bg-[#1F2023] border border-[#3E4044] rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#A8FF60] focus:border-transparent resize-y text-md tracking-wider"
                placeholder="ENTER YOUR MESSAGE HERE..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isMessageSent}
              />
            </div>

            {error && (
              <div className="w-full mb-4 p-3 bg-red-900/20 border border-red-700 text-red-400 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={() => router.push('/generate-campaigns')}
                className="flex-1 px-4 py-2 bg-transparent border cursor-pointer border-[#3E4044] text-gray-400 rounded-md hover:text-[#A8FF60] hover:border-[#A8FF60] transition-colors font-['Press_Start_2P'] text-xs tracking-wider"
                disabled={isMessageSent}
              >
                CANCEL
              </button>
              <button
                onClick={handleSendMessage}
                className="flex-1 px-4 py-2 bg-[#A8FF60] text-black cursor-pointer rounded-md hover:bg-[#97E651] transition-colors font-['Press_Start_2P'] text-xs tracking-wider"
                disabled={isMessageSent}
              >
                {isMessageSent ? 'SENT!' : 'SEND'}
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
    </div>
  );
} 