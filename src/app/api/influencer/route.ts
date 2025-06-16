import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, x_username, insta_username, follower_count, influencer_address } = body;

    // Validate required fields
    if (!username || !x_username || !insta_username || !follower_count) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Please provide username, x_username, insta_username, and follower_count' },
        { status: 400 }
      );
    }

    // Insert data into Supabase
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('influencer')
      .insert([
        {
          username,
          x_username,
          insta_username,
          follower_count,
          influencer_address
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
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
    console.log('Fetching all influencers...');
    const supabase = getSupabaseClient();
    
    // Log the query we're about to make
    console.log('Executing query: SELECT * FROM influencer');
    
    const { data, error } = await supabase
      .from('influencer')
      .select('*');

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

    // Log the raw data we received
    console.log('Raw data from Supabase:', JSON.stringify(data, null, 2));
    
    // Validate the data structure
    if (Array.isArray(data)) {
      console.log(`Found ${data.length} influencers`);
      data.forEach((influencer, index) => {
        console.log(`Influencer ${index + 1}:`, {
          id: influencer.id,
          username: influencer.username,
          x_username: influencer.x_username,
          insta_username: influencer.insta_username,
          follower_count: influencer.follower_count,
          influencer_address: influencer.influencer_address
        });
      });
    } else {
      console.error('Expected array of influencers but got:', typeof data);
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

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 