import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the latest lot number
    const { data: latestLot } = await supabase
      .from('lots')
      .select('lot_number')
      .order('lot_number', { ascending: false })
      .limit(1)
      .single();

    let nextNumber = 'LOT0001';
    
    if (latestLot && latestLot.lot_number) {
      // Extract number from lot number (e.g., LOT0023 -> 23)
      const match = latestLot.lot_number.match(/LOT(\d+)/);
      if (match) {
        const currentNumber = parseInt(match[1], 10);
        nextNumber = `LOT${String(currentNumber + 1).padStart(4, '0')}`;
      }
    }

    return NextResponse.json({ nextLotNumber: nextNumber });
  } catch (error) {
    console.error('Error getting next lot number:', error);
    // Return a default if there's an error
    return NextResponse.json({ nextLotNumber: `LOT${Date.now().toString().slice(-4)}` });
  }
}