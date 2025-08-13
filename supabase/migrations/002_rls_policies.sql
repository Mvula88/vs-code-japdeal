-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE lot_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_increment_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is active
CREATE OR REPLACE FUNCTION is_user_active()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid() OR is_admin());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (is_admin());

-- CARS POLICIES
-- Everyone can view cars
CREATE POLICY "Everyone can view cars"
    ON cars FOR SELECT
    USING (true);

-- Only admins can insert cars
CREATE POLICY "Admins can insert cars"
    ON cars FOR INSERT
    WITH CHECK (is_admin());

-- Only admins can update cars
CREATE POLICY "Admins can update cars"
    ON cars FOR UPDATE
    USING (is_admin());

-- Only admins can delete cars
CREATE POLICY "Admins can delete cars"
    ON cars FOR DELETE
    USING (is_admin());

-- LOTS POLICIES
-- Everyone can view lots
CREATE POLICY "Everyone can view lots"
    ON lots FOR SELECT
    USING (true);

-- Only admins can insert lots
CREATE POLICY "Admins can insert lots"
    ON lots FOR INSERT
    WITH CHECK (is_admin());

-- Only admins can update lots
CREATE POLICY "Admins can update lots"
    ON lots FOR UPDATE
    USING (is_admin());

-- Only admins can delete lots
CREATE POLICY "Admins can delete lots"
    ON lots FOR DELETE
    USING (is_admin());

-- LOT_IMAGES POLICIES
-- Everyone can view lot images
CREATE POLICY "Everyone can view lot images"
    ON lot_images FOR SELECT
    USING (true);

-- Only admins can manage lot images
CREATE POLICY "Admins can insert lot images"
    ON lot_images FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update lot images"
    ON lot_images FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can delete lot images"
    ON lot_images FOR DELETE
    USING (is_admin());

-- BIDS POLICIES
-- Users can view their own bids
CREATE POLICY "Users can view own bids"
    ON bids FOR SELECT
    USING (bidder_id = auth.uid());

-- Admins can view all bids
CREATE POLICY "Admins can view all bids"
    ON bids FOR SELECT
    USING (is_admin());

-- Public can view bids for specific lots (for bid history)
CREATE POLICY "Public can view lot bids"
    ON bids FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM lots
            WHERE lots.id = bids.lot_id
        )
    );

-- Active users can place bids
CREATE POLICY "Active users can place bids"
    ON bids FOR INSERT
    WITH CHECK (
        bidder_id = auth.uid() 
        AND is_user_active()
        AND EXISTS (
            SELECT 1 FROM lots
            WHERE lots.id = lot_id
            AND lots.state = 'live'
            AND NOW() < lots.end_at
        )
    );

-- WATCHLISTS POLICIES
-- Users can view their own watchlist
CREATE POLICY "Users can view own watchlist"
    ON watchlists FOR SELECT
    USING (user_id = auth.uid());

-- Active users can add to watchlist
CREATE POLICY "Active users can add to watchlist"
    ON watchlists FOR INSERT
    WITH CHECK (user_id = auth.uid() AND is_user_active());

-- Users can remove from their watchlist
CREATE POLICY "Users can delete from own watchlist"
    ON watchlists FOR DELETE
    USING (user_id = auth.uid());

-- Admins can view all watchlists
CREATE POLICY "Admins can view all watchlists"
    ON watchlists FOR SELECT
    USING (is_admin());

-- COST_SETTINGS POLICIES
-- Everyone can view active cost settings
CREATE POLICY "Everyone can view active cost settings"
    ON cost_settings FOR SELECT
    USING (is_active = true);

-- Admins can view all cost settings
CREATE POLICY "Admins can view all cost settings"
    ON cost_settings FOR SELECT
    USING (is_admin());

-- Only admins can manage cost settings
CREATE POLICY "Admins can insert cost settings"
    ON cost_settings FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update cost settings"
    ON cost_settings FOR UPDATE
    USING (is_admin());

-- INVOICES POLICIES
-- Users can view their own invoices
CREATE POLICY "Users can view own invoices"
    ON invoices FOR SELECT
    USING (user_id = auth.uid());

-- Admins can view all invoices
CREATE POLICY "Admins can view all invoices"
    ON invoices FOR SELECT
    USING (is_admin());

-- Only admins can create invoices
CREATE POLICY "Admins can create invoices"
    ON invoices FOR INSERT
    WITH CHECK (is_admin());

-- Only admins can update invoices
CREATE POLICY "Admins can update invoices"
    ON invoices FOR UPDATE
    USING (is_admin());

-- BID_INCREMENT_TIERS POLICIES
-- Everyone can view bid increment tiers
CREATE POLICY "Everyone can view bid increment tiers"
    ON bid_increment_tiers FOR SELECT
    USING (true);

-- Only admins can manage bid increment tiers
CREATE POLICY "Admins can insert bid increment tiers"
    ON bid_increment_tiers FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update bid increment tiers"
    ON bid_increment_tiers FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can delete bid increment tiers"
    ON bid_increment_tiers FOR DELETE
    USING (is_admin());

-- NOTIFICATIONS POLICIES
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- System/admins can create notifications
CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (is_admin());

-- AUDIT_LOGS POLICIES
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (is_admin());

-- System can insert audit logs (via service role)
-- No user-level insert policy needed as this will be done server-side

-- Create function to check bid eligibility
CREATE OR REPLACE FUNCTION can_user_bid(p_user_id UUID, p_lot_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_status user_status;
    lot_state lot_state;
    lot_end_at TIMESTAMPTZ;
BEGIN
    -- Check user status
    SELECT status INTO user_status
    FROM profiles
    WHERE id = p_user_id;
    
    IF user_status IS NULL OR user_status != 'active' THEN
        RETURN FALSE;
    END IF;
    
    -- Check lot state and timing
    SELECT state, end_at INTO lot_state, lot_end_at
    FROM lots
    WHERE id = p_lot_id;
    
    IF lot_state != 'live' OR NOW() >= lot_end_at THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;