import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/home-page";
import { Menu, Bell, BookOpen, Package, Star, Search, X } from "lucide-react";
import { LockedIcon } from "~/components/locked-icon";
import { Badge } from "~/components/ui/badge/badge";
import { BottomNav } from "~/components/bottom-nav";
import { CourseCard } from "~/components/course-card";
import { HowToUseTooltip } from "~/components/how-to-use-tooltip";
import { LoadingScreen } from "~/components/loading-screen";
import { OfflineBanner } from "~/components/offline-banner";
import { Sheet, SheetContent } from "~/components/ui/sheet/sheet";
import { SideMenu } from "~/components/side-menu";
import { NotificationPanel } from "~/components/notification-panel";
import { PopupNoticeModal } from "~/components/popup-notice-modal";
import { HomeType2 } from "~/components/home-type2";
import { getStudentAuth } from "~/lib/auth.client";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { getAllCourses } from "~/services/course.client";
import { getAllBundles } from "~/services/bundle.client";
import { getStudentEnrollments } from "~/services/enrollment.client";
import { getUserNotifications, getUnreadCount } from "~/services/notification.client";
import { getAppSettings } from "~/services/admin.client";
import { supabase } from "~/lib/supabase.client";
import { setCacheData, getCacheData } from "~/utils/secure-cache";
import { NoConnectionScreen } from "~/components/no-connection-screen";
import styles from "./home-page.module.css";


export function meta({}: Route.MetaArgs) {
  return [{ title: "Home - Magster" }, { name: "description", content: "Discover and explore courses" }];
}

export default function HomePage() {
  const isOnline = useOnlineStatus();
  const [student, setStudent] = useState<any>(null);
  const [bundles, setBundles] = useState<any[]>([]);
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCountState] = useState(0);
  const [purchasedBundleIds, setPurchasedBundleIds] = useState<string[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pinnedItems, setPinnedItems] = useState<any[]>([]);
  const [popupNotices, setPopupNotices] = useState<any[]>([]);
  const [homeUiType, setHomeUiType] = useState<string>('type2');
  const [showFeaturedPaths, setShowFeaturedPaths] = useState(true);
  const [enableLibrary, setEnableLibrary] = useState(true);
  const [enableCompetitions, setEnableCompetitions] = useState(true);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<'offline' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const CACHE_KEY = 'home_page_data';
    const cached = getCacheData<any>(CACHE_KEY, 60 * 60 * 1000); // 1 hour
    let cancelled = false;

    const applyCachedData = (cachedData: any) => {
      setStudent(cachedData.student);
      setDbCourses(cachedData.courses || []);
      setBundles(cachedData.bundles || []);
      setCategories(cachedData.categories || []);
      setPinnedItems(cachedData.pinnedItems || []);
      setPopupNotices(cachedData.popupNotices || []);
      setHomeUiType('type2');
      setShowFeaturedPaths(true);
      setEnableLibrary(cachedData.enableLibrary !== false);
      setEnableCompetitions(cachedData.enableCompetitions !== false);
      setNotifications(cachedData.notifications || []);
      setUnreadCountState(cachedData.unreadCount || 0);
      setPurchasedBundleIds(cachedData.purchasedBundleIds || []);
      setPurchasedCourseIds(cachedData.purchasedCourseIds || []);
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
        const [s, allCourses, allBundles, settings] = await Promise.all([
          getStudentAuth(),
          getAllCourses(),
          getAllBundles(),
          getAppSettings(),
        ]);

        const [{ data: cats }, { data: pinned }, { data: notices }] = await Promise.all([
          supabase.from('home_categories').select('*').order('display_order'),
          supabase.from('pinned_items').select('*').order('display_order'),
          supabase.from('popup_notices').select('*').eq('is_active', true),
        ]);

        if (cancelled) return;

        setStudent(s);
        const activeCourses = (allCourses || []).filter((c: any) => c.status === 'active');
        const activeBundles = (allBundles || []).filter((b: any) => b.is_active);
        
        const coursesWithPrices = activeCourses.map((c: any) => ({
          ...c,
          originalPrice: Number(c.price),
          discountedPrice: c.discount_percentage > 0 ? Math.round(Number(c.price) * (1 - c.discount_percentage / 100)) : Number(c.price),
          hasDiscount: c.discount_percentage > 0,
        }));
        
        setDbCourses(coursesWithPrices);
        setBundles(activeBundles);
        setCategories(cats || []);
        setPinnedItems(pinned || []);
        setPopupNotices(notices || []);

        const settingsMap = new Map((settings || []).map((s: any) => [s.setting_key, s.setting_value]));
        const uiType = 'type2';
        const featuredPaths = true;
        const libEnabled = settingsMap.get('enable_library') !== 'false';
        const compEnabled = settingsMap.get('enable_competitions') !== 'false';
        setHomeUiType(uiType);
        setShowFeaturedPaths(featuredPaths);
        setEnableLibrary(libEnabled);
        setEnableCompetitions(compEnabled);

        let notifs: any[] = [];
        let count = 0;
        let purchBundleIds: string[] = [];
        let purchCourseIds: string[] = [];

        if (s) {
          const [enrollments, n, c] = await Promise.all([
            getStudentEnrollments(s.id),
            getUserNotifications(s.id, 'student'),
            getUnreadCount(s.id, 'student'),
          ]);
          notifs = n || [];
          count = c || 0;
          setNotifications(notifs);
          setUnreadCountState(count);
          const approved = (enrollments || []).filter((e: any) => e.status === 'approved');
          purchBundleIds = approved.filter((e: any) => e.bundle_id).map((e: any) => e.bundle_id);
          purchCourseIds = approved.filter((e: any) => e.course_id).map((e: any) => e.course_id);
          setPurchasedBundleIds(purchBundleIds);
          setPurchasedCourseIds(purchCourseIds);
        }

        // Cache all data for offline use
        setCacheData(CACHE_KEY, {
          student: s,
          courses: coursesWithPrices,
          bundles: activeBundles,
          categories: cats || [],
          pinnedItems: pinned || [],
          popupNotices: notices || [],
          homeUiType: uiType,
          showFeaturedPaths: featuredPaths,
          enableLibrary: libEnabled,
          enableCompetitions: compEnabled,
          notifications: notifs,
          unreadCount: count,
          purchasedBundleIds: purchBundleIds,
          purchasedCourseIds: purchCourseIds,
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

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  if (fetchError === 'offline') return <NoConnectionScreen />;
  if (loading) return <LoadingScreen />;

  const purchasedBundleSet = new Set(purchasedBundleIds);
  const purchasedCourseSet = new Set(purchasedCourseIds);

  const handleNoticeDismiss = async (_noticeId: string) => {};

  const filteredCourses = searchQuery
    ? dbCourses.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.category?.toLowerCase().includes(searchQuery.toLowerCase()) || c.department?.toLowerCase().includes(searchQuery.toLowerCase()))
    : dbCourses;

  const filteredBundles = searchQuery
    ? bundles.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.description?.toLowerCase().includes(searchQuery.toLowerCase()) || b.year_level?.toLowerCase().includes(searchQuery.toLowerCase()))
    : bundles;

  const sortedPinnedItems = [...(pinnedItems || [])].sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const pinnedItemIds = new Set(sortedPinnedItems.map((p: any) => p.item_id));
  const pinnedCourses: typeof filteredCourses = [];
  const pinnedBundles: typeof filteredBundles = [];
  for (const pin of sortedPinnedItems) {
    const course = filteredCourses.find(c => c.id === pin.item_id);
    if (course) { pinnedCourses.push(course); continue; }
    const bundle = filteredBundles.find(b => b.id === pin.item_id);
    if (bundle) pinnedBundles.push(bundle);
  }
  const hasPinned = pinnedCourses.length > 0 || pinnedBundles.length > 0;

  const categoryData = (categories || []).map((cat: any) => {
    const catBundles = filteredBundles.filter((b) => {
      if (b.home_category_id === cat.id) return true;
      if (!b.home_category_id && b.year_level === cat.name) return true;
      return false;
    }).sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

    const bundleCourseIds = new Set<string>();
    catBundles.forEach(bundle => { (bundle.courses || []).forEach((c: any) => bundleCourseIds.add(c.id)); });

    const catCourses = filteredCourses.filter((c) => {
      if (bundleCourseIds.has(c.id)) return false;
      if (c.home_category_id === cat.id) return true;
      if (!c.home_category_id && c.category === cat.name) return true;
      return false;
    }).sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

    const orderedItems = [
      ...catBundles.map((bundle: any) => ({ type: 'bundle' as const, item: bundle, order: bundle.display_order ?? 0 })),
      ...catCourses.map((course: any) => ({ type: 'course' as const, item: course, order: course.display_order ?? 0 })),
    ].sort((a, b) => a.order - b.order);

    const rows: any[] = [];
    for (const entry of orderedItems) {
      if (entry.type === 'course') {
        const lastRow = rows[rows.length - 1];
        if (lastRow?.type === 'courses') { lastRow.items.push(entry.item); } else { rows.push({ type: 'courses', items: [entry.item] }); }
        continue;
      }
      rows.push({ type: 'bundle', item: entry.item });
    }
    return { ...cat, rows };
  }).filter((cat: any) => cat.rows.length > 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.menuButton} onClick={() => setMenuOpen(true)}><Menu size={24} /></button>
        <h1 className={styles.logo}>Magster</h1>
        <div className={styles.headerActions}>
          <button className={styles.menuButton} onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            {searchOpen ? <X size={24} /> : <Search size={24} />}
          </button>
          <button className={styles.notificationButton} onClick={() => setNotificationsOpen(true)}>
            <Bell size={24} />
            {unreadCount > 0 && <Badge variant="destructive" className={styles.notificationBadge}>{unreadCount}</Badge>}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input ref={searchInputRef} type="search" placeholder="Search courses, bundles..." className={styles.searchBarInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      )}

      <OfflineBanner />
      <main className={styles.main}>
        {homeUiType === 'type2' ? (
          <HomeType2 bundles={filteredBundles} dbCourses={filteredCourses} categories={categories} pinnedItems={pinnedItems} purchasedBundleIds={purchasedBundleIds.filter((id): id is string => !!id)} purchasedCourseIds={purchasedCourseIds.filter((id): id is string => !!id)} showFeaturedPaths={showFeaturedPaths} />
        ) : (
          <>
            {hasPinned && !searchQuery && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}><Star size={18} className={styles.topCoursesIcon} /> Top Courses</h2></div>
                <div className={styles.coursesGrid}>
                  {sortedPinnedItems.map((pin: any) => {
                    const course = pinnedCourses.find(c => c.id === pin.item_id);
                    if (course) {
                      return <CourseCard key={course.id} course={{ ...course, title: course.name, category: course.category || 'General', price: course.discountedPrice || course.price }} isLocked={!purchasedCourseSet.has(course.id)} />;
                    }
                    const bundle = pinnedBundles.find(b => b.id === pin.item_id);
                    if (bundle) {
                      const isPurchased = purchasedBundleSet.has(bundle.id);
                      return (
                        <Link key={bundle.id} to={isPurchased ? `/bundle/${bundle.id}` : `/bundle-preview/${bundle.id}`} className={`${styles.featuredCard} ${styles.topPinnedBundle} ${!isPurchased ? styles.locked : ""}`}>
                          {!isPurchased && <div className={styles.lockCorner}><LockedIcon size={20} className={styles.lockIcon} /></div>}
                          <div className={styles.bundleCardTop}>
                            <div className={styles.featuredIcon}><Package size={36} /></div>
                            <div className={styles.bundleCardInfo}>
                              <h3 className={styles.featuredTitle}>{bundle.name}</h3>
                              <p className={styles.featuredMeta}>{bundle.year_level} - {bundle.semester}</p>
                              <div className={styles.featuredStats}>
                                <div className={styles.stat}><BookOpen size={14} /><span>{bundle.course_count || 0} courses</span></div>
                                <div className={styles.stat}><Star size={14} /><span>{Number(bundle.price).toLocaleString()} ETB</span></div>
                              </div>
                            </div>
                          </div>
                          <button className={styles.enrollButton}>{isPurchased ? 'Open Bundle' : 'View Bundle'}</button>
                        </Link>
                      );
                    }
                    return null;
                  })}
                </div>
              </section>
            )}

            {categoryData.map((cat: any) => (
              <section key={cat.id} className={styles.section}>
                <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>{cat.name}</h2></div>
                {cat.rows.map((row: any, rowIndex: number) => {
                  if (row.type === 'bundle') {
                    const bundle = row.item;
                    const isPurchased = purchasedBundleSet.has(bundle.id);
                    const bundleCourses = bundle.courses || [];
                    return (
                      <div key={bundle.id} className={styles.yearGroup}>
                        {bundleCourses.length > 0 && (
                          <div className={styles.coursesGrid}>
                            {bundleCourses.map((course: any) => <CourseCard key={course.id} course={{ ...course, title: course.name, category: course.category || 'General', price: course.discountedPrice || course.price }} isLocked={!purchasedCourseSet.has(course.id)} />)}
                          </div>
                        )}
                        <Link to={isPurchased ? `/bundle/${bundle.id}` : `/bundle-preview/${bundle.id}`} className={`${styles.featuredCard} ${!isPurchased ? styles.locked : ""}`}>
                          {!isPurchased && <div className={styles.lockCorner}><LockedIcon size={20} className={styles.lockIcon} /></div>}
                          {bundle.discount_percentage > 0 && <Badge className={styles.newBadge}>{bundle.discount_percentage}% OFF</Badge>}
                          <div className={styles.bundleCardTop}>
                            <div className={styles.featuredIcon}><Package size={36} /></div>
                            <div className={styles.bundleCardInfo}>
                              <h3 className={styles.featuredTitle}>{bundle.name}</h3>
                              <p className={styles.featuredMeta}>{bundle.year_level} - {bundle.semester}</p>
                              <div className={styles.featuredStats}>
                                <div className={styles.stat}><BookOpen size={14} /><span>{bundle.course_count || 0} courses</span></div>
                                <div className={styles.stat}><Star size={14} /><span>{Number(bundle.price).toLocaleString()} ETB</span></div>
                              </div>
                            </div>
                          </div>
                          {bundleCourses.length > 0 && (
                            <div className={styles.bundleCoursesList}>
                              {bundleCourses.map((course: any) => <div key={course.id} className={styles.bundleCourseItem}><BookOpen size={14} /><span>{course.name}</span></div>)}
                            </div>
                          )}
                          <button className={styles.enrollButton}>{isPurchased ? 'Open Bundle' : 'View Bundle'}</button>
                        </Link>
                      </div>
                    );
                  }
                  return (
                    <div key={`${cat.id}-courses-${rowIndex}`} className={styles.coursesGrid}>
                      {row.items.map((course: any) => <CourseCard key={course.id} course={{ ...course, title: course.name, category: course.category || 'General', price: course.discountedPrice || course.price }} isLocked={!purchasedCourseSet.has(course.id)} />)}
                    </div>
                  );
                })}
              </section>
            ))}

            {searchQuery && filteredCourses.length === 0 && filteredBundles.length === 0 && (
              <div className={styles.emptyState}><BookOpen size={48} /><p>No courses found matching "{searchQuery}"</p></div>
            )}
          </>
        )}

        {homeUiType === 'type2' && searchQuery && filteredCourses.length === 0 && filteredBundles.length === 0 && (
          <div className={styles.emptyState}><BookOpen size={48} /><p>No courses found matching "{searchQuery}"</p></div>
        )}
      </main>

      <HowToUseTooltip studentId={student?.id} hideTooltip={student?.hide_how_to_use_tooltip} />
      <BottomNav />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetContent side="left"><SideMenu onClose={() => setMenuOpen(false)} /></SheetContent></Sheet>
      <NotificationPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} notifications={notifications} unreadCount={unreadCount} />

      {(popupNotices || []).length > 0 && student?.id && <PopupNoticeModal notices={popupNotices || []} studentId={student.id} onDismiss={handleNoticeDismiss} />}
    </div>
  );
}
