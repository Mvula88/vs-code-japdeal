import LotCard from '@/components/lot/lot-card';
import AuctionFilters from '@/components/auction/filters';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getEndedLots(searchParams: { [key: string]: string | string[] | undefined }) {
  const supabase = await createServerSupabaseClient();
  
  let query = supabase
    .from('lots')
    .select(`
      *,
      car:cars!car_id(*),
      lot_images(*)
    `)
    .eq('state', 'ended')
    .order('end_at', { ascending: false });

  // Apply filters - removed for now as they need different syntax with the new join
  // Filters will be re-implemented after confirming basic query works

  if (searchParams.priceMin) {
    query = query.gte('sold_price', parseFloat(String(searchParams.priceMin)));
  }

  if (searchParams.priceMax) {
    query = query.lte('sold_price', parseFloat(String(searchParams.priceMax)));
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching ended lots:', error);
    return [];
  }

  // Transform the data to match the expected structure
  const transformedData = (data || []).map(lot => ({
    ...lot,
    car: lot.car || null,
    images: lot.lot_images || []
  }));

  return transformedData;
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

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <AuctionFilters />
        </aside>

        <div className="lg:col-span-3">
          {lots.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}