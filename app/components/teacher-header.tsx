import { useState } from 'react';
import { useLoaderData, Form } from 'react-router';
import { Menu, Bell, Search } from 'lucide-react';
import styles from './teacher-header.module.css';
import { ProfileAvatar } from './profile-avatar';
import { NotificationPanel } from './notification-panel';

interface TeacherHeaderProps {
  onMenuClick: () => void;
}

export function TeacherHeader({ onMenuClick }: TeacherHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const data = useLoaderData() as any;
  const teacher = data?.teacher;
  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className={styles.header}>
        <button className={styles.menuButton} onClick={onMenuClick} aria-label="Menu">
          <Menu size={24} />
        </button>

        <Form method="get" className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="search"
            name="q"
            placeholder="Search courses, students, content..."
            className={styles.searchInput}
          />
        </Form>

        <div className={styles.actions}>
          <button 
            className={styles.notificationButton} 
            aria-label="Notifications"
            onClick={() => setShowNotifications(true)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </button>

          <div className={styles.avatar}>
            {teacher?.profile_picture ? (
              <img src={teacher.profile_picture} alt={teacher.full_name} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {getInitials(teacher?.full_name || 'Teacher')}
              </div>
            )}
          </div>
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
