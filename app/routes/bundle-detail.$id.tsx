import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ChevronLeft, Package, BookOpen, User, ArrowRight, Play } from "lucide-react";
import { Badge } from "~/components/ui/badge/badge";
import { Button } from "~/components/ui/button/button";
import { BottomNav } from "~/components/bottom-nav";
import { NoConnectionScreen } from "~/components/no-connection-screen";
import { getStudentAuth } from "~/lib/auth.client";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { getBundleById } from "~/services/bundle.client";
import { getStudentEnrollments, hasAccessToCourse } from "~/services/enrollment.client";
import styles from "./bundle-detail.$id.module.css";


export default function BundleDetail() {
  const { id } = useParams();
  const isOnline = useOnlineStatus();
  const [bundle, setBundle] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessibleCourseIds, setAccessibleCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<'offline' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    if (!isOnline) {
      setFetchError('offline');
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const [bundleData, student] = await Promise.all([getBundleById(id!), getStudentAuth()]);
        if (cancelled) return;
        if (!bundleData) {
          setLoading(false);
          return;
        }

        setBundle(bundleData);
        if (student) {
          const enrollments = await getStudentEnrollments(student.id);
          const approvedBundleIds = (enrollments || []).filter((e: any) => e.status === 'approved' && e.bundle_id).map((e: any) => e.bundle_id);
          const access = approvedBundleIds.includes(id);
          setHasAccess(access);
          if (access && bundleData.courses) {
            const courseAccessChecks = await Promise.all(bundleData.courses.map((c: any) => hasAccessToCourse(student.id, c.id)));
            setAccessibleCourseIds(bundleData.courses.filter((_: any, i: number) => courseAccessChecks[i]).map((c: any) => c.id));
          }
        }
        setFetchError(null);
      } catch {
        if (!isOnline) setFetchError('offline');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    load();

    return () => {
      cancelled = true;
    };
  }, [id, isOnline]);

  if (fetchError === 'offline') return <NoConnectionScreen />;
  if (loading || !bundle) return <div style={{ minHeight: '100dvh', background: 'var(--color-neutral-1)' }} />;

  const accessSet = new Set(accessibleCourseIds);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/home-page" className={styles.backButton}><ChevronLeft size={24} /><span>Back</span></Link>
        <h1 className={styles.headerTitle}>Bundle Details</h1>
        <div style={{ width: 40 }} />
      </header>
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.heroIconWrapper}><Package size={64} /></div>
          <div className={styles.heroContent}>
            {hasAccess && <Badge className={styles.purchasedBadge}>✓ Purchased</Badge>}
            <h1 className={styles.title}>{bundle.name}</h1>
            <p className={styles.subtitle}>{bundle.year_level} - {bundle.semester}</p>
            <p className={styles.description}>{bundle.description}</p>
            <div className={styles.meta}><div className={styles.metaItem}><BookOpen size={18} /><span>{bundle.course_count} Courses</span></div></div>
          </div>
        </div>
        {!hasAccess ? (
          <div className={styles.noAccess}>
            <Package size={48} className={styles.noAccessIcon} />
            <h2>You don't have access to this bundle</h2>
            <p>If you've recently made a payment, it might be pending approval.</p>
            <div className={styles.noAccessActions}>
              <Button onClick={() => navigate(`/bundle-preview/${bundle.id}`)}>View & Enroll</Button>
              <Button variant="outline" onClick={() => navigate('/my-payments')}>Check Payments</Button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.coursesHeader}><h2 className={styles.sectionTitle}>Included Courses ({bundle.course_count})</h2></div>
            <div className={styles.coursesGrid}>
              {bundle.courses?.map((course: any) => {
                const canAccess = accessSet.has(course.id);
                return (
                  <div key={course.id} className={styles.courseCard} onClick={() => canAccess ? navigate(`/course/${course.id}`) : navigate(`/course-preview/${course.id}`)}>
                    <div className={styles.courseIconBox}><BookOpen size={40} /></div>
                    <div className={styles.courseContent}>
                      <p className={styles.courseCategory}>{course.category || 'General'}</p>
                      <h3 className={styles.courseName}>{course.name}</h3>
                      {course.description && <p className={styles.courseDescription}>{course.description.length > 80 ? course.description.slice(0, 80) + '...' : course.description}</p>}
                      <div className={styles.courseFooter}>
                        <div className={styles.courseMeta}><User size={14} /><span>{course.teacher?.full_name || 'Instructor'}</span></div>
                        <Button size="sm" className={styles.courseButton}>{canAccess ? <>Open Course <ArrowRight size={14} /></> : <>Preview <Play size={14} /></>}</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
