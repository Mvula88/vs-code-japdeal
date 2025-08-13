import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Fuel, Gauge } from 'lucide-react';
import { Lot } from '@/lib/types/database';
import { formatCurrency, formatMileage, formatTimeAgo } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface LotCardProps {
  lot: Lot & {
    car?: any;
    images?: any[];
  };
  showPrices?: boolean;
}

export default function LotCard({ lot, showPrices = true }: LotCardProps) {
  const thumbnailImage = lot.images?.find((img) => img.is_thumbnail) || lot.images?.[0];
  const timeLeft = lot.end_at ? new Date(lot.end_at).getTime() - Date.now() : 0;
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const getStateColor = (state: string) => {
    switch (state) {
      case 'live':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      case 'ended':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriceDisplay = () => {
    if (lot.state === 'upcoming') {
      return null;
    }
    if (lot.state === 'live') {
      return (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Start Price:</span>
            <span>{formatCurrency(lot.start_price)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Current Price:</span>
            <span className="text-primary">{formatCurrency(lot.current_price)}</span>
          </div>
        </div>
      );
    }
    if (lot.state === 'ended') {
      return (
        <div className="flex justify-between font-semibold">
          <span>Sold Price:</span>
          <span className="text-primary">{formatCurrency(lot.sold_price)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={ROUTES.LOT(lot.lot_number)}>
        <div className="relative aspect-[4/3] bg-muted">
          {thumbnailImage ? (
            <Image
              src={thumbnailImage.file_path}
              alt={`${lot.car?.make} ${lot.car?.model}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No image available
            </div>
          )}
          <Badge
            className={cn(
              'absolute top-2 right-2',
              getStateColor(lot.state),
              'text-white border-0'
            )}
          >
            {lot.state.toUpperCase()}
          </Badge>
          {lot.state === 'live' && timeLeft > 0 && (
            <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium">
              <Clock className="inline-block w-3 h-3 mr-1" />
              {hoursLeft}h {minutesLeft}m left
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {lot.car?.year} {lot.car?.make} {lot.car?.model}
            </h3>
            <p className="text-sm text-muted-foreground">{lot.lot_number}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Gauge className="w-4 h-4" />
              <span>{formatMileage(lot.car?.mileage)}</span>
            </div>
            {lot.car?.fuel_type && (
              <div className="flex items-center gap-1">
                <Fuel className="w-4 h-4" />
                <span>{lot.car.fuel_type}</span>
              </div>
            )}
          </div>
          {showPrices && getPriceDisplay()}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {lot.state === 'live' && (
          <Link href={ROUTES.LOT(lot.lot_number)} className="w-full">
            <Button className="w-full">Pre-Bid Now</Button>
          </Link>
        )}
        {lot.state === 'upcoming' && (
          <div className="w-full text-center text-sm text-muted-foreground">
            <Calendar className="inline-block w-4 h-4 mr-1" />
            Opens {formatTimeAgo(lot.start_at)}
          </div>
        )}
        {lot.state === 'ended' && (
          <div className="w-full text-center text-sm text-muted-foreground">
            Ended {formatTimeAgo(lot.end_at)}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}