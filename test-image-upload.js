const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testImageUpload() {
  try {
    // Get a test lot
    const { data: lots, error: lotsError } = await supabase
      .from('lots')
      .select('id, lot_number')
      .eq('state', 'live')
      .limit(1)
      .single();
    
    if (lotsError) {
      console.error('Error fetching lot:', lotsError);
      return;
    }
    
    console.log('Testing with lot:', lots);
    
    // Create a test image URL (using a placeholder)
    const testImageUrl = 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80';
    
    // Insert a test image record
    const { data: imageRecord, error: imageError } = await supabase
      .from('lot_images')
      .insert({
        lot_id: lots.id,
        file_path: testImageUrl,
        is_thumbnail: true,
        display_order: 1,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (imageError) {
      console.error('Error inserting image:', imageError);
      return;
    }
    
    console.log('Successfully added test image:', imageRecord);
    
    // Verify the image was added
    const { data: verification, error: verifyError } = await supabase
      .from('lot_images')
      .select('*')
      .eq('lot_id', lots.id);
    
    console.log('Verification - Images for lot:', verification);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testImageUpload();