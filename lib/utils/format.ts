import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { CURRENCY, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT } from '@/lib/constants';

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return `${CURRENCY} 0.00`;
  return `${CURRENCY} ${amount.toLocaleString('en-NA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, DATE_FORMAT);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, DATETIME_FORMAT);
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, TIME_FORMAT);
}

export function formatTimeAgo(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatMileage(mileage: number | null | undefined): string {
  if (mileage == null) return '0 km';
  return `${mileage.toLocaleString('en-NA')} km`;
}

export function formatLotNumber(lotNumber: string): string {
  return lotNumber.toUpperCase();
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}