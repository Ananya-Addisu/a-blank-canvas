import { useState, useEffect } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/my-courses";
import { Menu, Bell, BookOpen, PlayCircle, CheckCircle2, Package, ChevronDown, ChevronUp } from "lucide-react";
import { BottomNav } from "~/components/bottom-nav";
import { Sheet, SheetContent } from "~/components/ui/sheet/sheet";
import { SideMenu } from "~/components/side-menu";
import { NotificationPanel } from "~/components/notification-panel";
import { Badge } from "~/components/ui/badge/badge";
import { StudentFooter } from "~/components/student-footer";
import { OfflineBanner } from "~/components/offline-banner";
import { getStudentAuth } from "~/lib/auth.client";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { getStudentEnrollments } from "~/services/enrollment.client";
import { getUserNotifications, getUnreadCount } from "~/services/notification.client";
import { getStudentAllProgress } from "~/services/progress.client";
import { setCacheData, getCacheData } from "~/utils/secure-cache";
import { NoConnectionScreen } from "~/components/no-connection-screen";
import styles from "./my-courses.module.css";

export function meta({}: Route.MetaArgs) {
  return [{ title: "My Courses - Magster" }, { name: "description", content: "Track your learning progress" }];
}

export default function MyCourses() {
  const isOnline = useOnlineStatus();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCountState] = useState(0);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pendingExpanded, setPendingExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<'offline' | null>(null);

  useEffect(() => {
    const CACHE_KEY = 'my_courses_data';
    const cached = getCacheData<any>(CACHE_KEY, 60 * 60 * 1000);
    let cancelled = false;

    const applyCachedData = (cachedData: any) => {
      setEnrollments(cachedData.enrollments || []);
      setNotifications(cachedData.notifications || []);
      setUnreadCountState(cachedData.unreadCount || 0);
      setProgressData(cachedData.progressData || []);
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
        const [enr, notifs, count, progress] = await Promise.all([
          getStudentEnrollments(student.id),
          getUserNotifications(student.id, 'student'),
          getUnreadCount(student.id, 'student'),
          getStudentAllProgress(student.id),
        ]);

        if (cancelled) return;

        setEnrollments(enr || []);
        setNotifications(notifs || []);
        setUnreadCountState(count || 0);
        setProgressData(progress || []);
        setCacheData(CACHE_KEY, {
          enrollments: enr || [],
          notifications: notifs || [],
          unreadCount: count || 0,
          progressData: progress || [],
        });
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

  const approvedEnrollments = enrollments.filter(e => e.status === 'approved');
  const pendingEnrollments = enrollments.filter(e => e.status === 'pending');
  const approvedCourses = approvedEnrollments.filter(e => e.enrollment_type === 'course' && e.course);
  const approvedBundles = approvedEnrollments.filter(e => e.enrollment_type === 'bundle' && e.bundle);
  const pendingCourses = pendingEnrollments.filter(e => e.enrollment_type === 'course');
  const pendingBundles = pendingEnrollments.filter(e => e.enrollment_type === 'bundle');

  const allCoursesMap = new Map<string, { course: any; source: string }>();
  approvedCourses.forEach(e => { if (e.course) allCoursesMap.set(e.course.id, { course: e.course, source: 'Direct' }); });
  approvedBundles.forEach(e => {
    const bundle = e.bundle as any;
    if (bundle?.bundle_courses) {
      bundle.bundle_courses.forEach((bc: any) => {
        if (bc.course && !allCoursesMap.has(bc.course.id)) allCoursesMap.set(bc.course.id, { course: bc.course, source: bundle.name });
      });
    }
  });
  const allCourses = Array.from(allCoursesMap.values());

  const getProgressForCourse = (enrollmentId: string) => {
    const progress = progressData.find((p: any) => p.enrollment.id === enrollmentId);
    return progress?.progress?.overallProgress || 0;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.menuButton} onClick={() => setMenuOpen(true)}><Menu size={24} /></button>
        <h1 className={styles.logo}>Magster</h1>
        <button className={styles.notificationButton} onClick={() => setNotificationsOpen(true)}>
          <Bell size={24} />
          {unreadCount > 0 && <Badge variant="destructive" className={styles.notificationBadge}>{unreadCount}</Badge>}
        </button>
      </div>

      <OfflineBanner />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>My Courses</h2>
          <p className={styles.pageSubtitle}>Continue your learning journey</p>
        </div>

        {approvedEnrollments.length === 0 && pendingEnrollments.length === 0 && (
          <div className={styles.emptyState}><BookOpen size={48} /><p>You haven't enrolled in any courses yet</p><Link to="/" className={styles.browseButton}>Browse Courses</Link></div>
        )}

        {pendingEnrollments.length > 0 && (
          <section className={styles.section}>
            <button className={styles.collapsibleSectionHeader} onClick={() => setPendingExpanded(prev => !prev)}>
              <div className={styles.sectionHeaderLeft}><h2 className={styles.sectionTitle}>Pending Enrollments</h2><Badge variant="secondary">{pendingEnrollments.length}</Badge></div>
              {pendingExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {pendingExpanded && <div className={styles.coursesGrid}>
              {pendingCourses.map((enrollment) => {
                const course = enrollment.course;
                if (!course) return null;
                return (
                  <div key={enrollment.id} className={styles.courseCard}>
                    <div className={styles.courseContent}>
                      <div className={styles.courseCategory}>{course.category || 'General'}<Badge variant="secondary" style={{ fontSize: '10px', marginLeft: '8px' }}>Pending</Badge></div>
                      <h3 className={styles.courseTitle}>{course.name}</h3>
                      <div className={styles.courseFooter}>
                        <span className={styles.coursePrice}>{Number(enrollment.payment_amount).toLocaleString()} ETB</span>
                        <Link to="/my-payments" className={styles.previewButton}>View Status</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
              {pendingBundles.map((enrollment) => {
                const bundle = enrollment.bundle as any;
                if (!bundle) return null;
                return (
                  <div key={enrollment.id} className={styles.courseCard}>
                    <div className={styles.courseContent}>
                      <div className={styles.courseCategory}>Bundle<Badge variant="secondary" style={{ fontSize: '10px', marginLeft: '8px' }}>Pending</Badge></div>
                      <h3 className={styles.courseTitle}>{bundle.name}</h3>
                      <div className={styles.courseFooter}>
                        <span className={styles.coursePrice}>{Number(enrollment.payment_amount).toLocaleString()} ETB</span>
                        <Link to="/my-payments" className={styles.previewButton}>View Status</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>}
          </section>
        )}

        {approvedCourses.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>Active Courses</h2><Badge variant="default">{approvedCourses.length}</Badge></div>
            <div className={styles.coursesGrid}>
              {approvedCourses.map((enrollment) => {
                const course = enrollment.course;
                if (!course) return null;
                const progress = getProgressForCourse(enrollment.id);
                const isCompleted = progress === 100;
                return (
                  <Link key={enrollment.id} to={`/course/${course.id}`} className={styles.courseCardLink}>
                    <div className={styles.courseCard}>
                      <div className={styles.courseContent}>
                        <div className={styles.courseCategory}>{course.category || 'General'}{isCompleted && <Badge className={styles.completedBadge} variant="default"><CheckCircle2 size={12} />Completed</Badge>}</div>
                        <h3 className={styles.courseTitle}>{course.name}</h3>
                        <div className={styles.courseFooter}><button className={styles.continueButton}><PlayCircle size={16} />Open Course</button></div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {approvedBundles.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>My Bundles</h2><Badge variant="default">{approvedBundles.length}</Badge></div>
            <div className={styles.coursesGrid}>
              {approvedBundles.map((enrollment) => {
                const bundle = enrollment.bundle as any;
                if (!bundle) return null;
                return (
                  <Link key={enrollment.id} to={`/bundle/${bundle.id}`} className={styles.courseCardLink}>
                    <div className={styles.courseCard}>
                      <div className={styles.courseContent}>
                        <div className={styles.courseCategory}>Bundle - {bundle.year_level} - {bundle.semester}</div>
                        <h3 className={styles.courseTitle}>{bundle.name}</h3>
                        <p className={styles.courseDescription}>{bundle.description?.substring(0, 80)}...</p>
                        <div className={styles.courseFooter}>
                          <span className={styles.coursePrice}>{bundle.bundle_courses?.length || 0} courses</span>
                          <button className={styles.continueButton}><PlayCircle size={16} />Open Bundle</button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {allCourses.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>All My Courses</h2><Badge variant="default">{allCourses.length}</Badge></div>
            <div className={styles.coursesGrid}>
              {allCourses.map(({ course, source }) => (
                <Link key={course.id} to={`/course/${course.id}`} className={styles.courseCardLink}>
                  <div className={styles.courseCard}>
                    <div className={styles.courseContent}>
                      <div className={styles.courseCategory}>{course.category || 'General'}</div>
                      <h3 className={styles.courseTitle}>{course.name}</h3>
                      <p className={styles.courseDescription}>{course.description?.substring(0, 80)}...</p>
                      <div className={styles.courseFooter}>
                        <Badge variant="secondary" style={{ fontSize: '11px' }}>{source}</Badge>
                        <button className={styles.continueButton}><PlayCircle size={16} />Open Course</button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
      <StudentFooter />
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetContent side="left"><SideMenu onClose={() => setMenuOpen(false)} /></SheetContent></Sheet>
      <NotificationPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} notifications={notifications} unreadCount={unreadCount} />
    </div>
  );
}
