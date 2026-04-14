import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { HelpCircle, X } from 'lucide-react';
import styles from './how-to-use-tooltip.module.css';

interface HowToUseTooltipProps {
  studentId: string;
  hideTooltip?: boolean;
}

export function HowToUseTooltip({ studentId, hideTooltip }: HowToUseTooltipProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check local + DB preference
    const localHidden = localStorage.getItem(`hide_how_to_use_${studentId}`);
    if (localHidden === 'true' || hideTooltip) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [studentId, hideTooltip]);

  const handleDismiss = async () => {
    setVisible(false);
    localStorage.setItem(`hide_how_to_use_${studentId}`, 'true');
    // Persist to DB
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (supabaseUrl && supabaseKey) {
        const client = createClient(supabaseUrl, supabaseKey);
        await client.from('students').update({ hide_how_to_use_tooltip: true }).eq('id', studentId);
      }
    } catch {
      // Silent fail
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.container}>
      <Link to="/student-how-to-use" className={styles.tooltip}>
        <div className={styles.iconWrap}>
          <HelpCircle size={20} />
        </div>
        <div className={styles.textWrap}>
          <span className={styles.title}>New here?</span>
          <span className={styles.subtitle}>Tap to learn how to use the app</span>
        </div>
      </Link>
      <button className={styles.dismissBtn} onClick={handleDismiss} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}
