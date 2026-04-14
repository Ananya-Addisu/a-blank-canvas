import styles from './circle-spinner.module.css';

export function CircleSpinner() {
  return <div className={styles.spinner} aria-label="Loading" role="status" />;
}