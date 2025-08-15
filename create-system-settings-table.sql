-- Create system_settings table for storing admin configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- General settings
    site_name TEXT DEFAULT 'JapDeal Auctions',
    site_description TEXT DEFAULT 'Premium Japanese vehicle auction platform',
    contact_email TEXT DEFAULT 'japdealnamibia@gmail.com',
    support_phone TEXT DEFAULT '+264 081 321 4813',
    currency TEXT DEFAULT 'N$',
    timezone TEXT DEFAULT 'Africa/Windhoek',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    
    -- Auction settings
    enable_buy_now BOOLEAN DEFAULT false,
    reserve_price BOOLEAN DEFAULT false,
    auto_extend BOOLEAN DEFAULT true,
    min_bid_increment INTEGER DEFAULT 100,
    max_bid_amount INTEGER DEFAULT 1000000,
    extension_time INTEGER DEFAULT 5,
    default_duration INTEGER DEFAULT 7,
    custom_duration INTEGER DEFAULT 14,
    buyer_fee DECIMAL(5,2) DEFAULT 5.0,
    seller_fee DECIMAL(5,2) DEFAULT 10.0,
    listing_fee INTEGER DEFAULT 50,
    
    -- Security settings
    two_factor_auth BOOLEAN DEFAULT false,
    session_timeout INTEGER DEFAULT 30,
    max_login_attempts INTEGER DEFAULT 5,
    require_strong_password BOOLEAN DEFAULT true,
    ip_whitelisting BOOLEAN DEFAULT false,
    audit_logging BOOLEAN DEFAULT true,
    
    -- Notification settings
    notification_settings JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create notifications table for storing sent notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'email', -- email, push, sms
    recipients TEXT[], -- Array of recipient emails/phones
    recipient_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, sent, failed
    sent_by UUID REFERENCES auth.users(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create database_backups table for tracking backups
CREATE TABLE IF NOT EXISTS public.database_backups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    size TEXT,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, failed
    file_path TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_backups ENABLE ROW LEVEL SECURITY;

-- Only admins can view and modify system settings
CREATE POLICY "Admins can view system settings" ON public.system_settings
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update system settings" ON public.system_settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can manage notifications
CREATE POLICY "Admins can manage notifications" ON public.notifications
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can manage backups
CREATE POLICY "Admins can manage backups" ON public.database_backups
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for system_settings
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings if none exist
INSERT INTO public.system_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);

-- Grant necessary permissions
GRANT ALL ON public.system_settings TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.database_backups TO authenticated;