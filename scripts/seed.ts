import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample car data
const sampleCars = [
  {
    make: 'Toyota',
    model: 'Land Cruiser',
    year: 2020,
    mileage: 45000,
    engine: '4.5L V8 Diesel',
    transmission: 'Automatic',
    fuel_type: 'Diesel',
    body_type: 'SUV',
    color: 'Pearl White',
    vin: 'JTMCY7AJ0L4123456',
    condition: 'Excellent',
    features: ['Leather Seats', 'Sunroof', 'Navigation', '4WD', 'Cruise Control'],
  },
  {
    make: 'Nissan',
    model: 'Patrol',
    year: 2019,
    mileage: 52000,
    engine: '5.6L V8',
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    body_type: 'SUV',
    color: 'Black',
    vin: 'JN1AR5EF9KM123456',
    condition: 'Very Good',
    features: ['Leather Seats', 'Rear Camera', 'Bluetooth', '4WD', 'Climate Control'],
  },
  {
    make: 'Toyota',
    model: 'Hilux',
    year: 2021,
    mileage: 28000,
    engine: '2.8L Diesel',
    transmission: 'Automatic',
    fuel_type: 'Diesel',
    body_type: 'Pickup',
    color: 'Silver',
    vin: 'MR0FA3CD0L0123456',
    condition: 'Excellent',
    features: ['Tonneau Cover', 'Tow Bar', '4WD', 'Bluetooth', 'USB Ports'],
  },
  {
    make: 'Mazda',
    model: 'CX-5',
    year: 2022,
    mileage: 15000,
    engine: '2.5L Skyactiv-G',
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    body_type: 'SUV',
    color: 'Soul Red Crystal',
    vin: 'JM3KFBCM7N0123456',
    condition: 'Like New',
    features: ['Leather Seats', 'Sunroof', 'Heads-Up Display', 'Adaptive Cruise Control', 'Apple CarPlay'],
  },
  {
    make: 'Honda',
    model: 'CR-V',
    year: 2020,
    mileage: 38000,
    engine: '1.5L Turbo',
    transmission: 'CVT',
    fuel_type: 'Petrol',
    body_type: 'SUV',
    color: 'Modern Steel Metallic',
    vin: '2HKRW2H50LH123456',
    condition: 'Excellent',
    features: ['Honda Sensing', 'Wireless Charging', 'Panoramic Roof', 'Power Tailgate', 'Lane Keep Assist'],
  },
  {
    make: 'Toyota',
    model: 'Fortuner',
    year: 2021,
    mileage: 31000,
    engine: '2.8L Diesel',
    transmission: 'Automatic',
    fuel_type: 'Diesel',
    body_type: 'SUV',
    color: 'Attitude Black',
    vin: 'MHFBT3CD8M0123456',
    condition: 'Very Good',
    features: ['7 Seats', 'Leather Seats', '4WD', 'Hill Descent Control', 'Multi-Terrain Select'],
  },
  {
    make: 'Mitsubishi',
    model: 'Pajero Sport',
    year: 2020,
    mileage: 42000,
    engine: '2.4L Diesel',
    transmission: 'Automatic',
    fuel_type: 'Diesel',
    body_type: 'SUV',
    color: 'White Diamond',
    vin: 'MMCJNKB40LH123456',
    condition: 'Very Good',
    features: ['Super Select 4WD', 'Leather Seats', 'Rockford Fosgate Audio', 'Forward Collision Mitigation', '7 Seats'],
  },
  {
    make: 'Nissan',
    model: 'X-Trail',
    year: 2022,
    mileage: 12000,
    engine: '2.5L',
    transmission: 'CVT',
    fuel_type: 'Petrol',
    body_type: 'SUV',
    color: 'Gun Metallic',
    vin: 'JN1TBNT32NW123456',
    condition: 'Like New',
    features: ['ProPILOT', 'Intelligent Mobility', 'Panoramic Sunroof', 'Wireless Apple CarPlay', '360-degree Camera'],
  },
  {
    make: 'Isuzu',
    model: 'D-Max',
    year: 2021,
    mileage: 35000,
    engine: '3.0L Diesel',
    transmission: 'Automatic',
    fuel_type: 'Diesel',
    body_type: 'Pickup',
    color: 'Splash White',
    vin: 'MPATFS86JMT123456',
    condition: 'Excellent',
    features: ['Diff Lock', 'Hill Descent Control', 'Terrain Command', 'Tow Bar', 'Bed Liner'],
  },
  {
    make: 'Toyota',
    model: 'Corolla Cross',
    year: 2022,
    mileage: 18000,
    engine: '1.8L Hybrid',
    transmission: 'CVT',
    fuel_type: 'Hybrid',
    body_type: 'SUV',
    color: 'Celestite Gray',
    vin: 'JTMB1RFV0ND123456',
    condition: 'Excellent',
    features: ['Toyota Safety Sense', 'Hybrid System', 'LED Headlights', 'Smart Entry', 'Wireless Charging'],
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    await supabase.from('bids').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('watchlists').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lot_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cars').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Get any existing user for seeding, or use your actual user ID
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    let adminUserId = profiles?.[0]?.id;

    if (!adminUserId) {
      console.log('❌ No users found in the database. Please create a user account first.');
      console.log('   Run the app and sign up, then try seeding again.');
      process.exit(1);
    }

    console.log('Using user ID for seeding:', adminUserId);

    console.log('Creating sample cars and lots...');
    
    for (let i = 0; i < sampleCars.length; i++) {
      const car = sampleCars[i];
      
      // Insert car (remove condition and features fields, add title and created_by fields)
      const { condition, features, ...carWithoutExtraFields } = car;
      const carWithRequiredFields = {
        ...carWithoutExtraFields,
        title: `${car.year} ${car.make} ${car.model}`,
        created_by: adminUserId,
      };
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .insert(carWithRequiredFields)
        .select()
        .single();

      if (carError) {
        console.error(`Error inserting car ${i + 1}:`, carError);
        continue;
      }

      // Determine lot state and dates
      let state: 'upcoming' | 'live' | 'ended';
      let start_at: Date;
      let end_at: Date;
      
      const now = new Date();
      
      if (i < 3) {
        // First 3 lots are live
        state = 'live';
        start_at = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Started yesterday
        end_at = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000); // End in 1-3 days
      } else if (i < 6) {
        // Next 3 are upcoming
        state = 'upcoming';
        start_at = new Date(now.getTime() + (i - 2) * 24 * 60 * 60 * 1000); // Start in 1-3 days
        end_at = new Date(now.getTime() + (i + 2) * 24 * 60 * 60 * 1000); // End in 4-7 days
      } else {
        // Rest are ended
        state = 'ended';
        start_at = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000); // Started days ago
        end_at = new Date(now.getTime() - (i - 5) * 24 * 60 * 60 * 1000); // Ended days ago
      }

      // Insert lot - upcoming lots should have NULL prices to be hidden
      const startingPrice = 150000 + Math.floor(Math.random() * 200000);
      const lotInsertData = {
        lot_number: `LOT${String(i + 1).padStart(4, '0')}`,
        car_id: carData.id,
        start_at: start_at.toISOString(),
        end_at: end_at.toISOString(),
        state,
        bid_count: state === 'live' ? Math.floor(Math.random() * 20) : state === 'ended' ? Math.floor(Math.random() * 30) : 0,
        created_by: adminUserId,
      } as any;

      // Only add prices for live and ended lots
      if (state !== 'upcoming') {
        lotInsertData.starting_price = startingPrice;
        lotInsertData.current_price = state === 'live' ? startingPrice + Math.floor(Math.random() * 50000) : startingPrice + Math.floor(Math.random() * 100000);
      }
      // For upcoming lots, we can either leave prices NULL (hidden) or set them equal
      // Let's set them for some upcoming lots to show both scenarios
      else if (i % 2 === 0) {
        // Every other upcoming lot will have prices set (but equal)
        lotInsertData.starting_price = startingPrice;
        lotInsertData.current_price = startingPrice; // Must be equal for upcoming
      }
      // Otherwise leave NULL (prices hidden)

      const { data: insertedLot, error: lotError } = await supabase
        .from('lots')
        .insert(lotInsertData)
        .select()
        .single();

      if (lotError) {
        console.error(`Error inserting lot ${i + 1}:`, lotError);
        continue;
      }
      
      const lotData = insertedLot;

      // Add sample images for each lot
      const imageUrls = [
        `https://images.unsplash.com/photo-${1550000000000 + i * 1000000000}-placeholder?w=800&h=600&fit=crop`,
        `https://images.unsplash.com/photo-${1560000000000 + i * 1000000000}-placeholder?w=800&h=600&fit=crop`,
        `https://images.unsplash.com/photo-${1570000000000 + i * 1000000000}-placeholder?w=800&h=600&fit=crop`,
      ];

      for (let j = 0; j < imageUrls.length; j++) {
        await supabase
          .from('lot_images')
          .insert({
            lot_id: lotData.id,
            image_url: imageUrls[j],
            display_order: j,
            is_primary: j === 0,
          });
      }

      console.log(`✅ Created lot ${lotData.lot_number} - ${car.year} ${car.make} ${car.model} (${state})`);
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase().then(() => {
  console.log('🎉 Seed completed!');
  process.exit(0);
});