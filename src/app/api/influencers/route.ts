import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, x_username, insta_username, follower_count, wallet_address } = body;

    // Validate required fields
    if (!username || !wallet_address) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Please provide username and wallet_address' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('influencer')
      .insert([
        {
          username,
          x_username,
          insta_username,
          follower_count: follower_count || 0,
          wallet_address
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      // Handle potential unique constraint violation
      if (error.code === '23505') { // unique_violation
        return NextResponse.json(
          { error: 'Database error', details: 'An influencer with this wallet address already exists.' },
          { status: 409 } // Conflict
        );
      }
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Influencer created successfully', data },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    let query = supabase.from('influencer').select('*');

    if (walletAddress) {
      query = query.eq('wallet_address', walletAddress);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
} 