const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ugctohwrmliejdbrkter.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnY3RvaHdybWxpZWpkYnJrdGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMDI1NzgsImV4cCI6MjA3MDY3ODU3OH0.1ELnifF0-8b7ol88rHBhCdHpnwOQyqjezK-HkJ71TVs';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnY3RvaHdybWxpZWpkYnJrdGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwMjU3OCwiZXhwIjoyMDcwNjc4NTc4fQ.JfGOzCnfpSE--BKAxr8jPlG46dCqeZFMHwz1wzK74XQ';

async function testDatabaseConnection() {
  console.log('Testing Supabase connection...\n');

  // Test with anon key
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Test auth signup
  console.log('Testing auth signup...');
  const testEmail = `test${Date.now()}@example.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: 'testPassword123!',
    options: {
      data: {
        display_name: 'Test User',
      },
    },
  });

  if (authError) {
    console.error('Auth signup error:', authError);
  } else {
    console.log('Auth signup successful:', authData.user?.id);
  }

  // Test with service role key to check profiles
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Check if profile was created
  if (authData?.user) {
    console.log('\nChecking if profile was created...');
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    } else {
      console.log('Profile found:', profile);
    }
  }

  // Check if trigger exists
  console.log('\nChecking database triggers...');
  const { data: triggers, error: triggerError } = await adminSupabase
    .rpc('get_triggers', { schema_name: 'auth', table_name: 'users' })
    .select('*');

  if (triggerError) {
    // Try alternative query
    const { data: altTriggers, error: altError } = await adminSupabase
      .from('pg_trigger')
      .select('*');
    
    if (altError) {
      console.log('Could not fetch triggers (expected - requires special permissions)');
    } else {
      console.log('Triggers found:', altTriggers?.length || 0);
    }
  } else {
    console.log('Triggers:', triggers);
  }

  // Clean up test user if created
  if (authData?.user) {
    console.log('\nCleaning up test data...');
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(
      authData.user.id
    );
    if (deleteError) {
      console.error('Cleanup error:', deleteError);
    } else {
      console.log('Test user cleaned up');
    }
  }
}

testDatabaseConnection().catch(console.error);