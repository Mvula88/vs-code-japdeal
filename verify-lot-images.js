const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyLotImages() {
  try {
    // Get lots with their images, similar to how the page fetches them
    const { data: lotsData, error: lotsError } = await supabase
      .from('lots')
      .select('*')
      .eq('state', 'live')
      .order('end_at', { ascending: true });

    if (lotsError) {
      console.error('Error fetching lots:', lotsError);
      return;
    }

    console.log(`Found ${lotsData.length} live lots`);

    // Get all car IDs
    const carIds = lotsData.map(lot => lot.car_id).filter(Boolean);
    
    // Fetch cars separately
    const { data: carsData, error: carsError } = await supabase
      .from('cars')
      .select('*')
      .in('id', carIds);

    if (carsError) {
      console.error('Error fetching cars:', carsError);
    }

    // Fetch lot images
    const lotIds = lotsData.map(lot => lot.id);
    const { data: imagesData, error: imagesError } = await supabase
      .from('lot_images')
      .select('*')
      .in('lot_id', lotIds);

    if (imagesError) {
      console.error('Error fetching lot images:', imagesError);
    }

    console.log(`Found ${imagesData?.length || 0} images for live lots`);

    // Combine and display the data
    const transformedData = lotsData.map(lot => {
      const car = carsData?.find(c => c.id === lot.car_id) || null;
      const images = imagesData?.filter(img => img.lot_id === lot.id) || [];
      
      return {
        lot_number: lot.lot_number,
        car: car ? `${car.year} ${car.make} ${car.model}` : 'Unknown',
        image_count: images.length,
        thumbnail: images.find(img => img.is_thumbnail)?.file_path || 'No thumbnail',
        all_images: images.map(img => ({
          is_thumbnail: img.is_thumbnail,
          file_path: img.file_path.substring(0, 50) + '...'
        }))
      };
    });

    console.log('\nLot Image Summary:');
    console.log(JSON.stringify(transformedData, null, 2));
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

verifyLotImages();