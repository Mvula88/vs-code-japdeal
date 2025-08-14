import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUser, getProfile } from '@/lib/utils/auth';

// GET - Fetch all users
export async function GET() {
  try {
    const user = await getUser();
    const profile = await getProfile();
    
    if (!user || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    const profile = await getProfile();
    
    if (!user || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: updateData.display_name,
        role: updateData.role,
        status: updateData.status,
        phone: updateData.phone,
        address: updateData.address,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Suspend/Ban user (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    const profile = await getProfile();
    
    if (!user || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action') || 'suspend'; // suspend or ban

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    
    const { error } = await supabase
      .from('profiles')
      .update({
        status: action === 'ban' ? 'banned' : 'suspended',
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}