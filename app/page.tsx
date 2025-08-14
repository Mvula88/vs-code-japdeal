import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Car, Shield, Clock, TrendingUp, Sparkles, Zap, Trophy, Calendar } from 'lucide-react';
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
        cars!inner(*),
        lot_images(*)
      `)
      .eq('state', 'live')
      .order('end_at', { ascending: true })
      .limit(6),
    
    supabase
      .from('lots')
      .select(`
        *,
        cars!inner(*),
        lot_images(*)
      `)
      .eq('state', 'upcoming')
      .order('start_at', { ascending: true })
      .limit(6),
    
    supabase
      .from('lots')
      .select(`
        *,
        cars!inner(*),
        lot_images(*)
      `)
      .eq('state', 'ended')
      .order('end_at', { ascending: false })
      .limit(6),
  ]);

  // Transform the data to match the expected structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformData = (data: any[]) => 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data || []).map((lot: any) => ({
      ...lot,
      car: lot.cars,
      images: lot.lot_images
    }));

  return {
    liveLots: transformData(liveLotsResult.data || []),
    upcomingLots: transformData(upcomingLotsResult.data || []),
    endedLots: transformData(endedLotsResult.data || []),
  };
}

export default async function HomePage() {
  const { liveLots, upcomingLots, endedLots } = await getLots();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Clean and Professional */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-24">
        {/* Background decoration */}
        <div className="absolute inset-0 grid-pattern opacity-5" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 px-4 py-1.5 text-sm font-medium badge-glow">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Trusted Japanese Car Imports to Namibia
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Pre-Bid on Premium
              <span className="gradient-text"> Japanese Cars</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Secure your dream vehicle from Japan&apos;s top auctions with 24-hour early access. 
              Transparent pricing, professional service, and nationwide delivery.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={ROUTES.AUCTIONS.LIVE}>
                <Button size="lg" className="btn-gradient group px-8 h-12 text-base">
                  View Live Auctions
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={ROUTES.AUTH.SIGN_UP}>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base hover:bg-primary/5">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Auctions Section - Moved up after hero */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">Live Auctions</h2>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                  {liveLots.length} Active
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Active auctions ending soon - place your pre-bid now
              </p>
            </div>
            <Link href={ROUTES.AUCTIONS.LIVE}>
              <Button variant="outline" className="group">
                View All Live
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {liveLots.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveLots.map((lot, index) => (
                <div 
                  key={lot.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <LotCard lot={lot} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-2">No Live Auctions</p>
                <p className="text-sm text-muted-foreground">
                  Check back soon for new active auctions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Recently Ended Auctions Section - Moved up after live */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">Recently Ended</h2>
                <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">
                  <Trophy className="h-3 w-3 mr-1.5" />
                  {endedLots.length} Completed
                </Badge>
              </div>
              <p className="text-muted-foreground">
                See the final prices of recently completed auctions
              </p>
            </div>
            <Link href={ROUTES.AUCTIONS.ENDED}>
              <Button variant="outline" className="group">
                View All Results
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {endedLots.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedLots.map((lot, index) => (
                <div 
                  key={lot.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <LotCard lot={lot} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-background">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-2">No Recent Results</p>
                <p className="text-sm text-muted-foreground">
                  Completed auction results will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Upcoming Auctions Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">Upcoming Auctions</h2>
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  <Calendar className="h-3 w-3 mr-1.5" />
                  {upcomingLots.length} Scheduled
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Preview vehicles that will be available for bidding soon
              </p>
            </div>
            <Link href={ROUTES.AUCTIONS.UPCOMING}>
              <Button variant="outline" className="group">
                View All Upcoming
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {upcomingLots.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingLots.map((lot, index) => (
                <div 
                  key={lot.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <LotCard lot={lot} showPrices={false} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-2">No Upcoming Auctions</p>
                <p className="text-sm text-muted-foreground">
                  New auctions will be scheduled soon
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Features Section - Moved down after auctions */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Quality Vehicles</h3>
                <p className="text-sm text-muted-foreground">
                  Hand-picked cars with verified history and inspection reports
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">24-Hour Advantage</h3>
                <p className="text-sm text-muted-foreground">
                  Place bids up to 24 hours before the overseas auction
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure & Transparent</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time updates and full cost transparency
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-5" />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Bidding?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have successfully imported their vehicles through JapDEAL
          </p>
          <div className="flex gap-4 justify-center">
            <Link href={ROUTES.AUTH.SIGN_UP}>
              <Button size="lg" className="btn-gradient px-8 h-12">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href={ROUTES.AUCTIONS.LIVE}>
              <Button size="lg" variant="outline" className="h-12 px-8">
                Browse Auctions
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">24-Hour Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Best Prices Guaranteed</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}