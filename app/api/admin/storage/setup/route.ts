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

    const carImagesBucketExists = buckets?.some(bucket => bucket.name === 'car-images');
    const carThumbnailsBucketExists = buckets?.some(bucket => bucket.name === 'car-thumbnails');
    
    const bucketsCreated = [];
    
    // Create car-images bucket if it doesn't exist
    if (!carImagesBucketExists) {
      const { data, error: createError } = await adminSupabase.storage.createBucket('car-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('Error creating car-images bucket:', createError);
      } else {
        bucketsCreated.push('car-images');
      }
    }
    
    // Create car-thumbnails bucket if it doesn't exist
    if (!carThumbnailsBucketExists) {
      const { data, error: createError } = await adminSupabase.storage.createBucket('car-thumbnails', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
        fileSizeLimit: 2097152 // 2MB for thumbnails
      });

      if (createError) {
        console.error('Error creating car-thumbnails bucket:', createError);
      } else {
        bucketsCreated.push('car-thumbnails');
      }
    }

    if (bucketsCreated.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: `Storage buckets created successfully: ${bucketsCreated.join(', ')}`,
        bucketsCreated 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'All required storage buckets already exist' 
    });
  } catch (error) {
    console.error('Error setting up storage:', error);
    return NextResponse.json(
      { error: 'Failed to setup storage' },
      { status: 500 }
    );
  }
}