import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const supabase = await createServerSupabaseClient();
    
    // Get IP address from headers
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    // Check if this IP has any authentication history
    const { data: sessions } = await supabase
      .from('auth.sessions')
      .select('id')
      .eq('ip', ip)
      .limit(1);
    
    const hasVisited = sessions && sessions.length > 0;
    
    return NextResponse.json({ 
      hasVisited,
      redirectPath: hasVisited ? '/sign-in' : '/sign-up'
    });
  } catch (error) {
    console.error('Error checking visitor:', error);
    // Default to sign-up if we can't determine
    return NextResponse.json({ 
      hasVisited: false,
      redirectPath: '/sign-up'
    });
  }
}