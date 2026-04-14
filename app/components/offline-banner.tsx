import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '~/hooks/use-online-status';
import styles from './offline-banner.module.css';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <WifiOff size={18} className={styles.icon} />
      <div className={styles.text}>
        <span className={styles.title}>No internet connection</span>
        <span className={styles.subtitle}>Some features may be unavailable</span>
      </div>
    </div>
  );
}
