'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export function AuctionSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Auction Rules</CardTitle>
          <CardDescription>
            Configure auction behavior and rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Buy Now</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to purchase items immediately at a fixed price
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reserve Price</Label>
              <p className="text-sm text-muted-foreground">
                Allow sellers to set minimum acceptable prices
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-extend Auctions</Label>
              <p className="text-sm text-muted-foreground">
                Extend auction time if bids are placed near the end
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bidding Configuration</CardTitle>
          <CardDescription>
            Set bidding increments and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="min-bid">Minimum Bid Increment</Label>
            <Input id="min-bid" type="number" placeholder="100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-bid">Maximum Bid Amount</Label>
            <Input id="max-bid" type="number" placeholder="1000000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="extend-time">Extension Time (minutes)</Label>
            <Input id="extend-time" type="number" placeholder="5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-duration">Default Auction Duration (days)</Label>
            <Input id="default-duration" type="number" placeholder="7" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fees & Commissions</CardTitle>
          <CardDescription>
            Configure platform fees and seller commissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buyer-fee">Buyer Premium (%)</Label>
            <Input id="buyer-fee" type="number" placeholder="5" step="0.1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seller-fee">Seller Commission (%)</Label>
            <Input id="seller-fee" type="number" placeholder="10" step="0.1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="listing-fee">Listing Fee</Label>
            <Input id="listing-fee" type="number" placeholder="50" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}