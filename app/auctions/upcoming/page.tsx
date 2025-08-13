import { Suspense } from 'react';
import LotCard from '@/components/lot/lot-card';
import AuctionFilters from '@/components/auction/filters';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getUpcomingLots(searchParams: PageProps['searchParams']) {
  const supabase = await createServerSupabaseClient();
  
  let query = supabase
    .from('lots')
    .select(`
      *,
      car:cars(*),
      images:lot_images(*)
    `)
    .eq('state', 'upcoming')
    .order('start_at', { ascending: true });

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

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching upcoming lots:', error);
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

export default async function UpcomingAuctionsPage({ searchParams }: PageProps) {
  const lots = await getUpcomingLots(searchParams);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upcoming Auctions</h1>
        <p className="text-muted-foreground">
          {lots.length} {lots.length === 1 ? 'auction' : 'auctions'} scheduled to go live soon
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
                  <LotCard key={lot.id} lot={lot} showPrices={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-lg font-medium mb-2">No upcoming auctions found</p>
                <p className="text-muted-foreground">
                  Check back later or browse our live auctions
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}