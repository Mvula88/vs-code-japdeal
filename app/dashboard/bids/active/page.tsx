import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/utils/auth';
import { formatCurrency, formatTimeAgo } from '@/lib/utils/format';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, TrendingUp } from 'lucide-react';

async function getActiveBids() {
  const user = await getUser();
  if (!user) return [];

  const supabase = await createServerSupabaseClient();

  // Get all bids for live lots
  const { data: bids } = await supabase
    .from('bids')
    .select(`
      *,
      lot:lots(
        *,
        car:cars(*),
        images:lot_images(*)
      )
    `)
    .eq('bidder_id', user.id)
    .eq('lot.state', 'live')
    .order('created_at', { ascending: false });

  if (!bids) return [];

  // Group bids by lot and get highest bid status
  const lotBids = new Map();
  
  for (const bid of bids) {
    if (!bid.lot) continue;
    
    const lotId = bid.lot.id;
    
    if (!lotBids.has(lotId)) {
      // Get the highest bid for this lot
      const { data: highestBid } = await supabase
        .from('bids')
        .select('amount, bidder_id')
        .eq('lot_id', lotId)
        .order('amount', { ascending: false })
        .limit(1)
        .single();

      lotBids.set(lotId, {
        lot: bid.lot,
        userBid: bid,
        highestBid: highestBid?.amount || 0,
        isWinning: highestBid?.bidder_id === user.id,
      });
    }
  }

  return Array.from(lotBids.values());
}

export default async function ActiveBidsPage() {
  const activeBids = await getActiveBids();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Active Bids</h1>
        <p className="text-muted-foreground">
          You&apos;re currently bidding on {activeBids.length} {activeBids.length === 1 ? 'auction' : 'auctions'}
        </p>
      </div>

      {activeBids.length > 0 ? (
        <div className="grid gap-4">
          {activeBids.map(({ lot, userBid, highestBid, isWinning }) => {
            const thumbnailImage = lot.images?.find((img: { is_thumbnail: boolean }) => img.is_thumbnail) || lot.images?.[0];
            
            return (
              <Card key={lot.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Image */}
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

                    {/* Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {lot.car.year} {lot.car.make} {lot.car.model}
                          </h3>
                          <p className="text-sm text-muted-foreground">{lot.lot_number}</p>
                        </div>
                        <Badge 
                          variant={isWinning ? 'default' : 'secondary'}
                          className={isWinning ? 'bg-green-500' : ''}
                        >
                          {isWinning ? 'Winning' : 'Outbid'}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Your Bid</p>
                          <p className="font-semibold">{formatCurrency(userBid.amount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Price</p>
                          <p className="font-semibold">{formatCurrency(highestBid)}</p>
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
                            {isWinning ? 'View Lot' : 'Place Higher Bid'}
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
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You don&apos;t have any active bids at the moment
            </p>
            <Link href="/auctions/live">
              <Button>Browse Live Auctions</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}