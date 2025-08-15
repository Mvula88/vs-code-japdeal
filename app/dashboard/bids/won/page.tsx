'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Car, 
  Calendar, 
  DollarSign, 
  FileText, 
  Download,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WonBidsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pending-payment');

  const handlePayment = (lotId: string) => {
    toast({
      title: 'Redirecting to payment',
      description: 'You will be redirected to the payment page.',
    });
  };

  const handleDownloadInvoice = (lotId: string) => {
    toast({
      title: 'Invoice downloaded',
      description: 'Your invoice has been downloaded successfully.',
    });
  };

  const wonBids = {
    pendingPayment: [
      {
        id: 'WON001',
        lotNumber: 'LOT0023',
        vehicle: '2020 Toyota Land Cruiser',
        image: 'https://images.unsplash.com/photo-1550000000000-placeholder',
        wonDate: '2024-01-14',
        amount: 'N$285,000',
        paymentDue: '2024-01-21',
        status: 'payment-pending',
      },
      {
        id: 'WON002',
        lotNumber: 'LOT0045',
        vehicle: '2021 Nissan Patrol',
        image: 'https://images.unsplash.com/photo-1560000000000-placeholder',
        wonDate: '2024-01-12',
        amount: 'N$265,000',
        paymentDue: '2024-01-19',
        status: 'payment-pending',
      },
    ],
    paid: [
      {
        id: 'WON003',
        lotNumber: 'LOT0015',
        vehicle: '2019 Toyota Hilux',
        image: 'https://images.unsplash.com/photo-1570000000000-placeholder',
        wonDate: '2024-01-10',
        amount: 'N$185,000',
        paidDate: '2024-01-11',
        status: 'shipping',
        trackingNumber: 'NAM-SHIP-2024-0145',
      },
      {
        id: 'WON004',
        lotNumber: 'LOT0008',
        vehicle: '2022 Mazda CX-5',
        image: 'https://images.unsplash.com/photo-1580000000000-placeholder',
        wonDate: '2024-01-05',
        amount: 'N$225,000',
        paidDate: '2024-01-06',
        status: 'delivered',
        deliveredDate: '2024-01-13',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Won Auctions</h1>
          <p className="text-muted-foreground">
            Manage your winning bids and track delivery
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Card className="px-4 py-2">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Total Won</p>
                <p className="text-xl font-bold">4</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Total: N$550,000
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Shipping</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Arriving soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N$960,000</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending-payment">Pending Payment</TabsTrigger>
          <TabsTrigger value="paid">Paid & Shipping</TabsTrigger>
          <TabsTrigger value="all">All Won Bids</TabsTrigger>
        </TabsList>

        <TabsContent value="pending-payment" className="space-y-4">
          {wonBids.pendingPayment.map((bid) => (
            <Card key={bid.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-32 bg-muted rounded-lg flex items-center justify-center">
                    <Car className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{bid.vehicle}</h3>
                          <p className="text-sm text-muted-foreground">
                            Lot #{bid.lotNumber} • Won on {bid.wonDate}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-orange-600">
                          <Clock className="mr-1 h-3 w-3" />
                          Payment Pending
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Winning Bid</p>
                        <p className="text-xl font-bold">{bid.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Due</p>
                        <p className="font-medium">{bid.paymentDue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time Remaining</p>
                        <p className="font-medium text-orange-600">5 days</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex space-x-2">
                        <Button onClick={() => handlePayment(bid.id)}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Make Payment
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleDownloadInvoice(bid.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Invoice
                        </Button>
                      </div>
                      <Button variant="ghost">View Details</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {wonBids.pendingPayment.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending payments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          {wonBids.paid.map((bid) => (
            <Card key={bid.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-32 bg-muted rounded-lg flex items-center justify-center">
                    <Car className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{bid.vehicle}</h3>
                          <p className="text-sm text-muted-foreground">
                            Lot #{bid.lotNumber} • Paid on {bid.paidDate}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={bid.status === 'delivered' ? 'text-green-600' : 'text-blue-600'}
                        >
                          {bid.status === 'shipping' && (
                            <>
                              <Truck className="mr-1 h-3 w-3" />
                              In Transit
                            </>
                          )}
                          {bid.status === 'delivered' && (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Delivered
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount Paid</p>
                        <p className="text-xl font-bold">{bid.amount}</p>
                      </div>
                      {bid.trackingNumber && (
                        <div>
                          <p className="text-sm text-muted-foreground">Tracking Number</p>
                          <p className="font-medium">{bid.trackingNumber}</p>
                        </div>
                      )}
                      {bid.deliveredDate && (
                        <div>
                          <p className="text-sm text-muted-foreground">Delivered On</p>
                          <p className="font-medium">{bid.deliveredDate}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex space-x-2">
                        {bid.status === 'shipping' && (
                          <Button variant="outline">
                            <Truck className="mr-2 h-4 w-4" />
                            Track Shipment
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          onClick={() => handleDownloadInvoice(bid.id)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Documents
                        </Button>
                      </div>
                      <Button variant="ghost">View Details</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {[...wonBids.pendingPayment, ...wonBids.paid].map((bid) => (
            <Card key={bid.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Car className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{bid.vehicle}</h3>
                      <p className="text-sm text-muted-foreground">
                        Lot #{bid.lotNumber} • {bid.amount}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {bid.status === 'payment-pending' && 'Payment Pending'}
                    {bid.status === 'shipping' && 'Shipping'}
                    {bid.status === 'delivered' && 'Delivered'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}