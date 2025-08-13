'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WatchlistButtonProps {
  lotId: string;
  className?: string;
}

export default function WatchlistButton({ lotId, className }: WatchlistButtonProps) {
  const [isWatched, setIsWatched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkWatchlistStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lotId]);

  const checkWatchlistStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('watchlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('lot_id', lotId)
      .single();

    setIsWatched(!!data);
  };

  const toggleWatchlist = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to add to watchlist');
        return;
      }

      if (isWatched) {
        const { error } = await supabase
          .from('watchlists')
          .delete()
          .eq('user_id', user.id)
          .eq('lot_id', lotId);

        if (error) throw error;
        
        setIsWatched(false);
        toast.success('Removed from watchlist');
      } else {
        const { error } = await supabase
          .from('watchlists')
          .insert({
            user_id: user.id,
            lot_id: lotId,
          });

        if (error) throw error;
        
        setIsWatched(true);
        toast.success('Added to watchlist');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update watchlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isWatched ? 'default' : 'outline'}
      size="sm"
      onClick={toggleWatchlist}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn(
            'h-4 w-4',
            isWatched && 'fill-current'
          )}
        />
      )}
      <span className="ml-2">
        {isWatched ? 'Watching' : 'Watch'}
      </span>
    </Button>
  );
}