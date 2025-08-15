'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { FUEL_TYPES, TRANSMISSION_TYPES, BODY_TYPES } from '@/lib/constants';

export default function AuctionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    make: '',
    model: '',
    yearMin: '',
    yearMax: '',
    mileageMax: '',
    fuelType: '',
    transmission: '',
    bodyType: '',
    priceMin: '',
    priceMax: '',
  });

  // Initialize filters from searchParams after component mounts
  useEffect(() => {
    if (searchParams) {
      setFilters({
        search: searchParams.get('search') || '',
        make: searchParams.get('make') || '',
        model: searchParams.get('model') || '',
        yearMin: searchParams.get('yearMin') || '',
        yearMax: searchParams.get('yearMax') || '',
        mileageMax: searchParams.get('mileageMax') || '',
        fuelType: searchParams.get('fuelType') || '',
        transmission: searchParams.get('transmission') || '',
        bodyType: searchParams.get('bodyType') || '',
        priceMin: searchParams.get('priceMin') || '',
        priceMax: searchParams.get('priceMax') || '',
      });
    }
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      }
    });
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      make: '',
      model: '',
      yearMin: '',
      yearMax: '',
      mileageMax: '',
      fuelType: '',
      transmission: '',
      bodyType: '',
      priceMin: '',
      priceMax: '',
    });
    router.push(window.location.pathname);
    setIsOpen(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by make, model..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Input
            id="make"
            placeholder="Toyota, Honda..."
            value={filters.make}
            onChange={(e) => setFilters({ ...filters, make: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            placeholder="Corolla, Civic..."
            value={filters.model}
            onChange={(e) => setFilters({ ...filters, model: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="yearMin">Year From</Label>
          <Input
            id="yearMin"
            type="number"
            placeholder="2010"
            value={filters.yearMin}
            onChange={(e) => setFilters({ ...filters, yearMin: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearMax">Year To</Label>
          <Input
            id="yearMax"
            type="number"
            placeholder="2024"
            value={filters.yearMax}
            onChange={(e) => setFilters({ ...filters, yearMax: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mileageMax">Max Mileage (km)</Label>
        <Input
          id="mileageMax"
          type="number"
          placeholder="100000"
          value={filters.mileageMax}
          onChange={(e) => setFilters({ ...filters, mileageMax: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fuelType">Fuel Type</Label>
        <Select value={filters.fuelType || 'all'} onValueChange={(value) => setFilters({ ...filters, fuelType: value === 'all' ? '' : value })}>
          <SelectTrigger id="fuelType">
            <SelectValue placeholder="Select fuel type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {FUEL_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transmission">Transmission</Label>
        <Select value={filters.transmission || 'all'} onValueChange={(value) => setFilters({ ...filters, transmission: value === 'all' ? '' : value })}>
          <SelectTrigger id="transmission">
            <SelectValue placeholder="Select transmission" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {TRANSMISSION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bodyType">Body Type</Label>
        <Select value={filters.bodyType || 'all'} onValueChange={(value) => setFilters({ ...filters, bodyType: value === 'all' ? '' : value })}>
          <SelectTrigger id="bodyType">
            <SelectValue placeholder="Select body type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {BODY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priceMin">Min Price (N$)</Label>
          <Input
            id="priceMin"
            type="number"
            placeholder="0"
            value={filters.priceMin}
            onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceMax">Max Price (N$)</Label>
          <Input
            id="priceMax"
            type="number"
            placeholder="500000"
            value={filters.priceMax}
            onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={applyFilters} className="flex-1">
          Apply Filters
        </Button>
        <Button onClick={clearFilters} variant="outline" className="flex-1">
          Clear All
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Auctions</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter */}
      <div className="hidden lg:block">
        <div className="sticky top-4">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Filters</h3>
            <FilterContent />
          </div>
        </div>
      </div>
    </>
  );
}