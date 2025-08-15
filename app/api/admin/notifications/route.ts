import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const { 
      recipients, 
      subject, 
      message, 
      type,
      recipientType 
    } = await request.json();

    // Get recipient emails based on type
    let recipientEmails: string[] = [];
    
    if (recipientType === 'all') {
      const { data: users } = await supabase
        .from('profiles')
        .select('email')
        .eq('status', 'active');
      recipientEmails = users?.map(u => u.email) || [];
    } else if (recipientType === 'bidders') {
      const { data: bidders } = await supabase
        .from('bids')
        .select('user_id')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (bidders) {
        const userIds = [...new Set(bidders.map(b => b.user_id))];
        const { data: users } = await supabase
          .from('profiles')
          .select('email')
          .in('id', userIds);
        recipientEmails = users?.map(u => u.email) || [];
      }
    } else if (recipientType === 'sellers') {
      const { data: sellers } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'seller');
      recipientEmails = sellers?.map(s => s.email) || [];
    } else if (recipients && recipients.length > 0) {
      recipientEmails = recipients;
    }

    // Store notification in database
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        subject,
        message,
        type: type || 'email',
        recipients: recipientEmails,
        recipient_count: recipientEmails.length,
        sent_by: user.id,
        status: 'sent',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // In a real application, you would send actual emails/SMS/push notifications here
    // For now, we'll just simulate success

    return NextResponse.json({
      success: true,
      notification,
      recipientCount: recipientEmails.length,
      message: `Notification sent to ${recipientEmails.length} recipients`,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

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

    // Get notification history
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}