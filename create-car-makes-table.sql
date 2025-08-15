-- Create car_makes table for managing vehicle manufacturers
CREATE TABLE IF NOT EXISTS public.car_makes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.car_makes ENABLE ROW LEVEL SECURITY;

-- Everyone can view car makes
CREATE POLICY "Anyone can view car makes" ON public.car_makes
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Only admins can manage car makes
CREATE POLICY "Admins can manage car makes" ON public.car_makes
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Insert default car makes
INSERT INTO public.car_makes (name) VALUES 
    ('Toyota'),
    ('Nissan'),
    ('Honda'),
    ('Mazda'),
    ('Mitsubishi'),
    ('Subaru'),
    ('Suzuki'),
    ('Isuzu'),
    ('Mercedes-Benz'),
    ('BMW'),
    ('Audi'),
    ('Volkswagen'),
    ('Ford'),
    ('Chevrolet'),
    ('Hyundai'),
    ('Kia'),
    ('Lexus'),
    ('Infiniti'),
    ('Porsche'),
    ('Land Rover'),
    ('Jeep'),
    ('Dodge'),
    ('RAM'),
    ('GMC'),
    ('Cadillac'),
    ('Tesla'),
    ('Volvo'),
    ('Jaguar'),
    ('Mini'),
    ('Fiat'),
    ('Peugeot'),
    ('Renault'),
    ('Citroen'),
    ('Alfa Romeo'),
    ('Maserati'),
    ('Ferrari'),
    ('Lamborghini'),
    ('Bentley'),
    ('Rolls-Royce'),
    ('Aston Martin')
ON CONFLICT (name) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON public.car_makes TO authenticated;
GRANT SELECT ON public.car_makes TO anon;