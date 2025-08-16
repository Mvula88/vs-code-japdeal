'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Fuel, Gauge, Users, TrendingUp, Heart, Zap } from 'lucide-react';
import { Lot } from '@/lib/types/database';
import { formatCurrency, formatMileage, formatTimeAgo } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import QuickViewModal from './quick-view-modal';

interface LotCardProps {
  lot: Lot & {
    car?: { 
      make: string; 
      model: string; 
      year: number; 
      mileage: number; 
      fuel_type?: string | null; 
      transmission?: string | null;
      engine?: string | null;
      body_type?: string | null;
      color?: string | null;
      vin?: string | null;
      condition?: string | null;
      features?: string[] | null;
    };
    images?: { id: string; file_path: string; is_thumbnail?: boolean }[];
  };
  showPrices?: boolean;
}

export default function LotCard({ lot, showPrices = true }: LotCardProps) {
  const [showQuickView, setShowQuickView] = useState(false);
  const thumbnailImage = lot.images?.find((img) => img.is_thumbnail) || lot.images?.[0];
  const timeLeft = lot.end_at ? new Date(lot.end_at).getTime() - Date.now() : 0;
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const daysUntilStart = lot.start_at ? Math.ceil((new Date(lot.start_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  const getStateStyles = (state: string) => {
    switch (state) {
      case 'live':
        return {
          badge: 'bg-green-500/10 text-green-600 border-green-500/20',
          icon: <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />,
          label: 'LIVE',
        };
      case 'upcoming':
        return {
          badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
          icon: <Calendar className="h-3 w-3" />,
          label: 'UPCOMING',
        };
      case 'ended':
        return {
          badge: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
          icon: null,
          label: 'ENDED',
        };
      default:
        return {
          badge: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
          icon: null,
          label: state.toUpperCase(),
        };
    }
  };

  const stateStyles = getStateStyles(lot.state);

  return (
    <Card className="group overflow-hidden hover-lift border-border/50 transition-all duration-300">
      <Link href={ROUTES.LOT(lot.lot_number)}>
        <div className="relative aspect-[16/10] bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
          {thumbnailImage ? (
            <Image
              src={thumbnailImage.file_path}
              alt={lot.car ? `${lot.car.year} ${lot.car.make} ${lot.car.model}` : 'Lot image'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted-foreground/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Image 
                    src="/car-placeholder.svg" 
                    alt="No image" 
                    width={32} 
                    height={32} 
                    className="opacity-50"
                  />
                </div>
                <p className="text-sm text-muted-foreground">No image available</p>
              </div>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <Badge className={cn(stateStyles.badge, "backdrop-blur-sm")}>
              {stateStyles.icon && (
                <span className="mr-1.5">{stateStyles.icon}</span>
              )}
              {stateStyles.label}
            </Badge>
            
            {lot.state === 'live' && lot.bid_count > 0 && (
              <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-0">
                <Users className="h-3 w-3 mr-1" />
                {lot.bid_count} {lot.bid_count === 1 ? 'bid' : 'bids'}
              </Badge>
            )}
          </div>
          
          {/* Bottom overlay - visible on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button 
              size="sm" 
              className="w-full bg-white/90 text-black hover:bg-white backdrop-blur-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickView(true);
              }}
            >
              <Zap className="h-3 w-3 mr-2" />
              Quick View
            </Button>
          </div>
          
          {/* Watchlist button */}
          <button className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background">
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </Link>
      
      <CardContent className="p-4 space-y-3">
        {/* Title and lot number */}
        <div>
          <Link href={ROUTES.LOT(lot.lot_number)}>
            <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">
              {lot.car?.year} {lot.car?.make} {lot.car?.model}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="font-mono">{lot.lot_number}</span>
            {lot.car?.transmission && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span>{lot.car.transmission}</span>
              </>
            )}
          </p>
        </div>
        
        {/* Specs */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Gauge className="h-3.5 w-3.5" />
            <span className="font-medium">{formatMileage(lot.car?.mileage)}</span>
          </div>
          {lot.car?.fuel_type && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Fuel className="h-3.5 w-3.5" />
              <span className="font-medium">{lot.car.fuel_type}</span>
            </div>
          )}
        </div>
        
        {/* Pricing */}
        {showPrices && (
          <div className="pt-2 border-t">
            {lot.state === 'live' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current bid</span>
                  <span className="text-lg font-bold gradient-text">
                    {formatCurrency(lot.current_price || lot.starting_price)}
                  </span>
                </div>
                {timeLeft > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {hoursLeft > 24 
                        ? `${Math.floor(hoursLeft / 24)} days left`
                        : hoursLeft > 0 
                        ? `${hoursLeft}h ${minutesLeft}m left`
                        : `${minutesLeft} minutes left`
                      }
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {lot.state === 'upcoming' && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {daysUntilStart <= 0 
                    ? 'Starting soon'
                    : daysUntilStart === 1
                    ? 'Starts tomorrow'
                    : `Starts in ${daysUntilStart} days`
                  }
                </span>
              </div>
            )}
            
            {lot.state === 'ended' && lot.sold_price && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sold for</span>
                  <span className="text-lg font-bold">{formatCurrency(lot.sold_price)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ended {formatTimeAgo(lot.end_at)}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        {lot.state === 'live' && (
          <Link href={ROUTES.LOT(lot.lot_number)} className="w-full">
            <Button className="w-full group/btn hover:shadow-md transition-all">
              <TrendingUp className="mr-2 h-4 w-4 group-hover/btn:translate-y-[-2px] transition-transform" />
              Place Pre-Bid
            </Button>
          </Link>
        )}
        
        {lot.state === 'upcoming' && (
          <Link href={ROUTES.LOT(lot.lot_number)} className="w-full">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        )}
        
        {lot.state === 'ended' && (
          <Link href={ROUTES.LOT(lot.lot_number)} className="w-full">
            <Button variant="ghost" className="w-full">
              View Results
            </Button>
          </Link>
        )}
      </CardFooter>
      
      {/* Quick View Modal */}
      <QuickViewModal
        lot={lot}
        open={showQuickView}
        onOpenChange={setShowQuickView}
      />
    </Card>
  );
}