import { useState, useEffect } from "react";
import type { Route } from "./+types/my-enrollments";
import { AppHeader } from "~/components/app-header";
import { BottomNav } from "~/components/bottom-nav";
import { Sheet, SheetContent } from "~/components/ui/sheet/sheet";
import { SideMenu } from "~/components/side-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs/tabs";
import { Badge } from "~/components/ui/badge/badge";
import { BookOpen, Package, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { OfflineBanner } from "~/components/offline-banner";
import { getStudentAuth } from "~/lib/auth.client";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { getStudentEnrollments } from "~/services/enrollment.client";
import { setCacheData, getCacheData } from "~/utils/secure-cache";
import { NoConnectionScreen } from "~/components/no-connection-screen";
import styles from "./my-enrollments.module.css";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Enrollments - Magster" },
    { name: "description", content: "Track your course enrollment requests" }
  ];
}

export default function MyEnrollments() {
  const isOnline = useOnlineStatus();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<'offline' | null>(null);

  useEffect(() => {
    const CACHE_KEY = 'my_enrollments_data';
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

  const approved = enrollments.filter(e => e.status === 'approved');
  const pending = enrollments.filter(e => e.status === 'pending');
  const declined = enrollments.filter(e => e.status === 'rejected');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className={styles.statusApproved}><CheckCircle size={14} /> Approved</Badge>;
      case 'pending':
        return <Badge className={styles.statusPending}><Clock size={14} /> Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className={styles.statusDeclined}><XCircle size={14} /> Declined</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderEnrollmentCard = (enrollment: any) => (
    <div key={enrollment.id} className={styles.enrollmentCard}>
      <div className={styles.cardIcon}>
        {enrollment.enrollment_type === 'bundle' ? (
          <Package size={32} />
        ) : (
          <BookOpen size={32} />
        )}
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            {enrollment.enrollment_type === 'bundle' 
              ? enrollment.bundles?.name 
              : enrollment.courses?.name}
          </h3>
          {getStatusBadge(enrollment.status)}
        </div>
        <p className={styles.cardDescription}>
          {enrollment.enrollment_type === 'bundle' 
            ? enrollment.bundles?.description 
            : enrollment.courses?.description}
        </p>
        <div className={styles.cardFooter}>
          <div className={styles.cardMeta}>
            <span className={styles.metaLabel}>Type:</span>
            <span className={styles.metaValue}>
              {enrollment.enrollment_type === 'bundle' ? 'Bundle' : 'Single Course'}
            </span>
          </div>
          <div className={styles.cardMeta}>
            <span className={styles.metaLabel}>Amount:</span>
            <span className={styles.metaValue}>
              {Number(enrollment.payment_amount).toLocaleString()} ETB
            </span>
          </div>
          <div className={styles.cardMeta}>
            <span className={styles.metaLabel}>Date:</span>
            <span className={styles.metaValue}>
              {new Date(enrollment.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <AppHeader onMenuClick={() => setMenuOpen(true)} />
      <OfflineBanner />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Enrollments</h1>
          <p className={styles.subtitle}>Track the status of your enrollment requests</p>
        </div>

        <Tabs defaultValue="all" className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="all">All ({enrollments.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="rejected">Declined ({declined.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className={styles.tabContent}>
            {enrollments.length > 0 ? (
              <div className={styles.enrollmentsList}>{enrollments.map(renderEnrollmentCard)}</div>
            ) : (
              <div className={styles.emptyState}><AlertCircle size={48} /><p>No enrollment requests yet</p></div>
            )}
          </TabsContent>

          <TabsContent value="approved" className={styles.tabContent}>
            {approved.length > 0 ? (
              <div className={styles.enrollmentsList}>{approved.map(renderEnrollmentCard)}</div>
            ) : (
              <div className={styles.emptyState}><CheckCircle size={48} /><p>No approved enrollments yet</p></div>
            )}
          </TabsContent>

          <TabsContent value="pending" className={styles.tabContent}>
            {pending.length > 0 ? (
              <div className={styles.enrollmentsList}>{pending.map(renderEnrollmentCard)}</div>
            ) : (
              <div className={styles.emptyState}><Clock size={48} /><p>No pending enrollments</p></div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className={styles.tabContent}>
            {declined.length > 0 ? (
              <div className={styles.enrollmentsList}>{declined.map(renderEnrollmentCard)}</div>
            ) : (
              <div className={styles.emptyState}><XCircle size={48} /><p>No declined enrollments</p></div>
            )}
          </TabsContent>
        </Tabs>
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
