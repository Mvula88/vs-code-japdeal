import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUser, getProfile } from '@/lib/utils/auth';

// GET - Fetch all lots
export async function GET() {
  try {
    const user = await getUser();
    const profile = await getProfile();
    
    if (!user || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('lots')
      .select(`
        *,
        cars(*),
        lot_images(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching lots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lots' },
      { status: 500 }
    );
  }
}

// POST - Create a new lot
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    const profile = await getProfile();
    
    if (!user || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    // First create the car
    const { data: carData, error: carError } = await supabase
      .from('cars')
      .insert({
        make: body.make,
        model: body.model,
        year: body.year,
        mileage: body.mileage,
        engine: body.engine,
        transmission: body.transmission,
        fuel_type: body.fuel_type,
        body_type: body.body_type,
        color: body.color,
        vin: body.vin,
        condition: body.condition,
        features: body.features || [],
      })
      .select()
      .single();

    if (carError) throw carError;

    // Then create the lot
    const { data: lotData, error: lotError } = await supabase
      .from('lots')
      .insert({
        lot_number: body.lot_number,
        car_id: carData.id,
        starting_price: body.starting_price,
        current_price: body.starting_price,
        bid_increment: body.bid_increment,
        reserve_price: body.reserve_price,
        start_at: body.start_at,
        end_at: body.end_at,
        state: body.state || 'upcoming',
        created_by: user.id,
      })
      .select()
      .single();

    if (lotError) throw lotError;

    return NextResponse.json({ ...lotData, car: carData });
  } catch (error) {
    console.error('Error creating lot:', error);
    return NextResponse.json(
      { error: 'Failed to create lot' },
      { status: 500 }
    );
  }
}

// PUT - Update a lot
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    const profile = await getProfile();
    
    if (!user || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, car_id, ...lotData } = body;
    
    const supabase = await createServerSupabaseClient();

    // Update car data if provided
    if (body.car) {
      const { error: carError } = await supabase
        .from('cars')
        .update({
          make: body.car.make,
          model: body.car.model,
          year: body.car.year,
          mileage: body.car.mileage,
          engine: body.car.engine,
          transmission: body.car.transmission,
          fuel_type: body.car.fuel_type,
          body_type: body.car.body_type,
          color: body.car.color,
          condition: body.car.condition,
          features: body.car.features,
        })
        .eq('id', car_id);

      if (carError) throw carError;
    }

    // Update lot data
    const { data, error } = await supabase
      .from('lots')
      .update({
        lot_number: lotData.lot_number,
        starting_price: lotData.starting_price,
        current_price: lotData.current_price,
        bid_increment: lotData.bid_increment,
        reserve_price: lotData.reserve_price,
        start_at: lotData.start_at,
        end_at: lotData.end_at,
        state: lotData.state,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating lot:', error);
    return NextResponse.json(
      { error: 'Failed to update lot' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a lot
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    const profile = await getProfile();
    
    if (!user || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Lot ID required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    
    // First get the lot to find the car_id
    const { data: lot } = await supabase
      .from('lots')
      .select('car_id')
      .eq('id', id)
      .single();

    // Delete the lot
    const { error: lotError } = await supabase
      .from('lots')
      .delete()
      .eq('id', id);

    if (lotError) throw lotError;

    // Delete the associated car
    if (lot?.car_id) {
      await supabase
        .from('cars')
        .delete()
        .eq('id', lot.car_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lot:', error);
    return NextResponse.json(
      { error: 'Failed to delete lot' },
      { status: 500 }
    );
  }
}