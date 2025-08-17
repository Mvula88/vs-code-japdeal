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
  const calculateTimeLeft = (endTimeStr: string | null) => {
    if (!endTimeStr) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: -1, // Use -1 to indicate no end time
      };
    }
    
    const difference = new Date(endTimeStr).getTime() - new Date().getTime();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
      };
    } else {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
      };
    }
  };

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>(() => calculateTimeLeft(endTime));

  useEffect(() => {
    if (!endTime) return;

    const updateTimeLeft = () => {
      setTimeLeft(calculateTimeLeft(endTime));
    };

    const timer = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return timeLeft;
}