'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatTimeAgo } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';
import { Bid } from '@/lib/types/database';
import { TrendingUp, User } from 'lucide-react';

interface BidHistoryProps {
  lotId: string;
  initialBids: Bid[];
}

export default function BidHistory({ lotId, initialBids }: BidHistoryProps) {
  const [bids, setBids] = useState<Bid[]>(initialBids);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`bids-${lotId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `lot_id=eq.${lotId}`,
        },
        async (payload: any) => {
          const { data: newBid } = await supabase
            .from('bids')
            .select('*, bidder:profiles(display_name)')
            .eq('id', payload.new.id)
            .single();
          
          if (newBid) {
            setBids((prev) => [newBid, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lotId, supabase]);

  if (bids.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Bid History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No bids placed yet. Be the first to bid!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Bid History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {bids.map((bid, index) => (
              <div
                key={bid.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {bid.bidder?.display_name || 'Anonymous'}
                      {index === 0 && (
                        <Badge variant="default" className="ml-2 h-5">
                          Highest
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(bid.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(bid.amount)}</p>
                  {index > 0 && (
                    <p className="text-xs text-muted-foreground">
                      +{formatCurrency(bid.amount - bids[index - 1].amount)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}