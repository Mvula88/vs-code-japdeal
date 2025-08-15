import LotCard from '@/components/lot/lot-card';
import AuctionFilters from '@/components/auction/filters';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getLiveLots() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get lots with joins - same as original
    const { data: lotsData, error: lotsError } = await supabase
      .from('lots')
      .select('*')
      .eq('state', 'live')
      .order('end_at', { ascending: true });

    if (lotsError) {
      console.error('Error fetching lots:', lotsError);
      throw lotsError;
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
      throw carsError;
    }

    // Fetch lot images
    const lotIds = lotsData.map(lot => lot.id);
    const { data: imagesData, error: imagesError } = await supabase
      .from('lot_images')
      .select('*')
      .in('lot_id', lotIds);

    if (imagesError) {
      console.error('Error fetching lot images:', imagesError);
      // Don't throw - images are optional
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

    return transformedData;
  } catch (error) {
    console.error('Error in getLiveLots:', error);
    throw error; // Re-throw to see the actual error
  }
}

export default async function LiveDebugPage({ searchParams }: PageProps) {
  try {
    const lots = await getLiveLots();

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Auctions Debug</h1>
          <p className="text-muted-foreground">
            {lots.length} active {lots.length === 1 ? 'auction' : 'auctions'} available
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="p-4 border rounded">
              <p className="text-sm text-gray-600">
                AuctionFilters component disabled for debugging
              </p>
            </div>
            {/* Commenting out to test without it */}
            {/* <AuctionFilters /> */}
          </aside>

          <div className="lg:col-span-3">
            {lots.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm">Testing with LotCard components...</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {lots.map((lot) => (
                    <div key={lot.id}>
                      <p className="text-xs text-gray-500 mb-2">Lot: {lot.lot_number}</p>
                      <LotCard lot={lot} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-lg font-medium mb-2">No live auctions found</p>
              </div>
            )}
          </div>
        </div>

        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-gray-600">Debug Data</summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(lots, null, 2)}
          </pre>
        </details>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Debug Error Caught</h1>
        <div className="bg-red-50 p-4 rounded">
          <p className="font-semibold mb-2">Error details:</p>
          <pre className="text-sm overflow-auto">
            {error instanceof Error 
              ? JSON.stringify({
                  message: error.message,
                  stack: error.stack,
                  name: error.name
                }, null, 2)
              : 'Unknown error'
            }
          </pre>
        </div>
      </div>
    );
  }
}