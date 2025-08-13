import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServerSupabaseAdminClient } from '@/lib/supabase/server';
import { getUser, getProfile } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const profile = await getProfile();
    if (!profile || profile.status !== 'active') {
      return NextResponse.json(
        { error: 'Your account is not eligible to bid' },
        { status: 403 }
      );
    }

    const { lotId, amount } = await request.json();

    if (!lotId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid bid data' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseAdminClient();

    // Start transaction by getting lot with lock
    const { data: lot, error: lotError } = await supabase
      .from('lots')
      .select('*, bid_increment_tiers(*)')
      .eq('id', lotId)
      .single();

    if (lotError || !lot) {
      return NextResponse.json(
        { error: 'Lot not found' },
        { status: 404 }
      );
    }

    // Validate lot state
    if (lot.state !== 'live') {
      return NextResponse.json(
        { error: 'This auction is not accepting bids' },
        { status: 400 }
      );
    }

    // Check if auction has ended
    if (new Date(lot.end_at) <= new Date()) {
      return NextResponse.json(
        { error: 'This auction has ended' },
        { status: 400 }
      );
    }

    // Get minimum increment
    const { data: incrementTiers } = await supabase
      .from('bid_increment_tiers')
      .select('*')
      .order('upper_bound', { ascending: true });

    const currentPrice = lot.current_price || lot.start_price || 0;
    const tier = incrementTiers?.find(t => currentPrice < t.upper_bound);
    const minIncrement = tier?.increment || 25000;
    const minBid = currentPrice + minIncrement;

    if (amount < minBid) {
      return NextResponse.json(
        { error: `Minimum bid is N$ ${minBid.toLocaleString()}` },
        { status: 400 }
      );
    }

    // Get request metadata
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Place the bid
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert({
        lot_id: lotId,
        bidder_id: user.id,
        amount,
        ip_address: ip,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (bidError) {
      console.error('Bid error:', bidError);
      return NextResponse.json(
        { error: 'Failed to place bid. Please try again.' },
        { status: 500 }
      );
    }

    // The database triggers will handle:
    // - Updating lot current_price
    // - Incrementing bid_count
    // - Auto-extension if applicable
    // - Sending outbid notifications

    // Log the bid in audit trail
    await supabase
      .from('audit_logs')
      .insert({
        actor_id: user.id,
        action: 'bid_placed',
        entity: 'bids',
        entity_id: bid.id,
        data: {
          lot_id: lotId,
          amount,
          previous_price: currentPrice,
        },
        ip_address: ip,
        user_agent: userAgent,
      });

    return NextResponse.json({
      success: true,
      bid,
      message: 'Bid placed successfully',
    });

  } catch (error: any) {
    console.error('Bid API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lotId = searchParams.get('lotId');

    if (!lotId) {
      return NextResponse.json(
        { error: 'Lot ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data: bids, error } = await supabase
      .from('bids')
      .select(`
        *,
        bidder:profiles(display_name)
      `)
      .eq('lot_id', lotId)
      .order('amount', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching bids:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bids' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bids });

  } catch (error: any) {
    console.error('Bids API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}