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
    console.log('Creating lot with data:', body);
    
    const supabase = await createServerSupabaseClient();

    // First create the car
    const { data: carData, error: carError } = await supabase
      .from('cars')
      .insert({
        make: body.make,
        model: body.model,
        year: parseInt(body.year),
        mileage: body.mileage ? parseInt(body.mileage) : null,
        engine: body.engine,
        transmission: body.transmission,
        fuel_type: body.fuel_type,
        body_type: body.body_type,
        color: body.color,
        vin: body.vin,
        condition: body.condition || 'good',
        features: body.features || [],
      })
      .select()
      .single();

    if (carError) {
      console.error('Error creating car:', carError);
      return NextResponse.json(
        { error: `Failed to create car: ${carError.message}` },
        { status: 400 }
      );
    }

    // Then create the lot
    const lotInsertData = {
      lot_number: body.lot_number,
      car_id: carData.id,
      starting_price: body.starting_price ? parseFloat(body.starting_price) : null,
      current_price: body.current_price || body.starting_price ? parseFloat(body.current_price || body.starting_price) : null,
      bid_increment: body.bid_increment ? parseFloat(body.bid_increment) : 1000,
      reserve_price: body.reserve_price ? parseFloat(body.reserve_price) : null,
      start_at: body.start_at || null,
      end_at: body.end_at || null,
      state: body.state || 'upcoming',
      created_by: user.id,
      sold_price: body.sold_price ? parseFloat(body.sold_price) : null,
      description: body.description || null,
      bid_count: 0,
    };

    // Remove null values for fields that shouldn't be null
    if (!lotInsertData.starting_price && body.state !== 'ended') {
      lotInsertData.starting_price = 0;
    }
    if (!lotInsertData.current_price && body.state !== 'ended') {
      lotInsertData.current_price = lotInsertData.starting_price || 0;
    }

    console.log('Inserting lot data:', lotInsertData);

    const { data: lotData, error: lotError } = await supabase
      .from('lots')
      .insert(lotInsertData)
      .select()
      .single();

    if (lotError) {
      console.error('Error creating lot:', lotError);
      // If lot creation fails, delete the car we just created
      await supabase.from('cars').delete().eq('id', carData.id);
      return NextResponse.json(
        { error: `Failed to create lot: ${lotError.message}` },
        { status: 400 }
      );
    }

    console.log('Successfully created lot:', lotData);
    return NextResponse.json({ ...lotData, car: carData });
  } catch (error) {
    console.error('Error creating lot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create lot';
    return NextResponse.json(
      { error: errorMessage },
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