import { useState, useEffect } from "react";
import { AppHeader } from "~/components/app-header";
import { BottomNav } from "~/components/bottom-nav";
import { Sheet, SheetContent } from "~/components/ui/sheet/sheet";
import { SideMenu } from "~/components/side-menu";
import { Badge } from "~/components/ui/badge/badge";
import { Clock, CheckCircle, XCircle, Package, BookOpen, Calendar, DollarSign } from "lucide-react";
import { OfflineBanner } from "~/components/offline-banner";
import { getStudentAuth } from "~/lib/auth.client";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { getStudentEnrollments } from "~/services/enrollment.client";
import { setCacheData, getCacheData } from "~/utils/secure-cache";
import { NoConnectionScreen } from "~/components/no-connection-screen";
import styles from "./my-payments.module.css";


export default function MyPayments() {
  const isOnline = useOnlineStatus();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<'offline' | null>(null);

  useEffect(() => {
    const CACHE_KEY = 'my_payments_data';
    const cached = getCacheData<any>(CACHE_KEY, 60 * 60 * 1000);
    let cancelled = false;

    const applyCachedData = (cachedData: any) => {
      setEnrollments(cachedData.enrollments || []);
    };

    if (!isOnline) {
      if (cached) {
        applyCachedData(cached);
        setFetchError(null);
      } else {
        setFetchError('offline');
      }
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const student = await getStudentAuth();
        if (!student) { setLoading(false); return; }
        const data = await getStudentEnrollments(student.id);
        if (cancelled) return;
        setEnrollments(data || []);
        setCacheData(CACHE_KEY, { enrollments: data || [] });
        setFetchError(null);
        setLoading(false);
      } catch {
        if (cancelled) return;

        if (!isOnline) {
          if (cached) {
            applyCachedData(cached);
            setFetchError(null);
          } else {
            setFetchError('offline');
          }
        }
        setLoading(false);
      }
    }

    setLoading(true);
    load();

    return () => {
      cancelled = true;
    };
  }, [isOnline]);

  if (fetchError === 'offline') return <NoConnectionScreen />;
  if (loading) return <div style={{ minHeight: '100dvh', background: 'var(--color-neutral-1)' }} />;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className={styles.iconApproved} />;
      case 'rejected': return <XCircle className={styles.iconRejected} />;
      default: return <Clock className={styles.iconPending} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className={styles.badgeApproved}>Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className={styles.container}>
      <AppHeader onMenuClick={() => setMenuOpen(true)} />
      <OfflineBanner />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Payments</h1>
          <p className={styles.subtitle}>Track the status of your enrollment payments</p>
        </div>

        {enrollments.length === 0 ? (
          <div className={styles.empty}>
            <DollarSign size={48} className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>No Payments Yet</h2>
            <p className={styles.emptyText}>You haven't enrolled in any courses or bundles yet.</p>
          </div>
        ) : (
          <div className={styles.enrollmentsList}>
            {enrollments.map((enrollment) => {
              const item = enrollment.enrollment_type === 'bundle' ? enrollment.bundle : enrollment.course;
              const itemName = item?.name || 'Unknown';
              
              return (
                <div key={enrollment.id} className={styles.enrollmentCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemIcon}>
                        {enrollment.enrollment_type === 'bundle' ? <Package size={20} /> : <BookOpen size={20} />}
                      </div>
                      <div>
                        <h3 className={styles.itemName}>{itemName}</h3>
                        <p className={styles.itemType}>{enrollment.enrollment_type === 'bundle' ? 'Bundle Package' : 'Single Course'}</p>
                      </div>
                    </div>
                    {getStatusBadge(enrollment.status)}
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.detail}>
                      <span className={styles.detailLabel}><DollarSign size={16} />Amount</span>
                      <span className={styles.detailValue}>{Number(enrollment.payment_amount).toLocaleString()} ETB</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.detailLabel}><Calendar size={16} />Enrolled On</span>
                      <span className={styles.detailValue}>{new Date(enrollment.created_at).toLocaleDateString()}</span>
                    </div>
                    {enrollment.payment_submission && (
                      <>
                        <div className={styles.detail}>
                          <span className={styles.detailLabel}>Payment Method</span>
                          <span className={styles.detailValue}>{enrollment.payment_submission.payment_method}</span>
                        </div>
                        <div className={styles.detail}>
                          <span className={styles.detailLabel}>Submitted On</span>
                          <span className={styles.detailValue}>{new Date(enrollment.payment_submission.submitted_at).toLocaleDateString()}</span>
                        </div>
                        {enrollment.payment_submission.status === 'approved' && enrollment.payment_submission.reviewed_at && (
                          <div className={styles.detail}>
                            <span className={styles.detailLabel}>Approved On</span>
                            <span className={styles.detailValue}>{new Date(enrollment.payment_submission.reviewed_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        {enrollment.payment_submission.admin_notes && (
                          <div className={styles.adminNotes}>
                            <p className={styles.notesLabel}>Admin Notes:</p>
                            <p className={styles.notesText}>{enrollment.payment_submission.admin_notes}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.statusIndicator}>
                      {getStatusIcon(enrollment.status)}
                      <span className={styles.statusText}>
                        {enrollment.status === 'approved' 
                          ? 'Payment approved - You have access!'
                          : enrollment.status === 'rejected'
                          ? <a href="https://t.me/magster_support" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Payment rejected - Contact support</a>
                          : 'Waiting for admin approval'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left">
          <SideMenu onClose={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
