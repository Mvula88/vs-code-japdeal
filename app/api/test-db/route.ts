import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Create a direct Supabase client without auth
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Simple test query
    const { data, error } = await supabase
      .from('lots')
      .select('id, lot_number, state')
      .limit(5);
    
    if (error) {
      return NextResponse.json({ 
        success: false,
        error: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      count: data?.length || 0,
      data: data || []
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false,
      error: err.message 
    }, { status: 500 });
  }
}