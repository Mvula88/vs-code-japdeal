import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/utils/auth';
import { formatCurrency, formatTimeAgo } from '@/lib/utils/format';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, TrendingUp, Calendar } from 'lucide-react';

async function getWatchlist() {
  const user = await getUser();
  if (!user) return [];

  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('watchlists')
    .select(`
      *,
      lot:lots(
        *,
        car:cars(*),
        images:lot_images(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function WatchlistPage() {
  const watchlist = await getWatchlist();

  // Group by lot state
  const liveLots = watchlist.filter(w => w.lot?.state === 'live');
  const upcomingLots = watchlist.filter(w => w.lot?.state === 'upcoming');
  const endedLots = watchlist.filter(w => w.lot?.state === 'ended');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
        <p className="text-muted-foreground">
          You&apos;re watching {watchlist.length} {watchlist.length === 1 ? 'lot' : 'lots'}
        </p>
      </div>

      {/* Live Lots */}
      {liveLots.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Live Auctions</h2>
          <div className="grid gap-4">
            {liveLots.map(({ lot }) => {
              const thumbnailImage = lot.images?.find((img: { is_thumbnail: boolean }) => img.is_thumbnail) || lot.images?.[0];
              
              return (
                <Card key={lot.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="relative w-32 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        {thumbnailImage ? (
                          <Image
                            src={thumbnailImage.file_path}
                            alt={`${lot.car.make} ${lot.car.model}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {lot.car.year} {lot.car.make} {lot.car.model}
                            </h3>
                            <p className="text-sm text-muted-foreground">{lot.lot_number}</p>
                          </div>
                          <Badge className="bg-green-500">LIVE</Badge>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Current Price</p>
                            <p className="font-semibold">{formatCurrency(lot.current_price)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Bids</p>
                            <p className="font-medium">{lot.bid_count}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Ends</p>
                            <p className="font-medium flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(lot.end_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Link href={`/lot/${lot.lot_number}`}>
                            <Button size="sm">
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Place Bid
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Lots */}
      {upcomingLots.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Auctions</h2>
          <div className="grid gap-4">
            {upcomingLots.map(({ lot }) => {
              const thumbnailImage = lot.images?.find((img: { is_thumbnail: boolean }) => img.is_thumbnail) || lot.images?.[0];
              
              return (
                <Card key={lot.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="relative w-32 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        {thumbnailImage ? (
                          <Image
                            src={thumbnailImage.file_path}
                            alt={`${lot.car.make} ${lot.car.model}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {lot.car.year} {lot.car.make} {lot.car.model}
                            </h3>
                            <p className="text-sm text-muted-foreground">{lot.lot_number}</p>
                          </div>
                          <Badge variant="secondary">UPCOMING</Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Opens {formatTimeAgo(lot.start_at)}</span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Link href={`/lot/${lot.lot_number}`}>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Ended Lots */}
      {endedLots.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Ended Auctions</h2>
          <div className="grid gap-4">
            {endedLots.map(({ lot }) => {
              const thumbnailImage = lot.images?.find((img: { is_thumbnail: boolean }) => img.is_thumbnail) || lot.images?.[0];
              
              return (
                <Card key={lot.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="relative w-32 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        {thumbnailImage ? (
                          <Image
                            src={thumbnailImage.file_path}
                            alt={`${lot.car.make} ${lot.car.model}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {lot.car.year} {lot.car.make} {lot.car.model}
                            </h3>
                            <p className="text-sm text-muted-foreground">{lot.lot_number}</p>
                          </div>
                          <Badge variant="outline">ENDED</Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Sold Price</p>
                            <p className="font-semibold">{formatCurrency(lot.sold_price)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Ended</p>
                            <p className="font-medium">{formatTimeAgo(lot.end_at)}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Link href={`/lot/${lot.lot_number}`}>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {watchlist.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Your watchlist is empty
            </p>
            <Link href="/auctions/live">
              <Button>Browse Auctions</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}