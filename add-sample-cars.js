const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleCars = [
  // Live auctions
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2021,
    mileage: 15000,
    engine: '2.5L',
    transmission: 'automatic',
    fuel_type: 'petrol',
    body_type: 'sedan',
    vin: 'LIVE001' + Date.now(),
    condition: 'excellent',
    lot: {
      lot_number: 'LOT-LIVE-001',
      starting_price: 75000,
      current_price: 78000,
      state: 'live',
      start_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Started yesterday
      end_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 2 days
    }
  },
  {
    make: 'Honda',
    model: 'CR-V',
    year: 2020,
    mileage: 28000,
    engine: '1.5L Turbo',
    transmission: 'automatic',
    fuel_type: 'petrol',
    body_type: 'suv',
    vin: 'LIVE002' + Date.now(),
    condition: 'good',
    lot: {
      lot_number: 'LOT-LIVE-002',
      starting_price: 65000,
      current_price: 68500,
      state: 'live',
      start_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // Started 12 hours ago
      end_at: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(), // Ends in 1.5 days
    }
  },
  {
    make: 'Mazda',
    model: 'CX-5',
    year: 2022,
    mileage: 8000,
    engine: '2.5L',
    transmission: 'automatic',
    fuel_type: 'petrol',
    body_type: 'suv',
    vin: 'LIVE003' + Date.now(),
    condition: 'excellent',
    lot: {
      lot_number: 'LOT-LIVE-003',
      starting_price: 95000,
      current_price: 96000,
      state: 'live',
      start_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // Started 6 hours ago
      end_at: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // Ends in 18 hours
    }
  },
  
  // Upcoming auctions
  {
    make: 'Nissan',
    model: 'X-Trail',
    year: 2021,
    mileage: 22000,
    engine: '2.5L',
    transmission: 'cvt',
    fuel_type: 'petrol',
    body_type: 'suv',
    vin: 'UPCOMING001' + Date.now(),
    condition: 'good',
    lot: {
      lot_number: 'LOT-UPCOMING-001',
      starting_price: 70000,
      current_price: 70000,
      state: 'upcoming',
      start_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Starts tomorrow
      end_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 4 days
    }
  },
  {
    make: 'Subaru',
    model: 'Outback',
    year: 2020,
    mileage: 35000,
    engine: '2.5L',
    transmission: 'cvt',
    fuel_type: 'petrol',
    body_type: 'wagon',
    vin: 'UPCOMING002' + Date.now(),
    condition: 'good',
    lot: {
      lot_number: 'LOT-UPCOMING-002',
      starting_price: 62000,
      current_price: 62000,
      state: 'upcoming',
      start_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Starts in 2 days
      end_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 5 days
    }
  },
  {
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2019,
    mileage: 42000,
    engine: '2.0L Turbo',
    transmission: 'automatic',
    fuel_type: 'petrol',
    body_type: 'sedan',
    vin: 'UPCOMING003' + Date.now(),
    condition: 'excellent',
    lot: {
      lot_number: 'LOT-UPCOMING-003',
      starting_price: 120000,
      current_price: 120000,
      state: 'upcoming',
      start_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Starts in 3 days
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 7 days
    }
  },
  
  // Ended auctions
  {
    make: 'BMW',
    model: '3 Series',
    year: 2018,
    mileage: 55000,
    engine: '2.0L Turbo',
    transmission: 'automatic',
    fuel_type: 'petrol',
    body_type: 'sedan',
    vin: 'ENDED001' + Date.now(),
    condition: 'good',
    lot: {
      lot_number: 'LOT-ENDED-001',
      starting_price: 85000,
      current_price: 92000,
      sold_price: 92000,
      state: 'ended',
      start_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Started 7 days ago
      end_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Ended 2 days ago
    }
  },
  {
    make: 'Volkswagen',
    model: 'Tiguan',
    year: 2019,
    mileage: 48000,
    engine: '2.0L TSI',
    transmission: 'automatic',
    fuel_type: 'petrol',
    body_type: 'suv',
    vin: 'ENDED002' + Date.now(),
    condition: 'good',
    lot: {
      lot_number: 'LOT-ENDED-002',
      starting_price: 72000,
      current_price: 76500,
      sold_price: 76500,
      state: 'ended',
      start_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Started 10 days ago
      end_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Ended 3 days ago
    }
  },
  {
    make: 'Hyundai',
    model: 'Tucson',
    year: 2020,
    mileage: 31000,
    engine: '2.0L',
    transmission: 'automatic',
    fuel_type: 'petrol',
    body_type: 'suv',
    vin: 'ENDED003' + Date.now(),
    condition: 'excellent',
    lot: {
      lot_number: 'LOT-ENDED-003',
      starting_price: 58000,
      current_price: 61000,
      sold_price: 61000,
      state: 'ended',
      start_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // Started 14 days ago
      end_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Ended 7 days ago
    }
  }
];

async function addSampleData() {
  console.log('Adding sample cars and lots...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const carData of sampleCars) {
    const { lot, ...car } = carData;
    
    try {
      // Create car
      const { data: newCar, error: carError } = await supabase
        .from('cars')
        .insert(car)
        .select()
        .single();
      
      if (carError) {
        console.error(`Error creating car ${car.make} ${car.model}:`, carError.message);
        errorCount++;
        continue;
      }
      
      // Create lot
      const { data: newLot, error: lotError } = await supabase
        .from('lots')
        .insert({
          ...lot,
          car_id: newCar.id,
          bid_increment: 1000,
        })
        .select()
        .single();
      
      if (lotError) {
        console.error(`Error creating lot ${lot.lot_number}:`, lotError.message);
        errorCount++;
        // Clean up the car if lot creation failed
        await supabase.from('cars').delete().eq('id', newCar.id);
      } else {
        console.log(`✓ Added ${lot.state} lot: ${lot.lot_number} - ${car.year} ${car.make} ${car.model}`);
        successCount++;
      }
    } catch (error) {
      console.error(`Error processing ${car.make} ${car.model}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Successfully added: ${successCount} cars/lots`);
  console.log(`Errors: ${errorCount}`);
  
  // Verify the data
  console.log('\n=== Verifying data ===');
  
  const { data: liveLots } = await supabase
    .from('lots')
    .select('lot_number')
    .eq('state', 'live');
  console.log(`Live auctions: ${liveLots?.length || 0}`);
  
  const { data: upcomingLots } = await supabase
    .from('lots')
    .select('lot_number')
    .eq('state', 'upcoming');
  console.log(`Upcoming auctions: ${upcomingLots?.length || 0}`);
  
  const { data: endedLots } = await supabase
    .from('lots')
    .select('lot_number')
    .eq('state', 'ended');
  console.log(`Ended auctions: ${endedLots?.length || 0}`);
}

addSampleData().catch(console.error);