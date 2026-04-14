import { useState } from "react";
import { useLoaderData } from 'react-router';
import { Menu, GraduationCap, Search, Bell, X } from "lucide-react";
import styles from "./app-header.module.css";
import { ProfileAvatar } from './profile-avatar';
import { NotificationPanel } from './notification-panel';
import { Badge } from './ui/badge/badge';

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const data = useLoaderData() as any;
  const student = data?.student;
  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <button className={styles.menuButton} onClick={onMenuClick} aria-label="Open menu">
            <Menu className={styles.menuIcon} />
          </button>
          <div className={styles.logo}>
            <GraduationCap className={styles.logoIcon} />
            <span>Magster</span>
          </div>
        </div>
        <div className={styles.actions}>
          <div className={`${styles.searchContainer} ${searchOpen ? styles.searchOpen : ""}`}>
            {searchOpen && (
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search courses..."
                autoFocus
              />
            )}
            <button
              className={styles.iconButton}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label={searchOpen ? "Close search" : "Open search"}
            >
              {searchOpen ? <X className={styles.icon} /> : <Search className={styles.icon} />}
            </button>
          </div>
          <button 
            className={styles.iconButton} 
            aria-label="Notifications"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className={styles.icon} />
            {unreadCount > 0 && (
              <Badge variant="destructive" className={styles.notificationBadge}>
                {unreadCount}
              </Badge>
            )}
          </button>

          <ProfileAvatar
            profilePicture={student?.profile_picture}
            userName={student?.full_name || 'Student'}
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
