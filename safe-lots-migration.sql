-- Safe migration script that checks existing structure

-- Check if bids table exists and has correct structure
DO $$
BEGIN
    -- Check if bids table has lot_id column
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bids' 
        AND column_name = 'lot_id'
    ) THEN
        RAISE NOTICE 'bids table already has lot_id column';
    ELSE
        -- Check if bids table exists at all
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'bids'
        ) THEN
            -- Table exists but might have different structure
            -- You may need to rename columns or migrate data
            RAISE NOTICE 'bids table exists but may have different structure';
            
            -- Check for auction_id column (common alternative name)
            IF EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'bids' 
                AND column_name = 'auction_id'
            ) THEN
                -- Rename auction_id to lot_id
                ALTER TABLE public.bids RENAME COLUMN auction_id TO lot_id;
                RAISE NOTICE 'Renamed auction_id to lot_id in bids table';
            END IF;
        END IF;
    END IF;
END $$;

-- Create cars table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    mileage INTEGER,
    engine TEXT,
    transmission TEXT,
    fuel_type TEXT,
    body_type TEXT,
    color TEXT,
    vin TEXT UNIQUE,
    condition TEXT DEFAULT 'good',
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lots table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.lots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lot_number TEXT UNIQUE NOT NULL,
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
    starting_price DECIMAL(15,2),
    current_price DECIMAL(15,2),
    sold_price DECIMAL(15,2),
    bid_increment DECIMAL(15,2) DEFAULT 1000,
    reserve_price DECIMAL(15,2),
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    state TEXT DEFAULT 'upcoming' CHECK (state IN ('upcoming', 'live', 'ended')),
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lot_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.lot_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Only create bids table if it doesn't exist at all
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bids'
    ) THEN
        CREATE TABLE public.bids (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
            bidder_id UUID REFERENCES auth.users(id),
            amount DECIMAL(15,2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created bids table';
    ELSE
        -- Add lot_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'bids' 
            AND column_name = 'lot_id'
        ) THEN
            ALTER TABLE public.bids ADD COLUMN lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added lot_id column to existing bids table';
        END IF;
    END IF;
END $$;

-- Enable RLS (safe to run multiple times)
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies (safe approach)
-- Cars policies
DROP POLICY IF EXISTS "Anyone can view cars" ON public.cars;
DROP POLICY IF EXISTS "Admins can manage cars" ON public.cars;

CREATE POLICY "Anyone can view cars" ON public.cars
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage cars" ON public.cars
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Lots policies
DROP POLICY IF EXISTS "Anyone can view lots" ON public.lots;
DROP POLICY IF EXISTS "Admins can manage lots" ON public.lots;

CREATE POLICY "Anyone can view lots" ON public.lots
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage lots" ON public.lots
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Lot images policies
DROP POLICY IF EXISTS "Anyone can view lot images" ON public.lot_images;
DROP POLICY IF EXISTS "Admins can manage lot images" ON public.lot_images;

CREATE POLICY "Anyone can view lot images" ON public.lot_images
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage lot images" ON public.lot_images
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Bids policies
DROP POLICY IF EXISTS "Users can view all bids" ON public.bids;
DROP POLICY IF EXISTS "Users can create their own bids" ON public.bids;
DROP POLICY IF EXISTS "Admins can manage all bids" ON public.bids;

CREATE POLICY "Users can view all bids" ON public.bids
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create their own bids" ON public.bids
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = bidder_id);

CREATE POLICY "Admins can manage all bids" ON public.bids
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create indexes (IF NOT EXISTS makes them safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_lots_lot_number ON public.lots(lot_number);
CREATE INDEX IF NOT EXISTS idx_lots_state ON public.lots(state);
CREATE INDEX IF NOT EXISTS idx_lots_car_id ON public.lots(car_id);
CREATE INDEX IF NOT EXISTS idx_bids_lot_id ON public.bids(lot_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_lot_images_lot_id ON public.lot_images(lot_id);

-- Grant permissions
GRANT ALL ON public.cars TO authenticated;
GRANT ALL ON public.lots TO authenticated;
GRANT ALL ON public.lot_images TO authenticated;
GRANT ALL ON public.bids TO authenticated;

GRANT SELECT ON public.cars TO anon;
GRANT SELECT ON public.lots TO anon;
GRANT SELECT ON public.lot_images TO anon;