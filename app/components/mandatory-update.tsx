import { Download, AlertTriangle } from 'lucide-react';
import styles from './mandatory-update.module.css';

interface MandatoryUpdateProps {
  currentVersion: string;
  requiredVersion: string;
  downloadUrl: string;
}

export function MandatoryUpdate({ currentVersion, requiredVersion, downloadUrl }: MandatoryUpdateProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <AlertTriangle size={48} />
        </div>

        <h1 className={styles.title}>Mandatory Update Required</h1>

        <p className={styles.message}>
          A new version of Magster is available. You must update to continue using the app.
          Your current version is no longer supported.
        </p>

        <div className={styles.versionInfo}>
          <div className={styles.versionRow}>
            <span className={styles.versionLabel}>Your Version:</span>
            <span>{currentVersion}</span>
          </div>
          <div className={styles.versionRow}>
            <span className={styles.versionLabel}>Required Version:</span>
            <span>{requiredVersion}</span>
          </div>
        </div>

        {downloadUrl ? (
          <a href={downloadUrl} className={styles.downloadBtn} download>
            <Download size={20} />
            Download Latest Version
          </a>
        ) : (
          <p className={styles.message}>
            Please contact support to get the latest version.
          </p>
        )}

        <p className={styles.warning}>
          After downloading, install the new APK. This version of the app will remain unusable until you switch to the updated version.
        </p>
      </div>
    </div>
  );
}
