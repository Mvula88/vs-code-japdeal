-- Comprehensive fix for auction system
-- This script creates all necessary tables and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to start fresh (be careful in production!)
DROP TABLE IF EXISTS public.lot_images CASCADE;
DROP TABLE IF EXISTS public.bids CASCADE;
DROP TABLE IF EXISTS public.lots CASCADE;
DROP TABLE IF EXISTS public.cars CASCADE;
DROP TABLE IF EXISTS public.car_makes CASCADE;

-- Create car_makes table for dropdown options
CREATE TABLE IF NOT EXISTS public.car_makes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default car makes
INSERT INTO public.car_makes (name) VALUES 
    ('Toyota'),
    ('Honda'),
    ('Nissan'),
    ('Mazda'),
    ('Mitsubishi'),
    ('Subaru'),
    ('Suzuki'),
    ('Audi'),
    ('BMW'),
    ('Mercedes-Benz'),
    ('Volkswagen'),
    ('Ford'),
    ('Chevrolet'),
    ('Hyundai'),
    ('Kia')
ON CONFLICT (name) DO NOTHING;

-- Create cars table
CREATE TABLE IF NOT EXISTS public.cars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
    mileage INTEGER CHECK (mileage >= 0),
    engine TEXT,
    transmission TEXT CHECK (transmission IN ('automatic', 'manual', 'cvt', NULL)),
    fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid', 'electric', NULL)),
    body_type TEXT CHECK (body_type IN ('sedan', 'suv', 'pickup', 'hatchback', 'coupe', 'van', 'wagon', NULL)),
    color TEXT,
    vin TEXT UNIQUE,
    condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lots table
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
    bid_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lot_images table
CREATE TABLE IF NOT EXISTS public.lot_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT,
    file_size INTEGER,
    is_thumbnail BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(15,2) NOT NULL,
    is_auto_bid BOOLEAN DEFAULT false,
    max_amount DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lots_state ON public.lots(state);
CREATE INDEX IF NOT EXISTS idx_lots_car_id ON public.lots(car_id);
CREATE INDEX IF NOT EXISTS idx_lots_created_at ON public.lots(created_at);
CREATE INDEX IF NOT EXISTS idx_cars_make ON public.cars(make);
CREATE INDEX IF NOT EXISTS idx_cars_model ON public.cars(model);
CREATE INDEX IF NOT EXISTS idx_cars_year ON public.cars(year);
CREATE INDEX IF NOT EXISTS idx_bids_lot_id ON public.bids(lot_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON public.bids(user_id);
CREATE INDEX IF NOT EXISTS idx_lot_images_lot_id ON public.lot_images(lot_id);

-- Enable Row Level Security
ALTER TABLE public.car_makes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view car makes" ON public.car_makes;
DROP POLICY IF EXISTS "Admin can manage car makes" ON public.car_makes;
DROP POLICY IF EXISTS "Public can view cars" ON public.cars;
DROP POLICY IF EXISTS "Admin can manage cars" ON public.cars;
DROP POLICY IF EXISTS "Public can view lots" ON public.lots;
DROP POLICY IF EXISTS "Admin can manage lots" ON public.lots;
DROP POLICY IF EXISTS "Public can view lot images" ON public.lot_images;
DROP POLICY IF EXISTS "Admin can manage lot images" ON public.lot_images;
DROP POLICY IF EXISTS "Users can view bids" ON public.bids;
DROP POLICY IF EXISTS "Users can create bids" ON public.bids;
DROP POLICY IF EXISTS "Admin can manage bids" ON public.bids;

-- RLS Policies for car_makes
CREATE POLICY "Public can view car makes" ON public.car_makes
    FOR SELECT
    USING (true);

CREATE POLICY "Admin can manage car makes" ON public.car_makes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for cars
CREATE POLICY "Public can view cars" ON public.cars
    FOR SELECT
    USING (true);

CREATE POLICY "Admin can manage cars" ON public.cars
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for lots
CREATE POLICY "Public can view lots" ON public.lots
    FOR SELECT
    USING (true);

CREATE POLICY "Admin can manage lots" ON public.lots
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for lot_images
CREATE POLICY "Public can view lot images" ON public.lot_images
    FOR SELECT
    USING (true);

CREATE POLICY "Admin can manage lot images" ON public.lot_images
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for bids
CREATE POLICY "Users can view bids" ON public.bids
    FOR SELECT
    USING (true);

CREATE POLICY "Users can create bids" ON public.bids
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage bids" ON public.bids
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Function to update lot state based on dates
CREATE OR REPLACE FUNCTION update_lot_states()
RETURNS void AS $$
BEGIN
    -- Update lots to live state
    UPDATE public.lots
    SET state = 'live'
    WHERE state = 'upcoming'
    AND start_at <= NOW()
    AND end_at > NOW();
    
    -- Update lots to ended state
    UPDATE public.lots
    SET state = 'ended'
    WHERE state IN ('live', 'upcoming')
    AND end_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_car_makes_updated_at BEFORE UPDATE ON public.car_makes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON public.cars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lots_updated_at BEFORE UPDATE ON public.lots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lot_images_updated_at BEFORE UPDATE ON public.lot_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
DO $$
DECLARE
    car_id UUID;
    lot_id UUID;
BEGIN
    -- Insert a sample car
    INSERT INTO public.cars (make, model, year, mileage, engine, transmission, fuel_type, body_type, vin)
    VALUES ('Toyota', 'Camry', 2020, 25000, '2.5L', 'automatic', 'petrol', 'sedan', 'TEST123456789')
    ON CONFLICT (vin) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO car_id;
    
    -- Insert a live lot
    INSERT INTO public.lots (lot_number, car_id, starting_price, current_price, state, start_at, end_at)
    VALUES ('TEST001', car_id, 50000, 50000, 'live', NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days')
    ON CONFLICT (lot_number) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO lot_id;
    
    -- Insert another sample car
    INSERT INTO public.cars (make, model, year, mileage, engine, transmission, fuel_type, body_type, vin)
    VALUES ('Honda', 'CR-V', 2021, 15000, '1.5L Turbo', 'automatic', 'petrol', 'suv', 'TEST987654321')
    ON CONFLICT (vin) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO car_id;
    
    -- Insert an upcoming lot
    INSERT INTO public.lots (lot_number, car_id, starting_price, current_price, state, start_at, end_at)
    VALUES ('TEST002', car_id, 65000, 65000, 'upcoming', NOW() + INTERVAL '1 day', NOW() + INTERVAL '4 days')
    ON CONFLICT (lot_number) DO UPDATE SET updated_at = NOW();
    
    -- Insert a third sample car
    INSERT INTO public.cars (make, model, year, mileage, engine, transmission, fuel_type, body_type, vin)
    VALUES ('Nissan', 'Altima', 2019, 35000, '2.0L', 'cvt', 'petrol', 'sedan', 'TEST456789123')
    ON CONFLICT (vin) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO car_id;
    
    -- Insert an ended lot
    INSERT INTO public.lots (lot_number, car_id, starting_price, current_price, sold_price, state, start_at, end_at)
    VALUES ('TEST003', car_id, 45000, 48000, 48000, 'ended', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days')
    ON CONFLICT (lot_number) DO UPDATE SET updated_at = NOW();
END $$;

-- Verify the data
SELECT 
    l.lot_number,
    l.state,
    c.make,
    c.model,
    c.year,
    l.starting_price,
    l.current_price
FROM public.lots l
JOIN public.cars c ON l.car_id = c.id
ORDER BY l.created_at DESC;