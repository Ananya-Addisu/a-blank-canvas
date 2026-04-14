import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router';
import styles from './popup-notice-modal.module.css';

interface PopupNotice {
  id: string;
  title: string;
  image_url: string;
  display_interval_hours: number;
  link_type?: string | null;
  link_id?: string | null;
  button_text?: string | null;
}

interface PopupNoticeModalProps {
  notices: PopupNotice[];
  studentId: string;
  onDismiss: (noticeId: string) => void;
}

const STORAGE_KEY = 'popup_notice_dismissed';

function getDismissedTimes(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function setDismissedTime(noticeId: string) {
  const times = getDismissedTimes();
  times[noticeId] = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(times));
}

export function PopupNoticeModal({ notices, studentId, onDismiss }: PopupNoticeModalProps) {
  const [activeNotice, setActiveNotice] = useState<PopupNotice | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!notices || notices.length === 0) return;

    const timer = setTimeout(() => {
      const dismissed = getDismissedTimes();
      const now = Date.now();

      for (const notice of notices) {
        const lastDismissed = dismissed[notice.id] || 0;
        const intervalMs = notice.display_interval_hours * 60 * 60 * 1000;
        if (now - lastDismissed > intervalMs) {
          setActiveNotice(notice);
          return;
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [notices]);

  if (!activeNotice) return null;

  const handleClose = () => {
    setDismissedTime(activeNotice.id);
    onDismiss(activeNotice.id);
    setActiveNotice(null);
  };

  const handleLinkClick = () => {
    handleClose();
    if (activeNotice.link_type === 'course' && activeNotice.link_id) {
      navigate(`/course/${activeNotice.link_id}`);
    } else if (activeNotice.link_type === 'bundle' && activeNotice.link_id) {
      navigate(`/bundle/${activeNotice.link_id}`);
    }
  };

  const hasLink = activeNotice.link_type && activeNotice.link_id && activeNotice.button_text;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          <X size={18} />
        </button>
        <img src={activeNotice.image_url} alt={activeNotice.title} className={styles.image} />
        {hasLink && (
          <div className={styles.linkSection}>
            <button className={styles.linkButton} onClick={handleLinkClick}>
              {activeNotice.button_text}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
