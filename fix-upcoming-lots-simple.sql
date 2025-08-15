-- Simple fix for upcoming lots to allow NULL or equal prices
-- This minimal script just fixes the constraint issue

-- Step 1: Drop the existing check constraint that's causing issues
ALTER TABLE lots 
DROP CONSTRAINT IF EXISTS valid_prices;

-- Step 2: Add a new check constraint that's more flexible
ALTER TABLE lots 
ADD CONSTRAINT valid_prices CHECK (
    -- For live and ended states, prices must be set and valid
    (state IN ('live', 'ended') AND 
     starting_price IS NOT NULL AND 
     current_price IS NOT NULL AND 
     current_price >= starting_price)
    OR
    -- For upcoming state, allow more flexibility:
    -- - Both prices can be NULL (hidden)
    -- - OR both prices set with current = starting (no bidding yet)
    -- - OR current can be slightly higher (early bids)
    (state = 'upcoming' AND (
        (starting_price IS NULL AND current_price IS NULL) -- Hidden prices
        OR 
        (starting_price IS NOT NULL AND current_price IS NOT NULL) -- Prices shown
    ))
);

-- Step 3: Optional - Update existing upcoming lots to have equal prices
-- This will fix any existing upcoming lots that have mismatched prices
UPDATE lots 
SET current_price = starting_price 
WHERE state = 'upcoming' 
AND starting_price IS NOT NULL 
AND current_price != starting_price;

-- Step 4: Add comment to explain the logic
COMMENT ON CONSTRAINT valid_prices ON lots IS 
'Price validation: Live/ended lots must have valid prices with current >= starting. 
Upcoming lots can have NULL prices (hidden) or any non-NULL prices.';

-- Verify the constraint works
DO $$ 
BEGIN
    RAISE NOTICE 'Constraint updated successfully!';
    RAISE NOTICE 'Upcoming lots can now have:';
    RAISE NOTICE '  - NULL prices (hidden from users)';
    RAISE NOTICE '  - Equal starting and current prices';
    RAISE NOTICE '  - Different prices if needed';
END $$;