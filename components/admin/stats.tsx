'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Car, DollarSign, TrendingUp } from 'lucide-react';

interface StatsProps {
  stats: {
    totalUsers: number;
    totalLots: number;
    activeLots: number;
    totalRevenue: number;
  };
}

export function AdminStats({ stats }: StatsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Total Lots',
      value: stats.totalLots.toLocaleString(),
      icon: Car,
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Active Lots',
      value: stats.activeLots.toLocaleString(),
      icon: TrendingUp,
      trend: '+15.3%',
      trendUp: true,
    },
    {
      title: 'Total Revenue',
      value: `¥${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: '+23.1%',
      trendUp: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className={card.trendUp ? 'text-green-500' : 'text-red-500'}>
                {card.trend}
              </span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}