-- Create cars table
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
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lot_images table for storing car images
CREATE TABLE IF NOT EXISTS public.lot_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
    bidder_id UUID REFERENCES auth.users(id),
    amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- RLS policies for cars
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

-- RLS policies for lots
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

-- RLS policies for lot_images
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

-- RLS policies for bids
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

-- Create indexes for performance
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