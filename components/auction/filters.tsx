'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Search, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AuctionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [carMakes, setCarMakes] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingMakes, setIsLoadingMakes] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    make: '',
    model: '',
    yearMin: '',
    yearMax: '',
  });

  // Fetch car makes on mount
  useEffect(() => {
    const fetchCarMakes = async () => {
      setIsLoadingMakes(true);
      const { data, error } = await supabase
        .from('car_makes')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (!error && data) {
        setCarMakes(data);
      }
      setIsLoadingMakes(false);
    };

    fetchCarMakes();
  }, [supabase]);

  // Initialize filters from searchParams and count active filters
  useEffect(() => {
    if (searchParams) {
      const newFilters = {
        search: searchParams.get('search') || '',
        make: searchParams.get('make') || '',
        model: searchParams.get('model') || '',
        yearMin: searchParams.get('yearMin') || '',
        yearMax: searchParams.get('yearMax') || '',
      };
      setFilters(newFilters);
      
      // Count active filters
      const count = Object.values(newFilters).filter(value => value !== '').length;
      setActiveFiltersCount(count);
    }
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      make: '',
      model: '',
      yearMin: '',
      yearMax: '',
    });
    router.push(window.location.pathname);
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Auctions
          </h3>
          {activeFiltersCount > 0 && (
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </span>
          )}
        </div>

        <div className="space-y-4">
          {/* Search Bar - Full Width */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Quick search by make, model, or keyword..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 h-11"
            />
          </div>

          {/* Main Filter Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Make</Label>
              <Select
                value={filters.make || 'all'}
                onValueChange={(value) => setFilters({ ...filters, make: value === 'all' ? '' : value })}
                disabled={isLoadingMakes}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={isLoadingMakes ? "Loading..." : "Select make"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {carMakes.map((make) => (
                    <SelectItem key={make.id} value={make.name}>
                      {make.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Model</Label>
              <Input
                placeholder="e.g., Corolla"
                value={filters.model}
                onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Year From</Label>
              <Input
                type="number"
                placeholder="2010"
                value={filters.yearMin}
                onChange={(e) => setFilters({ ...filters, yearMin: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Year To</Label>
              <Input
                type="number"
                placeholder="2024"
                value={filters.yearMax}
                onChange={(e) => setFilters({ ...filters, yearMax: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="col-span-2 lg:col-span-2 flex items-end gap-3">
              <Button onClick={applyFilters} className="flex-1 h-9">
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="outline" className="flex-1 h-9">
                <X className="mr-2 h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}