import { CircleSpinner } from './circle-spinner';
import styles from './loading-screen.module.css';

export function LoadingScreen() {
  return (
    <div className={styles.loadingScreen}>
      <CircleSpinner />
    </div>
  );
}