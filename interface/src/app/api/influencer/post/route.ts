import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseKey ? 'present' : 'missing'
  });
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!request.body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Received request body:', body);
    
    const { username, x_username, insta_username, follower_count } = body;

    // Validate required fields
    if (!username || !x_username || !insta_username || !follower_count) {
      console.log('Missing fields:', {
        username: !!username,
        x_username: !!x_username,
        insta_username: !!insta_username,
        follower_count: !!follower_count
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert data into Supabase
    const { data, error } = await supabase
      .from('influencer')
      .insert([
        { 
          username, 
          x_username, 
          insta_username, 
          follower_count: parseInt(follower_count) 
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 400 }
      );
    }

    console.log('Successfully inserted data:', data);
    return NextResponse.json(
      { message: 'Influencer added successfully', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/influencer/post:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 