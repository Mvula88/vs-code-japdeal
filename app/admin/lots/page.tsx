import { createServerSupabaseClient } from '@/lib/supabase/server';
import { LotsDataTable } from '@/components/admin/lots/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function AdminLotsPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: lots } = await supabase
    .from('lots')
    .select(`
      *,
      cars (
        make,
        model,
        year,
        mileage,
        engine_size
      ),
      bids (count),
      profiles (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lots Management</h1>
          <p className="text-muted-foreground">
            Manage all auction lots and their details
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/lots/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Lot
          </Link>
        </Button>
      </div>

      <LotsDataTable lots={lots || []} />
    </div>
  );
}