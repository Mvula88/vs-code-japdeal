import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Car, Shield, Clock, TrendingUp, Users, Award, Sparkles, ChevronRight, Zap, Globe, Truck } from 'lucide-react';
import LotCard from '@/components/lot/lot-card';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ROUTES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils/format';

async function getLots() {
  const supabase = await createServerSupabaseClient();
  
  const [liveLotsResult, upcomingLotsResult, endedLotsResult, statsResult] = await Promise.all([
    supabase
      .from('lots')
      .select(`
        *,
        car:cars(*),
        images:lot_images(*)
      `)
      .eq('state', 'live')
      .order('end_at', { ascending: true })
      .limit(6),
    
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
      
    // Get some stats
    supabase
      .from('lots')
      .select('state, sold_price')
  ]);

  // Calculate stats
  const totalAuctions = statsResult.data?.length || 0;
  const totalSold = statsResult.data?.filter(l => l.state === 'ended' && l.sold_price).length || 0;
  const totalValue = statsResult.data?.reduce((sum, l) => sum + (l.sold_price || 0), 0) || 0;

  return {
    liveLots: liveLotsResult.data || [],
    upcomingLots: upcomingLotsResult.data || [],
    endedLots: endedLotsResult.data || [],
    stats: {
      totalAuctions,
      totalSold,
      totalValue
    }
  };
}

export default async function HomePage() {
  const { liveLots, upcomingLots, endedLots, stats } = await getLots();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Enhanced with modern design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {/* Background decoration */}
        <div className="absolute inset-0 grid-pattern opacity-5" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge className="mb-4 px-4 py-1.5 text-sm font-medium badge-glow">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Trusted Japanese Car Imports
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-balance">
                Pre-Bid on
                <span className="gradient-text"> Premium </span>
                Japanese Cars
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed text-pretty">
                Secure your dream vehicle from Japan&apos;s top auctions. Get exclusive 24-hour early access, transparent pricing, and nationwide delivery to Namibia.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href={ROUTES.AUCTIONS.LIVE}>
                  <Button size="lg" className="btn-gradient group px-8 h-12 text-base">
                    Browse Live Auctions
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href={ROUTES.AUTH.SIGN_UP}>
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base hover:bg-primary/5">
                    Create Free Account
                  </Button>
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full pulse-ring" />
                  <span className="text-muted-foreground">{liveLots.length} Live Auctions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Secure Bidding</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Nationwide Delivery</span>
                </div>
              </div>
            </div>
            
            {/* Hero image/graphic */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden glass shadow-2xl">
                {liveLots[0]?.images?.[0] ? (
                  <Image
                    src={liveLots[0].images[0].file_path}
                    alt="Featured Car"
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Car className="h-24 w-24 text-primary/30" />
                  </div>
                )}
                
                {/* Overlay with stats */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="flex justify-between items-end">
                    <div>
                      {liveLots[0] && (
                        <>
                          <p className="text-white/80 text-sm mb-1">Featured Auction</p>
                          <h3 className="text-white font-bold text-xl">
                            {liveLots[0].car?.year} {liveLots[0].car?.make} {liveLots[0].car?.model}
                          </h3>
                        </>
                      )}
                    </div>
                    <Badge className="bg-green-500 text-white border-0">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                      LIVE NOW
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-xl p-4 glass animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalSold}+</p>
                    <p className="text-sm text-muted-foreground">Cars Sold</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-card rounded-xl shadow-xl p-4 glass animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">500+</p>
                    <p className="text-sm text-muted-foreground">Happy Customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">{stats.totalAuctions}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Auctions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">{stats.totalSold}</p>
              <p className="text-sm text-muted-foreground mt-1">Vehicles Sold</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">{formatCurrency(stats.totalValue)}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Value</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">24/7</p>
              <p className="text-sm text-muted-foreground mt-1">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4">Why Choose JapDEAL</Badge>
            <h2 className="text-4xl font-bold mb-4">Your Gateway to Japanese Excellence</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the most transparent and efficient way to import quality Japanese vehicles
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover-lift border-border/50 overflow-hidden">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-3">Premium Selection</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Hand-picked vehicles from Japan&apos;s most reputable auctions with comprehensive inspection reports
                </p>
                <div className="mt-6 flex items-center text-primary font-medium">
                  Learn more <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover-lift border-border/50 overflow-hidden">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-bold text-xl mb-3">24-Hour Advantage</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Exclusive early access to place bids before the overseas auction ends, securing your position
                </p>
                <div className="mt-6 flex items-center text-primary font-medium">
                  Learn more <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover-lift border-border/50 overflow-hidden">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-bold text-xl mb-3">Secure & Transparent</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time bidding updates, secure payments, and full cost transparency with no hidden fees
                </p>
                <div className="mt-6 flex items-center text-primary font-medium">
                  Learn more <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Auctions Section - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <Badge className="mb-3 bg-green-500/10 text-green-600 border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Live Now
              </Badge>
              <h2 className="text-4xl font-bold mb-3">Active Auctions</h2>
              <p className="text-lg text-muted-foreground">
                Place your pre-bid now on these premium vehicles
              </p>
            </div>
            <Link href={ROUTES.AUCTIONS.LIVE}>
              <Button variant="outline" size="lg" className="group">
                View All Live Auctions
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {liveLots.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveLots.slice(0, 6).map((lot, index) => (
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
              <CardContent className="py-16 text-center">
                <Car className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No live auctions at the moment</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon for new listings</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4">Simple Process</Badge>
            <h2 className="text-4xl font-bold mb-4">How JapDEAL Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From browsing to delivery - we make importing your dream car simple
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
            
            {[
              { icon: Globe, title: "Browse", desc: "Explore our curated selection of Japanese vehicles" },
              { icon: TrendingUp, title: "Pre-Bid", desc: "Place your maximum bid up to 24 hours early" },
              { icon: Award, title: "Win", desc: "We bid on your behalf at the overseas auction" },
              { icon: Truck, title: "Delivery", desc: "Nationwide delivery straight to your location" }
            ].map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                  <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center shadow-lg">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Find Your Dream Car?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have imported their vehicles through JapDEAL
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
        </div>
      </section>
    </div>
  );
}