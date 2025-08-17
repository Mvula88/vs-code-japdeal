import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import BidPanel from '@/components/bidding/bid-panel';
import BidHistory from '@/components/bidding/bid-history';
import CostBreakdown from '@/components/bidding/cost-breakdown';
import WatchlistButton from '@/components/lot/watchlist-button';
import ImageGallery from '@/components/lot/image-gallery';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUser, getProfile, canBid } from '@/lib/utils/auth';
import { formatMileage, formatDateTime, formatCurrency } from '@/lib/utils/format';
import { 
  Calendar, 
  Fuel, 
  Gauge, 
  Settings, 
  MapPin, 
  Car, 
  Info,
  Clock,
  ChevronRight,
  Shield,
  FileText,
  DollarSign,
  Users,
  Eye,
  Activity,
  Package
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

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
    .select('*')
    .eq('lot_id', lot.id)
    .order('amount', { ascending: false });
  
  // Get bidder profiles if there are bids
  if (bids && bids.length > 0) {
    const bidderIds = [...new Set(bids.map(bid => bid.bidder_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', bidderIds);
    
    // Attach profile data to bids
    if (profiles) {
      bids.forEach(bid => {
        const profile = profiles.find(p => p.id === bid.bidder_id);
        bid.bidder = profile || null;
      });
    }
  }

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
  ).slice(0, 4);

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

  // Calculate key statistics
  const bidCount = lot.bids?.length || 0;
  const highestBid = lot.bids?.[0]?.amount || lot.starting_price;
  const timeToEnd = lot.end_at ? new Date(lot.end_at).getTime() - new Date().getTime() : null;
  const daysLeft = timeToEnd ? Math.floor(timeToEnd / (1000 * 60 * 60 * 24)) : null;

  const getStatusColor = (state: string) => {
    switch(state) {
      case 'live':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ended':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={ROUTES.HOME} className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link 
              href={lot.state === 'live' ? ROUTES.AUCTIONS.LIVE : 
                    lot.state === 'upcoming' ? ROUTES.AUCTIONS.UPCOMING : 
                    ROUTES.AUCTIONS.ENDED}
              className="hover:text-primary transition-colors"
            >
              {lot.state === 'live' ? 'Live Auctions' : 
               lot.state === 'upcoming' ? 'Upcoming Auctions' : 
               'Ended Auctions'}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{lot.lot_number}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border mb-6 p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold">
                  {lot.car.year} {lot.car.make} {lot.car.model}
                </h1>
                {user && <WatchlistButton lotId={lot.id} />}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={cn("px-3 py-1", getStatusColor(lot.state))}>
                  {lot.state.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Lot #{lot.lot_number}
                </span>
                {lot.car.vin && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-sm text-muted-foreground font-mono">
                      VIN: {lot.car.vin}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 lg:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{bidCount}</div>
                <div className="text-xs text-muted-foreground">Total Bids</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(highestBid)}</div>
                <div className="text-xs text-muted-foreground">Current Price</div>
              </div>
              {daysLeft !== null && (
                <div className="text-center">
                  <div className="text-2xl font-bold">{daysLeft}d</div>
                  <div className="text-xs text-muted-foreground">Time Left</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <ImageGallery 
                  images={lot.images || []} 
                  carTitle={`${lot.car.year} ${lot.car.make} ${lot.car.model}`} 
                />
              </CardContent>
            </Card>

            {/* Key Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Key Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Gauge className="h-4 w-4" />
                      <span className="text-sm">Mileage</span>
                    </div>
                    <p className="font-semibold">{formatMileage(lot.car.mileage)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">Transmission</span>
                    </div>
                    <p className="font-semibold">{lot.car.transmission || 'Not Specified'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Fuel className="h-4 w-4" />
                      <span className="text-sm">Fuel Type</span>
                    </div>
                    <p className="font-semibold">{lot.car.fuel_type || 'Not Specified'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span className="text-sm">Engine</span>
                    </div>
                    <p className="font-semibold">{lot.car.engine || 'Not Specified'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Car className="h-4 w-4" />
                      <span className="text-sm">Body Type</span>
                    </div>
                    <p className="font-semibold">{lot.car.body_type || 'Not Specified'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Color</span>
                    </div>
                    <p className="font-semibold">{lot.car.color || 'Not Specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="specifications">Full Specs</TabsTrigger>
                <TabsTrigger value="history">Bid History</TabsTrigger>
                <TabsTrigger value="inspection">Inspection</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Information</CardTitle>
                    <CardDescription>Complete details about this vehicle</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground">Basic Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Make</span>
                            <span className="font-medium">{lot.car.make}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Model</span>
                            <span className="font-medium">{lot.car.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Year</span>
                            <span className="font-medium">{lot.car.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Origin</span>
                            <span className="font-medium">{lot.car.origin_market || 'Japan'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-sm text-muted-foreground">Condition</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Mileage</span>
                            <span className="font-medium">{formatMileage(lot.car.mileage)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Grade</span>
                            <span className="font-medium">{lot.car.grade || 'Not Specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Condition</span>
                            <span className="font-medium">{lot.car.condition || 'Good'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Service History</span>
                            <span className="font-medium">Available</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {lot.description && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-sm text-blue-900 mb-2">Additional Notes</h4>
                        <p className="text-sm text-blue-800">{lot.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Auction Information */}
                {lot.state === 'live' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Auction Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Auction Started</span>
                          <span className="font-medium">{lot.start_at ? formatDateTime(lot.start_at) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Auction Ends</span>
                          <span className="font-medium">{lot.end_at ? formatDateTime(lot.end_at) : 'N/A'}</span>
                        </div>
                        {lot.auto_extend_minutes > 0 && (
                          <div className="flex justify-between p-3 bg-yellow-50 rounded-lg">
                            <span className="text-sm text-yellow-800">Auto Extension</span>
                            <span className="font-medium text-yellow-900">{lot.auto_extend_minutes} minutes</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Technical Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Engine & Performance</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">Engine</span>
                            <span className="font-medium">{lot.car.engine || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">Displacement</span>
                            <span className="font-medium">{lot.car.displacement || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">Power</span>
                            <span className="font-medium">{lot.car.power || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">Drive Type</span>
                            <span className="font-medium">{lot.car.specs?.drive_type || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Dimensions & Weight</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">Body Type</span>
                            <span className="font-medium">{lot.car.body_type || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">Doors</span>
                            <span className="font-medium">{lot.car.doors || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">Seats</span>
                            <span className="font-medium">{lot.car.seats || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">Weight</span>
                            <span className="font-medium">{lot.car.weight || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {lot.car.specs && Object.keys(lot.car.specs).length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Additional Specifications</h4>
                        <div className="grid md:grid-cols-3 gap-3">
                          {Object.entries(lot.car.specs).map(([key, value]) => (
                            <div key={key} className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                              <p className="font-medium text-sm">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <BidHistory lotId={lot.id} initialBids={lot.bids || []} />
              </TabsContent>

              <TabsContent value="inspection" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Vehicle Inspection Report
                    </CardTitle>
                    <CardDescription>Professional inspection details and certification</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Inspection report will be available soon</p>
                      <p className="text-sm mt-2">All vehicles undergo comprehensive inspection before listing</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Bid Panel - Sticky on desktop */}
            <div className="lg:sticky lg:top-4">
              <BidPanel
                lot={lot}
                currentPrice={lot.current_price || lot.starting_price || 0}
                bidIncrements={bidIncrements}
                isAuthenticated={!!user}
                canBid={userCanBid}
              />
              
              {/* Cost Breakdown */}
              <div className="mt-6">
                <CostBreakdown
                  costSettings={costSettings}
                  vehiclePrice={lot.current_price || lot.starting_price || 0}
                />
              </div>

              {/* Seller Information */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Seller Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">JapDEAL Verified</p>
                      <p className="text-xs text-muted-foreground">Trusted Seller</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Japan</span>
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    <Info className="h-4 w-4 mr-2" />
                    View Seller Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Related Lots Section */}
        {relatedLots.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Similar {lot.car.make} Vehicles</h2>
              <Link href={ROUTES.AUCTIONS.LIVE}>
                <Button variant="outline" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedLots.map((relatedLot) => (
                <Link key={relatedLot.id} href={ROUTES.LOT(relatedLot.lot_number)}>
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                    <div className="aspect-[4/3] relative bg-gray-100">
                      {relatedLot.images?.[0] && (
                        <Image
                          src={relatedLot.images[0].file_path}
                          alt={`${relatedLot.car.make} ${relatedLot.car.model}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                        {relatedLot.state.toUpperCase()}
                      </Badge>
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold line-clamp-1">
                        {relatedLot.car.year} {relatedLot.car.make} {relatedLot.car.model}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">
                          {formatMileage(relatedLot.car.mileage)}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(relatedLot.current_price || relatedLot.starting_price)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}