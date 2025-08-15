import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get settings from database
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    // Return default settings if none exist
    const defaultSettings = {
      // General settings
      siteName: 'JapDeal Auctions',
      siteDescription: 'Premium Japanese vehicle auction platform',
      contactEmail: 'japdealnamibia@gmail.com',
      supportPhone: '+264 081 321 4813',
      currency: 'N$',
      timezone: 'Africa/Windhoek',
      dateFormat: 'DD/MM/YYYY',
      
      // Auction settings
      enableBuyNow: false,
      reservePrice: false,
      autoExtend: true,
      minBidIncrement: 100,
      maxBidAmount: 1000000,
      extensionTime: 5,
      defaultDuration: 7,
      customDuration: 14,
      buyerFee: 5,
      sellerFee: 10,
      listingFee: 50,
      
      // Security settings
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireStrongPassword: true,
      ipWhitelisting: false,
      auditLogging: true,
    };

    return NextResponse.json(settings || defaultSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await request.json();

    // First, check if settings exist
    const { data: existingSettings } = await supabase
      .from('system_settings')
      .select('id')
      .single();

    let result;
    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from('system_settings')
        .update({
          site_name: settings.siteName,
          site_description: settings.siteDescription,
          contact_email: settings.contactEmail,
          support_phone: settings.supportPhone,
          currency: settings.currency,
          timezone: settings.timezone,
          date_format: settings.dateFormat,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', existingSettings.id)
        .select()
        .single();
    } else {
      // Create new settings
      result = await supabase
        .from('system_settings')
        .insert({
          site_name: settings.siteName,
          site_description: settings.siteDescription,
          contact_email: settings.contactEmail,
          support_phone: settings.supportPhone,
          currency: settings.currency,
          timezone: settings.timezone,
          date_format: settings.dateFormat,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user.id,
          updated_by: user.id,
        })
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ 
      success: true, 
      settings: result.data,
      message: 'Settings saved successfully' 
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}