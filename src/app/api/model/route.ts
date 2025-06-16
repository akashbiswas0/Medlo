import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trigger, model_id } = body;

    if (!trigger || !model_id) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Please provide trigger and model_id' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('model_details')
      .insert([{ trigger, model_id }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
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
    console.log('Fetching all model details...');
    const supabase = getSupabaseClient();
    
    // Log the query we're about to make
    console.log('Executing query: SELECT * FROM model_details');
    
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

    // Log the raw data we received
    console.log('Raw data from Supabase:', JSON.stringify(data, null, 2));
    
    // Validate the data structure
    if (Array.isArray(data)) {
      console.log(`Found ${data.length} model details`);
      data.forEach((model, index) => {
        console.log(`Model ${index + 1}:`, {
          id: model.id,
          trigger: model.trigger,
          model_id: model.model_id
        });
      });
    } else {
      console.error('Expected array of model details but got:', typeof data);
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