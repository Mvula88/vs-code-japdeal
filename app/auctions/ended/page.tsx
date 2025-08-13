import { Suspense } from 'react';
import LotCard from '@/components/lot/lot-card';
import AuctionFilters from '@/components/auction/filters';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getEndedLots(searchParams: { [key: string]: string | string[] | undefined }) {
  const supabase = await createServerSupabaseClient();
  
  let query = supabase
    .from('lots')
    .select(`
      *,
      car:cars(*),
      images:lot_images(*)
    `)
    .eq('state', 'ended')
    .order('end_at', { ascending: false });

  // Apply filters
  if (searchParams.search) {
    const searchTerm = String(searchParams.search);
    query = query.or(`car.make.ilike.%${searchTerm}%,car.model.ilike.%${searchTerm}%`);
  }

  if (searchParams.make) {
    query = query.ilike('car.make', `%${searchParams.make}%`);
  }

  if (searchParams.model) {
    query = query.ilike('car.model', `%${searchParams.model}%`);
  }

  if (searchParams.yearMin) {
    query = query.gte('car.year', parseInt(String(searchParams.yearMin)));
  }

  if (searchParams.yearMax) {
    query = query.lte('car.year', parseInt(String(searchParams.yearMax)));
  }

  if (searchParams.mileageMax) {
    query = query.lte('car.mileage', parseInt(String(searchParams.mileageMax)));
  }

  if (searchParams.fuelType) {
    query = query.eq('car.fuel_type', searchParams.fuelType);
  }

  if (searchParams.transmission) {
    query = query.eq('car.transmission', searchParams.transmission);
  }

  if (searchParams.bodyType) {
    query = query.eq('car.body_type', searchParams.bodyType);
  }

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

  return data || [];
}

function LoadingSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
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
          <Suspense fallback={<LoadingSkeleton />}>
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
          </Suspense>
        </div>
      </div>
    </div>
  );
}