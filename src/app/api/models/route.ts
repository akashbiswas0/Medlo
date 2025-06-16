import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trigger, model_id, influencer_id } = body;

    if (!trigger || !model_id) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Please provide trigger and model_id' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('model_details')
      .insert([{ trigger, model_id, influencer_id }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
       if (error.code === '23505') { // unique_violation on model_id
        return NextResponse.json(
          { error: 'Database error', details: 'A model with this model_id already exists.' },
          { status: 409 } // Conflict
        );
      }
       if (error.code === '23503') { // foreign_key_violation on influencer_id
        return NextResponse.json(
          { error: 'Database error', details: 'The specified influencer_id does not exist.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Model details saved successfully', data },
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
    
    const { data, error } = await supabase
      .from('model_details')
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
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
} 