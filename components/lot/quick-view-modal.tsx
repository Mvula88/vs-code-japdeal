'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  Fuel, 
  Gauge, 
  Car,
  Wrench,
  FileText,
  TrendingUp,
  DollarSign,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, formatMileage, formatDateTime } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants';
import { Lot } from '@/lib/types/database';
import { useState } from 'react';

interface QuickViewModalProps {
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickViewModal({ lot, open, onOpenChange }: QuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = lot.images || [];
  const hasImages = images.length > 0;

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'live':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'ended':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-500/10 text-green-600';
      case 'good':
        return 'bg-blue-500/10 text-blue-600';
      case 'fair':
        return 'bg-yellow-500/10 text-yellow-600';
      case 'poor':
        return 'bg-red-500/10 text-red-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {lot.car?.year} {lot.car?.make} {lot.car?.model}
              </DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={getStateColor(lot.state)}>
                  {lot.state.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Lot #{lot.lot_number}
                </span>
                {lot.car?.condition && (
                  <Badge variant="secondary" className={getConditionColor(lot.car.condition)}>
                    {lot.car.condition}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="bidding">Bidding Info</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4">
              <TabsContent value="overview" className="space-y-4 pr-4">
                {/* Image Gallery */}
                {hasImages ? (
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={images[currentImageIndex].file_path}
                      alt={`${lot.car?.make} ${lot.car?.model}`}
                      fill
                      className="object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex
                                  ? 'bg-white'
                                  : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Car className="h-12 w-12 mx-auto mb-2" />
                      <p>No images available</p>
                    </div>
                  </div>
                )}

                {/* Key Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Gauge className="h-4 w-4" />
                      <span className="text-sm">Mileage</span>
                    </div>
                    <p className="font-semibold">{formatMileage(lot.car?.mileage)}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Fuel className="h-4 w-4" />
                      <span className="text-sm">Fuel Type</span>
                    </div>
                    <p className="font-semibold capitalize">{lot.car?.fuel_type || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Wrench className="h-4 w-4" />
                      <span className="text-sm">Transmission</span>
                    </div>
                    <p className="font-semibold capitalize">{lot.car?.transmission || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Car className="h-4 w-4" />
                      <span className="text-sm">Body Type</span>
                    </div>
                    <p className="font-semibold capitalize">{lot.car?.body_type || 'N/A'}</p>
                  </div>
                </div>

                {/* Description */}
                {lot.description && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Description
                    </h4>
                    <p className="text-sm text-muted-foreground">{lot.description}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4 pr-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Vehicle Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Make</span>
                      <span className="font-medium">{lot.car?.make}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Model</span>
                      <span className="font-medium">{lot.car?.model}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Year</span>
                      <span className="font-medium">{lot.car?.year}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Engine</span>
                      <span className="font-medium">{lot.car?.engine || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Color</span>
                      <span className="font-medium capitalize">{lot.car?.color || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">VIN</span>
                      <span className="font-medium text-xs">{lot.car?.vin || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {lot.car?.features && lot.car.features.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {lot.car.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bidding" className="space-y-4 pr-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Auction Information</h4>
                  
                  {/* Pricing */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Starting Price</span>
                      <span className="font-semibold">{formatCurrency(lot.starting_price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Current Price</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(lot.current_price || lot.starting_price)}
                      </span>
                    </div>
                    {lot.bid_increment && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Bid Increment</span>
                        <span className="font-medium">{formatCurrency(lot.bid_increment)}</span>
                      </div>
                    )}
                    {lot.reserve_price && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Reserve Price</span>
                        <Badge variant="outline">Set</Badge>
                      </div>
                    )}
                  </div>

                  {/* Timing */}
                  <div className="space-y-2">
                    {lot.start_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Starts:</span>
                        <span>{formatDateTime(lot.start_at)}</span>
                      </div>
                    )}
                    {lot.end_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Ends:</span>
                        <span>{formatDateTime(lot.end_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Bid Count */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Bids</span>
                    </div>
                    <span className="font-bold text-lg">{lot.bid_count || 0}</span>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Link href={ROUTES.LOT(lot.lot_number)} className="flex-1">
              <Button className="w-full" size="lg">
                <FileText className="mr-2 h-4 w-4" />
                View Full Details
              </Button>
            </Link>
            {lot.state === 'live' && (
              <Link href={ROUTES.LOT(lot.lot_number)} className="flex-1">
                <Button className="w-full" size="lg" variant="default">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Place Bid
                </Button>
              </Link>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}