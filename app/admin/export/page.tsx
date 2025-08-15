'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  Download, 
  FileSpreadsheet,
  Database,
  Users,
  ShoppingCart,
  FileText,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminExportPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedData, setSelectedData] = useState({
    users: true,
    lots: true,
    bids: false,
    transactions: false,
    cars: true,
  });

  const handleExport = async () => {
    setExporting(true);
    setProgress(0);

    // Simulate export progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setExporting(false);
          toast({
            title: 'Export completed',
            description: 'Your data has been exported successfully.',
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const exportPresets = [
    {
      name: 'Full Database Backup',
      description: 'Export all data from the platform',
      icon: Database,
      action: () => {
        setSelectedData({
          users: true,
          lots: true,
          bids: true,
          transactions: true,
          cars: true,
        });
      },
    },
    {
      name: 'User Data Export',
      description: 'Export all user information and activity',
      icon: Users,
      action: () => {
        setSelectedData({
          users: true,
          lots: false,
          bids: false,
          transactions: false,
          cars: false,
        });
      },
    },
    {
      name: 'Auction Data Export',
      description: 'Export lots, bids, and vehicle information',
      icon: ShoppingCart,
      action: () => {
        setSelectedData({
          users: false,
          lots: true,
          bids: true,
          transactions: false,
          cars: true,
        });
      },
    },
    {
      name: 'Financial Export',
      description: 'Export transaction and payment data',
      icon: FileText,
      action: () => {
        setSelectedData({
          users: false,
          lots: false,
          bids: false,
          transactions: true,
          cars: false,
        });
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Export</h1>
        <p className="text-muted-foreground">
          Export platform data for backup or analysis
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {exportPresets.map((preset) => (
          <Card 
            key={preset.name} 
            className="cursor-pointer hover:border-primary"
            onClick={preset.action}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <preset.icon className="h-5 w-5 text-muted-foreground" />
                <Button variant="ghost" size="sm">
                  Select
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{preset.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {preset.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export Configuration</CardTitle>
            <CardDescription>
              Select data to include in the export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {Object.entries(selectedData).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox 
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => 
                      setSelectedData({ ...selectedData, [key]: checked as boolean })
                    }
                  />
                  <Label htmlFor={key} className="capitalize">
                    {key === 'cars' ? 'Vehicles' : key}
                  </Label>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>All time</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="sql">SQL Dump</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Summary</CardTitle>
            <CardDescription>
              Review your export configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data Types</span>
                <span className="font-medium">
                  {Object.values(selectedData).filter(Boolean).length} selected
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date Range</span>
                <span className="font-medium">
                  {dateRange.from ? 'Custom' : 'All time'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Size</span>
                <span className="font-medium">~25 MB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Time</span>
                <span className="font-medium">~2 minutes</span>
              </div>
            </div>

            {exporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Exporting...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleExport}
              disabled={exporting || !Object.values(selectedData).some(Boolean)}
            >
              <Download className="mr-2 h-4 w-4" />
              {exporting ? 'Exporting...' : 'Start Export'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
          <CardDescription>
            Previously exported files available for download
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: 'full_backup_2024_01_15.zip', date: '2024-01-15 14:30', size: '45.2 MB', type: 'Full Backup' },
              { name: 'users_export_2024_01_14.csv', date: '2024-01-14 09:15', size: '3.8 MB', type: 'Users' },
              { name: 'auction_data_2024_01_13.xlsx', date: '2024-01-13 16:45', size: '12.5 MB', type: 'Auctions' },
              { name: 'transactions_2024_01_12.csv', date: '2024-01-12 11:20', size: '8.3 MB', type: 'Financial' },
            ].map((file) => (
              <div key={file.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {file.name.endsWith('.zip') ? (
                    <Archive className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.type} • {file.date} • {file.size}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    toast({
                      title: 'Download started',
                      description: `Downloading ${file.name}`,
                    });
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}