import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function LiveTestPage() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Simple query
    const { data: lots, error } = await supabase
      .from('lots')
      .select('*')
      .eq('state', 'live');

    if (error) {
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Error Loading Lots</h1>
          <pre className="bg-red-50 p-4 rounded">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Live Auctions Test Page</h1>
        <p className="mb-4">Found {lots?.length || 0} live lots</p>
        
        <div className="space-y-4">
          {lots?.map((lot) => (
            <div key={lot.id} className="p-4 border rounded">
              <h3 className="font-semibold">{lot.lot_number}</h3>
              <p>State: {lot.state}</p>
              <p>Price: ${lot.current_price || lot.starting_price}</p>
            </div>
          ))}
        </div>

        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-gray-600">Debug Data</summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(lots, null, 2)}
          </pre>
        </details>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Unexpected Error</h1>
        <pre className="bg-red-50 p-4 rounded">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}