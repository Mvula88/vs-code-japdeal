'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Filter, Download, Eye, Ban, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminBidsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const handleApproveBid = (bidId: string) => {
    toast({
      title: 'Bid approved',
      description: `Bid #${bidId} has been approved successfully.`,
    });
  };

  const handleRejectBid = (bidId: string) => {
    toast({
      title: 'Bid rejected',
      description: `Bid #${bidId} has been rejected.`,
      variant: 'destructive',
    });
  };

  const bids = [
    {
      id: 'BID001',
      lotNumber: 'LOT0001',
      vehicle: '2020 Toyota Land Cruiser',
      bidder: 'john.doe@email.com',
      amount: 'N$185,000',
      timestamp: '2024-01-15 14:23:45',
      status: 'active',
    },
    {
      id: 'BID002',
      lotNumber: 'LOT0001',
      vehicle: '2020 Toyota Land Cruiser',
      bidder: 'jane.smith@email.com',
      amount: 'N$180,000',
      timestamp: '2024-01-15 14:20:12',
      status: 'outbid',
    },
    {
      id: 'BID003',
      lotNumber: 'LOT0002',
      vehicle: '2019 Nissan Patrol',
      bidder: 'mike.wilson@email.com',
      amount: 'N$165,000',
      timestamp: '2024-01-15 13:45:30',
      status: 'active',
    },
    {
      id: 'BID004',
      lotNumber: 'LOT0003',
      vehicle: '2021 Toyota Hilux',
      bidder: 'sarah.jones@email.com',
      amount: 'N$145,000',
      timestamp: '2024-01-15 12:30:00',
      status: 'active',
    },
    {
      id: 'BID005',
      lotNumber: 'LOT0002',
      vehicle: '2019 Nissan Patrol',
      bidder: 'david.brown@email.com',
      amount: 'N$160,000',
      timestamp: '2024-01-15 11:15:22',
      status: 'outbid',
    },
    {
      id: 'BID006',
      lotNumber: 'LOT0004',
      vehicle: '2022 Mazda CX-5',
      bidder: 'emily.davis@email.com',
      amount: 'N$125,000',
      timestamp: '2024-01-15 10:45:18',
      status: 'won',
    },
    {
      id: 'BID007',
      lotNumber: 'LOT0005',
      vehicle: '2020 Honda CR-V',
      bidder: 'robert.taylor@email.com',
      amount: 'N$135,000',
      timestamp: '2024-01-15 09:30:45',
      status: 'active',
    },
    {
      id: 'BID008',
      lotNumber: 'LOT0003',
      vehicle: '2021 Toyota Hilux',
      bidder: 'lisa.anderson@email.com',
      amount: 'N$140,000',
      timestamp: '2024-01-15 08:20:10',
      status: 'outbid',
    },
  ];

  const filteredBids = bids.filter(bid => 
    bid.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bid.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bid.bidder.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bid.lotNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bid Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage all auction bids
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Bids
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              Across 45 auctions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Bid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N$485,000</div>
            <p className="text-xs text-muted-foreground">
              2022 Land Cruiser VX
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Bid Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N$156,750</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bids</CardTitle>
          <CardDescription>
            View and manage all bid activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bids..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bid ID</TableHead>
                  <TableHead>Lot</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Bidder</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell className="font-medium">{bid.id}</TableCell>
                    <TableCell>{bid.lotNumber}</TableCell>
                    <TableCell>{bid.vehicle}</TableCell>
                    <TableCell>{bid.bidder}</TableCell>
                    <TableCell className="font-semibold">{bid.amount}</TableCell>
                    <TableCell>{bid.timestamp}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          bid.status === 'active' ? 'default' :
                          bid.status === 'won' ? 'default' :
                          bid.status === 'outbid' ? 'secondary' :
                          'outline'
                        }
                        className={
                          bid.status === 'won' ? 'bg-green-500' : ''
                        }
                      >
                        {bid.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {bid.status === 'active' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleApproveBid(bid.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleRejectBid(bid.id)}
                            >
                              <Ban className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}