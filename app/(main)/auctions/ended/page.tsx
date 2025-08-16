import LotCard from '@/components/lot/lot-card';
import AuctionFilters from '@/components/auction/filters';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { applyAuctionFilters } from '@/lib/utils/auction-filters';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getEndedLots(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // First, get the lots
    const { data: lotsData, error: lotsError } = await supabase
      .from('lots')
      .select('*')
      .eq('state', 'ended')
      .order('end_at', { ascending: false });

    if (lotsError) {
      console.error('Error fetching lots:', lotsError);
      return [];
    }

    if (!lotsData || lotsData.length === 0) {
      return [];
    }

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

    // Combine the data
    const transformedData = lotsData.map(lot => {
      const car = carsData?.find(c => c.id === lot.car_id) || null;
      const images = imagesData?.filter(img => img.lot_id === lot.id) || [];
      
      return {
        ...lot,
        car,
        images
      };
    });

    // Apply filters
    const filteredData = applyAuctionFilters(transformedData, searchParams);
    return filteredData;
  } catch (error) {
    console.error('Error in getEndedLots:', error);
    return [];
  }
}

export default async function EndedAuctionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const lots = await getEndedLots(params);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ended Auctions</h1>
        <p className="text-muted-foreground">
          View results from {lots.length} completed {lots.length === 1 ? 'auction' : 'auctions'}
        </p>
      </div>

      <div className="mb-8">
        <AuctionFilters />
      </div>

      {lots.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lots.map((lot) => (
            <LotCard key={lot.id} lot={lot} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-lg font-medium mb-2">No ended auctions found</p>
          <p className="text-muted-foreground">
            Try adjusting your filters to view past auction results
          </p>
        </div>
      )}
    </div>
  );
}