import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Sheet, SheetContent } from "~/components/ui/sheet/sheet";
import { SideMenu } from "~/components/side-menu";
import { EnrollmentModal } from "~/components/enrollment-modal";
import { Button } from "~/components/ui/button/button";
import { Badge } from "~/components/ui/badge/badge";
import { Checkbox } from "~/components/ui/checkbox/checkbox";
import { NoConnectionScreen } from "~/components/no-connection-screen";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { BookOpen, Package, CheckCircle, X, Eye } from "lucide-react";
import { getBundleById } from "~/services/bundle.client";
import styles from "./bundle-preview.module.css";


export default function BundlePreview() {
  const { id } = useParams();
  const isOnline = useOnlineStatus();
  const [bundle, setBundle] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollItem, setEnrollItem] = useState<any>(null);
  const [enrollType, setEnrollType] = useState<'course' | 'bundle'>('bundle');
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
        const data = await getBundleById(id!);
        if (cancelled) return;
        setBundle(data);
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

  const originalPrice = bundle.courses?.reduce((sum: number, course: any) => sum + Number(course.price), 0) || 0;
  const discountAmount = originalPrice * (bundle.discount_percentage / 100);
  const finalPrice = Number(bundle.price);

  const handleEnrollBundle = () => { setEnrollItem(bundle); setEnrollType('bundle'); setEnrollModalOpen(true); };
  const handleEnrollCourse = (course: any) => { setEnrollItem(course); setEnrollType('course'); setEnrollModalOpen(true); };
  const toggleCourseSelection = (courseId: string) => {
    const course = bundle.courses?.find((c: any) => c.id === courseId);
    if ((course as any)?.is_bundle_exclusive) return;
    setSelectedCourses(prev => prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]);
  };
  const handleEnrollSelected = () => {
    if (selectedCourses.length === 0) return;
    if (selectedCourses.length === bundle.courses?.length) { handleEnrollBundle(); } else {
      const selectedCoursesList = bundle.courses?.filter((c: any) => selectedCourses.includes(c.id));
      const totalPrice = selectedCoursesList?.reduce((sum: number, c: any) => sum + Number(c.price), 0) || 0;
      setEnrollItem({ ...bundle, name: `Selected Courses from ${bundle.name}`, price: totalPrice, course_count: selectedCourses.length, selected_course_ids: selectedCourses });
      setEnrollType('bundle'); setEnrollModalOpen(true);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <button className={styles.closeButton} onClick={() => navigate(-1)}><X size={24} /></button>
        <div className={styles.hero}>
          <div className={styles.heroIcon}><Package size={80} /></div>
          <div className={styles.heroOverlay}>
            <div className={styles.badges}>
              <Badge className={styles.badge}><Package size={16} />Bundle</Badge>
              {bundle.discount_percentage > 0 && <Badge variant="destructive" className={styles.discountBadge}>{bundle.discount_percentage}% OFF</Badge>}
            </div>
            <h1 className={styles.title}>{bundle.name}</h1>
            <p className={styles.subtitle}>{bundle.year_level} - {bundle.semester}</p>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.priceSection}>
            <div className={styles.priceDetails}>
              {bundle.discount_percentage > 0 && <div className={styles.originalPrice}>{originalPrice.toLocaleString()} ETB</div>}
              <div className={styles.finalPrice}>{finalPrice.toLocaleString()} ETB</div>
              {bundle.discount_percentage > 0 && <div className={styles.savings}>You save {discountAmount.toLocaleString()} ETB</div>}
            </div>
            <Button size="lg" onClick={handleEnrollBundle} className={styles.enrollButton}>Enroll in Bundle</Button>
          </div>
          <div className={styles.description}><h2 className={styles.sectionTitle}>About This Bundle</h2><p className={styles.descriptionText}>{bundle.description}</p></div>
          <div className={styles.coursesSection}>
            <div className={styles.coursesSectionHeader}>
              <h2 className={styles.sectionTitle}>Included Courses ({bundle.course_count || 0})</h2>
              {selectedCourses.length > 0 && <Button onClick={handleEnrollSelected} size="sm">Enroll {selectedCourses.length} Course{selectedCourses.length > 1 ? 's' : ''}</Button>}
            </div>
            <p className={styles.coursesHint}>Click on individual courses to enroll separately, or select multiple courses below</p>
            <div className={styles.coursesList}>
              {bundle.courses?.map((course: any) => (
                <div key={course.id} className={styles.courseCard}>
                  <div className={styles.courseCheckbox}>{(course as any).is_bundle_exclusive ? <Checkbox checked disabled /> : <Checkbox checked={selectedCourses.includes(course.id)} onCheckedChange={() => toggleCourseSelection(course.id)} />}</div>
                  <div className={styles.courseIconWrapper}><BookOpen size={32} className={styles.courseIcon} /></div>
                  <div className={styles.courseInfo}><h3 className={styles.courseName}>{course.name}</h3><p className={styles.courseCategory}>{course.category}</p><p className={styles.courseDescription}>{course.description}</p></div>
                  <div className={styles.courseActions}>
                    <span className={styles.coursePrice}>{Number(course.price).toLocaleString()} ETB</span>
                    {(course as any).is_bundle_exclusive ? <Badge style={{ fontSize: '10px', padding: '2px 6px' }}>Bundle Only</Badge> : <Button size="sm" variant="outline" onClick={() => handleEnrollCourse(course)}>Enroll</Button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.benefits}>
            <h2 className={styles.sectionTitle}>Bundle Benefits</h2>
            <ul className={styles.benefitsList}>
              <li className={styles.benefit}><CheckCircle className={styles.benefitIcon} /><span>All courses in one package</span></li>
              <li className={styles.benefit}><CheckCircle className={styles.benefitIcon} /><span>Save {bundle.discount_percentage}% compared to individual purchase</span></li>
              <li className={styles.benefit}><CheckCircle className={styles.benefitIcon} /><span>6 months access to all course materials</span></li>
              <li className={styles.benefit}><CheckCircle className={styles.benefitIcon} /><span>Complete semester coverage</span></li>
            </ul>
          </div>
        </div>
      </main>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetContent side="left"><SideMenu onClose={() => setMenuOpen(false)} /></SheetContent></Sheet>
      <EnrollmentModal isOpen={enrollModalOpen} onClose={() => setEnrollModalOpen(false)} item={enrollItem} type={enrollType} />
    </div>
  );
}
