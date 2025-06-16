import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Note: The 'id' parameter from the URL is URL-encoded.
    // e.g., 'priyanshur66/2:...' becomes 'priyanshur66%2F2%3A...'
    // We need to decode it to match the value in the database.
    const model_id = decodeURIComponent(params.id);
    
    if (!model_id) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('model_details')
      .select('*')
      .eq('model_id', model_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // "The result contains 0 rows"
        return NextResponse.json(
          { error: 'Not Found', details: `No model found with ID: ${model_id}` },
          { status: 404 }
        );
      }
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Not Found', details: `No model found with ID: ${model_id}` },
        { status: 404 }
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