'use client';

import { useState, useEffect, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { useCountdown } from '@/lib/hooks/use-realtime';
import { Lot, BidIncrementTier } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/constants';

interface BidPanelProps {
  lot: Lot;
  currentPrice: number;
  bidIncrements: BidIncrementTier[];
  isAuthenticated: boolean;
  canBid: boolean;
  onBidPlaced?: () => void;
  onBidAmountChange?: (amount: number) => void;
}

export default function BidPanel({
  lot,
  currentPrice: initialPrice,
  bidIncrements,
  isAuthenticated,
  canBid,
  onBidPlaced,
  onBidAmountChange,
}: BidPanelProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [optimisticPrice, setOptimisticPrice] = useOptimistic(currentPrice);
  const timeLeft = useCountdown(lot.end_at);

  // Check if user has visited before using localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const visited = localStorage.getItem('has_visited');
      setHasVisitedBefore(!!visited);
      if (!visited) {
        localStorage.setItem('has_visited', 'true');
      }
    }
  }, []);

  // Notify parent when bid amount changes
  useEffect(() => {
    const amount = parseFloat(bidAmount);
    if (!isNaN(amount) && amount > 0) {
      onBidAmountChange?.(amount);
    } else {
      onBidAmountChange?.(currentPrice);
    }
  }, [bidAmount, currentPrice, onBidAmountChange]);

  // Calculate minimum bid increment
  const getMinIncrement = () => {
    const tier = bidIncrements.find(t => currentPrice < t.upper_bound);
    return tier?.increment || 25000;
  };

  const minBid = currentPrice + getMinIncrement();

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`lot-${lot.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lots',
          filter: `id=eq.${lot.id}`,
        },
        (payload) => {
          if (payload.new.current_price) {
            setCurrentPrice(payload.new.current_price);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lot.id, supabase]);

  const handlePreBid = async () => {
    if (!isAuthenticated) {
      // Check if user has visited before via API
      try {
        const response = await fetch('/api/auth/check-visitor');
        const data = await response.json();
        const redirectPath = data.hasVisited ? ROUTES.AUTH.SIGN_IN : ROUTES.AUTH.SIGN_UP;
        router.push(redirectPath);
      } catch {
        // Default to sign-in if API fails
        router.push(ROUTES.AUTH.SIGN_IN);
      }
      return;
    }
    handleBid();
  };

  const handleBid = async () => {
    if (!isAuthenticated) {
      handlePreBid();
      return;
    }

    if (!canBid) {
      toast.error('You are not eligible to bid');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minBid) {
      toast.error(`Minimum bid is ${formatCurrency(minBid)}`);
      return;
    }

    setIsLoading(true);
    setOptimisticPrice(amount);

    try {
      const response = await fetch('/api/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotId: lot.id,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place bid');
      }

      toast.success('Bid placed successfully!');
      setBidAmount('');
      setCurrentPrice(amount);
      onBidPlaced?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to place bid');
      setOptimisticPrice(currentPrice);
    } finally {
      setIsLoading(false);
    }
  };

  const quickBidAmounts = [
    minBid,
    minBid + getMinIncrement(),
    minBid + (getMinIncrement() * 2),
  ];

  // For upcoming auctions - show starting price and status
  if (lot.state === 'upcoming') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Auction</CardTitle>
          <Badge variant="secondary" className="w-fit">
            NOT STARTED
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Starting Price</p>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(lot.starting_price || 0)}
            </p>
          </div>
          {lot.start_at && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Auction Starts</p>
              <p className="text-sm font-medium">
                {new Date(lot.start_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // For ended auctions - show final price only
  if (lot.state === 'ended') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Auction Ended</CardTitle>
          <Badge variant="outline" className="w-fit">
            SOLD
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-900">Final Price</p>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(lot.sold_price || currentPrice || lot.starting_price || 0)}
            </p>
          </div>
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              {lot.bid_count || 0} total bids placed
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Only check time if the auction is live and has an end_at value
  // timeLeft.total === 0 means the auction has ended
  // timeLeft.total === -1 means there's no end time
  // timeLeft.total > 0 means the auction is still running
  if (lot.state === 'live' && lot.end_at && timeLeft.total === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>This auction has ended</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Place Your Bid</CardTitle>
          <Badge variant="default" className="bg-green-500">
            LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Countdown Timer - only show if end_at exists */}
        {lot.end_at && (
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time Remaining</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-2xl font-bold">{timeLeft.days}</div>
                <div className="text-xs text-muted-foreground">Days</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{timeLeft.hours}</div>
                <div className="text-xs text-muted-foreground">Hours</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{timeLeft.minutes}</div>
                <div className="text-xs text-muted-foreground">Min</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{timeLeft.seconds}</div>
                <div className="text-xs text-muted-foreground">Sec</div>
              </div>
            </div>
          </div>
        )}

        {/* Current Price */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Start Price</span>
            <span className="font-medium">{formatCurrency(lot.starting_price)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Current Price</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(optimisticPrice)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Min Increment</span>
            <span className="font-medium">{formatCurrency(getMinIncrement())}</span>
          </div>
        </div>

        {/* Bid Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Bid Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              N$
            </span>
            <Input
              type="number"
              placeholder={minBid.toString()}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="pl-10"
              disabled={isLoading || !canBid}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum bid: {formatCurrency(minBid)}
          </p>
        </div>

        {/* Quick Bid Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {quickBidAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => setBidAmount(amount.toString())}
              disabled={isLoading || !canBid}
            >
              {formatCurrency(amount)}
            </Button>
          ))}
        </div>

        {/* Pre-Bid Button - Visible to all */}
        <Button
          className="w-full"
          size="lg"
          onClick={handlePreBid}
          disabled={isLoading || (isAuthenticated && !canBid)}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing Pre-Bid...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              {isAuthenticated ? 'Place Pre-Bid' : 'Pre-Bid Now'}
            </>
          )}
        </Button>

        {/* Show sign in prompt for non-authenticated users */}
        {!isAuthenticated && (
          <p className="text-xs text-center text-muted-foreground">
            {hasVisitedBefore 
              ? 'Sign in to place your pre-bid' 
              : 'Sign up to place your pre-bid'}
          </p>
        )}

        {/* Bid Count */}
        <div className="text-center text-sm text-muted-foreground">
          {lot.bid_count} {lot.bid_count === 1 ? 'bid' : 'bids'} placed
        </div>
      </CardContent>
    </Card>
  );
}