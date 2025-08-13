import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Car, Shield, Clock } from 'lucide-react';
import LotCard from '@/components/lot/lot-card';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ROUTES } from '@/lib/constants';

async function getLots() {
  const supabase = await createServerSupabaseClient();
  
  const [liveLotsResult, upcomingLotsResult, endedLotsResult] = await Promise.all([
    supabase
      .from('lots')
      .select(`
        *,
        car:cars(*),
        images:lot_images(*)
      `)
      .eq('state', 'live')
      .order('end_at', { ascending: true })
      .limit(3),
    
    supabase
      .from('lots')
      .select(`
        *,
        car:cars(*),
        images:lot_images(*)
      `)
      .eq('state', 'upcoming')
      .order('start_at', { ascending: true })
      .limit(3),
    
    supabase
      .from('lots')
      .select(`
        *,
        car:cars(*),
        images:lot_images(*)
      `)
      .eq('state', 'ended')
      .order('end_at', { ascending: false })
      .limit(3),
  ]);

  return {
    liveLots: liveLotsResult.data || [],
    upcomingLots: upcomingLotsResult.data || [],
    endedLots: endedLotsResult.data || [],
  };
}

export default async function HomePage() {
  const { liveLots, upcomingLots, endedLots } = await getLots();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Pre-Bid on Japanese Import Cars
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Secure your dream car from Japan up to 24 hours before the final auction.
              Transparent pricing, nationwide delivery to Namibia.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href={ROUTES.AUCTIONS.LIVE}>
                <Button size="lg">
                  View Live Auctions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={ROUTES.AUTH.SIGN_UP}>
                <Button size="lg" variant="outline">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quality Vehicles</h3>
              <p className="text-muted-foreground">
                Hand-picked Japanese cars with verified history and condition reports
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Bidding</h3>
              <p className="text-muted-foreground">
                Safe and transparent pre-bidding system with real-time updates
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">24-Hour Advantage</h3>
              <p className="text-muted-foreground">
                Place your bids up to 24 hours before the overseas auction ends
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Auctions Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Live Auctions</h2>
              <p className="text-muted-foreground">
                Active auctions ending soon - place your pre-bid now
              </p>
            </div>
            <Link href={ROUTES.AUCTIONS.LIVE}>
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {liveLots.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveLots.map((lot) => (
                <LotCard key={lot.id} lot={lot} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">No live auctions at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Auctions Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Upcoming Auctions</h2>
              <p className="text-muted-foreground">
                Preview cars that will be available for bidding soon
              </p>
            </div>
            <Link href={ROUTES.AUCTIONS.UPCOMING}>
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {upcomingLots.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingLots.map((lot) => (
                <LotCard key={lot.id} lot={lot} showPrices={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-background rounded-lg">
              <p className="text-muted-foreground">No upcoming auctions scheduled</p>
            </div>
          )}
        </div>
      </section>

      {/* Ended Auctions Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Recently Ended</h2>
              <p className="text-muted-foreground">
                See the final prices of recently completed auctions
              </p>
            </div>
            <Link href={ROUTES.AUCTIONS.ENDED}>
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {endedLots.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedLots.map((lot) => (
                <LotCard key={lot.id} lot={lot} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">No recently ended auctions</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}