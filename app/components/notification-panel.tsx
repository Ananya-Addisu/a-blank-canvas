//these are the fix codes from this file
import { useState, useEffect } from 'react';
import { useFetcher } from 'react-router';
import { Bell, X, Check, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet/sheet';
import { Button } from './ui/button/button';
import { Badge } from './ui/badge/badge';
import styles from './notification-panel.module.css';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action_url?: string;
  is_read: boolean;
  created_at: string;
  expires_at?: string | null;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
}

export function NotificationPanel({ isOpen, onClose, notifications: initialNotifications, unreadCount: initialUnreadCount }: NotificationPanelProps) {
  // Filter out expired notifications
  const now = new Date().toISOString();
  const validNotifs = initialNotifications.filter(n => !n.expires_at || n.expires_at > now);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(validNotifs);
  const [localUnreadCount, setLocalUnreadCount] = useState(validNotifs.filter(n => !n.is_read).length);

  // Sync with props when they change
  useEffect(() => {
    const valid = initialNotifications.filter(n => !n.expires_at || n.expires_at > new Date().toISOString());
    setLocalNotifications(valid);
    setLocalUnreadCount(valid.filter(n => !n.is_read).length);
  }, [initialNotifications]);
  const fetcher = useFetcher();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check size={20} className={styles.iconSuccess} />;
      case 'warning':
        return <AlertTriangle size={20} className={styles.iconWarning} />;
      case 'error':
        return <AlertCircle size={20} className={styles.iconError} />;
      default:
        return <Info size={20} className={styles.iconInfo} />;
    }
  };

  const handleMarkAsRead = (id: string) => {
    // FIX: Notification mark as read updates in real-time via optimistic update
    setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setLocalUnreadCount(prev => Math.max(0, prev - 1));
    fetcher.submit(
      { intent: 'mark_read', notificationId: id },
      { method: 'post', action: '/api/notifications' }
    );
  };

  const handleMarkAllAsRead = () => {
    // FIX: Mark all as read updates in real-time via optimistic update
    setLocalNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setLocalUnreadCount(0);
    fetcher.submit(
      { intent: 'mark_all_read' },
      { method: 'post', action: '/api/notifications' }
    );
  };

  const handleDelete = (id: string) => {
    // FIX: Notification remove updates in real-time via optimistic update
    const notification = localNotifications.find(n => n.id === id);
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.is_read) {
      setLocalUnreadCount(prev => Math.max(0, prev - 1));
    }
    fetcher.submit(
      { intent: 'delete', notificationId: id },
      { method: 'post', action: '/api/notifications' }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className={styles.panel}>
        <SheetHeader className={styles.header}>
          <div className={styles.headerTop}>
            <SheetTitle className={styles.title}>
              <Bell size={20} />
              Notifications
              {localUnreadCount > 0 && (
                <Badge variant="destructive" className={styles.badge}>
                  {localUnreadCount}
                </Badge>
              )}
            </SheetTitle>
            <button
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Close notifications"
            >
              <X size={24} />
            </button>
          </div>
          {localNotifications.length > 0 && localUnreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className={styles.markAllButton}
            >
              Mark all as read
            </Button>
          )}
        </SheetHeader>

        <div className={styles.content}>
          {localNotifications.length === 0 ? (
            <div className={styles.empty}>
              <Bell size={48} />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className={styles.list}>
              {localNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.item} ${!notification.is_read ? styles.unread : ''}`}
                >
                  <div className={styles.iconContainer}>
                    {getIcon(notification.type)}
                  </div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemHeader}>
                      <h4 className={styles.itemTitle}>{notification.title}</h4>
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className={styles.deleteButton}
                        aria-label="Delete notification"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className={styles.itemMessage}>{notification.message}</p>
                    <div className={styles.itemFooter}>
                      <span className={styles.itemTime}>
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className={styles.markReadButton}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
