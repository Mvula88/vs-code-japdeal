-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON lots;
DROP POLICY IF EXISTS "Enable insert for admin users" ON lots;
DROP POLICY IF EXISTS "Enable update for admin users" ON lots;
DROP POLICY IF EXISTS "Enable delete for admin users" ON lots;
DROP POLICY IF EXISTS "Public can view lots" ON lots;
DROP POLICY IF EXISTS "Admin full access to lots" ON lots;

DROP POLICY IF EXISTS "Enable read access for all users" ON cars;
DROP POLICY IF EXISTS "Enable insert for admin users" ON cars;
DROP POLICY IF EXISTS "Enable update for admin users" ON cars;
DROP POLICY IF EXISTS "Enable delete for admin users" ON cars;
DROP POLICY IF EXISTS "Public can view cars" ON cars;
DROP POLICY IF EXISTS "Admin full access to cars" ON cars;

DROP POLICY IF EXISTS "Enable read access for all users" ON lot_images;
DROP POLICY IF EXISTS "Enable insert for admin users" ON lot_images;
DROP POLICY IF EXISTS "Enable update for admin users" ON lot_images;
DROP POLICY IF EXISTS "Enable delete for admin users" ON lot_images;
DROP POLICY IF EXISTS "Public can view lot images" ON lot_images;
DROP POLICY IF EXISTS "Admin full access to lot_images" ON lot_images;

-- Enable RLS on tables if not already enabled
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE lot_images ENABLE ROW LEVEL SECURITY;

-- Create new policies for lots table
CREATE POLICY "Public can view all lots" ON lots
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can do everything with lots" ON lots
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create new policies for cars table
CREATE POLICY "Public can view all cars" ON cars
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can do everything with cars" ON cars
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create new policies for lot_images table
CREATE POLICY "Public can view all lot images" ON lot_images
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can do everything with lot images" ON lot_images
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Test query to verify policies
SELECT 
  'Testing public access to lots' as test,
  COUNT(*) as count
FROM lots;

SELECT 
  'Testing public access to cars' as test,
  COUNT(*) as count
FROM cars;

SELECT 
  'Testing public access to lot_images' as test,
  COUNT(*) as count
FROM lot_images;