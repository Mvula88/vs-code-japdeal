import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import BidPanel from '@/components/bidding/bid-panel';
import BidHistory from '@/components/bidding/bid-history';
import CostBreakdown from '@/components/bidding/cost-breakdown';
import WatchlistButton from '@/components/lot/watchlist-button';
import ImageGallery from '@/components/lot/image-gallery';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUser, getProfile, canBid } from '@/lib/utils/auth';
import { formatMileage, formatDateTime } from '@/lib/utils/format';
import { Calendar, Fuel, Gauge, Settings, MapPin, Car } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

interface PageProps {
  params: Promise<{ lot_number: string }>;
}

async function getLotDetails(lotNumber: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: lot, error } = await supabase
    .from('lots')
    .select(`
      *,
      car:cars(*),
      images:lot_images(*)
    `)
    .eq('lot_number', lotNumber)
    .single();

  if (error) {
    console.error('Error fetching lot details:', error);
    return null;
  }
  
  if (!lot) {
    console.error('No lot found with number:', lotNumber);
    return null;
  }

  // Get bids for this lot
  const { data: bids } = await supabase
    .from('bids')
    .select(`
      *,
      profiles(display_name)
    `)
    .eq('lot_id', lot.id)
    .order('amount', { ascending: false });

  // Get bid increment tiers
  const { data: bidIncrements } = await supabase
    .from('bid_increment_tiers')
    .select('*')
    .order('position', { ascending: true });

  // Get active cost settings
  const { data: costSettings } = await supabase
    .from('cost_settings')
    .select('*')
    .eq('is_active', true)
    .single();

  // Attach bids to lot
  lot.bids = bids || [];

  return {
    lot,
    bidIncrements: bidIncrements || [],
    costSettings,
  };
}

async function getRelatedLots(make: string, currentLotId: string) {
  const supabase = await createServerSupabaseClient();
  
  // First get all live lots with cars
  const { data: lots } = await supabase
    .from('lots')
    .select(`
      *,
      car:cars(*),
      images:lot_images(*)
    `)
    .eq('state', 'live')
    .neq('id', currentLotId)
    .limit(10);

  if (!lots) return [];

  // Filter by make on the client side
  const relatedLots = lots.filter(lot => 
    lot.car?.make?.toLowerCase() === make.toLowerCase()
  ).slice(0, 3);

  return relatedLots;
}

export default async function LotDetailPage({ params }: PageProps) {
  const { lot_number } = await params;
  const lotData = await getLotDetails(lot_number);
  
  if (!lotData) {
    notFound();
  }

  const { lot, bidIncrements, costSettings } = lotData;
  const user = await getUser();
  const profile = await getProfile();
  const userCanBid = canBid(profile);
  
  const relatedLots = await getRelatedLots(lot.car.make, lot.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href={ROUTES.HOME} className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link 
          href={lot.state === 'live' ? ROUTES.AUCTIONS.LIVE : 
                lot.state === 'upcoming' ? ROUTES.AUCTIONS.UPCOMING : 
                ROUTES.AUCTIONS.ENDED}
          className="hover:text-primary"
        >
          {lot.state === 'live' ? 'Live Auctions' : 
           lot.state === 'upcoming' ? 'Upcoming Auctions' : 
           'Ended Auctions'}
        </Link>
        <span>/</span>
        <span className="text-foreground">{lot.lot_number}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {lot.car.year} {lot.car.make} {lot.car.model}
                </h1>
                <div className="flex items-center gap-4">
                  <Badge variant={lot.state === 'live' ? 'default' : 'secondary'}>
                    {lot.state.toUpperCase()}
                  </Badge>
                  <span className="text-muted-foreground">{lot.lot_number}</span>
                </div>
              </div>
              {user && <WatchlistButton lotId={lot.id} />}
            </div>
          </div>

          {/* Image Gallery */}
          <ImageGallery images={lot.images || []} carTitle={`${lot.car.make} ${lot.car.model}`} />

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="history">Bid History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Make & Model</span>
                      </div>
                      <p className="font-medium">{lot.car.make} {lot.car.model}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Year</span>
                      </div>
                      <p className="font-medium">{lot.car.year}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Mileage</span>
                      </div>
                      <p className="font-medium">{formatMileage(lot.car.mileage)}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Fuel Type</span>
                      </div>
                      <p className="font-medium">{lot.car.fuel_type || 'N/A'}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Transmission</span>
                      </div>
                      <p className="font-medium">{lot.car.transmission || 'N/A'}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Origin Market</span>
                      </div>
                      <p className="font-medium">{lot.car.origin_market || 'Japan'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {lot.car.vin && (
                <Card>
                  <CardHeader>
                    <CardTitle>VIN Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-mono">{lot.car.vin}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="specifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Engine</p>
                      <p className="font-medium">{lot.car.engine || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Body Type</p>
                      <p className="font-medium">{lot.car.body_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Color</p>
                      <p className="font-medium">{lot.car.color || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Drive Type</p>
                      <p className="font-medium">{lot.car.specs?.drive_type || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {lot.car.specs && Object.keys(lot.car.specs).length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-medium mb-3">Additional Specifications</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {Object.entries(lot.car.specs).map(([key, value]) => (
                            <div key={key}>
                              <p className="text-sm text-muted-foreground mb-1">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                              <p className="font-medium">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <BidHistory lotId={lot.id} initialBids={lot.bids || []} />
            </TabsContent>
          </Tabs>

          {/* Auction Timeline */}
          {lot.state === 'live' && (
            <Card>
              <CardHeader>
                <CardTitle>Auction Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Started</span>
                    <span className="font-medium">{formatDateTime(lot.start_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ends</span>
                    <span className="font-medium">{formatDateTime(lot.end_at)}</span>
                  </div>
                  {lot.auto_extend_minutes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Auto Extension</span>
                      <span className="font-medium">{lot.auto_extend_minutes} minutes</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Bid Panel */}
          <BidPanel
            lot={lot}
            currentPrice={lot.current_price || lot.starting_price || 0}
            bidIncrements={bidIncrements}
            isAuthenticated={!!user}
            canBid={userCanBid}
          />

          {/* Cost Breakdown */}
          <CostBreakdown
            costSettings={costSettings}
            vehiclePrice={lot.current_price || lot.starting_price || 0}
          />
        </div>
      </div>

      {/* Related Lots */}
      {relatedLots.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Similar Vehicles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedLots.map((relatedLot) => (
              <Link key={relatedLot.id} href={ROUTES.LOT(relatedLot.lot_number)}>
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] relative">
                    {relatedLot.images?.[0] && (
                      <Image
                        src={relatedLot.images[0].file_path}
                        alt={`${relatedLot.car.make} ${relatedLot.car.model}`}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold">
                      {relatedLot.car.year} {relatedLot.car.make} {relatedLot.car.model}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatMileage(relatedLot.car.mileage)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}