const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQueries() {
  console.log('Testing auction queries...\n');
  
  // Test 1: Simple lots query
  console.log('1. Testing simple lots query:');
  const { data: lots1, error: error1 } = await supabase
    .from('lots')
    .select('*');
  
  if (error1) {
    console.error('Error:', error1);
  } else {
    console.log(`Found ${lots1?.length || 0} lots`);
  }
  
  // Test 2: Lots with cars (old syntax)
  console.log('\n2. Testing lots with cars (old syntax):');
  const { data: lots2, error: error2 } = await supabase
    .from('lots')
    .select(`
      *,
      cars(*)
    `);
  
  if (error2) {
    console.error('Error:', error2);
  } else {
    console.log(`Found ${lots2?.length || 0} lots with cars`);
    if (lots2?.length > 0) {
      console.log('Sample:', JSON.stringify(lots2[0], null, 2).substring(0, 500));
    }
  }
  
  // Test 3: Lots with cars (foreign key syntax)
  console.log('\n3. Testing lots with cars (foreign key syntax):');
  const { data: lots3, error: error3 } = await supabase
    .from('lots')
    .select(`
      *,
      car:cars!car_id(*)
    `);
  
  if (error3) {
    console.error('Error:', error3);
  } else {
    console.log(`Found ${lots3?.length || 0} lots with cars`);
    if (lots3?.length > 0) {
      console.log('Sample:', JSON.stringify(lots3[0], null, 2).substring(0, 500));
    }
  }
  
  // Test 4: Live lots only
  console.log('\n4. Testing live lots:');
  const { data: lots4, error: error4 } = await supabase
    .from('lots')
    .select(`
      *,
      car:cars!car_id(*),
      lot_images(*)
    `)
    .eq('state', 'live');
  
  if (error4) {
    console.error('Error:', error4);
  } else {
    console.log(`Found ${lots4?.length || 0} live lots`);
    if (lots4?.length > 0) {
      console.log('Sample lot:', JSON.stringify(lots4[0], null, 2));
    }
  }
  
  // Test 5: Check cars table
  console.log('\n5. Testing cars table:');
  const { data: cars, error: carsError } = await supabase
    .from('cars')
    .select('*');
  
  if (carsError) {
    console.error('Error:', carsError);
  } else {
    console.log(`Found ${cars?.length || 0} cars`);
    if (cars?.length > 0) {
      console.log('Sample car:', JSON.stringify(cars[0], null, 2));
    }
  }
}

testQueries().catch(console.error);