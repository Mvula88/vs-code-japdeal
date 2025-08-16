import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get lots with images
    const { data: lots, error: lotsError } = await supabase
      .from('lots')
      .select('id, lot_number, state')
      .eq('state', 'live')
      .limit(3);
    
    if (lotsError) {
      return NextResponse.json({ error: lotsError.message }, { status: 500 });
    }
    
    const lotIds = lots?.map(l => l.id) || [];
    
    // Get images
    const { data: images, error: imagesError } = await supabase
      .from('lot_images')
      .select('*')
      .in('lot_id', lotIds);
    
    if (imagesError) {
      return NextResponse.json({ error: imagesError.message }, { status: 500 });
    }
    
    // Group images by lot
    const lotImages = lots?.map(lot => ({
      lot_number: lot.lot_number,
      images: images?.filter(img => img.lot_id === lot.id).map(img => ({
        id: img.id,
        file_path: img.file_path,
        is_thumbnail: img.is_thumbnail,
        display_order: img.display_order
      }))
    }));
    
    return NextResponse.json({
      success: true,
      data: lotImages,
      debug: {
        total_lots: lots?.length || 0,
        total_images: images?.length || 0,
        sample_image_url: images?.[0]?.file_path
      }
    });
  } catch (error) {
    console.error('Debug images error:', error);
    return NextResponse.json(
      { error: 'Failed to debug images' },
      { status: 500 }
    );
  }
}