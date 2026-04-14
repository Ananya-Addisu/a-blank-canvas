import { useNavigate } from "react-router";
import { WifiOff, ArrowLeft, RefreshCw } from "lucide-react";
import { getSession } from "~/lib/auth.client";
import styles from "./no-connection-screen.module.css";

export function NoConnectionScreen() {
  const navigate = useNavigate();

  const handleBack = () => {
    const session = getSession();

    if (session?.userType === "student") {
      navigate("/home-page", { replace: true });
      return;
    }

    if (session?.userType === "teacher") {
      navigate("/teacher", { replace: true });
      return;
    }

    if (session?.userType === "admin") {
      navigate("/admin", { replace: true });
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
            <WifiOff size={36} />
          </div>
        </div>

        <h1 className={styles.title}>No Internet Connection</h1>
        <p className={styles.description}>
          This page requires an internet connection. Please check your connection and try again.
        </p>

        <div className={styles.actions}>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            <RefreshCw size={16} />
            Try Again
          </button>
          <button onClick={handleBack} className={styles.backButton}>
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
