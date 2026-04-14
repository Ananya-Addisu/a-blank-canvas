import { Smartphone, ShieldAlert, ExternalLink } from "lucide-react";
import styles from "./app-only-screen.module.css";

export function AppOnlyScreen() {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <Smartphone size={40} strokeWidth={1.5} />
        </div>
        <h1 className={styles.title}>App Only Access</h1>
        <p className={styles.description}>
          This platform is exclusively available through the official Magster mobile application. 
          Download the app to access courses, compete, and learn on the go.
        </p>
        <div className={styles.badge}>
          <ShieldAlert size={14} />
          Browser access is restricted
        </div>
        <div className={styles.divider} />
        <div className={styles.storeHint}>
          <ExternalLink size={14} />
          <span>
            Get the Magster app from the official{' '}
            <a
              href="https://t.me/magsteracademy"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.telegramLink}
            >
              Magster Academy Telegram Channel
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
