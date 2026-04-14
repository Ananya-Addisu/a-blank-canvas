import { Link } from "react-router";
import { BookOpen, Package, ChevronRight, Lock } from "lucide-react";
import styles from "./home-type2.module.css";

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
  "grade 12": featuredGrade12,
  "entrance": featuredGrade12,
  "freshman": featuredFreshman,
  "semester 1": featuredFreshman,
  "engineering": featuredEngineering,
  "health": featuredHealth,
  "medicine": featuredHealth,
  "natural science": featuredNatural,
  "science": featuredNatural,
  "social": featuredSocial,
  "social science": featuredSocial,
  "law": featuredLaw,
  "legal": featuredLaw,
  "business": featuredBusiness,
  "economics": featuredBusiness,
  "commerce": featuredBusiness,
  "technology": featuredTechnology,
  "computing": featuredTechnology,
  "computer": featuredTechnology,
  "software": featuredTechnology,
};

function getFallbackImage(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [key, img] of Object.entries(FALLBACK_IMAGES)) {
    if (lower.includes(key)) return img;
  }
  return null;
}

function LockBadge() {
  return (
    <div className={styles.lockBadge}>
      <Lock size={10} />
    </div>
  );
}

interface HomeType2Props {
  bundles: any[];
  dbCourses: any[];
  categories: any[];
  pinnedItems: any[];
  purchasedBundleIds: string[];
  purchasedCourseIds: string[];
  showFeaturedPaths?: boolean;
}

export function HomeType2({
  bundles,
  dbCourses,
  categories,
  pinnedItems,
  purchasedBundleIds,
  purchasedCourseIds,
  showFeaturedPaths = true,
}: HomeType2Props) {
  const purchasedBundleSet = new Set(purchasedBundleIds);
  const purchasedCourseSet = new Set(purchasedCourseIds);

  const featuredPaths = bundles
    .filter((b: any) => b.is_featured_path)
    .sort((a: any, b: any) => (a.featured_path_order ?? 0) - (b.featured_path_order ?? 0));

  const bundlesForSection = bundles.filter((b: any) => !b.is_featured_path_exclusive);

  const sortedPinnedItems = [...(pinnedItems || [])].sort(
    (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );
  const pinnedIds = new Set(sortedPinnedItems.map((p: any) => p.item_id));

  const pinnedCourseItems = sortedPinnedItems
    .map((pin: any) => dbCourses.find((c) => c.id === pin.item_id))
    .filter(Boolean);

  const nonPinnedCourses = dbCourses
    .filter((c) => !pinnedIds.has(c.id))
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const popularCourses = [...pinnedCourseItems, ...nonPinnedCourses];

  return (
    <>
      {/* Featured Paths */}
      {showFeaturedPaths && featuredPaths.length > 0 && (
        <section className={styles.scrollSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Paths</h2>
            <Link to="/browse-bundles?tab=featured" className={styles.seeAll}>
              See All <ChevronRight size={16} />
            </Link>
          </div>
          <div className={styles.scrollRow}>
            {featuredPaths.map((bundle: any) => {
              const isPurchased = purchasedBundleSet.has(bundle.id);
              return (
                <Link
                  key={bundle.id}
                  to={isPurchased ? `/bundle/${bundle.id}` : `/bundle-preview/${bundle.id}`}
                  className={styles.featuredCard}
                >
                  {!isPurchased && <LockBadge />}
                  <div className={styles.featuredCardImageWrap}>
                    {(bundle.thumbnail_url || getFallbackImage(bundle.name)) ? (
                      <img
                        src={bundle.thumbnail_url || getFallbackImage(bundle.name)!}
                        alt={bundle.name}
                        className={styles.featuredCardImage}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.featuredCardImagePlaceholder}>
                        <Package size={36} />
                      </div>
                    )}
                  </div>
                  <div className={styles.featuredCardBody}>
                    <h3 className={styles.featuredCardTitle}>{bundle.name}</h3>
                    {Number(bundle.price) > 0 && (
                      <p className={styles.featuredCardPrice}>
                        {Number(bundle.price).toLocaleString()} ETB
                      </p>
                    )}
                    <button className={styles.featuredCardButton}>
                      {isPurchased ? "Open" : "Enroll Now"}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Popular Courses */}
      {popularCourses.length > 0 && (
        <section className={styles.scrollSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Popular Courses</h2>
            <Link to="/browse-courses" className={styles.seeAll}>
              See All <ChevronRight size={16} />
            </Link>
          </div>
          <div className={styles.scrollRow}>
            {popularCourses.map((course: any) => {
              const isLocked = !purchasedCourseSet.has(course.id);
              const targetUrl = isLocked
                ? `/course-preview/${course.id}`
                : `/course/${course.id}`;
              return (
                <Link
                  key={course.id}
                  to={targetUrl}
                  className={styles.courseCard}
                >
                  {isLocked && <LockBadge />}
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.name}
                      className={styles.courseCardImage}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.courseCardImagePlaceholder}>
                      <BookOpen size={28} />
                    </div>
                  )}
                  <div className={styles.courseCardBody}>
                    <h3 className={styles.courseCardTitle}>{course.name}</h3>
                    <p className={styles.courseCardPrice}>
                      {Number(course.discountedPrice || course.price).toLocaleString()} ETB
                    </p>
                    <button className={styles.courseCardButton}>
                      {isLocked ? "Enroll Now" : "Open"}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Bundles */}
      {bundlesForSection.length > 0 && (
        <section className={styles.scrollSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Bundles</h2>
            <Link to="/browse-bundles" className={styles.seeAll}>
              See All <ChevronRight size={16} />
            </Link>
          </div>
          <div className={styles.scrollRow}>
            {bundlesForSection.map((bundle: any) => {
              const isPurchased = purchasedBundleSet.has(bundle.id);
              return (
                <Link
                  key={bundle.id}
                  to={isPurchased ? `/bundle/${bundle.id}` : `/bundle-preview/${bundle.id}`}
                  className={styles.bundleCard}
                >
                  {!isPurchased && <LockBadge />}
                  <div className={styles.bundleCardHeader}>
                    <h3 className={styles.bundleCardTitle}>{bundle.name}</h3>
                    {bundle.discount_percentage > 0 && (
                      <span className={styles.bundleDiscountBadge}>
                        {bundle.discount_percentage}% OFF
                      </span>
                    )}
                  </div>
                  <div className={styles.bundleCardFooter}>
                    <button className={styles.bundlePreviewButton}>
                      {isPurchased ? "Open" : "Preview"}
                    </button>
                    <span className={styles.bundleCourseCount}>
                      {bundle.course_count || 0} courses
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
