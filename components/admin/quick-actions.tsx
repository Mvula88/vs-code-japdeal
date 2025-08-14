'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, UserPlus, Settings, FileText, Download } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      label: 'Add New Lot',
      icon: Plus,
      href: '/admin/lots/new',
      variant: 'default' as const,
    },
    {
      label: 'Import Lots',
      icon: Upload,
      href: '/admin/lots/import',
      variant: 'outline' as const,
    },
    {
      label: 'Add User',
      icon: UserPlus,
      href: '/admin/users/new',
      variant: 'outline' as const,
    },
    {
      label: 'System Settings',
      icon: Settings,
      href: '/admin/settings',
      variant: 'outline' as const,
    },
    {
      label: 'View Reports',
      icon: FileText,
      href: '/admin/reports',
      variant: 'outline' as const,
    },
    {
      label: 'Export Data',
      icon: Download,
      href: '/admin/export',
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              className="justify-start"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}