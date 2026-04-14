import styles from "./route-skeletons.module.css";

const s = (cls: string) => `${styles[cls]} ${styles.shimmer}`;

/* Shared bottom nav */
function BottomNavSkel() {
  return (
    <div className={styles.bottomNav}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.navItem}>
          <div className={s("navIcon")} />
          <div className={s("navLabel")} />
        </div>
      ))}
    </div>
  );
}

/* Shared student header (menu + logo + bell) */
function StdHeader() {
  return (
    <div className={styles.stdHeader}>
      <div className={s("stdHeaderIcon")} />
      <div className={s("stdHeaderLogo")} />
      <div style={{ flex: 1 }} />
      <div className={s("stdHeaderIcon")} />
      <div className={s("stdHeaderIcon")} />
    </div>
  );
}

/* Shared back header */
function BackHeader({ titleWidth = "40%" }: { titleWidth?: string }) {
  return (
    <div className={styles.backHeader}>
      <div className={s("backIcon")} />
      <div className={s("backTitle")} style={{ width: titleWidth }} />
      <div style={{ flex: 1 }} />
    </div>
  );
}

/* ==========================================
   STUDENT HOME (existing behavior - kept as-is)
   ========================================== */
export function StudentHomeSkeleton() {
  return (
    <div className={styles.container}>
      <StdHeader />
      <div className={styles.main}>
        {/* Featured Paths */}
        <div className={styles.sectionRow}>
          <div className={s("sectionLabel")} />
          <div className={s("sectionSeeAll")} />
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)", overflow: "hidden" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.courseCardSkel} style={{ flex: "0 0 30%", animationDelay: `${i * 0.1}s` }}>
              <div className={styles.courseCardImage} style={{ aspectRatio: "4/3" }} />
              <div className={styles.courseCardBody}>
                <div className={s("courseCardTitle")} />
                <div className={s("courseCardPrice")} />
              </div>
            </div>
          ))}
        </div>

        {/* Popular Courses */}
        <div className={styles.sectionRow}>
          <div className={s("sectionLabel")} style={{ width: "42%" }} />
          <div className={s("sectionSeeAll")} />
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)", overflow: "hidden" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.courseCardSkel} style={{ flex: "0 0 28%", animationDelay: `${i * 0.08}s` }}>
              <div className={styles.courseCardImage} style={{ aspectRatio: "1/1" }} />
              <div className={styles.courseCardBody}>
                <div className={s("courseCardTitle")} />
                <div className={s("courseCardPrice")} />
              </div>
            </div>
          ))}
        </div>

        {/* Bundles */}
        <div className={styles.sectionRow}>
          <div className={s("sectionLabel")} style={{ width: "25%" }} />
          <div className={s("sectionSeeAll")} />
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)", overflow: "hidden" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.contentCard} style={{ flex: "0 0 35%", minHeight: 100, animationDelay: `${i * 0.12}s` }}>
              <div className={s("contentCardTitle")} />
              <div style={{ flex: 1 }} />
              <div className={styles.contentCardFooter}>
                <div className={s("contentCardMeta")} style={{ width: 60, height: 26, borderRadius: 14 }} />
                <div className={s("contentCardMeta")} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

/* ==========================================
   MY COURSES / MY ENROLLMENTS / MY PAYMENTS / DOWNLOADS
   Header + title + list of course cards
   ========================================== */
export function StudentListSkeleton() {
  return (
    <div className={styles.container}>
      <StdHeader />
      <div className={styles.main}>
        <div>
          <div className={s("pageTitle")} />
          <div className={s("pageSubtitle")} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.listItem} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={s("listItemIcon")} />
              <div className={styles.listItemLines}>
                <div className={s("listItemLine1")} />
                <div className={s("listItemLine2")} />
              </div>
              <div className={s("listItemAction")} />
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

/* ==========================================
   BROWSE COURSES / BROWSE BUNDLES
   Back header + search + grid of cards
   ========================================== */
export function StudentBrowseSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="35%" />
      <div className={styles.main}>
        <div className={s("searchBar")} />
        <div className={styles.sectionRow}>
          <div className={s("sectionLabel")} style={{ width: "25%" }} />
        </div>
        <div className={styles.courseGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.courseCardSkel} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={styles.courseCardImage} />
              <div className={styles.courseCardBody}>
                <div className={s("courseCardTitle")} />
                <div className={s("courseCardPrice")} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

/* ==========================================
   COURSE DETAIL / BUNDLE DETAIL / PREVIEW
   Back header + hero image + chapters + lessons
   ========================================== */
export function StudentDetailSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="55%" />
      <div className={styles.main}>
        <div className={s("detailEnrollBar")} />

        <div>
          <div className={s("sectionLabel")} style={{ width: "45%", height: 16, marginBottom: 12 }} />
        </div>

        {/* Chapter blocks */}
        {Array.from({ length: 2 }).map((_, ci) => (
          <div key={ci} className={styles.chapterBlock} style={{ animationDelay: `${ci * 0.15}s` }}>
            <div className={s("chapterTitle")} />
            {Array.from({ length: 3 }).map((_, li) => (
              <div key={li} className={styles.lessonRow} style={{ animationDelay: `${(ci * 3 + li) * 0.08}s` }}>
                <div className={s("lessonIcon")} />
                <div className={s("lessonTitle")} />
                <div className={s("lessonDuration")} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <BottomNavSkel />
    </div>
  );
}

/* ==========================================
   LIBRARY / COMPETITIONS
   Header + search + filter tabs + content cards
   ========================================== */
export function StudentSearchSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="35%" />
      <div className={styles.main}>
        <div className={s("searchBar")} />
        <div className={styles.filterRow}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={s("filterChip")} style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.contentCard} style={{ animationDelay: `${i * 0.12}s` }}>
              <div className={styles.contentCardRow}>
                <div className={s("contentCardBadge")} />
                <div className={s("contentCardBadge")} style={{ width: 50 }} />
              </div>
              <div className={s("contentCardTitle")} />
              <div className={s("contentCardDesc")} />
              <div className={styles.contentCardFooter}>
                <div className={s("contentCardMeta")} />
                <div className={s("contentCardMeta")} />
                <div className={s("contentCardButton")} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

/* ==========================================
   SETTINGS
   Header + form cards
   ========================================== */
export function StudentSettingsSkeleton() {
  return (
    <div className={styles.container}>
      <StdHeader />
      <div className={styles.main}>
        <div>
          <div className={s("pageTitle")} style={{ width: "30%" }} />
          <div className={s("pageSubtitle")} style={{ width: "55%" }} />
        </div>

        {/* Profile card */}
        <div className={styles.formCard}>
          <div className={s("formCardTitle")} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.formField}>
              <div className={s("formLabel")} />
              <div className={s("formInput")} />
            </div>
          ))}
          <div className={s("formButton")} />
        </div>

        {/* Theme card */}
        <div className={styles.formCard}>
          <div className={s("formCardTitle")} style={{ width: "20%" }} />
          <div className={styles.formField}>
            <div className={s("formLabel")} style={{ width: "35%" }} />
            <div className={s("formInput")} style={{ width: 60, height: 28, borderRadius: 14 }} />
          </div>
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

/* ==========================================
   COURSE PLAYER
   Video area + lesson sidebar
   ========================================== */
export function StudentPlayerSkeleton() {
  return (
    <div className={styles.container} style={{ background: "var(--color-neutral-12)" }}>
      <div className={styles.playerVideo}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <div className={s("playerPlayBtn")} style={{ background: "var(--color-neutral-8)" }} />
        </div>
      </div>
      <div style={{ background: "var(--color-neutral-1)", flex: 1, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: "var(--space-4)" }}>
        <div className={styles.playerSidebar}>
          <div className={s("backTitle")} style={{ width: "65%", height: 18 }} />
          <div className={s("pageSubtitle")} style={{ width: "40%" }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.lessonRow} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={s("lessonIcon")} />
              <div className={s("lessonTitle")} />
              <div className={s("lessonDuration")} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   ABOUT PAGE
   Header + about sections + testimonials
   ========================================== */
export function StudentAboutSkeleton() {
  return (
    <div className={styles.container}>
      <StdHeader />
      <div className={styles.main}>
        <div className={styles.aboutSection}>
          <div className={s("aboutIcon")} />
          <div className={s("pageTitle")} style={{ width: "50%", alignSelf: "center" }} />
          <div className={styles.aboutTextBlock}>
            <div className={s("contentCardDesc")} style={{ width: "100%" }} />
            <div className={s("contentCardDesc")} style={{ width: "85%" }} />
            <div className={s("contentCardDesc")} style={{ width: "70%" }} />
          </div>
        </div>
        {/* Testimonials */}
        <div className={s("sectionLabel")} style={{ width: "40%" }} />
        <div style={{ display: "flex", gap: "var(--space-3)", overflow: "hidden" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.contentCard} style={{ flex: "0 0 80%", animationDelay: `${i * 0.1}s` }}>
              <div className={s("contentCardTitle")} style={{ width: "40%" }} />
              <div className={s("contentCardDesc")} />
              <div className={s("contentCardDesc")} style={{ width: "60%" }} />
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

/* ==========================================
   ENROLL / PAYMENT pages (simple form)
   ========================================== */
export function StudentFormSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="30%" />
      <div className={styles.main}>
        <div className={styles.formCard}>
          <div className={s("formCardTitle")} style={{ width: "50%" }} />
          <div className={s("contentCardDesc")} style={{ width: "80%" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.formField}>
                <div className={s("formLabel")} />
                <div className={s("formInput")} />
              </div>
            ))}
          </div>
          <div className={s("formButton")} style={{ width: "100%" }} />
        </div>
      </div>
    </div>
  );
}

export function StudentLibrarySkeleton() {
  return (
    <div className={styles.container}>
      <StdHeader />
      <div className={styles.main}>
        <div>
          <div className={s("pageTitle")} style={{ width: "26%" }} />
          <div className={s("pageSubtitle")} style={{ width: "54%" }} />
        </div>
        <div className={s("searchBar")} />
        <div className={styles.filterRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={s("filterChip")} style={{ width: i === 0 ? 92 : 72, animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.contentCard} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.contentCardRow}>
                <div className={s("contentCardBadge")} />
                <div className={s("contentCardBadge")} style={{ width: 84 }} />
              </div>
              <div className={s("contentCardTitle")} style={{ width: i % 2 === 0 ? "72%" : "58%" }} />
              <div className={s("contentCardDesc")} style={{ width: "92%" }} />
              <div className={s("contentCardDesc")} style={{ width: "68%" }} />
              <div className={styles.contentCardFooter}>
                <div className={s("contentCardMeta")} />
                <div className={s("contentCardMeta")} />
                <div className={s("contentCardButton")} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

export function StudentMyCoursesSkeleton() {
  return (
    <div className={styles.container}>
      <StdHeader />
      <div className={styles.main}>
        <div>
          <div className={s("pageTitle")} style={{ width: "34%" }} />
          <div className={s("pageSubtitle")} style={{ width: "62%" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--space-3)" }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={styles.formCard}>
              <div className={s("contentCardMeta")} style={{ width: 60, height: 14 }} />
              <div className={s("pageTitle")} style={{ width: "48%", marginBottom: 0 }} />
              <div className={s("pageSubtitle")} style={{ width: "72%" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.contentCard} style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                <div className={styles.courseCardImage} style={{ width: 88, aspectRatio: "1 / 1", borderRadius: 12, flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className={s("contentCardTitle")} style={{ width: i === 0 ? "72%" : "58%" }} />
                  <div className={s("contentCardDesc")} style={{ width: "78%" }} />
                  <div className={s("searchBar")} style={{ height: 8, borderRadius: 999 }} />
                </div>
              </div>
              <div className={styles.contentCardFooter}>
                <div className={s("contentCardBadge")} style={{ width: 88 }} />
                <div className={s("contentCardMeta")} style={{ width: 70 }} />
                <div className={s("contentCardButton")} style={{ width: 112 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

export function StudentMyEnrollmentsSkeleton() {
  return (
    <div className={styles.container}>
      <StdHeader />
      <div className={styles.main}>
        <div>
          <div className={s("pageTitle")} style={{ width: "38%" }} />
          <div className={s("pageSubtitle")} style={{ width: "66%" }} />
        </div>
        <div className={styles.filterRow}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={s("filterChip")} style={{ width: i === 0 ? 82 : 96, animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.contentCard}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", alignItems: "flex-start" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className={s("contentCardTitle")} style={{ width: i === 1 ? "58%" : "74%" }} />
                  <div className={s("contentCardDesc")} style={{ width: "88%" }} />
                </div>
                <div className={s("contentCardBadge")} style={{ width: 90, flexShrink: 0 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-3)" }}>
                {Array.from({ length: 3 }).map((_, metaIndex) => (
                  <div key={metaIndex} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div className={s("contentCardMeta")} style={{ width: 46 }} />
                    <div className={s("contentCardDesc")} style={{ width: "100%" }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

export function StudentMyPaymentsSkeleton() {
  return (
    <div className={styles.container}>
      <StdHeader />
      <div className={styles.main}>
        <div>
          <div className={s("pageTitle")} style={{ width: "30%" }} />
          <div className={s("pageSubtitle")} style={{ width: "70%" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.formCard}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", alignItems: "center" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className={s("contentCardTitle")} style={{ width: i === 2 ? "52%" : "68%" }} />
                  <div className={s("contentCardDesc")} style={{ width: "44%" }} />
                </div>
                <div className={s("contentCardBadge")} style={{ width: 82 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--space-3)" }}>
                {Array.from({ length: 4 }).map((_, detailIndex) => (
                  <div key={detailIndex} className={styles.formField}>
                    <div className={s("formLabel")} style={{ width: detailIndex % 2 === 0 ? "34%" : "42%" }} />
                    <div className={s("formInput")} style={{ height: 14, borderRadius: 8 }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <div className={s("listItemIcon")} style={{ width: 18, height: 18 }} />
                <div className={s("contentCardDesc")} style={{ width: i === 0 ? "46%" : "58%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

export function StudentDownloadsSkeleton() {
  return (
    <div className={styles.container}>
      <StdHeader />
      <div className={styles.main}>
        <div>
          <div className={s("pageTitle")} style={{ width: "28%" }} />
          <div className={s("pageSubtitle")} style={{ width: "56%" }} />
        </div>
        <div className={s("searchBar")} />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.listItem}>
              <div className={s("listItemIcon")} />
              <div className={styles.listItemLines}>
                <div className={s("listItemLine1")} style={{ width: i === 1 ? "52%" : "72%" }} />
                <div className={s("listItemLine2")} style={{ width: "38%" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                <div className={s("contentCardMeta")} style={{ width: 52 }} />
                <div className={s("listItemAction")} style={{ width: 72 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

export function StudentCompetitionsSkeleton() {
  return (
    <div className={styles.container}>
      <StdHeader />
      <div className={styles.main}>
        <div className={styles.contentCard}>
          <div className={s("contentCardBadge")} style={{ width: 110 }} />
          <div className={s("pageTitle")} style={{ width: "58%", marginBottom: 0 }} />
          <div className={s("pageSubtitle")} style={{ width: "76%" }} />
          <div className={styles.contentCardFooter}>
            <div className={s("contentCardMeta")} />
            <div className={s("contentCardMeta")} />
            <div className={s("contentCardButton")} />
          </div>
        </div>
        <div className={styles.filterRow}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={s("filterChip")} style={{ width: i === 0 ? 84 : 76 }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.contentCard}>
              <div className={styles.contentCardRow}>
                <div className={s("contentCardBadge")} />
                <div className={s("contentCardBadge")} style={{ width: 72 }} />
              </div>
              <div className={s("contentCardTitle")} style={{ width: i === 0 ? "76%" : "62%" }} />
              <div className={s("contentCardDesc")} style={{ width: "92%" }} />
              <div className={styles.contentCardFooter}>
                <div className={s("contentCardMeta")} />
                <div className={s("contentCardMeta")} />
                <div className={s("contentCardButton")} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

export function StudentCompetitionExamSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="44%" />
      <div className={styles.main}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)" }}>
          <div className={s("contentCardBadge")} style={{ width: 86 }} />
          <div className={s("contentCardBadge")} style={{ width: 110 }} />
        </div>
        <div className={s("searchBar")} style={{ height: 10, borderRadius: 999 }} />
        <div className={styles.formCard}>
          <div className={s("contentCardMeta")} style={{ width: 64 }} />
          <div className={s("contentCardTitle")} style={{ width: "92%", height: 18 }} />
          <div className={s("contentCardDesc")} style={{ width: "88%" }} />
          <div className={s("contentCardDesc")} style={{ width: "74%" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.lessonRow}>
                <div className={s("lessonIcon")} style={{ borderRadius: 999 }} />
                <div className={s("lessonTitle")} style={{ width: i % 2 === 0 ? "72%" : "58%", flex: "unset" }} />
              </div>
            ))}
          </div>
          <div className={s("formButton")} style={{ width: "100%", alignSelf: "stretch" }} />
        </div>
      </div>
    </div>
  );
}

export function StudentCourseDetailSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="50%" />
      <div className={styles.main}>
        <div className={`${styles.detailHero} ${styles.shimmer}`} />
        <div className={s("detailTitle")} />
        <div className={styles.detailMeta}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={s("detailMetaItem")} />
          ))}
        </div>
        <div className={s("detailEnrollBar")} />
        {Array.from({ length: 2 }).map((_, ci) => (
          <div key={ci} className={styles.chapterBlock}>
            <div className={s("chapterTitle")} style={{ width: ci === 0 ? "46%" : "58%" }} />
            {Array.from({ length: 3 }).map((_, li) => (
              <div key={li} className={styles.lessonRow}>
                <div className={s("lessonIcon")} />
                <div className={s("lessonTitle")} />
                <div className={s("lessonDuration")} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <BottomNavSkel />
    </div>
  );
}

export function StudentCoursePreviewSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="54%" />
      <div className={styles.main}>
        <div className={`${styles.detailHero} ${styles.shimmer}`} />
        <div className={styles.contentCardRow}>
          <div className={s("contentCardBadge")} style={{ width: 78 }} />
          <div className={s("contentCardMeta")} style={{ width: 64, height: 22, borderRadius: 12 }} />
        </div>
        <div className={s("detailTitle")} style={{ width: "64%" }} />
        <div className={styles.detailMeta}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={s("detailMetaItem")} />
          ))}
        </div>
        <div className={styles.contentCard}>
          <div className={s("sectionLabel")} style={{ width: "38%" }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.lessonRow}>
              <div className={s("lessonIcon")} />
              <div className={s("lessonTitle")} style={{ width: i === 1 ? "52%" : "68%", flex: "unset" }} />
              <div className={s("contentCardBadge")} style={{ width: 72, height: 24 }} />
            </div>
          ))}
          <div className={s("formButton")} style={{ width: "100%", alignSelf: "stretch" }} />
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

export function StudentBundleDetailSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="52%" />
      <div className={styles.main}>
        <div className={`${styles.detailHero} ${styles.shimmer}`} />
        <div className={s("detailTitle")} style={{ width: "62%" }} />
        <div className={styles.detailMeta}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={s("detailMetaItem")} style={{ width: i === 1 ? 96 : 72 }} />
          ))}
        </div>
        <div className={s("detailEnrollBar")} />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.contentCard}>
              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                <div className={styles.courseCardImage} style={{ width: 64, aspectRatio: "1 / 1", borderRadius: 12, flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className={s("contentCardTitle")} style={{ width: i === 0 ? "70%" : "54%" }} />
                  <div className={s("contentCardDesc")} style={{ width: "64%" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

export function StudentBundlePreviewSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="56%" />
      <div className={styles.main}>
        <div className={`${styles.detailHero} ${styles.shimmer}`} />
        <div className={styles.contentCardRow}>
          <div className={s("contentCardBadge")} style={{ width: 78 }} />
          <div className={s("contentCardMeta")} style={{ width: 82, height: 22, borderRadius: 12 }} />
        </div>
        <div className={s("detailTitle")} style={{ width: "68%" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={styles.contentCard}>
              <div className={s("contentCardTitle")} style={{ width: i === 0 ? "66%" : "54%" }} />
              <div className={s("contentCardDesc")} style={{ width: "72%" }} />
              <div className={styles.contentCardFooter}>
                <div className={s("contentCardMeta")} />
                <div className={s("contentCardMeta")} />
              </div>
            </div>
          ))}
        </div>
        <div className={s("formButton")} style={{ width: "100%", alignSelf: "stretch" }} />
      </div>
      <BottomNavSkel />
    </div>
  );
}

export function StudentCoursePlayerSkeleton() {
  return <StudentPlayerSkeleton />;
}

export function StudentCourseExamSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="42%" />
      <div className={styles.main}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)" }}>
          <div className={s("contentCardBadge")} style={{ width: 98 }} />
          <div className={s("contentCardBadge")} style={{ width: 84 }} />
        </div>
        <div className={s("searchBar")} style={{ height: 10, borderRadius: 999 }} />
        <div className={styles.formCard}>
          <div className={s("contentCardMeta")} style={{ width: 72 }} />
          <div className={s("contentCardTitle")} style={{ width: "86%", height: 18 }} />
          <div className={s("contentCardDesc")} style={{ width: "82%" }} />
          <div style={{ display: "grid", gap: "var(--space-3)" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.lessonRow}>
                <div className={s("lessonIcon")} style={{ borderRadius: 999 }} />
                <div className={s("lessonTitle")} style={{ width: i === 2 ? "56%" : "74%", flex: "unset" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <div className={s("formButton")} style={{ flex: 1, alignSelf: "stretch" }} />
            <div className={s("formButton")} style={{ flex: 1, alignSelf: "stretch" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentEnrollSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="28%" />
      <div className={styles.main}>
        <div className={styles.formCard}>
          <div className={s("formCardTitle")} style={{ width: "44%" }} />
          <div className={s("contentCardTitle")} style={{ width: "72%" }} />
          <div className={styles.contentCardFooter}>
            <div className={s("contentCardMeta")} />
            <div className={s("contentCardMeta")} />
          </div>
        </div>
        <div className={styles.formCard}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.formField}>
              <div className={s("formLabel")} style={{ width: i === 0 ? "34%" : "28%" }} />
              <div className={s("formInput")} />
            </div>
          ))}
          <div className={s("formButton")} style={{ width: "100%", alignSelf: "stretch" }} />
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

export function StudentBrowseCoursesSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="38%" />
      <div className={styles.main}>
        <div className={s("searchBar")} />
        <div className={styles.filterRow}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={s("filterChip")} style={{ width: i === 0 ? 88 : 74 }} />
          ))}
        </div>
        <div className={styles.courseGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.courseCardSkel}>
              <div className={styles.courseCardImage} />
              <div className={styles.courseCardBody}>
                <div className={s("courseCardTitle")} style={{ width: i % 2 === 0 ? "84%" : "66%" }} />
                <div className={s("courseCardPrice")} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

export function StudentBrowseBundlesSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="36%" />
      <div className={styles.main}>
        <div className={s("searchBar")} />
        <div className={styles.filterRow}>
          <div className={s("filterChip")} style={{ width: 72 }} />
          <div className={s("filterChip")} style={{ width: 96 }} />
        </div>
        <div className={styles.contentCard}>
          <div className={s("contentCardBadge")} style={{ width: 92 }} />
          <div className={s("pageTitle")} style={{ width: "54%", marginBottom: 0 }} />
          <div className={s("pageSubtitle")} style={{ width: "72%" }} />
        </div>
        <div className={styles.courseGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.courseCardSkel}>
              <div className={styles.courseCardImage} style={{ aspectRatio: "1 / 1" }} />
              <div className={styles.courseCardBody}>
                <div className={s("courseCardTitle")} style={{ width: i === 0 ? "82%" : "64%" }} />
                <div className={s("courseCardPrice")} style={{ width: "58%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

export function StudentPaymentSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="34%" />
      <div className={styles.main}>
        <div className={styles.formCard}>
          <div className={s("formCardTitle")} style={{ width: "36%" }} />
          <div className={s("pageTitle")} style={{ width: "42%", marginBottom: 0 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-3)" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.contentCard}>
              <div className={s("listItemIcon")} style={{ width: 28, height: 28 }} />
              <div className={s("contentCardTitle")} style={{ width: "92%" }} />
              <div className={s("contentCardDesc")} style={{ width: "68%" }} />
            </div>
          ))}
        </div>
        <div className={styles.formCard}>
          <div className={s("contentCardTitle")} style={{ width: "52%" }} />
          <div className={s("contentCardDesc")} style={{ width: "70%" }} />
          <div className={s("formButton")} style={{ width: "100%", alignSelf: "stretch" }} />
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

export function StudentPaymentInstructionsSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="48%" />
      <div className={styles.main}>
        <div className={styles.formCard}>
          <div className={s("pageTitle")} style={{ width: "44%", marginBottom: 0 }} />
          <div className={s("pageSubtitle")} style={{ width: "64%" }} />
        </div>
        <div className={styles.formCard}>
          <div className={s("formCardTitle")} style={{ width: "30%" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-3)" }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={s("formInput")} style={{ height: 72 }} />
            ))}
          </div>
        </div>
        <div className={styles.formCard}>
          <div className={s("contentCardTitle")} style={{ width: "48%" }} />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", alignItems: "center" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div className={s("formLabel")} style={{ width: i === 0 ? "32%" : "28%" }} />
                <div className={s("formInput")} style={{ height: 14, borderRadius: 8 }} />
              </div>
              <div className={s("listItemAction")} style={{ width: 36, height: 36 }} />
            </div>
          ))}
        </div>
        <div className={styles.formCard}>
          <div className={s("contentCardTitle")} style={{ width: "40%" }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.lessonRow}>
              <div className={s("contentCardBadge")} style={{ width: 28, height: 28, borderRadius: 999 }} />
              <div className={s("lessonTitle")} style={{ width: i === 2 ? "62%" : "80%", flex: "unset" }} />
            </div>
          ))}
          <div className={s("formButton")} style={{ width: "100%", alignSelf: "stretch" }} />
        </div>
      </div>
    </div>
  );
}

export function StudentPaymentProofSkeleton() {
  return (
    <div className={styles.container}>
      <BackHeader titleWidth="38%" />
      <div className={styles.main}>
        <div className={styles.formCard}>
          <div className={s("contentCardTitle")} style={{ width: "56%" }} />
          <div className={styles.contentCardFooter}>
            <div className={s("contentCardMeta")} />
            <div className={s("contentCardMeta")} />
          </div>
        </div>
        <div className={styles.formCard}>
          <div className={s("formCardTitle")} style={{ width: "34%" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-3)" }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={s("formInput")} style={{ height: 96, borderRadius: 16 }} />
            ))}
          </div>
          <div className={styles.formField}>
            <div className={s("formLabel")} style={{ width: "30%" }} />
            <div className={s("formInput")} />
          </div>
          <div className={s("formButton")} style={{ width: "100%", alignSelf: "stretch" }} />
        </div>
      </div>
    </div>
  );
}

export function StudentPaymentSuccessSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.main} style={{ alignItems: "center", justifyContent: "center", paddingBottom: "var(--space-6)" }}>
        <div className={styles.formCard} style={{ width: "100%", maxWidth: 560, alignItems: "center", textAlign: "center" }}>
          <div className={s("aboutIcon")} style={{ width: 72, height: 72 }} />
          <div className={s("pageTitle")} style={{ width: "52%", marginBottom: 0 }} />
          <div className={s("pageSubtitle")} style={{ width: "74%" }} />
          <div className={styles.formCard} style={{ width: "100%" }}>
            <div className={s("contentCardTitle")} style={{ width: "42%" }} />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.lessonRow}>
                <div className={s("lessonIcon")} style={{ borderRadius: 999 }} />
                <div className={s("lessonTitle")} style={{ width: i === 1 ? "68%" : "82%", flex: "unset" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "var(--space-3)", width: "100%" }}>
            <div className={s("formButton")} style={{ flex: 1, alignSelf: "stretch" }} />
            <div className={s("formButton")} style={{ flex: 1, alignSelf: "stretch" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentHowToUseSkeleton() {
  return (
    <div className={styles.container}>
      <StdHeader />
      <div className={styles.main}>
        <div>
          <div className={s("pageTitle")} style={{ width: "36%" }} />
          <div className={s("pageSubtitle")} style={{ width: "62%" }} />
        </div>
        <div className={`${styles.detailHero} ${styles.shimmer}`} />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.contentCard}>
              <div className={styles.contentCardRow}>
                <div className={s("contentCardBadge")} style={{ width: 34, height: 34, borderRadius: 999 }} />
                <div className={s("contentCardTitle")} style={{ width: i === 1 ? "54%" : "68%" }} />
              </div>
              <div className={s("contentCardDesc")} style={{ width: "92%" }} />
              <div className={s("contentCardDesc")} style={{ width: "70%" }} />
            </div>
          ))}
        </div>
      </div>
      <BottomNavSkel />
    </div>
  );
}

/* ==========================================
   TEACHER DASHBOARD
   ========================================== */
export function TeacherDashboardSkeleton() {
  return (
    <div className={styles.teacherLayout}>
      <TeacherSidebarSkel />
      <div className={styles.teacherMain}>
        <TeacherHeaderSkel />
        <div className={styles.teacherContent}>
          {/* Welcome */}
          <div>
            <div className={s("pageTitle")} style={{ width: "55%" }} />
            <div className={s("pageSubtitle")} style={{ width: "75%", marginTop: 8 }} />
          </div>
          {/* Stats */}
          <div className={styles.teacherStatsRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.teacherStatCard} style={{ animationDelay: `${i * 0.12}s` }}>
                <div className={s("teacherStatIcon")} />
                <div className={s("teacherStatValue")} />
                <div className={s("teacherStatLabel")} />
              </div>
            ))}
          </div>
          {/* Course list */}
          <div className={styles.sectionRow}>
            <div className={s("sectionLabel")} style={{ width: "35%" }} />
            <div className={s("sectionSeeAll")} />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.teacherCourseItem} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={s("teacherCourseIcon")} />
              <div className={styles.teacherCourseLines}>
                <div className={s("listItemLine1")} />
                <div className={s("listItemLine2")} />
              </div>
              <div className={s("teacherCourseBtn")} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   TEACHER GENERIC PAGE (list/content)
   ========================================== */
export function TeacherPageSkeleton() {
  return (
    <div className={styles.teacherLayout}>
      <TeacherSidebarSkel />
      <div className={styles.teacherMain}>
        <TeacherHeaderSkel />
        <div className={styles.teacherContent}>
          <div>
            <div className={s("pageTitle")} />
          </div>
          <div className={s("searchBar")} style={{ maxWidth: 400 }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.teacherCourseItem} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={s("teacherCourseIcon")} />
              <div className={styles.teacherCourseLines}>
                <div className={s("listItemLine1")} />
                <div className={s("listItemLine2")} />
              </div>
              <div className={s("teacherCourseBtn")} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   TEACHER EARNINGS PAGE (stats + table)
   ========================================== */
export function TeacherStatsSkeleton() {
  return (
    <div className={styles.teacherLayout}>
      <TeacherSidebarSkel />
      <div className={styles.teacherMain}>
        <TeacherHeaderSkel />
        <div className={styles.teacherContent}>
          <div className={s("pageTitle")} />
          <div className={styles.teacherStatsRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.teacherStatCard} style={{ animationDelay: `${i * 0.12}s` }}>
                <div className={s("teacherStatIcon")} />
                <div className={s("teacherStatValue")} />
                <div className={s("teacherStatLabel")} />
              </div>
            ))}
          </div>
          <div className={s("sectionLabel")} style={{ width: "30%" }} />
          <div className={styles.teacherTable}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.teacherTableRow} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={s("teacherTableCell")} />
                <div className={s("teacherTableCell")} />
                <div className={s("teacherTableCell")} />
                <div className={s("teacherTableCell")} style={{ flex: 0.5 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Shared teacher sidebar skeleton */
function TeacherSidebarSkel() {
  return (
    <div className={styles.teacherSidebar}>
      <div className={s("teacherSidebarLogo")} />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className={styles.teacherSidebarItem}>
          <div className={s("teacherSidebarIcon")} />
          <div className={s("teacherSidebarLabel")} />
        </div>
      ))}
    </div>
  );
}

/* Shared teacher header skeleton */
function TeacherHeaderSkel() {
  return (
    <div className={styles.teacherHeader}>
      <div className={s("stdHeaderIcon")} />
      <div className={s("stdHeaderLogo")} style={{ width: 100 }} />
      <div style={{ flex: 1 }} />
      <div className={s("stdHeaderIcon")} />
    </div>
  );
}
