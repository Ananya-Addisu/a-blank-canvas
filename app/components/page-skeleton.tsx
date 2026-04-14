import styles from "./page-skeleton.module.css";

type SkeletonVariant = "dashboard" | "list" | "cards" | "table" | "student-home" | "teacher-dashboard";

interface PageSkeletonProps {
  variant?: SkeletonVariant;
  rows?: number;
}

export function PageSkeleton({ variant = "dashboard", rows = 3 }: PageSkeletonProps) {
  if (variant === "student-home") {
    return (
      <div className={styles.skeletonContainer}>
        {/* Header bar */}
        <div className={styles.studentHeader}>
          <div className={styles.studentHeaderIcon} />
          <div className={styles.studentHeaderLogo} />
          <div style={{ flex: 1 }} />
          <div className={styles.studentHeaderIcon} />
          <div className={styles.studentHeaderIcon} />
        </div>

        {/* Featured Paths section */}
        <div className={styles.sectionLabelRow}>
          <div className={styles.sectionLabel} />
          <div className={styles.sectionSeeAll} />
        </div>
        <div className={styles.featuredScrollRow}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.featuredSkelCard} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.featuredSkelImage} />
              <div className={styles.featuredSkelBody}>
                <div className={styles.featuredSkelTitle} />
                <div className={styles.featuredSkelPrice} />
                <div className={styles.featuredSkelButton} />
              </div>
            </div>
          ))}
        </div>

        {/* Popular Courses section */}
        <div className={styles.sectionLabelRow}>
          <div className={styles.sectionLabel} style={{ width: '42%' }} />
          <div className={styles.sectionSeeAll} />
        </div>
        <div className={styles.courseScrollRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.courseSkelCard} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={styles.courseSkelImage} />
              <div className={styles.courseSkelBody}>
                <div className={styles.courseSkelTitle} />
                <div className={styles.courseSkelPrice} />
              </div>
            </div>
          ))}
        </div>

        {/* Bundles section */}
        <div className={styles.sectionLabelRow}>
          <div className={styles.sectionLabel} style={{ width: '25%' }} />
          <div className={styles.sectionSeeAll} />
        </div>
        <div className={styles.bundleScrollRow}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.bundleSkelCard} style={{ animationDelay: `${i * 0.12}s` }}>
              <div className={styles.bundleSkelTitle} />
              <div style={{ flex: 1 }} />
              <div className={styles.bundleSkelFooter}>
                <div className={styles.bundleSkelButton} />
                <div className={styles.bundleSkelCount} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom nav placeholder */}
        <div className={styles.bottomNavSkel}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.bottomNavItem}>
              <div className={styles.bottomNavIcon} />
              <div className={styles.bottomNavLabel} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "teacher-dashboard") {
    return (
      <div className={styles.skeletonContainer}>
        {/* Teacher header */}
        <div className={styles.teacherHeader}>
          <div className={styles.studentHeaderIcon} />
          <div className={styles.studentHeaderLogo} style={{ width: 100 }} />
          <div style={{ flex: 1 }} />
          <div className={styles.studentHeaderIcon} />
        </div>

        {/* Welcome text */}
        <div className={styles.teacherWelcome}>
          <div className={`${styles.skeletonLine}`} style={{ width: '55%', height: 22 }} />
          <div className={`${styles.skeletonLine}`} style={{ width: '75%', height: 14, marginTop: 8 }} />
        </div>

        {/* Stat cards */}
        <div className={styles.teacherStats}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.teacherStatCard} style={{ animationDelay: `${i * 0.12}s` }}>
              <div className={styles.teacherStatIcon} />
              <div className={styles.teacherStatValue} />
              <div className={styles.teacherStatLabel} />
            </div>
          ))}
        </div>

        {/* My Courses section */}
        <div className={styles.sectionLabelRow} style={{ marginTop: 8 }}>
          <div className={styles.sectionLabel} style={{ width: '35%' }} />
          <div className={styles.sectionSeeAll} />
        </div>
        <div className={styles.teacherCourseList}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.teacherCourseItem} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.teacherCourseIcon} />
              <div className={styles.teacherCourseInfo}>
                <div className={`${styles.skeletonLine}`} style={{ width: '70%', height: 14 }} />
                <div className={`${styles.skeletonLine}`} style={{ width: '50%', height: 12, marginTop: 6 }} />
              </div>
              <div className={styles.teacherManageBtn} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className={styles.skeletonContainer}>
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonCircle} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div className={`${styles.skeletonLine} ${styles.skeletonLineMedium}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
          </div>
        </div>
        <div className={styles.skeletonStats}>
          <div className={styles.skeletonStatCard} />
          <div className={styles.skeletonStatCard} />
          <div className={styles.skeletonStatCard} />
        </div>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonList}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={styles.skeletonListItem}>
              <div className={styles.skeletonListItemIcon} />
              <div className={styles.skeletonListItemLines}>
                <div className={`${styles.skeletonLine} ${styles.skeletonLineMedium}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className={styles.skeletonContainer}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonCards}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
        <div className={styles.skeletonTitle} style={{ width: "40%", marginTop: 16 }} />
        <div className={styles.skeletonCards}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={styles.skeletonContainer}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonList}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={styles.skeletonListItem}>
              <div className={styles.skeletonListItemIcon} />
              <div className={styles.skeletonListItemLines}>
                <div className={`${styles.skeletonLine} ${styles.skeletonLineLong}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={styles.skeletonContainer}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonTable}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={styles.skeletonTableRow}>
              <div className={styles.skeletonTableCell} />
              <div className={styles.skeletonTableCell} />
              <div className={styles.skeletonTableCell} />
              <div className={styles.skeletonTableCell} style={{ flex: 0.5 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
