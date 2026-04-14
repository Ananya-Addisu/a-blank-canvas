import { useNavigate } from "react-router";
import { WifiOff, ArrowLeft, RefreshCw } from "lucide-react";
import { getSession } from "~/lib/auth.client";
import styles from "./no-internet.module.css";

export default function NoInternet() {
  const navigate = useNavigate();

  const handleBack = () => {
    const session = getSession();

    if (session?.userType === "student") {
      navigate("/home-page", { replace: true });
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.illustration}>
          <div className={styles.largeText}>Offline</div>
          <div className={styles.iconWrapper}>
            <WifiOff size={48} />
          </div>
        </div>

        <h1 className={styles.title}>No Internet Connection</h1>
        <p className={styles.description}>
          You appear to be offline. Please check your connection and try again.
        </p>

        <div className={styles.actions}>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          <button
            onClick={handleBack}
            className={styles.backButton}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
