import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { Menu, Search, Bell } from 'lucide-react';
import styles from './admin-header.module.css';
import { Input } from './ui/input/input';
import { ProfileAvatar } from './profile-avatar';
import { NotificationPanel } from './notification-panel';
import { Badge } from './ui/badge/badge';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const data = useLoaderData() as any;
  const admin = data?.admin;
  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <>
      <header className={styles.header}>
        <button className={styles.menuBtn} onClick={onMenuClick}>
          <Menu size={24} />
        </button>

        <div className={styles.search}>
          <Search size={20} className={styles.searchIcon} />
          <Input type="text" placeholder="Search..." className={styles.searchInput} />
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.iconBtn}
            onClick={() => setShowNotifications(true)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <Badge variant="destructive" className={styles.badge}>
                {unreadCount}
              </Badge>
            )}
          </button>

          <ProfileAvatar
            profilePicture={admin?.profile_picture}
            userName={admin?.full_name || 'Admin'}
            editable={false}
            size="sm"
          />
        </div>
      </header>

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        unreadCount={unreadCount}
      />
    </>
  );
}
