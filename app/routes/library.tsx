import { useState, useEffect, useMemo } from "react";
import type { Route } from "./+types/library";
import { Menu, Bell, Search, Book, FileText, Award, Lock, X, ChevronLeft, Video } from "lucide-react";
import { BottomNav } from "~/components/bottom-nav";
import { Sheet, SheetContent } from "~/components/ui/sheet/sheet";
import { SideMenu } from "~/components/side-menu";
import { NotificationPanel } from "~/components/notification-panel";
import { Badge } from "~/components/ui/badge/badge";
import { MarkdownRenderer } from "~/components/markdown-renderer";
import { CustomVideoPlayer } from "~/components/custom-video-player";
import { SecureVideoPlayer } from "~/components/secure-video-player";
import { StudentFooter } from "~/components/student-footer";
import { OfflineBanner } from "~/components/offline-banner";
import { LockedIcon } from "~/components/locked-icon";
import { getStudentAuth } from "~/lib/auth.client";
import { getUserNotifications, getUnreadCount } from "~/services/notification.client";
import { hasAccessToCourse } from "~/services/enrollment.client";
import { supabase } from "~/lib/supabase.client";
import { LoadingScreen } from "~/components/loading-screen";
import styles from "./library.module.css";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Library - Magster" }, { name: "description", content: "Access educational resources" }];
}

export default function Library() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCountState] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'az' | 'course'>('az');
  const [openItem, setOpenItem] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const student = await getStudentAuth();
      if (!student) return;
      setStudent(student);

      const [notifs, count, contentRes] = await Promise.all([
        getUserNotifications(student.id, 'student'),
        getUnreadCount(student.id, 'student'),
        supabase.from('library_content').select('*, course:courses(id, name), category:library_items(id, name)').eq('approval_status', 'approved').order('created_at', { ascending: false }),
      ]);
      setNotifications(notifs || []);
      setUnreadCountState(count || 0);
      const allItems = contentRes.data || [];
      setItems(allItems);

      // Check access for each unique course_id
      const courseIds = [...new Set(allItems.map((i: any) => i.course_id).filter(Boolean))];
      const accessChecks: Record<string, boolean> = {};
      await Promise.all(courseIds.map(async (cid: string) => {
        accessChecks[cid] = await hasAccessToCourse(student.id, cid);
      }));
      setAccessMap(accessChecks);
      setLoading(false);
    }
    load();
  }, []);

  const tabOptions = [
    { key: "All", label: "All", icon: Book },
    { key: "book", label: "Books", icon: Book },
    { key: "exam", label: "Exams", icon: Award },
    { key: "video", label: "Videos", icon: Video },
  ];

  const filteredItems = useMemo(() => {
    let result = items.filter((item) => {
      const matchesSearch = !searchQuery ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.course?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "All" || item.content_type === activeTab;
      return matchesSearch && matchesTab;
    });

    if (sortBy === 'az') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else {
      result.sort((a, b) => (a.course?.name || '').localeCompare(b.course?.name || ''));
    }

    return result;
  }, [items, searchQuery, activeTab, sortBy]);

  if (loading) return <LoadingScreen />;

  const hasAccess = (item: any) => item.course_id ? accessMap[item.course_id] === true : true;
  const isSecureLibraryUpload = (item: any) => item.content_type === 'video' && Boolean(item.file_url) && (item.video_source === 'upload' || item.video_source === 'supabase');

  // Open item view
  if (openItem) {
    const unlocked = hasAccess(openItem);
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button className={styles.menuButton} onClick={() => setOpenItem(null)}>
            <ChevronLeft size={24} />
          </button>
          <h1 className={styles.logo} style={{ fontSize: '1rem' }}>{openItem.title}</h1>
          <div style={{ width: 40 }} />
        </header>
        <main className={styles.readerMain}>
          {!unlocked ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-neutral-10)' }}>
              <Lock size={48} style={{ margin: '0 auto var(--space-4)', opacity: 0.5 }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--color-neutral-12)' }}>Content Locked</h2>
              <p>You need to enroll in <strong>{openItem.course?.name || 'the linked course'}</strong> to access this content.</p>
            </div>
          ) : openItem.content_type === 'video' ? (
            isSecureLibraryUpload(openItem) ? (
              <SecureVideoPlayer
                libraryContentId={openItem.id}
                studentId={student?.id}
                studentName={student?.full_name}
                title={openItem.title}
              />
            ) : openItem.youtube_url ? (
              <CustomVideoPlayer
                videoUrl={openItem.youtube_url}
                gdriveUrl={openItem.file_url && !openItem.file_url.includes('youtube') ? openItem.file_url : undefined}
                title={openItem.title}
              />
            ) : openItem.file_url ? (
              <CustomVideoPlayer
                videoUrl={openItem.file_url}
                title={openItem.title}
              />
            ) : (
              <p style={{ padding: 'var(--space-6)', textAlign: 'center' }}>No video available</p>
            )
          ) : openItem.content_markdown ? (
            <div style={{ padding: 'var(--space-4)' }}>
              <MarkdownRenderer content={openItem.content_markdown} />
            </div>
          ) : (
            <p style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-neutral-10)' }}>No content available</p>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.menuButton} onClick={() => setMenuOpen(true)}><Menu size={24} /></button>
        <h1 className={styles.logo}>Library</h1>
        <button className={styles.notificationButton} onClick={() => setNotificationsOpen(true)}>
          <Bell size={24} />
          {unreadCount > 0 && <Badge variant="destructive" className={styles.notificationBadge}>{unreadCount}</Badge>}
        </button>
      </div>

      <OfflineBanner />
      <main className={styles.main}>
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input type="search" placeholder="Search by title, subject, or course..." className={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {searchQuery && <button className={styles.clearSearch} onClick={() => setSearchQuery("")}><X size={16} /></button>}
          </div>
        </div>

        <div className={styles.tabBar}>
          {tabOptions.map((cat) => (
            <button key={cat.key} className={`${styles.tabButton} ${activeTab === cat.key ? styles.tabActive : ''}`} onClick={() => setActiveTab(cat.key)}>
              <cat.icon size={14} /><span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--space-4)', marginBottom: 'var(--space-3)' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-10)', margin: 0 }}>
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={() => setSortBy('az')}
              style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-2)', border: '1px solid var(--color-neutral-6)', background: sortBy === 'az' ? 'var(--color-accent-3)' : 'transparent', color: sortBy === 'az' ? 'var(--color-accent-11)' : 'var(--color-neutral-11)', cursor: 'pointer' }}
            >A–Z</button>
            <button
              onClick={() => setSortBy('course')}
              style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-2)', border: '1px solid var(--color-neutral-6)', background: sortBy === 'course' ? 'var(--color-accent-3)' : 'transparent', color: sortBy === 'course' ? 'var(--color-accent-11)' : 'var(--color-neutral-11)', cursor: 'pointer' }}
            >By Course</button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className={styles.emptyState}><Book size={48} /><p>No items found{searchQuery ? ` for "${searchQuery}"` : ''}</p></div>
        ) : (
          <div className={styles.grid}>
            {filteredItems.map((item) => {
              const unlocked = hasAccess(item);
              return (
                <div key={item.id} className={styles.card} onClick={() => setOpenItem(item)} style={{ position: 'relative' }}>
                  {!unlocked && (
                    <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                      <Lock size={16} style={{ color: 'var(--color-error-9)' }} />
                    </div>
                  )}
                  <div className={styles.content} style={{ opacity: unlocked ? 1 : 0.6 }}>
                    <div className={styles.cardHeader}>
                      <Badge className={styles.typeBadge}>{item.content_type}</Badge>
                      {!unlocked && <Badge variant="destructive" style={{ fontSize: '0.65rem' }}>Locked</Badge>}
                    </div>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    {(item.course?.name || item.category?.name) && <p className={styles.author} style={{ fontSize: '0.75rem' }}>{item.course?.name || item.category?.name}</p>}
                    {item.author && <p className={styles.author}>by {item.author}</p>}
                    <div className={styles.cardFooter}>
                      <span className={styles.subject}>{item.subject}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
      <StudentFooter />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left"><SideMenu onClose={() => setMenuOpen(false)} /></SheetContent>
      </Sheet>

      <NotificationPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} notifications={notifications} unreadCount={unreadCount} />
    </div>
  );
}
