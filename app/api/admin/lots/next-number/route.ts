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

    // Get all lot numbers to find the highest number
    const { data: lots, error: lotsError } = await supabase
      .from('lots')
      .select('lot_number')
      .like('lot_number', 'LOT%')
      .order('created_at', { ascending: false });

    let nextNumber = 'LOT0001';
    
    if (lots && lots.length > 0) {
      // Find the highest lot number
      let maxNumber = 0;
      
      for (const lot of lots) {
        if (lot.lot_number) {
          const match = lot.lot_number.match(/LOT(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNumber) {
              maxNumber = num;
            }
          }
        }
      }
      
      // Generate next number
      nextNumber = `LOT${String(maxNumber + 1).padStart(4, '0')}`;
    }
    
    // Add a timestamp component to ensure uniqueness in case of race conditions
    const timestamp = Date.now().toString().slice(-3);
    const uniqueNumber = `${nextNumber}-${timestamp}`;

    return NextResponse.json({ 
      nextLotNumber: nextNumber,
      uniqueLotNumber: uniqueNumber 
    });
  } catch (error) {
    console.error('Error getting next lot number:', error);
    // Return a default if there's an error
    return NextResponse.json({ nextLotNumber: `LOT${Date.now().toString().slice(-4)}` });
  }
}