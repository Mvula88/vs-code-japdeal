# Database Setup Instructions

## Important: Run this in your Supabase SQL Editor

The auction pages are showing an error because the database tables don't exist in production. Follow these steps to fix it:

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar

### Step 2: Run the Migration
1. Copy the entire contents of the file `supabase/migrations/002_auction_system.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute the migration

### Step 3: Verify the Tables
After running the migration, verify the tables were created:

```sql
-- Run this query to check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cars', 'lots', 'lot_images', 'bids', 'car_makes')
ORDER BY table_name;
```

You should see all 5 tables listed.

### Step 4: Add Sample Data (Optional)
If you want to add some sample data for testing:

```sql
-- Insert a sample car and lot
DO $$
DECLARE
    car_id UUID;
    lot_id UUID;
BEGIN
    -- Insert a sample car
    INSERT INTO public.cars (make, model, year, mileage, engine, transmission, fuel_type, body_type, vin, condition)
    VALUES ('Toyota', 'Camry', 2020, 25000, '2.5L', 'automatic', 'petrol', 'sedan', 'SAMPLE' || extract(epoch from now())::text, 'excellent')
    RETURNING id INTO car_id;
    
    -- Insert a live lot
    INSERT INTO public.lots (lot_number, car_id, starting_price, current_price, state, start_at, end_at)
    VALUES ('SAMPLE-' || to_char(now(), 'YYYYMMDD-HH24MI'), car_id, 50000, 50000, 'live', NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days')
    RETURNING id INTO lot_id;
    
    RAISE NOTICE 'Created sample lot with ID: %', lot_id;
END $$;
```

### Step 5: Test the Application
1. Go back to your application
2. Navigate to `/auctions/live`, `/auctions/upcoming`, or `/auctions/ended`
3. The pages should now load without errors

## Troubleshooting

### If you still see errors:

1. **Check RLS Policies**: Make sure Row Level Security is properly configured:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('cars', 'lots', 'lot_images', 'bids', 'car_makes');
```

2. **Check for any error messages in the Supabase logs**:
   - Go to "Logs" in the Supabase dashboard
   - Look for any authentication or permission errors

3. **Verify your environment variables**:
   - Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correctly set in Vercel

### Need Help?
If you continue to experience issues:
1. Check the browser console for specific error messages
2. Check the Vercel function logs for server-side errors
3. Ensure all environment variables are properly configured in Vercel