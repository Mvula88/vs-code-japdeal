'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function AuctionSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    enableBuyNow: false,
    reservePrice: false,
    autoExtend: true,
    minBidIncrement: 100,
    maxBidAmount: 1000000,
    extensionTime: 5,
    defaultDuration: 7,
    customDuration: 14,
    buyerFee: 5,
    sellerFee: 10,
    listingFee: 50,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enableBuyNow: settings.enableBuyNow,
          reservePrice: settings.reservePrice,
          autoExtend: settings.autoExtend,
          minBidIncrement: settings.minBidIncrement,
          maxBidAmount: settings.maxBidAmount,
          extensionTime: settings.extensionTime,
          defaultDuration: settings.defaultDuration,
          customDuration: settings.customDuration,
          buyerFee: settings.buyerFee,
          sellerFee: settings.sellerFee,
          listingFee: settings.listingFee,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      toast({
        title: 'Settings saved',
        description: 'Your auction settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
            <Switch 
              checked={settings.enableBuyNow}
              onCheckedChange={(checked) => setSettings({ ...settings, enableBuyNow: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reserve Price</Label>
              <p className="text-sm text-muted-foreground">
                Allow sellers to set minimum acceptable prices
              </p>
            </div>
            <Switch 
              checked={settings.reservePrice}
              onCheckedChange={(checked) => setSettings({ ...settings, reservePrice: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-extend Auctions</Label>
              <p className="text-sm text-muted-foreground">
                Extend auction time if bids are placed near the end
              </p>
            </div>
            <Switch 
              checked={settings.autoExtend}
              onCheckedChange={(checked) => setSettings({ ...settings, autoExtend: checked })}
            />
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
            <Input 
              id="min-bid" 
              type="number" 
              value={settings.minBidIncrement}
              onChange={(e) => setSettings({ ...settings, minBidIncrement: parseInt(e.target.value) || 0 })}
              placeholder="100" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-bid">Maximum Bid Amount</Label>
            <Input 
              id="max-bid" 
              type="number" 
              value={settings.maxBidAmount}
              onChange={(e) => setSettings({ ...settings, maxBidAmount: parseInt(e.target.value) || 0 })}
              placeholder="1000000" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="extend-time">Extension Time (minutes)</Label>
            <Input 
              id="extend-time" 
              type="number" 
              value={settings.extensionTime}
              onChange={(e) => setSettings({ ...settings, extensionTime: parseInt(e.target.value) || 0 })}
              placeholder="5" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-duration">Default Auction Duration (days)</Label>
            <Input 
              id="default-duration" 
              type="number" 
              value={settings.defaultDuration}
              onChange={(e) => setSettings({ ...settings, defaultDuration: parseInt(e.target.value) || 0 })}
              placeholder="7" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-duration">Custom Auction Duration for Live Auctions (days)</Label>
            <Input 
              id="custom-duration" 
              type="number" 
              value={settings.customDuration}
              onChange={(e) => setSettings({ ...settings, customDuration: parseInt(e.target.value) || 0 })}
              placeholder="14" 
            />
            <p className="text-sm text-muted-foreground">
              Set the duration for live/current auctions when listing new vehicles
            </p>
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
            <Input 
              id="buyer-fee" 
              type="number" 
              value={settings.buyerFee}
              onChange={(e) => setSettings({ ...settings, buyerFee: parseFloat(e.target.value) || 0 })}
              placeholder="5" 
              step="0.1" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seller-fee">Seller Commission (%)</Label>
            <Input 
              id="seller-fee" 
              type="number" 
              value={settings.sellerFee}
              onChange={(e) => setSettings({ ...settings, sellerFee: parseFloat(e.target.value) || 0 })}
              placeholder="10" 
              step="0.1" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="listing-fee">Listing Fee</Label>
            <Input 
              id="listing-fee" 
              type="number" 
              value={settings.listingFee}
              onChange={(e) => setSettings({ ...settings, listingFee: parseInt(e.target.value) || 0 })}
              placeholder="50" 
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}