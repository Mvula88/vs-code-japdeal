'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  Heart, 
  FileText, 
  Bell, 
  User,
  Trophy,
  Clock
} from 'lucide-react';

const navItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: User,
  },
  {
    title: 'Active Bids',
    href: '/dashboard/bids/active',
    icon: TrendingUp,
  },
  {
    title: 'Won Auctions',
    href: '/dashboard/bids/won',
    icon: Trophy,
  },
  {
    title: 'Lost Auctions',
    href: '/dashboard/bids/lost',
    icon: Clock,
  },
  {
    title: 'Watchlist',
    href: '/dashboard/watchlist',
    icon: Heart,
  },
  {
    title: 'Invoices',
    href: '/dashboard/invoices',
    icon: FileText,
  },
  {
    title: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
  },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <Card className="p-4">
      <h2 className="font-semibold mb-4">Dashboard Menu</h2>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}