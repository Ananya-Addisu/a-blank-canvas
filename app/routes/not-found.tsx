import { Link, useNavigate } from "react-router";
import { Home, ArrowLeft, MapPin } from "lucide-react";
import styles from "./not-found.module.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.illustration}>
          <div className={styles.largeNumber}>404</div>
          <div className={styles.iconWrapper}>
            <MapPin size={48} />
          </div>
        </div>
        
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          Oops! The page you're looking for seems to have wandered off. 
          It might have been removed, renamed, or never existed in the first place.
        </p>
        
        <div className={styles.actions}>
          <Link to="/" className={styles.homeButton}>
            <Home size={18} />
            Back to Home
          </Link>
          <button 
            onClick={() => navigate(-1)} 
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
