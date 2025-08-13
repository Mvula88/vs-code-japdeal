import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUser, getProfile } from '@/lib/utils/auth';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { TrendingUp, Trophy, Heart, FileText } from 'lucide-react';
import Link from 'next/link';

async function getDashboardData() {
  const user = await getUser();
  const profile = await getProfile();
  
  if (!user || !profile) {
    return null;
  }

  const supabase = await createServerSupabaseClient();

  // Get statistics
  const [activeBidsResult, wonBidsResult, watchlistResult, invoicesResult] = await Promise.all([
    // Active bids
    supabase
      .from('bids')
      .select(`
        *,
        lot:lots(*, car:cars(*))
      `)
      .eq('bidder_id', user.id)
      .eq('lot.state', 'live')
      .order('created_at', { ascending: false }),

    // Won auctions
    supabase
      .from('bids')
      .select(`
        *,
        lot:lots(*, car:cars(*))
      `)
      .eq('bidder_id', user.id)
      .eq('lot.state', 'ended'),

    // Watchlist count
    supabase
      .from('watchlists')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id),

    // Recent invoices
    supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  // Process won auctions (where user has highest bid)
  const wonAuctions = [];
  if (wonBidsResult.data) {
    for (const bid of wonBidsResult.data) {
      // Check if this user has the highest bid for this lot
      const { data: highestBid } = await supabase
        .from('bids')
        .select('bidder_id')
        .eq('lot_id', bid.lot?.id)
        .order('amount', { ascending: false })
        .limit(1)
        .single();

      if (highestBid?.bidder_id === user.id) {
        wonAuctions.push(bid);
      }
    }
  }

  return {
    profile,
    activeBids: activeBidsResult.data || [],
    wonAuctions,
    watchlistCount: watchlistResult.count || 0,
    recentInvoices: invoicesResult.data || [],
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return <div>Loading...</div>;
  }

  const { profile, activeBids, wonAuctions, watchlistCount, recentInvoices } = data;

  // Calculate unique active lots
  const activeLots = Array.from(new Set(activeBids.map(b => b.lot?.id))).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile.display_name || profile.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLots}</div>
            <p className="text-xs text-muted-foreground">
              Currently bidding on {activeLots} {activeLots === 1 ? 'lot' : 'lots'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Auctions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wonAuctions.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully won auctions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{watchlistCount}</div>
            <p className="text-xs text-muted-foreground">
              Lots you're watching
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              Total invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Bids */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Active Bids</CardTitle>
          </CardHeader>
          <CardContent>
            {activeBids.length > 0 ? (
              <div className="space-y-4">
                {activeBids.slice(0, 3).map((bid) => (
                  <div key={bid.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {bid.lot?.car?.year} {bid.lot?.car?.make} {bid.lot?.car?.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your bid: {formatCurrency(bid.amount)}
                      </p>
                    </div>
                    <Link href={`/lot/${bid.lot?.lot_number}`}>
                      <Badge variant="outline">View</Badge>
                    </Link>
                  </div>
                ))}
                {activeBids.length > 3 && (
                  <Link 
                    href="/dashboard/bids/active" 
                    className="text-sm text-primary hover:underline"
                  >
                    View all active bids →
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No active bids</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInvoices.length > 0 ? (
              <div className="space-y-4">
                {recentInvoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.amount_due)}</p>
                      <Badge
                        variant={
                          invoice.status === 'paid' ? 'default' :
                          invoice.status === 'issued' ? 'secondary' :
                          'outline'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {recentInvoices.length > 3 && (
                  <Link 
                    href="/dashboard/invoices" 
                    className="text-sm text-primary hover:underline"
                  >
                    View all invoices →
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No invoices yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}