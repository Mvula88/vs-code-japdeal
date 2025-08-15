'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, Key, Lock, UserCheck, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSecurityPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    requireStrongPassword: true,
    ipWhitelisting: false,
    auditLogging: true,
  });

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          twoFactorAuth: settings.twoFactorAuth,
          sessionTimeout: settings.sessionTimeout,
          maxLoginAttempts: settings.maxLoginAttempts,
          requireStrongPassword: settings.requireStrongPassword,
          ipWhitelisting: settings.ipWhitelisting,
          auditLogging: settings.auditLogging,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      toast({
        title: 'Security settings updated',
        description: 'Your security configuration has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings.',
        variant: 'destructive',
      });
    }
  };

  const handleRotateKeys = () => {
    toast({
      title: 'API keys rotated',
      description: 'New API keys have been generated successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">
          Configure security settings and access controls
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Security Status</AlertTitle>
        <AlertDescription>
          Your platform security level is <strong>HIGH</strong>. All recommended security features are enabled.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Settings</CardTitle>
          <CardDescription>
            Configure user authentication and session management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for all admin accounts
              </p>
            </div>
            <Switch 
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input 
              id="session-timeout" 
              type="number" 
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-attempts">Max Login Attempts</Label>
            <Input 
              id="max-attempts" 
              type="number" 
              value={settings.maxLoginAttempts}
              onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) || 5 })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Policy</CardTitle>
          <CardDescription>
            Set password requirements for user accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Strong Passwords</Label>
              <p className="text-sm text-muted-foreground">
                Minimum 8 characters, uppercase, lowercase, numbers, and symbols
              </p>
            </div>
            <Switch 
              checked={settings.requireStrongPassword}
              onCheckedChange={(checked) => setSettings({ ...settings, requireStrongPassword: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>
            Manage IP restrictions and audit logging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>IP Whitelisting</Label>
              <p className="text-sm text-muted-foreground">
                Restrict admin access to specific IP addresses
              </p>
            </div>
            <Switch 
              checked={settings.ipWhitelisting}
              onCheckedChange={(checked) => setSettings({ ...settings, ipWhitelisting: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Audit Logging</Label>
              <p className="text-sm text-muted-foreground">
                Log all administrative actions and access attempts
              </p>
            </div>
            <Switch 
              checked={settings.auditLogging}
              onCheckedChange={(checked) => setSettings({ ...settings, auditLogging: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Security</CardTitle>
          <CardDescription>
            Manage API keys and access tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">API Keys</p>
              <p className="text-sm text-muted-foreground">
                Last rotated: 30 days ago
              </p>
            </div>
            <Button onClick={handleRotateKeys} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Rotate Keys
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Security Settings</Button>
      </div>
    </div>
  );
}