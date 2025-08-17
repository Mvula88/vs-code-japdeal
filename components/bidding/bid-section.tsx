'use client';

import { useState } from 'react';
import BidPanel from './bid-panel';
import CostBreakdown from './cost-breakdown';
import { Lot, BidIncrementTier, CostSettings } from '@/lib/types/database';

interface BidSectionProps {
  lot: Lot;
  bidIncrements: BidIncrementTier[];
  costSettings: CostSettings | null;
  isAuthenticated: boolean;
  canBid: boolean;
}

export default function BidSection({
  lot,
  bidIncrements,
  costSettings,
  isAuthenticated,
  canBid,
}: BidSectionProps) {
  const [bidAmount, setBidAmount] = useState(lot.current_price || lot.starting_price || 0);

  const handleBidAmountChange = (amount: number) => {
    setBidAmount(amount);
  };

  return (
    <>
      <BidPanel
        lot={lot}
        currentPrice={lot.current_price || lot.starting_price || 0}
        bidIncrements={bidIncrements}
        isAuthenticated={isAuthenticated}
        canBid={canBid}
        onBidAmountChange={handleBidAmountChange}
      />
      
      {/* Only show cost breakdown for live auctions */}
      {lot.state === 'live' && (
        <div className="mt-6">
          <CostBreakdown
            costSettings={costSettings}
            vehiclePrice={bidAmount}
          />
        </div>
      )}
    </>
  );
}