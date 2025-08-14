import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  Users, 
  Car, 
  DollarSign, 
  TrendingUp,
  Activity,
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { AdminStats } from '@/components/admin/stats';
import { RecentActivity } from '@/components/admin/recent-activity';
import { QuickActions } from '@/components/admin/quick-actions';

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();
  
  const [
    { count: totalUsers },
    { count: totalLots },
    { count: activeLots },
    { data: recentBids }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('lots').select('*', { count: 'exact', head: true }),
    supabase.from('lots').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase
      .from('bids')
      .select('*, lots(title), profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  const stats = {
    totalUsers: totalUsers || 0,
    totalLots: totalLots || 0,
    activeLots: activeLots || 0,
    totalRevenue: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your auction platform and monitor activity
        </p>
      </div>

      <AdminStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity activities={recentBids || []} />
        <QuickActions />
      </div>
    </div>
  );
}