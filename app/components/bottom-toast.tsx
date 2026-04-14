import { useEffect, useState } from "react";
import styles from "./bottom-toast.module.css";

interface BottomToastProps {
  message: string;
  show: boolean;
  duration?: number;
  onDone?: () => void;
}

export function BottomToast({ message, show, duration = 3500, onDone }: BottomToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDone?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onDone]);

  if (!visible) return null;

  return <div className={styles.toast}>{message}</div>;
}
