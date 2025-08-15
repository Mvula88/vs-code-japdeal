'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, Send, Users, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const [emailSettings, setEmailSettings] = useState({
    welcomeEmail: true,
    bidConfirmation: true,
    auctionWon: true,
    auctionEnding: true,
    newsletter: false,
  });

  const handleSendNotification = () => {
    toast({
      title: 'Notification sent',
      description: 'Your notification has been sent to selected recipients.',
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: 'Settings saved',
      description: 'Notification settings have been updated successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Manage notifications and communication settings
        </p>
      </div>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Notification</CardTitle>
              <CardDescription>
                Send custom notifications to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipients</Label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    All Users
                  </Button>
                  <Button variant="outline" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Active Bidders
                  </Button>
                  <Button variant="outline" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Sellers
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Notification subject" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Enter your notification message here..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Notification Type</Label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bell className="mr-2 h-4 w-4" />
                    Push
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    SMS
                  </Button>
                </div>
              </div>

              <Button onClick={handleSendNotification}>
                <Send className="mr-2 h-4 w-4" />
                Send Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>
                Manage reusable notification templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Welcome Email', type: 'email', status: 'active', lastUsed: '2 days ago' },
                  { name: 'Bid Confirmation', type: 'email', status: 'active', lastUsed: '1 hour ago' },
                  { name: 'Auction Won', type: 'email', status: 'active', lastUsed: '3 hours ago' },
                  { name: 'Payment Reminder', type: 'email', status: 'active', lastUsed: '1 day ago' },
                  { name: 'Newsletter', type: 'email', status: 'draft', lastUsed: 'Never' },
                ].map((template) => (
                  <div key={template.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">Last used: {template.lastUsed}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                        {template.status}
                      </Badge>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4" variant="outline">
                Create New Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notification Settings</CardTitle>
              <CardDescription>
                Configure which emails are sent automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Welcome Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email when new users register
                  </p>
                </div>
                <Switch 
                  checked={emailSettings.welcomeEmail}
                  onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, welcomeEmail: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bid Confirmation</Label>
                  <p className="text-sm text-muted-foreground">
                    Confirm when users place bids
                  </p>
                </div>
                <Switch 
                  checked={emailSettings.bidConfirmation}
                  onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, bidConfirmation: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auction Won</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify winners when auction ends
                  </p>
                </div>
                <Switch 
                  checked={emailSettings.auctionWon}
                  onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, auctionWon: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auction Ending Soon</Label>
                  <p className="text-sm text-muted-foreground">
                    Remind users about ending auctions
                  </p>
                </div>
                <Switch 
                  checked={emailSettings.auctionEnding}
                  onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, auctionEnding: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Newsletter</Label>
                  <p className="text-sm text-muted-foreground">
                    Send periodic newsletters to subscribers
                  </p>
                </div>
                <Switch 
                  checked={emailSettings.newsletter}
                  onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, newsletter: checked })}
                />
              </div>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                Recent notifications sent to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { subject: 'New Auction Alert', type: 'email', recipients: 1234, sent: '2 hours ago', status: 'delivered' },
                  { subject: 'Bid Confirmation', type: 'push', recipients: 1, sent: '3 hours ago', status: 'delivered' },
                  { subject: 'Payment Reminder', type: 'email', recipients: 45, sent: '1 day ago', status: 'delivered' },
                  { subject: 'Welcome to JapDeal', type: 'email', recipients: 12, sent: '2 days ago', status: 'delivered' },
                  { subject: 'Auction Ending Soon', type: 'email', recipients: 234, sent: '3 days ago', status: 'failed' },
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {notification.type === 'email' ? (
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Bell className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">{notification.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {notification.recipients} recipients • {notification.sent}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={notification.status === 'delivered' ? 'default' : 'destructive'}
                    >
                      {notification.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}