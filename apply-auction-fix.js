const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSQL() {
  try {
    // Read the SQL file
    const sqlFile = fs.readFileSync(path.join(__dirname, 'fix-auction-system.sql'), 'utf8');
    
    // Split by semicolons but be careful with functions
    const statements = sqlFile
      .split(/;\s*$(?=(?:[^']*'[^']*')*[^']*$)/m)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments
      if (statement.trim().startsWith('--')) continue;
      
      try {
        console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
        console.log(statement.substring(0, 100) + '...');
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          console.error(`Error in statement ${i + 1}:`, error.message);
          errorCount++;
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.error(`Error executing statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Successful statements: ${successCount}`);
    console.log(`Failed statements: ${errorCount}`);
    
    // Test query to verify data
    console.log('\n=== Testing data retrieval ===');
    const { data: lots, error: lotsError } = await supabase
      .from('lots')
      .select(`
        *,
        car:cars!car_id(*)
      `)
      .eq('state', 'live');
    
    if (lotsError) {
      console.error('Error fetching lots:', lotsError);
    } else {
      console.log(`Found ${lots?.length || 0} live lots`);
      if (lots && lots.length > 0) {
        console.log('Sample lot:', JSON.stringify(lots[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('Script error:', error);
    process.exit(1);
  }
}

// Create the exec_sql function if it doesn't exist
async function createExecSQLFunction() {
  const createFunction = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;
  
  try {
    const { error } = await supabase.rpc('query', { query: createFunction });
    if (error && !error.message.includes('already exists')) {
      console.error('Error creating exec_sql function:', error);
    }
  } catch (err) {
    // Function might already exist
  }
}

async function main() {
  console.log('Setting up auction system...');
  console.log('Supabase URL:', supabaseUrl);
  
  await createExecSQLFunction();
  await runSQL();
  
  console.log('\nSetup complete!');
}

main().catch(console.error);