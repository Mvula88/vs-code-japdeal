'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Database, Download, Upload, RefreshCw, AlertCircle, CheckCircle, HardDrive, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminDatabasePage() {
  const { toast } = useToast();
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await fetch('/api/admin/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'backup' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Backup failed');
      }

      setBackupProgress(100);
      toast({
        title: 'Backup completed',
        description: 'Database backup has been created successfully.',
      });
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: 'Backup failed',
        description: error instanceof Error ? error.message : 'Failed to create backup.',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => {
        setIsBackingUp(false);
        setBackupProgress(0);
      }, 1000);
    }
  };

  const handleRestore = async () => {
    const confirmed = window.confirm('Are you sure you want to restore from backup? This will overwrite current data.');
    if (!confirmed) return;

    setIsRestoring(true);
    try {
      const response = await fetch('/api/admin/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'restore' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Restore failed');
      }

      toast({
        title: 'Restore initiated',
        description: 'Database restore is in progress. This may take a few minutes.',
      });
    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: 'Restore failed',
        description: error instanceof Error ? error.message : 'Failed to restore database.',
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/admin/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'optimize' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Optimization failed');
      }

      toast({
        title: 'Optimization completed',
        description: `Optimized ${data.details?.tablesOptimized || 0} tables, reclaimed ${data.details?.spaceReclaimed || '0MB'}.`,
      });
    } catch (error) {
      console.error('Optimization error:', error);
      toast({
        title: 'Optimization failed',
        description: error instanceof Error ? error.message : 'Failed to optimize database.',
        variant: 'destructive',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCheckIntegrity = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/admin/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'check-integrity' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Integrity check failed');
      }

      const hasIssues = data.overall !== 'healthy';
      toast({
        title: hasIssues ? 'Issues found' : 'Database healthy',
        description: hasIssues 
          ? 'Some tables have issues. Please review the results.'
          : 'All database tables passed integrity checks.',
        variant: hasIssues ? 'destructive' : 'default',
      });
    } catch (error) {
      console.error('Integrity check error:', error);
      toast({
        title: 'Check failed',
        description: error instanceof Error ? error.message : 'Failed to check database integrity.',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Database Management</h1>
        <p className="text-muted-foreground">
          Monitor and maintain your database
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2 GB</div>
            <p className="text-xs text-muted-foreground">
              +20% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231</div>
            <p className="text-xs text-muted-foreground">
              Across all tables
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Current active users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 days</div>
            <p className="text-xs text-muted-foreground">
              Automated backup
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Database Health</AlertTitle>
        <AlertDescription>
          Your database is healthy and performing optimally. No issues detected.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
          <CardDescription>
            Overview of database tables and their sizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'users', records: 12543, size: '245 MB', status: 'healthy' },
              { name: 'lots', records: 8921, size: '412 MB', status: 'healthy' },
              { name: 'bids', records: 15678, size: '189 MB', status: 'healthy' },
              { name: 'cars', records: 3456, size: '298 MB', status: 'healthy' },
              { name: 'transactions', records: 4632, size: '67 MB', status: 'healthy' },
            ].map((table) => (
              <div key={table.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{table.name}</p>
                    <p className="text-sm text-muted-foreground">{table.records.toLocaleString()} records</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">{table.size}</span>
                  <Badge variant="outline" className="text-green-600">
                    {table.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>
            Create backups and restore your database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isBackingUp && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Creating backup...</span>
                <span>{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} />
            </div>
          )}
          <div className="flex space-x-2">
            <Button onClick={handleBackup} disabled={isBackingUp}>
              <Download className="mr-2 h-4 w-4" />
              Create Backup
            </Button>
            <Button variant="outline" onClick={handleRestore} disabled={isRestoring}>
              <Upload className="mr-2 h-4 w-4" />
              {isRestoring ? 'Restoring...' : 'Restore from Backup'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance</CardTitle>
          <CardDescription>
            Optimize and maintain database performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={handleOptimize} variant="outline" disabled={isOptimizing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isOptimizing ? 'animate-spin' : ''}`} />
              {isOptimizing ? 'Optimizing...' : 'Optimize Database'}
            </Button>
            <Button variant="outline" onClick={handleCheckIntegrity} disabled={isChecking}>
              <AlertCircle className={`mr-2 h-4 w-4 ${isChecking ? 'animate-pulse' : ''}`} />
              {isChecking ? 'Checking...' : 'Check Integrity'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}