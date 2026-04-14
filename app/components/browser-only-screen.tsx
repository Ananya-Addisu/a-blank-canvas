import { Monitor, ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router';
import styles from './browser-only-screen.module.css';

export function BrowserOnlyScreen() {
  const navigate = useNavigate();

  const handleOpenInBrowser = () => {
    window.open('https://magster.bernos.et/teacher', '_blank');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconCircle}>
          <Monitor size={36} />
        </div>
        <h1 className={styles.title}>Better on Web</h1>
        <p className={styles.description}>
          This feature is optimized for the web browser experience. Please open it in your browser for the best functionality.
        </p>
        <div className={styles.actions}>
          <button className={styles.webButton} onClick={handleOpenInBrowser}>
            <ExternalLink size={18} />
            Open in Browser
          </button>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
