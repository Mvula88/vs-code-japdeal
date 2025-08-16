import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUser, getProfile } from '@/lib/utils/auth';

export async function POST() {
  try {
    const user = await getUser();
    const profile = await getProfile();
    
    if (!user || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client to bypass RLS
    const { createServerSupabaseAdminClient } = await import('@/lib/supabase/server');
    const adminSupabase = await createServerSupabaseAdminClient();

    // Check if bucket exists
    const { data: buckets, error: listError } = await adminSupabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return NextResponse.json({ error: 'Failed to list buckets' }, { status: 500 });
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'lot-images');

    if (!bucketExists) {
      // Create the bucket
      const { data, error: createError } = await adminSupabase.storage.createBucket('lot-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return NextResponse.json({ error: 'Failed to create bucket' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Storage bucket created successfully',
        bucket: data 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Storage bucket already exists' 
    });
  } catch (error) {
    console.error('Error setting up storage:', error);
    return NextResponse.json(
      { error: 'Failed to setup storage' },
      { status: 500 }
    );
  }
}