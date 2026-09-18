import { useEffect, useState } from 'react';
import { Bell, BellOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const NotificationSettings = () => {
  const { toast } = useToast();
  const { isSupported, isSubscribed, subscribeToPushNotifications, unsubscribeFromPushNotifications, showNotification } =
    usePushNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(isSubscribed);

  // Sync state with hook
  useEffect(() => {
    setNotificationsEnabled(isSubscribed);
  }, [isSubscribed]);

  const handleToggleNotifications = async () => {
    setIsLoading(true);
    try {
      if (notificationsEnabled) {
        // Disable notifications
        const success = await unsubscribeFromPushNotifications();
        if (success) {
          setNotificationsEnabled(false);
          toast({
            title: 'Notifications disabled',
            description: 'You will no longer receive push notifications.',
          });
        } else {
          toast({
            title: 'Failed to disable notifications',
            variant: 'destructive',
          });
        }
      } else {
        // Enable notifications
        const success = await subscribeToPushNotifications();
        if (success) {
          setNotificationsEnabled(true);
          toast({
            title: '✅ Notifications enabled!',
            description: 'You will now receive push notifications for orders and messages.',
          });

          // Show test notification
          await showNotification({
            title: '🎉 Notifications enabled!',
            body: 'You will now get alerts for orders, messages, and updates.',
            tag: 'test-notification',
          });
        } else {
          toast({
            title: 'Failed to enable notifications',
            description: 'Please check your browser permissions.',
            variant: 'destructive',
          });
        }
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
        <AlertCircle className="h-5 w-5 text-amber-700 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-amber-900">Notifications not supported</p>
          <p className="text-amber-800 mt-1">Your browser doesn't support push notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-border/50">
        <div className="flex items-start gap-3 flex-1">
          {notificationsEnabled ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-foreground">Push Notifications</p>
                <p className="text-xs text-green-600">Enabled</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <BellOff className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-foreground">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Disabled</p>
              </div>
            </div>
          )}
        </div>
        <Button
          onClick={handleToggleNotifications}
          disabled={isLoading}
          variant={notificationsEnabled ? 'outline' : 'default'}
          size="sm"
        >
          {isLoading ? (
            <>
              <div className="animate-spin mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              {notificationsEnabled ? 'Disabling...' : 'Enabling...'}
            </>
          ) : (
            <>
              {notificationsEnabled ? (
                <>
                  <BellOff className="h-4 w-4 mr-1" />
                  Disable
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-1" />
                  Enable
                </>
              )}
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {notificationsEnabled
          ? 'You will receive push notifications for new orders, messages, and order updates even when the website is closed.'
          : 'Enable notifications to stay updated about your orders and messages.'}
      </p>
    </div>
  );
};

export default NotificationSettings;
