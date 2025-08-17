'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calculator, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { CostSettings } from '@/lib/types/database';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface CostBreakdownProps {
  costSettings: CostSettings | null;
  vehiclePrice?: number;
}

export default function CostBreakdown({ costSettings, vehiclePrice = 0 }: CostBreakdownProps) {
  const [customPrice, setCustomPrice] = useState(vehiclePrice.toString());
  const [breakdown, setBreakdown] = useState<{
    vehiclePrice: number;
    fixedCosts: number;
    customDuty: number;
    vat: number;
    adminFee: number;
    total: number;
  }>({
    vehiclePrice: 0,
    fixedCosts: 0,
    customDuty: 0,
    vat: 0,
    adminFee: 0,
    total: 0,
  });

  useEffect(() => {
    setCustomPrice(vehiclePrice.toString());
    calculateCosts(vehiclePrice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiclePrice, costSettings]);

  const calculateCosts = (price: number) => {
    if (!costSettings) return;

    const fixedCosts = 
      costSettings.japan_transport +
      costSettings.auction_fees +
      costSettings.shipping_wvb +
      costSettings.transport_whk +
      costSettings.customs_clearance +
      costSettings.doc_translation;

    const customDuty = (price * costSettings.custom_duty_pct) / 100;
    const vatBase = price + customDuty + fixedCosts;
    const vat = (vatBase * costSettings.vat_pct) / 100;
    const adminFee = (price * costSettings.admin_fee_pct) / 100;
    
    const total = price + fixedCosts + customDuty + vat + adminFee;

    setBreakdown({
      vehiclePrice: price,
      fixedCosts,
      customDuty,
      vat,
      adminFee,
      total,
    });
  };

  const handleCustomCalculation = () => {
    const price = parseFloat(customPrice) || 0;
    calculateCosts(price);
  };

  if (!costSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cost Estimate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cost settings not available. Contact support for assistance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Total Cost Estimate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Custom Price Input */}
        <div className="space-y-2">
          <Label htmlFor="customPrice">Enter Bid Amount</Label>
          <div className="flex gap-2">
            <Input
              id="customPrice"
              type="number"
              placeholder="Enter amount"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
            />
            <Button onClick={handleCustomCalculation}>Calculate</Button>
          </div>
        </div>

        <Separator />

        {/* Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Vehicle Price</span>
            <span className="font-semibold">{formatCurrency(breakdown.vehiclePrice)}</span>
          </div>

          <div className="space-y-2 pl-4 border-l-2 border-muted">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                Japan Transport
                <Popover>
                  <PopoverTrigger>
                    <Info className="h-3 w-3" />
                  </PopoverTrigger>
                  <PopoverContent className="text-sm">
                    Transportation costs within Japan to the auction house
                  </PopoverContent>
                </Popover>
              </span>
              <span>{formatCurrency(costSettings.japan_transport)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Auction Fees</span>
              <span>{formatCurrency(costSettings.auction_fees)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Shipping to Walvis Bay</span>
              <span>{formatCurrency(costSettings.shipping_wvb)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Transport to Windhoek</span>
              <span>{formatCurrency(costSettings.transport_whk)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Customs Clearance</span>
              <span>{formatCurrency(costSettings.customs_clearance)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Document Translation</span>
              <span>{formatCurrency(costSettings.doc_translation)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Fixed Costs Total</span>
            <span className="font-medium">{formatCurrency(breakdown.fixedCosts)}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-sm">
              Custom Duty ({costSettings.custom_duty_pct}%)
            </span>
            <span>{formatCurrency(breakdown.customDuty)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">
              VAT ({costSettings.vat_pct}%)
            </span>
            <span>{formatCurrency(breakdown.vat)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">
              Admin Fee ({costSettings.admin_fee_pct}%)
            </span>
            <span>{formatCurrency(breakdown.adminFee)}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-semibold">Estimated Total</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(breakdown.total)}
            </span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <p className="font-medium mb-1">Important Note:</p>
          <p>
            This is an estimate based on current rates. Final costs may vary depending on
            exchange rates, shipping conditions, and regulatory changes at the time of import.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}