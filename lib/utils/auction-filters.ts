import { Lot } from '@/lib/types/database';

type LotWithCar = Lot & {
  car?: {
    make?: string;
    model?: string;
    year?: number;
    mileage?: number;
    fuel_type?: string | null;
    transmission?: string | null;
    body_type?: string | null;
    [key: string]: unknown;
  } | null;
};

export function applyAuctionFilters(
  lots: LotWithCar[],
  searchParams: { [key: string]: string | string[] | undefined }
) {
  let filteredData = lots;
  
  // Search filter (make, model, lot number)
  if (searchParams.search) {
    const search = String(searchParams.search).toLowerCase();
    filteredData = filteredData.filter(lot => 
      lot.car?.make?.toLowerCase().includes(search) ||
      lot.car?.model?.toLowerCase().includes(search) ||
      lot.lot_number?.toLowerCase().includes(search)
    );
  }
  
  // Make filter
  if (searchParams.make) {
    const make = String(searchParams.make).toLowerCase();
    filteredData = filteredData.filter(lot => 
      lot.car?.make?.toLowerCase() === make
    );
  }
  
  // Model filter
  if (searchParams.model) {
    const model = String(searchParams.model).toLowerCase();
    filteredData = filteredData.filter(lot => 
      lot.car?.model?.toLowerCase().includes(model)
    );
  }
  
  // Year filters
  if (searchParams.yearMin) {
    const yearMin = parseInt(String(searchParams.yearMin));
    filteredData = filteredData.filter(lot => 
      (lot.car?.year || 0) >= yearMin
    );
  }
  
  if (searchParams.yearMax) {
    const yearMax = parseInt(String(searchParams.yearMax));
    filteredData = filteredData.filter(lot => 
      (lot.car?.year || 0) <= yearMax
    );
  }
  
  // Mileage filter
  if (searchParams.mileageMax) {
    const mileageMax = parseInt(String(searchParams.mileageMax));
    filteredData = filteredData.filter(lot => 
      (lot.car?.mileage || 0) <= mileageMax
    );
  }
  
  // Fuel type filter
  if (searchParams.fuelType && searchParams.fuelType !== 'all') {
    const fuelType = String(searchParams.fuelType).toLowerCase();
    filteredData = filteredData.filter(lot => 
      lot.car?.fuel_type?.toLowerCase() === fuelType
    );
  }
  
  // Transmission filter
  if (searchParams.transmission && searchParams.transmission !== 'all') {
    const transmission = String(searchParams.transmission).toLowerCase();
    filteredData = filteredData.filter(lot => 
      lot.car?.transmission?.toLowerCase() === transmission
    );
  }
  
  // Body type filter
  if (searchParams.bodyType && searchParams.bodyType !== 'all') {
    const bodyType = String(searchParams.bodyType).toLowerCase();
    filteredData = filteredData.filter(lot => 
      lot.car?.body_type?.toLowerCase() === bodyType
    );
  }
  
  // Price filters
  if (searchParams.priceMin) {
    const minPrice = parseFloat(String(searchParams.priceMin));
    filteredData = filteredData.filter(lot => 
      (lot.current_price || lot.starting_price || 0) >= minPrice
    );
  }
  
  if (searchParams.priceMax) {
    const maxPrice = parseFloat(String(searchParams.priceMax));
    filteredData = filteredData.filter(lot => 
      (lot.current_price || lot.starting_price || 0) <= maxPrice
    );
  }

  return filteredData;
}