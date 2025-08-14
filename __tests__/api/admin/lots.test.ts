import { GET, POST, PUT, DELETE } from '@/app/api/admin/lots/route';
import { NextRequest } from 'next/server';

// Mock the auth and supabase modules
jest.mock('@/lib/utils/auth', () => ({
  getUser: jest.fn(),
  getProfile: jest.fn(),
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: jest.fn(),
}));

describe('/api/admin/lots', () => {
  const mockUser = { id: 'user-123', email: 'admin@test.com' };
  const mockProfile = { id: 'user-123', role: 'admin' };
  
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { getUser, getProfile } = require('@/lib/utils/auth');
    const { createServerSupabaseClient } = require('@/lib/supabase/server');
    
    getUser.mockResolvedValue(mockUser);
    getProfile.mockResolvedValue(mockProfile);
    createServerSupabaseClient.mockResolvedValue(mockSupabase);
  });

  describe('GET /api/admin/lots', () => {
    it('returns lots for admin users', async () => {
      const mockLots = [
        { id: '1', lot_number: 'LOT001', state: 'live' },
        { id: '2', lot_number: 'LOT002', state: 'upcoming' },
      ];
      
      mockSupabase.order.mockResolvedValue({ data: mockLots, error: null });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockLots);
      expect(mockSupabase.from).toHaveBeenCalledWith('lots');
    });

    it('returns 401 for non-admin users', async () => {
      const { getProfile } = require('@/lib/utils/auth');
      getProfile.mockResolvedValue({ id: 'user-123', role: 'buyer' });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/admin/lots', () => {
    it('creates a new lot with car', async () => {
      const newLot = {
        lot_number: 'LOT003',
        make: 'Toyota',
        model: 'Corolla',
        year: 2022,
        starting_price: 200000,
        bid_increment: 5000,
      };

      const mockCar = { id: 'car-123', make: 'Toyota', model: 'Corolla' };
      const mockLotData = { id: 'lot-123', lot_number: 'LOT003', car_id: 'car-123' };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockCar, error: null })
        .mockResolvedValueOnce({ data: mockLotData, error: null });

      const request = new NextRequest('http://localhost:3000/api/admin/lots', {
        method: 'POST',
        body: JSON.stringify(newLot),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ...mockLotData, car: mockCar });
    });
  });

  describe('DELETE /api/admin/lots', () => {
    it('deletes a lot and associated car', async () => {
      mockSupabase.single.mockResolvedValue({ data: { car_id: 'car-123' }, error: null });
      mockSupabase.eq.mockReturnThis();

      const request = new NextRequest('http://localhost:3000/api/admin/lots?id=lot-123');
      
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockSupabase.delete).toHaveBeenCalledTimes(2); // Once for lot, once for car
    });

    it('returns 400 when lot ID is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/lots');
      
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Lot ID required');
    });
  });
});