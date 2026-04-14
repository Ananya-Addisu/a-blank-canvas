import { useState, useEffect } from 'react';
import { BottomNav } from '~/components/bottom-nav';
import { LoadingScreen } from '~/components/loading-screen';
import { MessageCircle, FileText, Shield, Send as SendIcon, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { OfflineBanner } from '~/components/offline-banner';
import styles from './about.module.css';


export default function AboutPage() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className={styles.container}>
      <OfflineBanner />
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>About Magster</h1>
            <p className={styles.heroSubtitle}>
              Magster is an educational platform empowering Ethiopian students with quality courses, 
              study materials, and competitive exams — all in one app.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Connect With Us</h2>
            
            <a href="https://t.me/magaborawi" target="_blank" rel="noopener noreferrer" className={styles.linkCard}>
              <div className={styles.linkCardIcon}><MessageCircle size={20} /></div>
              <div className={styles.linkCardContent}>
                <div className={styles.linkCardTitle}>Contact Support</div>
                <div className={styles.linkCardDesc}>Chat with us on Telegram</div>
              </div>
              <ExternalLink size={16} style={{ color: 'var(--color-neutral-9)' }} />
            </a>

            <a href="https://t.me/magsteracademy" target="_blank" rel="noopener noreferrer" className={styles.linkCard}>
              <div className={styles.linkCardIcon}><SendIcon size={20} /></div>
              <div className={styles.linkCardContent}>
                <div className={styles.linkCardTitle}>Our Channel</div>
                <div className={styles.linkCardDesc}>Follow Magster Academy on Telegram</div>
              </div>
              <ExternalLink size={16} style={{ color: 'var(--color-neutral-9)' }} />
            </a>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Legal</h2>
            
            <button className={styles.linkCard} onClick={() => setShowTerms(!showTerms)}>
              <div className={styles.linkCardIcon}><FileText size={20} /></div>
              <div className={styles.linkCardContent}>
                <div className={styles.linkCardTitle}>Terms of Service</div>
                <div className={styles.linkCardDesc}>Our terms and conditions</div>
              </div>
            </button>
            {showTerms && (
              <div style={{ padding: 'var(--space-4)', background: 'var(--color-neutral-1)', borderRadius: 'var(--radius-3)', border: '1px solid var(--color-neutral-6)', fontSize: '0.875rem', color: 'var(--color-neutral-11)', lineHeight: 1.7 }}>
                <p><strong>Terms of Service</strong></p>
                <p>By using Magster, you agree to use the platform for educational purposes only. All content is owned by Magster and its content creators. Unauthorized redistribution, screen recording, or sharing of paid content is strictly prohibited. Accounts found violating these terms may be permanently suspended without refund.</p>
                <p>Payments are non-refundable once course access is granted. Magster reserves the right to modify pricing, content availability, and platform features at any time.</p>
              </div>
            )}

            <button className={styles.linkCard} onClick={() => setShowPrivacy(!showPrivacy)}>
              <div className={styles.linkCardIcon}><Shield size={20} /></div>
              <div className={styles.linkCardContent}>
                <div className={styles.linkCardTitle}>Privacy Policy</div>
                <div className={styles.linkCardDesc}>How we handle your data</div>
              </div>
            </button>
            {showPrivacy && (
              <div style={{ padding: 'var(--space-4)', background: 'var(--color-neutral-1)', borderRadius: 'var(--radius-3)', border: '1px solid var(--color-neutral-6)', fontSize: '0.875rem', color: 'var(--color-neutral-11)', lineHeight: 1.7 }}>
                <p><strong>Privacy Policy</strong></p>
                <p>Magster collects your name, phone number, and academic information to provide personalized educational services. We use device binding for security. Your payment screenshots are stored temporarily and automatically deleted after review.</p>
                <p>We do not sell your personal data. Your information is only shared with authorized administrators for account management and payment verification purposes.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
