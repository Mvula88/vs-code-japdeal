'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeLot(lotId: string) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const lotChannel = supabase
      .channel(`lot:${lotId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lots',
          filter: `id=eq.${lotId}`,
        },
        (payload) => {
          console.log('Lot update:', payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `lot_id=eq.${lotId}`,
        },
        (payload) => {
          console.log('New bid:', payload);
        }
      )
      .subscribe();

    setChannel(lotChannel);

    return () => {
      if (lotChannel) {
        supabase.removeChannel(lotChannel);
      }
    };
  }, [lotId, supabase]);

  return channel;
}

export function useCountdown(endTime: string | null) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          total: difference,
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return timeLeft;
}