import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'walletAddress is required' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();

  try {
    // 1. Check if the user is a brand
    const { data: brandData, error: brandError } = await supabase
      .from('brand')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (brandError && brandError.code !== 'PGRST116') { // Ignore 'not found' errors
      throw brandError;
    }

    if (brandData) {
      return NextResponse.json({ userType: 'brand' });
    }

    // 2. Check if the user is an influencer
    const { data: influencerData, error: influencerError } = await supabase
      .from('influencer')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();
      
    if (influencerError && influencerError.code !== 'PGRST116') {
      throw influencerError;
    }

    if (influencerData) {
      // 3. If they are an influencer, check if they have a model
      const { data: modelData, error: modelError } = await supabase
        .from('model_details')
        .select('id')
        .eq('influencer_id', influencerData.id)
        .limit(1)
        .single();
        
      if (modelError && modelError.code !== 'PGRST116') {
        throw modelError;
      }

      if (modelData) {
        return NextResponse.json({ userType: 'influencer', hasModel: true });
      } else {
        return NextResponse.json({ userType: 'influencer', hasModel: false });
      }
    }

    // 4. If not in either table, they are a new user
    return NextResponse.json({ userType: 'new' });

  } catch (error: any) {
    console.error('Error checking user status:', error);
    return NextResponse.json(
      { error: 'Failed to check user status', details: error.message },
      { status: 500 }
    );
  }
} 