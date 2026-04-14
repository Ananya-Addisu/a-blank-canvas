import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Package, Search, X, Sparkles } from "lucide-react";
import { BottomNav } from "~/components/bottom-nav";
import { getStudentAuth } from "~/lib/auth.client";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { getAllBundles } from "~/services/bundle.client";
import { getStudentEnrollments } from "~/services/enrollment.client";
import { setCacheData, getCacheData } from "~/utils/secure-cache";
import { NoConnectionScreen } from "~/components/no-connection-screen";
import styles from "./browse-courses.module.css";

import featuredGrade12 from "~/assets/featured-grade12-prep.jpg";
import featuredFreshman from "~/assets/featured-freshman-sem1.jpg";
import featuredEngineering from "~/assets/featured-engineering.jpg";
import featuredHealth from "~/assets/featured-health-science.jpg";
import featuredNatural from "~/assets/featured-natural-science.jpg";
import featuredSocial from "~/assets/featured-social-science.jpg";
import featuredLaw from "~/assets/featured-law.jpg";
import featuredBusiness from "~/assets/featured-business.jpg";
import featuredTechnology from "~/assets/featured-technology.jpg";

const FALLBACK_IMAGES: Record<string, string> = {
  "grade 12": featuredGrade12, "entrance": featuredGrade12, "freshman": featuredFreshman, "semester 1": featuredFreshman,
  "engineering": featuredEngineering, "health": featuredHealth, "medicine": featuredHealth, "natural science": featuredNatural,
  "science": featuredNatural, "social": featuredSocial, "social science": featuredSocial, "law": featuredLaw, "legal": featuredLaw,
  "business": featuredBusiness, "economics": featuredBusiness, "commerce": featuredBusiness, "technology": featuredTechnology,
  "computing": featuredTechnology, "computer": featuredTechnology, "software": featuredTechnology,
};

function getFallbackImage(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [key, img] of Object.entries(FALLBACK_IMAGES)) { if (lower.includes(key)) return img; }
  return null;
}


export default function BrowseBundles() {
  const isOnline = useOnlineStatus();
  const [bundles, setBundles] = useState<any[]>([]);
  const [featuredPaths, setFeaturedPaths] = useState<any[]>([]);
  const [purchasedBundleIds, setPurchasedBundleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<'offline' | null>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const activeTab = searchParams.get("tab") === "featured" ? "featured" : "bundles";

  useEffect(() => {
    const CACHE_KEY = 'browse_bundles_data';
    const cached = getCacheData<any>(CACHE_KEY, 60 * 60 * 1000);
    let cancelled = false;

    const applyCachedData = (cachedData: any) => {
      setBundles(cachedData.bundles || []);
      setFeaturedPaths(cachedData.featuredPaths || []);
      setPurchasedBundleIds(cachedData.purchasedBundleIds || []);
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
        const [allBundles, student] = await Promise.all([
          getAllBundles(),
          getStudentAuth(),
        ]);
        const activeBundles = (allBundles || []).filter((b: any) => b.is_active);
        const featured = activeBundles
          .filter((bundle: any) => bundle.is_featured_path)
          .sort((a: any, b: any) => (a.featured_path_order ?? 0) - (b.featured_path_order ?? 0));

        if (cancelled) return;

        setBundles(activeBundles);
        setFeaturedPaths(featured);
        let purchIds: string[] = [];
        if (student) {
          const enrollments = await getStudentEnrollments(student.id);
          const approved = (enrollments || []).filter((e: any) => e.status === 'approved');
          purchIds = approved.filter((e: any) => e.bundle_id).map((e: any) => e.bundle_id);
          setPurchasedBundleIds(purchIds);
        }
        setCacheData(CACHE_KEY, { bundles: activeBundles, featuredPaths: featured, purchasedBundleIds: purchIds });
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

  const purchasedSet = new Set(purchasedBundleIds);
  const displayItems = activeTab === "featured" ? featuredPaths : bundles;
  const filtered = query.trim() ? displayItems.filter((b: any) => b.name.toLowerCase().includes(query.toLowerCase()) || b.description?.toLowerCase().includes(query.toLowerCase())) : displayItems;
  const categoryMap = new Map<string, any[]>();
  for (const bundle of filtered) { const cat = bundle.year_level || 'Other'; if (!categoryMap.has(cat)) categoryMap.set(cat, []); categoryMap.get(cat)!.push(bundle); }
  categoryMap.forEach((bundles) => { bundles.sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)); });
  const sortedCategories = Array.from(categoryMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  const renderBundleCard = (bundle: any) => {
    const isPurchased = purchasedSet.has(bundle.id);
    const targetUrl = isPurchased ? `/bundle/${bundle.id}` : `/bundle-preview/${bundle.id}`;
    return (
      <Link key={bundle.id} to={targetUrl} className={styles.card}>
        {(bundle.thumbnail_url || getFallbackImage(bundle.name)) ? <img src={bundle.thumbnail_url || getFallbackImage(bundle.name)!} alt={bundle.name} className={styles.cardImage} loading="lazy" /> : <div className={styles.cardImagePlaceholder}><Package size={32} /></div>}
        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>{bundle.name}</h3>
          <p className={styles.cardPrice}>{Number(bundle.price).toLocaleString()} ETB</p>
          <button className={styles.cardButton}>{isPurchased ? "Open" : "Preview"}</button>
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
            <input ref={inputRef} className={styles.searchInput} placeholder={`Search ${activeTab === "featured" ? "featured paths" : "bundles"}...`} value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className={styles.searchClose} onClick={() => { setSearchOpen(false); setQuery(""); }}><X size={18} /></button>
          </div>
        ) : (
          <><h1 className={styles.topBarTitle}>{activeTab === "featured" ? "Featured Paths" : "All Bundles"}</h1><button className={styles.searchButton} onClick={() => setSearchOpen(true)}><Search size={20} /></button></>
        )}
      </div>
      {featuredPaths.length > 0 && (
        <div className={styles.tabBar}>
          <button className={`${styles.tab} ${activeTab === "bundles" ? styles.tabActive : ""}`} onClick={() => setSearchParams({})}><Package size={16} /> Bundles</button>
          <button className={`${styles.tab} ${activeTab === "featured" ? styles.tabActive : ""}`} onClick={() => setSearchParams({ tab: "featured" })}><Sparkles size={16} /> Featured Paths</button>
        </div>
      )}
      <div className={styles.main}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>{query ? "No results match your search." : activeTab === "featured" ? "No featured paths available yet." : "No bundles available yet."}</div>
        ) : query ? (
          <div className={styles.grid}>{filtered.map(renderBundleCard)}</div>
        ) : (
          <>{sortedCategories.map(([category, catBundles]) => (
            <div key={category} className={styles.categorySection}><h2 className={styles.categoryTitle}>{category}</h2><div className={styles.grid}>{catBundles.map(renderBundleCard)}</div></div>
          ))}</>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
