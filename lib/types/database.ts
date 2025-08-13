export type UserRole = 'buyer' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned';
export type LotState = 'upcoming' | 'live' | 'ended';
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'void';
export type NotificationType = 'outbid' | 'ending_soon' | 'won' | 'system';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  last_login_at: string | null;
}

export interface Car {
  id: string;
  vin: string | null;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  body_type: string | null;
  fuel_type: string | null;
  transmission: string | null;
  engine: string | null;
  color: string | null;
  origin_market: string | null;
  specs: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Lot {
  id: string;
  lot_number: string;
  car_id: string;
  state: LotState;
  start_price: number | null;
  current_price: number | null;
  sold_price: number | null;
  start_at: string | null;
  end_at: string | null;
  auto_extend_minutes: number;
  bid_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  car?: Car;
  images?: LotImage[];
  bids?: Bid[];
}

export interface LotImage {
  id: string;
  car_id: string;
  file_path: string;
  is_thumbnail: boolean;
  display_order: number;
  created_at: string;
}

export interface Bid {
  id: string;
  lot_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
  fingerprint: string | null;
  bidder?: Profile;
}

export interface Watchlist {
  id: string;
  user_id: string;
  lot_id: string;
  created_at: string;
  lot?: Lot;
}

export interface CostSettings {
  id: string;
  effective_from: string;
  japan_transport: number;
  auction_fees: number;
  shipping_wvb: number;
  transport_whk: number;
  customs_clearance: number;
  doc_translation: number;
  custom_duty_pct: number;
  vat_pct: number;
  admin_fee_pct: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  lot_id: string;
  amount_due: number;
  currency: string;
  status: InvoiceStatus;
  issued_at: string | null;
  paid_at: string | null;
  due_date: string | null;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  user?: Profile;
  lot?: Lot;
}

export interface BidIncrementTier {
  id: string;
  upper_bound: number;
  increment: number;
  position: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  data: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  actor?: Profile;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      cars: {
        Row: Car;
        Insert: Omit<Car, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Car, 'id' | 'created_at' | 'updated_at'>>;
      };
      lots: {
        Row: Lot;
        Insert: Omit<Lot, 'id' | 'lot_number' | 'created_at' | 'updated_at' | 'bid_count'>;
        Update: Partial<Omit<Lot, 'id' | 'lot_number' | 'created_at' | 'updated_at'>>;
      };
      lot_images: {
        Row: LotImage;
        Insert: Omit<LotImage, 'id' | 'created_at'>;
        Update: Partial<Omit<LotImage, 'id' | 'created_at'>>;
      };
      bids: {
        Row: Bid;
        Insert: Omit<Bid, 'id' | 'created_at'>;
        Update: never;
      };
      watchlists: {
        Row: Watchlist;
        Insert: Omit<Watchlist, 'id' | 'created_at'>;
        Update: never;
      };
      cost_settings: {
        Row: CostSettings;
        Insert: Omit<CostSettings, 'id' | 'created_at'>;
        Update: Partial<Omit<CostSettings, 'id' | 'created_at'>>;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Invoice, 'id' | 'created_at' | 'updated_at'>>;
      };
      bid_increment_tiers: {
        Row: BidIncrementTier;
        Insert: Omit<BidIncrementTier, 'id' | 'created_at'>;
        Update: Partial<Omit<BidIncrementTier, 'id' | 'created_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Pick<Notification, 'read_at'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: never;
      };
    };
    Views: object;
    Functions: {
      is_admin: {
        Args: object;
        Returns: boolean;
      };
      is_user_active: {
        Args: object;
        Returns: boolean;
      };
      can_user_bid: {
        Args: {
          p_user_id: string;
          p_lot_id: string;
        };
        Returns: boolean;
      };
      generate_lot_number: {
        Args: object;
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
      lot_state: LotState;
      invoice_status: InvoiceStatus;
      notification_type: NotificationType;
    };
  };
}