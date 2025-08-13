-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('buyer', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');
CREATE TYPE lot_state AS ENUM ('upcoming', 'live', 'ended');
CREATE TYPE invoice_status AS ENUM ('draft', 'issued', 'paid', 'void');
CREATE TYPE notification_type AS ENUM ('outbid', 'ending_soon', 'won', 'system');

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    role user_role NOT NULL DEFAULT 'buyer',
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Cars table
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vin TEXT,
    title TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
    mileage INTEGER NOT NULL CHECK (mileage >= 0),
    body_type TEXT,
    fuel_type TEXT,
    transmission TEXT,
    engine TEXT,
    color TEXT,
    origin_market TEXT,
    specs JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bid increment tiers table
CREATE TABLE bid_increment_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upper_bound NUMERIC(12,2) NOT NULL,
    increment NUMERIC(12,2) NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(position)
);

-- Lots table
CREATE TABLE lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_number TEXT NOT NULL UNIQUE,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    state lot_state NOT NULL DEFAULT 'upcoming',
    start_price NUMERIC(12,2),
    current_price NUMERIC(12,2),
    sold_price NUMERIC(12,2),
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    auto_extend_minutes INTEGER DEFAULT 5,
    bid_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_prices CHECK (
        (state = 'upcoming' AND start_price IS NULL AND current_price IS NULL) OR
        (state = 'live' AND start_price IS NOT NULL AND current_price IS NOT NULL) OR
        (state = 'ended')
    ),
    CONSTRAINT valid_dates CHECK (
        (state = 'upcoming') OR
        (state = 'live' AND start_at IS NOT NULL AND end_at IS NOT NULL AND end_at > start_at) OR
        (state = 'ended' AND end_at IS NOT NULL)
    )
);

-- Lot images table
CREATE TABLE lot_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bids table
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES profiles(id),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    fingerprint TEXT
);

-- Watchlists table
CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, lot_id)
);

-- Cost settings table (versioned)
CREATE TABLE cost_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    japan_transport NUMERIC(12,2) NOT NULL DEFAULT 0,
    auction_fees NUMERIC(12,2) NOT NULL DEFAULT 0,
    shipping_wvb NUMERIC(12,2) NOT NULL DEFAULT 0,
    transport_whk NUMERIC(12,2) NOT NULL DEFAULT 0,
    customs_clearance NUMERIC(12,2) NOT NULL DEFAULT 0,
    doc_translation NUMERIC(12,2) NOT NULL DEFAULT 0,
    custom_duty_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (custom_duty_pct >= 0 AND custom_duty_pct <= 100),
    vat_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (vat_pct >= 0 AND vat_pct <= 100),
    admin_fee_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (admin_fee_pct >= 0 AND admin_fee_pct <= 100),
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    lot_id UUID NOT NULL REFERENCES lots(id),
    amount_due NUMERIC(12,2) NOT NULL CHECK (amount_due >= 0),
    currency TEXT NOT NULL DEFAULT 'NAD',
    status invoice_status NOT NULL DEFAULT 'draft',
    issued_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    data JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_cars_make_model ON cars USING gin((make || ' ' || model) gin_trgm_ops);
CREATE INDEX idx_cars_year ON cars(year);
CREATE INDEX idx_cars_created_by ON cars(created_by);

CREATE INDEX idx_lots_state ON lots(state);
CREATE INDEX idx_lots_end_at ON lots(end_at) WHERE state = 'live';
CREATE INDEX idx_lots_car_id ON lots(car_id);
CREATE INDEX idx_lots_lot_number ON lots(lot_number);
CREATE INDEX idx_lots_state_end_at ON lots(state, end_at);

CREATE INDEX idx_bids_lot_id ON bids(lot_id);
CREATE INDEX idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX idx_bids_lot_created_desc ON bids(lot_id, created_at DESC);

CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX idx_watchlists_lot_id ON watchlists(lot_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read_at) WHERE read_at IS NULL;

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_lot_id ON invoices(lot_id);
CREATE INDEX idx_invoices_status ON invoices(status);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create function to generate lot numbers
CREATE OR REPLACE FUNCTION generate_lot_number()
RETURNS TEXT AS $$
DECLARE
    date_part TEXT;
    sequence_number INTEGER;
    new_lot_number TEXT;
BEGIN
    date_part := 'JPD-' || TO_CHAR(NOW(), 'YYYYMMDD');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(lot_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO sequence_number
    FROM lots
    WHERE lot_number LIKE date_part || '-%';
    
    new_lot_number := date_part || '-' || LPAD(sequence_number::TEXT, 4, '0');
    
    RETURN new_lot_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate lot numbers
CREATE OR REPLACE FUNCTION set_lot_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.lot_number IS NULL OR NEW.lot_number = '' THEN
        NEW.lot_number := generate_lot_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_lot_number
    BEFORE INSERT ON lots
    FOR EACH ROW
    EXECUTE FUNCTION set_lot_number();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_cars_updated_at
    BEFORE UPDATE ON cars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lots_updated_at
    BEFORE UPDATE ON lots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, display_name, role, status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'buyer'),
        'active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create function to validate bid amount
CREATE OR REPLACE FUNCTION validate_bid_amount()
RETURNS TRIGGER AS $$
DECLARE
    lot_record RECORD;
    min_increment NUMERIC(12,2);
    min_bid NUMERIC(12,2);
BEGIN
    -- Get lot details with lock
    SELECT * INTO lot_record
    FROM lots
    WHERE id = NEW.lot_id
    FOR UPDATE;
    
    -- Check if lot is live
    IF lot_record.state != 'live' THEN
        RAISE EXCEPTION 'Lot is not accepting bids (state: %)', lot_record.state;
    END IF;
    
    -- Check if auction has ended
    IF NOW() > lot_record.end_at THEN
        RAISE EXCEPTION 'Auction has ended';
    END IF;
    
    -- Get minimum increment based on current price
    SELECT increment INTO min_increment
    FROM bid_increment_tiers
    WHERE upper_bound >= lot_record.current_price
    ORDER BY upper_bound ASC
    LIMIT 1;
    
    -- If no tier found, use default
    IF min_increment IS NULL THEN
        min_increment := 25000; -- Default for high value items
    END IF;
    
    -- Calculate minimum bid
    min_bid := lot_record.current_price + min_increment;
    
    -- Validate bid amount
    IF NEW.amount < min_bid THEN
        RAISE EXCEPTION 'Bid must be at least N$ % (current: N$ %, increment: N$ %)', 
            min_bid, lot_record.current_price, min_increment;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate bids
CREATE TRIGGER validate_bid_before_insert
    BEFORE INSERT ON bids
    FOR EACH ROW
    EXECUTE FUNCTION validate_bid_amount();

-- Create function to update lot after bid
CREATE OR REPLACE FUNCTION update_lot_after_bid()
RETURNS TRIGGER AS $$
DECLARE
    lot_record RECORD;
    extend_window INTERVAL;
BEGIN
    -- Get lot details
    SELECT * INTO lot_record
    FROM lots
    WHERE id = NEW.lot_id;
    
    -- Update current price and bid count
    UPDATE lots
    SET current_price = NEW.amount,
        bid_count = bid_count + 1
    WHERE id = NEW.lot_id;
    
    -- Check for auto-extension
    IF lot_record.auto_extend_minutes > 0 THEN
        extend_window := (lot_record.auto_extend_minutes || ' minutes')::INTERVAL;
        
        IF NOW() > (lot_record.end_at - extend_window) THEN
            UPDATE lots
            SET end_at = end_at + extend_window
            WHERE id = NEW.lot_id;
            
            -- Log the extension
            INSERT INTO audit_logs (action, entity, entity_id, data)
            VALUES (
                'auto_extend',
                'lots',
                NEW.lot_id,
                jsonb_build_object(
                    'extended_by_minutes', lot_record.auto_extend_minutes,
                    'new_end_time', (lot_record.end_at + extend_window)::TEXT,
                    'triggered_by_bid', NEW.id
                )
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update lot after successful bid
CREATE TRIGGER update_lot_after_bid_insert
    AFTER INSERT ON bids
    FOR EACH ROW
    EXECUTE FUNCTION update_lot_after_bid();

-- Create function to notify outbid users
CREATE OR REPLACE FUNCTION notify_outbid_users()
RETURNS TRIGGER AS $$
DECLARE
    previous_bidder UUID;
BEGIN
    -- Find the previous highest bidder
    SELECT bidder_id INTO previous_bidder
    FROM bids
    WHERE lot_id = NEW.lot_id
        AND id != NEW.id
        AND bidder_id != NEW.bidder_id
    ORDER BY amount DESC, created_at DESC
    LIMIT 1;
    
    -- Create notification if there was a previous bidder
    IF previous_bidder IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
            previous_bidder,
            'outbid',
            'You have been outbid',
            'Someone has placed a higher bid on a lot you were bidding on',
            jsonb_build_object(
                'lot_id', NEW.lot_id,
                'new_bid_amount', NEW.amount,
                'bid_id', NEW.id
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to send outbid notifications
CREATE TRIGGER notify_outbid_after_bid
    AFTER INSERT ON bids
    FOR EACH ROW
    EXECUTE FUNCTION notify_outbid_users();

-- Insert default bid increment tiers
INSERT INTO bid_increment_tiers (upper_bound, increment, position) VALUES
    (50000, 5000, 1),
    (200000, 10000, 2),
    (500000, 25000, 3),
    (1000000, 50000, 4),
    (99999999, 100000, 5);

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;