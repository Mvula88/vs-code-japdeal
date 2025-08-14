import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/utils/auth';
import { formatDate } from '@/lib/utils/format';
import { Bell, BellOff, CheckCircle } from 'lucide-react';

async function getNotifications() {
  const user = await getUser();
  
  if (!user) {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your auction activities
          </p>
        </div>
        <Button variant="outline" size="sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark all as read
        </Button>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={!notification.is_read ? 'border-primary/50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${!notification.is_read ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Bell className={`h-4 w-4 ${!notification.is_read ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{notification.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <Badge variant="default" className="text-xs">New</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{notification.message}</p>
                {notification.action_url && (
                  <Button variant="link" className="p-0 h-auto mt-2 text-sm">
                    View Details →
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-3 rounded-full bg-muted mb-4">
              <BellOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No notifications yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              We&apos;ll notify you about important updates regarding your bids and watched auctions
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}