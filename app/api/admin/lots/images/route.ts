import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUser, getProfile } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    const profile = await getProfile();
    
    if (!user || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const lotId = formData.get('lotId') as string;
    const images = formData.getAll('images') as File[];
    
    if (!lotId) {
      return NextResponse.json({ error: 'Lot ID is required' }, { status: 400 });
    }

    // Use admin client for storage operations
    const { createServerSupabaseAdminClient } = await import('@/lib/supabase/server');
    const adminSupabase = await createServerSupabaseAdminClient();
    
    const uploadedImages = [];

    // Upload each image to Supabase Storage
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const fileExt = image.name.split('.').pop();
      const fileName = `${lotId}/${Date.now()}_${i}.${fileExt}`;
      
      // Convert File to ArrayBuffer
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await adminSupabase.storage
        .from('lot-images')
        .upload(fileName, buffer, {
          contentType: image.type,
          upsert: false
        });

      if (storageError) {
        console.error('Storage error:', storageError);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = adminSupabase.storage
        .from('lot-images')
        .getPublicUrl(fileName);

      // Save image record to database
      const { data: imageRecord, error: dbError } = await adminSupabase
        .from('lot_images')
        .insert({
          lot_id: lotId,
          file_path: publicUrl,
          is_primary: i === 0, // First image is primary
          display_order: i + 1,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        continue;
      }

      uploadedImages.push(imageRecord);
    }

    return NextResponse.json({ 
      success: true, 
      images: uploadedImages 
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}