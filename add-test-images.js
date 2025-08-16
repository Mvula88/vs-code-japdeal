const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Array of car image URLs from Unsplash
const carImages = [
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80', // Ferrari
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80', // Sports car
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80', // Porsche
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80', // Chevrolet
  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&q=80', // Classic car
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80', // Mustang
  'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80', // Mercedes
  'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80', // Vintage car
  'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80', // McLaren
  'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&q=80', // Sports car front
];

async function addTestImages() {
  try {
    // Get all lots
    const { data: lots, error: lotsError } = await supabase
      .from('lots')
      .select('id, lot_number, state');
    
    if (lotsError) {
      console.error('Error fetching lots:', lotsError);
      return;
    }
    
    console.log(`Found ${lots.length} lots`);
    
    // Add images for each lot
    for (let i = 0; i < lots.length; i++) {
      const lot = lots[i];
      
      // Check if lot already has images
      const { data: existingImages } = await supabase
        .from('lot_images')
        .select('id')
        .eq('lot_id', lot.id);
      
      if (existingImages && existingImages.length > 0) {
        console.log(`Lot ${lot.lot_number} already has images, skipping...`);
        continue;
      }
      
      // Add 3 images per lot
      const imagesToAdd = [];
      for (let j = 0; j < 3; j++) {
        const imageIndex = (i * 3 + j) % carImages.length;
        imagesToAdd.push({
          lot_id: lot.id,
          file_path: carImages[imageIndex],
          is_thumbnail: j === 0, // First image is thumbnail
          display_order: j + 1,
          created_at: new Date().toISOString()
        });
      }
      
      const { data: insertedImages, error: insertError } = await supabase
        .from('lot_images')
        .insert(imagesToAdd)
        .select();
      
      if (insertError) {
        console.error(`Error adding images for lot ${lot.lot_number}:`, insertError);
      } else {
        console.log(`Added ${insertedImages.length} images for lot ${lot.lot_number}`);
      }
    }
    
    // Verify total images
    const { count } = await supabase
      .from('lot_images')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\nTotal images in database: ${count}`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addTestImages();