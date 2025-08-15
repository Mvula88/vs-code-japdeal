import { createServerSupabaseClient } from '@/lib/supabase/server';
import { LotsDataTable } from '@/components/admin/lots/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface TransformedLot {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  starting_price: number;
  current_price: number;
  created_at: string;
  cars: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    engine_size: number;
  };
  bids: { count: number }[];
  profiles: {
    full_name: string;
    email: string;
  };
}

export default async function AdminLotsPage() {
  const supabase = await createServerSupabaseClient();
  
  let lots: TransformedLot[] = [];
  
  try {
    const { data } = await supabase
      .from('lots')
      .select(`
        id,
        lot_number,
        starting_price,
        current_price,
        sold_price,
        start_at,
        end_at,
        state,
        description,
        created_at,
        car:cars!car_id (
          make,
          model,
          year,
          mileage,
          engine
        )
      `)
      .order('created_at', { ascending: false });

    // Transform data to match expected structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lots = ((data as any[]) || []).map((lot) => ({
      id: lot.id,
      title: lot.lot_number,
      status: lot.state || 'draft',
      start_date: lot.start_at || lot.created_at,
      end_date: lot.end_at || lot.created_at,
      starting_price: lot.starting_price || 0,
      current_price: lot.current_price || lot.starting_price || 0,
      created_at: lot.created_at,
      cars: lot.car ? {
        make: lot.car.make,
        model: lot.car.model,
        year: lot.car.year,
        mileage: lot.car.mileage || 0,
        engine_size: parseFloat(lot.car.engine?.split('L')[0] || '0')
      } : {
        make: 'Unknown',
        model: 'Unknown',
        year: 0,
        mileage: 0,
        engine_size: 0
      },
      bids: [{ count: 0 }], // Default to 0 bids for now
      profiles: {
        full_name: 'Admin',
        email: 'admin@japdeal.com'
      }
    }));
  } catch (error) {
    console.error('Error fetching lots:', error);
    // Database tables might not exist yet
    lots = [];
  }

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

      {lots.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No lots found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first lot to get started with the auction platform.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Make sure to run the database migration script first:
            <code className="ml-2 px-2 py-1 bg-muted rounded">create-lots-tables.sql</code>
          </p>
          <Button asChild>
            <Link href="/admin/lots/new">
              <Plus className="mr-2 h-4 w-4" />
              Create First Lot
            </Link>
          </Button>
        </div>
      ) : (
        <LotsDataTable lots={lots} />
      )}
    </div>
  );
}