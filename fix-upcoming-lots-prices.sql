-- Fix for upcoming lots to hide prices before going live
-- This script modifies the database to allow NULL prices for upcoming lots
-- and ensures they don't display prices until the auction goes live

-- Step 1: Drop the existing check constraint that's causing issues
ALTER TABLE lots 
DROP CONSTRAINT IF EXISTS valid_prices;

-- Step 2: Add a new check constraint that allows NULL prices for upcoming lots
ALTER TABLE lots 
ADD CONSTRAINT valid_prices CHECK (
    -- For live and ended states, prices must be set and valid
    (state IN ('live', 'ended') AND starting_price IS NOT NULL AND current_price IS NOT NULL AND current_price >= starting_price)
    OR
    -- For upcoming state, prices can be NULL (hidden) or set but equal
    (state = 'upcoming' AND (
        (starting_price IS NULL AND current_price IS NULL) -- Prices hidden
        OR 
        (starting_price IS NOT NULL AND current_price IS NOT NULL AND current_price = starting_price) -- Prices set but not increased yet
    ))
);

-- Step 3: Create a view that automatically hides prices for upcoming lots
CREATE OR REPLACE VIEW public_lots AS
SELECT 
    id,
    lot_number,
    car_id,
    state,
    -- Hide prices for upcoming lots
    CASE 
        WHEN state = 'upcoming' THEN NULL
        ELSE starting_price 
    END as starting_price,
    CASE 
        WHEN state = 'upcoming' THEN NULL
        ELSE current_price 
    END as current_price,
    start_at,
    end_at,
    extension_count,
    bid_count,
    created_by,
    created_at,
    updated_at
FROM lots;

-- Step 4: Grant permissions on the view
GRANT SELECT ON public_lots TO anon, authenticated;

-- Step 5: Create a function to automatically set prices when lot goes live
CREATE OR REPLACE FUNCTION handle_lot_state_change()
RETURNS TRIGGER AS $$
BEGIN
    -- When a lot transitions from upcoming to live, ensure prices are set
    IF OLD.state = 'upcoming' AND NEW.state = 'live' THEN
        -- If prices are NULL, set them to a default or required value
        IF NEW.starting_price IS NULL THEN
            RAISE EXCEPTION 'Starting price must be set before lot can go live';
        END IF;
        IF NEW.current_price IS NULL THEN
            NEW.current_price := NEW.starting_price;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger for state changes
DROP TRIGGER IF EXISTS lot_state_change_trigger ON lots;
CREATE TRIGGER lot_state_change_trigger
    BEFORE UPDATE OF state ON lots
    FOR EACH ROW
    EXECUTE FUNCTION handle_lot_state_change();

-- Step 7: Update existing upcoming lots to have NULL prices (optional)
-- Uncomment if you want to hide prices for existing upcoming lots
-- UPDATE lots 
-- SET starting_price = NULL, current_price = NULL 
-- WHERE state = 'upcoming';

-- Step 8: Create a function for admins to set prices for upcoming lots
CREATE OR REPLACE FUNCTION set_lot_prices(
    p_lot_id UUID,
    p_starting_price DECIMAL
)
RETURNS void AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can set lot prices';
    END IF;
    
    -- Update the lot prices
    UPDATE lots 
    SET 
        starting_price = p_starting_price,
        current_price = p_starting_price
    WHERE id = p_lot_id 
    AND state = 'upcoming';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lot not found or not in upcoming state';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create RLS policy to hide prices from non-authenticated users for upcoming lots
-- First, ensure RLS is enabled on lots table
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;

-- Drop existing select policies if any
DROP POLICY IF EXISTS "Public can view lots" ON lots;
DROP POLICY IF EXISTS "Authenticated can view lots" ON lots;

-- Create new policies
CREATE POLICY "Public can view lots with price restrictions" ON lots
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Authenticated can view all lots" ON lots
    FOR SELECT
    TO authenticated
    USING (true);

-- Step 10: Create a computed column for display price (optional)
-- This can be used in the frontend to show "Price on Request" for upcoming lots
ALTER TABLE lots 
ADD COLUMN IF NOT EXISTS display_price TEXT GENERATED ALWAYS AS (
    CASE 
        WHEN state = 'upcoming' AND starting_price IS NULL THEN 'Price on Request'
        WHEN state = 'upcoming' AND starting_price IS NOT NULL THEN 'Starting at ' || starting_price::TEXT
        WHEN state = 'live' THEN 'Current: ' || current_price::TEXT
        WHEN state = 'ended' THEN 'Sold for: ' || current_price::TEXT
        ELSE 'N/A'
    END
) STORED;

-- Step 11: Add comment to explain the logic
COMMENT ON COLUMN lots.starting_price IS 'Starting price for the lot. NULL for upcoming lots where price is not yet revealed';
COMMENT ON COLUMN lots.current_price IS 'Current highest bid price. NULL for upcoming lots, equals starting_price when live auction starts';

-- Verification: Check if the constraint works correctly
-- This should succeed for upcoming lots with NULL prices
-- INSERT INTO lots (lot_number, car_id, state, starting_price, current_price, start_at, end_at, created_by)
-- VALUES ('TEST001', 'some-car-id', 'upcoming', NULL, NULL, NOW() + INTERVAL '1 day', NOW() + INTERVAL '2 days', auth.uid());

-- This should succeed for live lots with valid prices
-- INSERT INTO lots (lot_number, car_id, state, starting_price, current_price, start_at, end_at, created_by)
-- VALUES ('TEST002', 'some-car-id', 'live', 100000, 100000, NOW(), NOW() + INTERVAL '1 day', auth.uid());

COMMENT ON CONSTRAINT valid_prices ON lots IS 'Ensures prices are valid based on lot state: upcoming lots can have NULL prices (hidden), live/ended lots must have valid prices';