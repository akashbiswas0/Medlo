import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
  }

  const supabase = getSupabaseClient();

  try {
    let ips: any[] = [];

    // Check if the user is a brand
    const { data: brand } = await supabase
      .from('brand')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (brand) {
      // User is a brand, fetch IPs by creator_wallet
      const { data: brandIps, error: brandIpsError } = await supabase
        .from('ip_asset')
        .select('*')
        .eq('creator_wallet', walletAddress);

      if (brandIpsError) throw brandIpsError;
      ips = brandIps || [];
    } else {
      // Check if the user is an influencer
      const { data: influencer } = await supabase
        .from('influencer')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (influencer) {
        // User is an influencer, fetch IPs by influencer_id
        const { data: influencerIps, error: influencerIpsError } = await supabase
          .from('ip_asset')
          .select('*')
          .eq('influencer_id', influencer.id);

        if (influencerIpsError) throw influencerIpsError;
        ips = influencerIps || [];
      }
    }

    return NextResponse.json(ips);

  } catch (error: any) {
    console.error('Error fetching royalty IPs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch royalty IPs', details: error.message },
      { status: 500 }
    );
  }
} 