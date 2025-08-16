'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Copy,
  Ban,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Lot {
  id: string;
  title: string;
  lot_number: string;
  status: string;
  start_date: string;
  end_date: string;
  starting_price: number;
  current_price: number;
  created_at: string;
  cars: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    engine_size: number;
  };
  bids: { count: number }[];
  profiles: {
    full_name: string;
    email: string;
  };
}

interface LotsDataTableProps {
  lots: Lot[];
}

export function LotsDataTable({ lots }: LotsDataTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const router = useRouter();

  const filteredLots = lots.filter((lot) => {
    const matchesSearch = 
      lot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.cars?.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.cars?.model?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lot.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lot?')) return;
    
    try {
      const response = await fetch(`/api/admin/lots/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Lot deleted successfully');
        router.refresh();
      } else {
        toast.error('Failed to delete lot');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/lots/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        router.refresh();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      active: 'default',
      ended: 'outline',
      cancelled: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search lots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Lot Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Bids</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No lots found
                </TableCell>
              </TableRow>
            ) : (
              filteredLots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{lot.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {lot.cars?.year} {lot.cars?.make} {lot.cars?.model}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lot.cars?.mileage?.toLocaleString()}km • {lot.cars?.engine_size}L
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(lot.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(new Date(lot.start_date), 'MMM d, yyyy')}</p>
                      <p className="text-muted-foreground">
                        to {format(new Date(lot.end_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">N${lot.current_price?.toLocaleString()}</p>
                      <p className="text-muted-foreground">
                        Start: N${lot.starting_price?.toLocaleString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {lot.bids?.[0]?.count || 0} bids
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{lot.profiles?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {lot.profiles?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/lot/${lot.lot_number}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Lot
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/lots/${lot.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(lot.id);
                            toast.success('ID copied to clipboard');
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {lot.status === 'active' ? (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(lot.id, 'ended')}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            End Auction
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(lot.id, 'active')}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(lot.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}