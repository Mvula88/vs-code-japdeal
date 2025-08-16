'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Search, X } from 'lucide-react';
import { FUEL_TYPES, TRANSMISSION_TYPES, BODY_TYPES } from '@/lib/constants';

export default function AuctionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

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

  // Initialize filters from searchParams and count active filters
  useEffect(() => {
    if (searchParams) {
      const newFilters = {
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
      {/* Search Bar */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">Quick Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="search"
            placeholder="Search by make, model, or keyword..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      {/* Vehicle Details Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Vehicle Details</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="make" className="text-sm">Make</Label>
            <Input
              id="make"
              placeholder="e.g., Toyota"
              value={filters.make}
              onChange={(e) => setFilters({ ...filters, make: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model" className="text-sm">Model</Label>
            <Input
              id="model"
              placeholder="e.g., Corolla"
              value={filters.model}
              onChange={(e) => setFilters({ ...filters, model: e.target.value })}
              className="h-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yearMin" className="text-sm">Year From</Label>
            <Input
              id="yearMin"
              type="number"
              placeholder="2010"
              value={filters.yearMin}
              onChange={(e) => setFilters({ ...filters, yearMin: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearMax" className="text-sm">Year To</Label>
            <Input
              id="yearMax"
              type="number"
              placeholder="2024"
              value={filters.yearMax}
              onChange={(e) => setFilters({ ...filters, yearMax: e.target.value })}
              className="h-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mileageMax" className="text-sm">Maximum Mileage</Label>
          <Input
            id="mileageMax"
            type="number"
            placeholder="100,000 km"
            value={filters.mileageMax}
            onChange={(e) => setFilters({ ...filters, mileageMax: e.target.value })}
            className="h-9"
          />
        </div>
      </div>

      {/* Vehicle Specifications */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Specifications</h4>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="fuelType" className="text-sm">Fuel Type</Label>
            <Select value={filters.fuelType || 'all'} onValueChange={(value) => setFilters({ ...filters, fuelType: value === 'all' ? '' : value })}>
              <SelectTrigger id="fuelType" className="h-9">
                <SelectValue placeholder="All Fuel Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fuel Types</SelectItem>
                {FUEL_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transmission" className="text-sm">Transmission</Label>
            <Select value={filters.transmission || 'all'} onValueChange={(value) => setFilters({ ...filters, transmission: value === 'all' ? '' : value })}>
              <SelectTrigger id="transmission" className="h-9">
                <SelectValue placeholder="All Transmissions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transmissions</SelectItem>
                {TRANSMISSION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyType" className="text-sm">Body Type</Label>
            <Select value={filters.bodyType || 'all'} onValueChange={(value) => setFilters({ ...filters, bodyType: value === 'all' ? '' : value })}>
              <SelectTrigger id="bodyType" className="h-9">
                <SelectValue placeholder="All Body Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Body Types</SelectItem>
                {BODY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Price Range</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priceMin" className="text-sm">Min (N$)</Label>
            <Input
              id="priceMin"
              type="number"
              placeholder="0"
              value={filters.priceMin}
              onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceMax" className="text-sm">Max (N$)</Label>
            <Input
              id="priceMax"
              type="number"
              placeholder="Any"
              value={filters.priceMax}
              onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
              className="h-9"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={applyFilters} className="flex-1">
          Apply Filters
        </Button>
        <Button onClick={clearFilters} variant="outline" className="flex-1">
          <X className="mr-2 h-4 w-4" />
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
            <Button variant="outline" className="w-full relative">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader className="pb-4 border-b">
              <SheetTitle className="flex items-center justify-between">
                Filter Auctions
                {activeFiltersCount > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    {activeFiltersCount} active
                  </span>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter - Horizontal Layout */}
      <div className="hidden lg:block">
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

            {/* Desktop Horizontal Filter Layout */}
            <div className="space-y-6">
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
              <div className="grid grid-cols-4 gap-4">
                {/* Row 1 */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Make</Label>
                  <Input
                    placeholder="e.g., Toyota"
                    value={filters.make}
                    onChange={(e) => setFilters({ ...filters, make: e.target.value })}
                    className="h-9"
                  />
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
              </div>

              <div className="grid grid-cols-4 gap-4">
                {/* Row 2 */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Fuel Type</Label>
                  <Select value={filters.fuelType || 'all'} onValueChange={(value) => setFilters({ ...filters, fuelType: value === 'all' ? '' : value })}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {FUEL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Transmission</Label>
                  <Select value={filters.transmission || 'all'} onValueChange={(value) => setFilters({ ...filters, transmission: value === 'all' ? '' : value })}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {TRANSMISSION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Body Type</Label>
                  <Select value={filters.bodyType || 'all'} onValueChange={(value) => setFilters({ ...filters, bodyType: value === 'all' ? '' : value })}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {BODY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Max Mileage (km)</Label>
                  <Input
                    type="number"
                    placeholder="100,000"
                    value={filters.mileageMax}
                    onChange={(e) => setFilters({ ...filters, mileageMax: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {/* Row 3 - Price Range and Actions */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Min Price (N$)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Max Price (N$)</Label>
                  <Input
                    type="number"
                    placeholder="Any"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="col-span-2 flex items-end gap-3">
                  <Button onClick={applyFilters} className="flex-1 h-9">
                    Apply Filters
                  </Button>
                  <Button onClick={clearFilters} variant="outline" className="flex-1 h-9">
                    <X className="mr-2 h-3.5 w-3.5" />
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}