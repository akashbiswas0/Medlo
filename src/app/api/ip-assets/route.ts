import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received payload on server:", body);
    const { 
        ip_id, 
        license_terms_id, 
        image_url, 
        prompt, 
        model_id, 
        influencer_id, 
        creator_wallet 
    } = body;

    if (!ip_id || !license_terms_id || !creator_wallet) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Please provide ip_id, license_terms_id and creator_wallet' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ip_asset')
      .insert([{ 
        ip_id, 
        license_terms_id, 
        image_url, 
        prompt, 
        model_id, 
        influencer_id, 
        creator_wallet 
    }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      // Handle potential unique constraint violation
      if (error.code === '23505') { // unique_violation
        return NextResponse.json(
          { error: 'Database error', details: 'An IP Asset with this ip_id already exists.' },
          { status: 409 } // Conflict
        );
      }
       // Handle foreign key violations
      if (error.code === '23503') {
        let detail = 'A foreign key constraint was violated.';
        if (error.message.includes('model_details')) {
            detail = 'The specified model_id does not exist.';
        } else if (error.message.includes('influencer')) {
            detail = 'The specified influencer_id does not exist.';
        }
         return NextResponse.json(
          { error: 'Database error', details: detail },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'IP Asset created successfully', data },
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
    const creatorWallet = searchParams.get('creator_wallet');

    let query = supabase.from('ip_asset').select('*');

    if (creatorWallet) {
      query = query.eq('creator_wallet', creatorWallet);
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