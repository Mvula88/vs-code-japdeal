'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Calendar,
  Download,
  Activity
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track performance and gain insights
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N$845,231</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpIcon className="inline h-3 w-3 text-green-600" />
              <span className="text-green-600">+20.1%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpIcon className="inline h-3 w-3 text-green-600" />
              <span className="text-green-600">+180</span> new this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Auctions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpIcon className="inline h-3 w-3 text-green-600" />
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.3%</div>
            <p className="text-xs text-muted-foreground">
              <ArrowDownIcon className="inline h-3 w-3 text-red-600" />
              <span className="text-red-600">-2.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="auctions">Auctions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue trends for the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {/* Chart placeholder */}
                <Activity className="h-12 w-12" />
                <span className="ml-2">Revenue chart visualization</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Categories</CardTitle>
                <CardDescription>
                  Vehicle categories by auction volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'SUVs', count: 234, revenue: 'N$324,500' },
                    { category: 'Sedans', count: 189, revenue: 'N$267,300' },
                    { category: 'Pickups', count: 156, revenue: 'N$198,700' },
                    { category: 'Hatchbacks', count: 98, revenue: 'N$54,200' },
                  ].map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-muted-foreground">{item.count} auctions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest platform activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'New user registered', user: 'john.doe@email.com', time: '2 min ago' },
                    { action: 'Auction won', user: 'jane.smith@email.com', time: '15 min ago' },
                    { action: 'Bid placed', user: 'mike.wilson@email.com', time: '1 hour ago' },
                    { action: 'Payment received', user: 'sarah.jones@email.com', time: '2 hours ago' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>
                Detailed revenue analysis by source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Buyer Premium</p>
                    <p className="text-2xl font-bold">N$423,100</p>
                    <p className="text-xs text-muted-foreground">50% of total revenue</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Seller Commission</p>
                    <p className="text-2xl font-bold">N$338,480</p>
                    <p className="text-xs text-muted-foreground">40% of total revenue</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Listing Fees</p>
                    <p className="text-2xl font-bold">N$83,651</p>
                    <p className="text-xs text-muted-foreground">10% of total revenue</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>
                User growth and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">New Registrations</p>
                  <p className="text-2xl font-bold">324</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Active Bidders</p>
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Repeat Buyers</p>
                  <p className="text-2xl font-bold">456</p>
                  <p className="text-xs text-muted-foreground">19.4% of total</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Avg. Session Duration</p>
                  <p className="text-2xl font-bold">12:34</p>
                  <p className="text-xs text-muted-foreground">Minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auctions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auction Performance</CardTitle>
              <CardDescription>
                Key metrics for auction activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Live Auctions</p>
                  <p className="text-2xl font-bold">42</p>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Avg. Bids per Auction</p>
                  <p className="text-2xl font-bold">18.5</p>
                  <p className="text-xs text-muted-foreground">+3.2 from last month</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Avg. Final Price</p>
                  <p className="text-2xl font-bold">N$147,500</p>
                  <p className="text-xs text-muted-foreground">+8% from starting</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Success Rate</p>
                  <p className="text-2xl font-bold">87.3%</p>
                  <p className="text-xs text-muted-foreground">Auctions with bids</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}