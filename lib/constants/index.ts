export const CURRENCY = 'N$';
export const TIMEZONE = 'Africa/Windhoek';
export const DATE_FORMAT = 'dd MMM yyyy';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'dd MMM yyyy HH:mm';

export const LOT_STATES = {
  UPCOMING: 'upcoming',
  LIVE: 'live',
  ENDED: 'ended',
} as const;

export const USER_ROLES = {
  BUYER: 'buyer',
  ADMIN: 'admin',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
} as const;

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  PAID: 'paid',
  VOID: 'void',
} as const;

export const NOTIFICATION_TYPES = {
  OUTBID: 'outbid',
  ENDING_SOON: 'ending_soon',
  WON: 'won',
  SYSTEM: 'system',
} as const;

export const FUEL_TYPES = [
  'Petrol',
  'Diesel',
  'Hybrid',
  'Electric',
  'Plug-in Hybrid',
  'LPG',
] as const;

export const TRANSMISSION_TYPES = [
  'Manual',
  'Automatic',
  'CVT',
  'Semi-Automatic',
  'Dual-Clutch',
] as const;

export const BODY_TYPES = [
  'Sedan',
  'SUV',
  'Hatchback',
  'Coupe',
  'Wagon',
  'Van',
  'Pickup',
  'Convertible',
  'Minivan',
  'Sports Car',
] as const;

export const ROUTES = {
  HOME: '/',
  AUTH: {
    SIGN_IN: '/auth/sign-in',
    SIGN_UP: '/auth/sign-up',
    RESET_PASSWORD: '/auth/reset-password',
  },
  AUCTIONS: {
    LIVE: '/auctions/live',
    UPCOMING: '/auctions/upcoming',
    ENDED: '/auctions/ended',
  },
  LOT: (lotNumber: string) => `/lot/${lotNumber}`,
  DASHBOARD: '/dashboard',
  ADMIN: {
    BASE: '/admin',
    LOTS: '/admin/lots',
    USERS: '/admin/users',
    COSTS: '/admin/costs',
    ANALYTICS: '/admin/analytics',
    INVOICES: '/admin/invoices',
    SETTINGS: '/admin/settings',
  },
} as const;