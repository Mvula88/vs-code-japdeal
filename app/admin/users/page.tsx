import { createServerSupabaseClient } from '@/lib/supabase/server';
import { UsersDataTable } from '@/components/admin/users/data-table';
import { Button } from '@/components/ui/button';
import { UserPlus, Download } from 'lucide-react';
import Link from 'next/link';

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      *,
      lots:lots(count),
      bids:bids(count)
    `)
    .order('created_at', { ascending: false });

  const stats = {
    total: users?.length || 0,
    active: users?.filter(u => u.status === 'active').length || 0,
    verified: users?.filter(u => u.is_verified).length || 0,
    admins: users?.filter(u => u.role === 'admin').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Users
          </Button>
          <Button asChild>
            <Link href="/admin/users/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium text-muted-foreground">Active</p>
          <p className="text-2xl font-bold">{stats.active}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium text-muted-foreground">Verified</p>
          <p className="text-2xl font-bold">{stats.verified}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium text-muted-foreground">Admins</p>
          <p className="text-2xl font-bold">{stats.admins}</p>
        </div>
      </div>

      <UsersDataTable users={users || []} />
    </div>
  );
}