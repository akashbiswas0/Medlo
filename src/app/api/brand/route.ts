import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brand_name, brand_niche, brand_x_username, brand_email } = body;

    if (!brand_name || !brand_niche || !brand_x_username || !brand_email) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Please provide brand_name, brand_niche, brand_x_username, and brand_email' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('brand')
      .insert([
        {
          brand_name,
          brand_niche,
          brand_x_username,
          brand_email
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
      { message: 'Brand created successfully', data },
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
    console.log('Fetching all brands...');
    const { data, error } = await supabase
      .from('brand')
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

    console.log('Successfully fetched brands:', data);
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