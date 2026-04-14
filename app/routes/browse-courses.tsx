import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, BookOpen, Search, X } from "lucide-react";
import { BottomNav } from "~/components/bottom-nav";
import { getStudentAuth } from "~/lib/auth.client";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { getAllCourses } from "~/services/course.client";
import { getStudentEnrollments } from "~/services/enrollment.client";
import { supabase } from "~/lib/supabase.client";
import { setCacheData, getCacheData } from "~/utils/secure-cache";
import { NoConnectionScreen } from "~/components/no-connection-screen";
import styles from "./browse-courses.module.css";


export default function BrowseCourses() {
  const isOnline = useOnlineStatus();
  const [courses, setCourses] = useState<any[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);
  const [pinnedItems, setPinnedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<'offline' | null>(null);
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const CACHE_KEY = 'browse_courses_data';
    const cached = getCacheData<any>(CACHE_KEY, 60 * 60 * 1000);
    let cancelled = false;

    const applyCachedData = (cachedData: any) => {
      setCourses(cachedData.courses || []);
      setPurchasedCourseIds(cachedData.purchasedCourseIds || []);
      setPinnedItems(cachedData.pinnedItems || []);
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
        const [allCourses, student, { data: pinned }] = await Promise.all([
          getAllCourses(),
          getStudentAuth(),
          supabase.from('pinned_items').select('*').order('display_order'),
        ]);

        if (cancelled) return;

        const activeCourses = (allCourses || []).filter((c: any) => c.status === 'active').map((c: any) => ({
          ...c, discountedPrice: c.discount_percentage > 0 ? Math.round(Number(c.price) * (1 - c.discount_percentage / 100)) : Number(c.price),
        }));
        setCourses(activeCourses);
        setPinnedItems(pinned || []);
        let purchIds: string[] = [];
        if (student) {
          const enrollments = await getStudentEnrollments(student.id);
          const approved = (enrollments || []).filter((e: any) => e.status === 'approved');
          purchIds = approved.filter((e: any) => e.course_id).map((e: any) => e.course_id);
          setPurchasedCourseIds(purchIds);
        }
        setCacheData(CACHE_KEY, { courses: activeCourses, purchasedCourseIds: purchIds, pinnedItems: pinned || [] });
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

  useEffect(() => { if (searchOpen) inputRef.current?.focus(); }, [searchOpen]);

  if (fetchError === 'offline') return <NoConnectionScreen />;
  if (loading) return <div style={{ minHeight: '100dvh', background: 'var(--color-neutral-1)' }} />;

  const purchasedSet = new Set(purchasedCourseIds);
  const filtered = query.trim() ? courses.filter((c: any) => c.name.toLowerCase().includes(query.toLowerCase()) || c.category?.toLowerCase().includes(query.toLowerCase()) || c.department?.toLowerCase().includes(query.toLowerCase())) : courses;

  const pinnedIds = new Set((pinnedItems || []).map((p: any) => p.item_id));
  const pinnedOrder = new Map((pinnedItems || []).map((p: any) => [p.item_id, p.display_order ?? 0]));
  const pinned = filtered.filter((c: any) => pinnedIds.has(c.id)).sort((a: any, b: any) => (pinnedOrder.get(a.id) ?? 0) - (pinnedOrder.get(b.id) ?? 0));
  const nonPinned = filtered.filter((c: any) => !pinnedIds.has(c.id));
  const categoryMap = new Map<string, any[]>();
  for (const course of nonPinned) { const cat = course.category || 'Other'; if (!categoryMap.has(cat)) categoryMap.set(cat, []); categoryMap.get(cat)!.push(course); }
  categoryMap.forEach((courses) => { courses.sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)); });
  const sortedCategories = Array.from(categoryMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  const renderCourseCard = (course: any) => {
    const isLocked = !purchasedSet.has(course.id);
    const targetUrl = isLocked ? `/course-preview/${course.id}` : `/course/${course.id}`;
    return (
      <Link key={course.id} to={targetUrl} className={styles.card}>
        {course.thumbnail_url ? <img src={course.thumbnail_url} alt={course.name} className={styles.cardImage} loading="lazy" /> : <div className={styles.cardImagePlaceholder}><BookOpen size={32} /></div>}
        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>{course.name}</h3>
          <p className={styles.cardPrice}>{Number(course.discountedPrice || course.price).toLocaleString()} ETB</p>
          <button className={styles.cardButton}>{isLocked ? "Enroll Now" : "Open Course"}</button>
        </div>
      </Link>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        {searchOpen ? (
          <div className={styles.searchWrap}>
            <input ref={inputRef} className={styles.searchInput} placeholder="Search courses..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className={styles.searchClose} onClick={() => { setSearchOpen(false); setQuery(""); }}><X size={18} /></button>
          </div>
        ) : (
          <><h1 className={styles.topBarTitle}>All Courses</h1><button className={styles.searchButton} onClick={() => setSearchOpen(true)}><Search size={20} /></button></>
        )}
      </div>
      <div className={styles.main}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>{query ? "No courses match your search." : "No courses available yet."}</div>
        ) : (
          <>
            {pinned.length > 0 && !query && (
              <div className={styles.categorySection}><h2 className={styles.categoryTitle}>⭐ Featured</h2><div className={styles.grid}>{pinned.map(renderCourseCard)}</div></div>
            )}
            {!query && sortedCategories.map(([category, catCourses]) => (
              <div key={category} className={styles.categorySection}><h2 className={styles.categoryTitle}>{category}</h2><div className={styles.grid}>{catCourses.map(renderCourseCard)}</div></div>
            ))}
            {query && <div className={styles.grid}>{filtered.map(renderCourseCard)}</div>}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
