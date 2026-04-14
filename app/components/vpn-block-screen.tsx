import { Ban, RefreshCw } from "lucide-react";
import { useState } from "react";
import styles from "./vpn-block-screen.module.css";

interface VpnBlockScreenProps {
  onRetry: () => void;
  reason?: "vpn_detected" | "outside_ethiopia" | string;
}

export function VpnBlockScreen({ onRetry, reason = "vpn_detected" }: VpnBlockScreenProps) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    onRetry();
    setTimeout(() => setRetrying(false), 3000);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <Ban size={56} strokeWidth={1.5} />
        </div>

        <h1 className={styles.title}>Access Denied</h1>

        <p className={styles.description}>
          This app is not available in your country.
        </p>

        <p className={styles.subdesc}>
          Magster is exclusively available in Ethiopia. If you believe this is an error, 
          please disable any VPN or proxy and try again.
        </p>

        <button
          className={styles.retryBtn}
          onClick={handleRetry}
          disabled={retrying}
        >
          <RefreshCw size={18} className={retrying ? "animate-spin" : ""} />
          {retrying ? "Checking…" : "Try Again"}
        </button>
      </div>
    </div>
  );
}
