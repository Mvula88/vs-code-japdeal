const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  console.log('Checking database connection and tables...\n');
  
  try {
    // Check if tables exist
    const tables = ['cars', 'lots', 'lot_images', 'bids', 'users'];
    
    for (const table of tables) {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Table '${table}': Error - ${error.message}`);
      } else {
        console.log(`✅ Table '${table}': Exists (${count || 0} rows)`);
      }
    }
    
    // Check lots with different states
    console.log('\nChecking lot states:');
    const states = ['live', 'upcoming', 'ended'];
    
    for (const state of states) {
      const { count, error } = await supabase
        .from('lots')
        .select('*', { count: 'exact', head: true })
        .eq('state', state);
      
      if (error) {
        console.log(`  ${state}: Error - ${error.message}`);
      } else {
        console.log(`  ${state}: ${count || 0} lots`);
      }
    }
    
    // Get sample data
    console.log('\nSample lot data:');
    const { data: sampleLot, error: sampleError } = await supabase
      .from('lots')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleError) {
      console.log('  No lots found or error:', sampleError.message);
    } else {
      console.log('  Sample lot:', JSON.stringify(sampleLot, null, 2));
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabase();