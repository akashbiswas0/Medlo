'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_type: 'brand' | 'influencer';
  is_read: boolean;
}

export default function BrandDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [brandId, setBrandId] = useState<string | null>(null);
  const influencerId = '123e4567-e89b-12d3-a456-426614174001'; // Example influencer UUID

  useEffect(() => {
    // Fetch brand ID
    const fetchBrandId = async () => {
      try {
        // First check if we have a brand email in localStorage from brand setup
        const brandEmail = localStorage.getItem('brandEmail');
        
        if (!brandEmail) {
          setError('Please complete brand setup first');
          return;
        }

        const { data, error } = await supabase
          .from('brand')
          .select('id')
          .eq('brand_email', brandEmail)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          setError('Brand not found. Please complete brand setup first.');
          return;
        }

        setBrandId(data.id);
      } catch (err) {
        console.error('Error fetching brand ID:', err);
        setError('Failed to load brand information');
      }
    };

    fetchBrandId();
  }, []);

  useEffect(() => {
    if (!brandId) return;

    // Fetch initial messages
    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messaging',
          filter: `brand_id=eq.${brandId}`,
        },
        (payload) => {
          setMessages((current) => [payload.new as Message, ...current]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [brandId]);

  const fetchMessages = async () => {
    if (!brandId) return;

    try {
      const { data, error } = await supabase
        .from('messaging')
        .select('*')
        .or(`brand_id.eq.${brandId},influencer_id.eq.${influencerId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    try {
      setError('');
      
      if (!newMessage.trim()) {
        setError('Message cannot be empty');
        return;
      }

      if (!brandId) {
        setError('Brand information not loaded');
        return;
      }

      const { error: insertError } = await supabase
        .from('messaging')
        .insert([
          {
            brand_id: brandId,
            influencer_id: influencerId,
            content: newMessage.trim(),
            sender_type: 'brand',
            is_read: false
          }
        ]);

      if (insertError) throw insertError;

      setNewMessage('');
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
      <div className="flex-1 flex flex-col p-4 pt-20">
        <div className="max-w-2xl mx-auto w-full">
          <h1 className="text-2xl font-bold text-gray-100 mb-6 font-['Press_Start_2P'] text-sm tracking-wider">
            MESSAGES
          </h1>

          {/* Messages List */}
          <div className="space-y-4 mb-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.sender_type === 'brand'
                    ? 'bg-[#A8FF60] text-black mr-4'
                    : 'bg-[#2E3034] ml-4'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-2 opacity-70">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1F2023] border-t border-[#3E4044]">
            <div className="max-w-2xl mx-auto">
              {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-700 text-red-400 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-[#2E3034] border border-[#3E4044] rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#A8FF60] focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-[#A8FF60] text-black rounded-md hover:bg-[#97E651] transition-colors font-['Press_Start_2P'] text-xs tracking-wider"
                >
                  SEND
                </button>
              </div>
            </div>
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
