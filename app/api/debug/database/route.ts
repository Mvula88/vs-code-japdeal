import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    interface DiagnosticsResult {
      timestamp: string;
      environment: string | undefined;
      supabaseUrl: string | undefined;
      tables: Record<string, unknown>;
      errors: Array<Record<string, unknown>>;
      connection?: string;
      rls?: unknown;
    }
    
    const diagnostics: DiagnosticsResult = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      tables: {},
      errors: []
    };

    // Test basic connectivity
    const { error: connError } = await supabase
      .from('lots')
      .select('count', { count: 'exact', head: true });
    
    if (connError) {
      diagnostics.errors.push({
        test: 'connection',
        error: connError.message,
        details: connError
      });
    } else {
      diagnostics.connection = 'OK';
    }

    // Check lots table with different states
    const states = ['live', 'upcoming', 'ended'];
    for (const state of states) {
      const { data, error, count } = await supabase
        .from('lots')
        .select('*, car:cars(*), images:lot_images(*)', { count: 'exact' })
        .eq('state', state);
      
      if (error) {
        diagnostics.errors.push({
          test: `lots_${state}`,
          error: error.message,
          hint: error.hint,
          details: error.details,
          code: error.code
        });
      } else {
        diagnostics.tables[`lots_${state}`] = {
          count: count || 0,
          sample: data?.[0] || null
        };
      }
    }

    // Check cars table
    const { data: carsData, error: carsError, count: carsCount } = await supabase
      .from('cars')
      .select('*', { count: 'exact' });
    
    if (carsError) {
      diagnostics.errors.push({
        test: 'cars',
        error: carsError.message,
        details: carsError
      });
    } else {
      diagnostics.tables.cars = {
        count: carsCount || 0,
        sample: carsData?.[0] || null
      };
    }

    // Check RLS policies
    const { data: rlsCheck, error: rlsError } = await supabase
      .rpc('check_rls_enabled', { table_name: 'lots' })
      .single();
    
    if (!rlsError && rlsCheck) {
      diagnostics.rls = rlsCheck;
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}