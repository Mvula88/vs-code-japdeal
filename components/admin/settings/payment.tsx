'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PaymentSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>
            Configure payment processing options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Stripe</h4>
                <p className="text-sm text-muted-foreground">
                  Accept credit cards and online payments
                </p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripe-key">Publishable Key</Label>
              <Input id="stripe-key" placeholder="pk_live_..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripe-secret">Secret Key</Label>
              <Input id="stripe-secret" type="password" placeholder="sk_live_..." />
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">PayPal</h4>
                <p className="text-sm text-muted-foreground">
                  Accept PayPal payments
                </p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paypal-client">Client ID</Label>
              <Input id="paypal-client" placeholder="AX..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paypal-secret">Client Secret</Label>
              <Input id="paypal-secret" type="password" placeholder="EK..." />
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Bank Transfer</h4>
                <p className="text-sm text-muted-foreground">
                  Accept direct bank transfers
                </p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input id="bank-name" placeholder="Bank of America" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input id="account-number" placeholder="XXXX-XXXX-XXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routing-number">Routing Number</Label>
              <Input id="routing-number" placeholder="XXXXXXXXX" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Rules</CardTitle>
          <CardDescription>
            Configure payment processing rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-deadline">Payment Deadline (days)</Label>
            <Input id="payment-deadline" type="number" placeholder="3" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-payment">Minimum Payment Amount</Label>
            <Input id="min-payment" type="number" placeholder="100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-currency">Default Currency</Label>
            <Select>
              <SelectTrigger id="default-currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD - US Dollar</SelectItem>
                <SelectItem value="eur">EUR - Euro</SelectItem>
                <SelectItem value="gbp">GBP - British Pound</SelectItem>
                <SelectItem value="jpy">JPY - Japanese Yen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Deposit</Label>
              <p className="text-sm text-muted-foreground">
                Require deposit before allowing bids
              </p>
            </div>
            <Switch />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Deposit Amount</Label>
            <Input id="deposit-amount" type="number" placeholder="500" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}