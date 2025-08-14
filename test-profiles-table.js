const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ugctohwrmliejdbrkter.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnY3RvaHdybWxpZWpkYnJrdGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwMjU3OCwiZXhwIjoyMDcwNjc4NTc4fQ.JfGOzCnfpSE--BKAxr8jPlG46dCqeZFMHwz1wzK74XQ';

async function checkDatabase() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('Checking database setup...\n');

  // Check if profiles table exists
  console.log('1. Checking if profiles table exists...');
  const { data: tables, error: tablesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (tablesError) {
    console.error('Profiles table error:', tablesError.message);
    if (tablesError.message.includes('does not exist')) {
      console.log('\n❌ PROFILES TABLE DOES NOT EXIST!');
      console.log('The database migrations have not been run.');
      console.log('\nTo fix this, you need to:');
      console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ugctohwrmliejdbrkter');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the migration file: supabase/migrations/001_initial_schema.sql');
      return;
    }
  } else {
    console.log('✅ Profiles table exists');
    console.log('Sample data:', tables);
  }

  // Check if we can query auth schema (may fail due to permissions)
  console.log('\n2. Checking auth schema access...');
  try {
    const { data: authTest, error: authError } = await supabase.rpc('raw_sql', {
      query: "SELECT count(*) FROM information_schema.triggers WHERE event_object_schema = 'auth' AND event_object_table = 'users'"
    });
    
    if (authError) {
      console.log('Cannot directly query auth schema (expected - limited permissions)');
    } else {
      console.log('Auth triggers found:', authTest);
    }
  } catch (e) {
    console.log('Cannot check auth triggers directly');
  }

  // Try to check if the trigger function exists
  console.log('\n3. Checking if handle_new_user function exists...');
  const { data: functions, error: funcError } = await supabase.rpc('raw_sql', {
    query: "SELECT proname FROM pg_proc WHERE proname = 'handle_new_user'"
  }).single();

  if (funcError) {
    // Try alternative approach
    try {
      // Test if we can call the function
      const testId = 'test-' + Date.now();
      const { data: testProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          email: `test${Date.now()}@example.com`,
          display_name: 'Test User',
          role: 'buyer',
          status: 'active'
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.message.includes('violates foreign key')) {
          console.log('✅ Profiles table has proper foreign key to auth.users');
        } else {
          console.error('Profile insert error:', insertError.message);
        }
      } else {
        console.log('Test profile created:', testProfile);
        // Clean up
        await supabase.from('profiles').delete().eq('id', testProfile.id);
      }
    } catch (e) {
      console.log('Function check failed');
    }
  } else {
    console.log('handle_new_user function:', functions ? '✅ EXISTS' : '❌ NOT FOUND');
  }

  console.log('\n4. Checking existing profiles...');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(5);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
  } else {
    console.log(`Found ${profiles?.length || 0} profiles`);
    if (profiles && profiles.length > 0) {
      console.log('Sample profiles:', profiles);
    }
  }
}

checkDatabase().catch(console.error);