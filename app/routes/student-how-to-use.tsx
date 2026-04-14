import { useState, useEffect } from "react";
import type { Route } from "./+types/student-how-to-use";
import { Menu, Bell, PlayCircle, BookOpen, Trophy, Download, CreditCard } from "lucide-react";
import { BottomNav } from "~/components/bottom-nav";
import { Sheet, SheetContent } from "~/components/ui/sheet/sheet";
import { SideMenu } from "~/components/side-menu";
import { NotificationPanel } from "~/components/notification-panel";
import { Badge } from "~/components/ui/badge/badge";
import { StudentFooter } from "~/components/student-footer";
import { TutorialVideoPlayer } from "~/components/tutorial-video-player";
import { OfflineBanner } from "~/components/offline-banner";
import { getStudentAuth } from "~/lib/auth.client";
import { getUserNotifications, getUnreadCount } from "~/services/notification.client";
import { getTutorialVideos } from "~/services/tutorial.client";
import styles from "./student-how-to-use.module.css";


export function meta({}: Route.MetaArgs) {
  return [{ title: "How to Use - Magster" }, { name: "description", content: "Learn how to use Magster platform" }];
}

export default function StudentHowToUse() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCountState] = useState(0);
  const [tutorialVideos, setTutorialVideos] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [student, videos] = await Promise.all([
        getStudentAuth(),
        getTutorialVideos('student'),
      ]);
      if (student) {
        const [notifs, count] = await Promise.all([
          getUserNotifications(student.id, 'student'),
          getUnreadCount(student.id, 'student'),
        ]);
        setNotifications(notifs || []);
        setUnreadCountState(count || 0);
      }
      setTutorialVideos(videos || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div style={{ minHeight: '100dvh', background: 'var(--color-neutral-1)' }} />;

  const guides = [
    { icon: BookOpen, title: "Browse Courses", description: "Explore available courses and bundles. View course details, lessons, and pricing." },
    { icon: CreditCard, title: "Enroll & Pay", description: "Select a course or bundle, choose a payment method, and submit payment proof for approval." },
    { icon: PlayCircle, title: "Watch Lessons", description: "Once approved, access your enrolled courses and watch video lessons at your own pace." },
    { icon: Download, title: "Download Materials", description: "Download PDFs, notes, and other learning materials from the library section." },
    { icon: Trophy, title: "Join Competitions", description: "Participate in competitions, test your knowledge, and compete with other students." },
  ];

  const activeVideo = tutorialVideos[activeVideoIndex];

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
          <h2 className={styles.pageTitle}>How to Use Magster</h2>
          <p className={styles.pageSubtitle}>Get started with our platform in just a few simple steps</p>
        </div>

        {tutorialVideos.length > 0 && activeVideo && (
          <div className={styles.videoSection}>
            <h3 className={styles.videoSectionTitle}>Tutorial Videos</h3>
            <TutorialVideoPlayer videoUrl={activeVideo.video_url} title={activeVideo.title} onNext={() => setActiveVideoIndex(i => Math.min(i + 1, tutorialVideos.length - 1))} onPrevious={() => setActiveVideoIndex(i => Math.max(i - 1, 0))} hasNext={activeVideoIndex < tutorialVideos.length - 1} hasPrevious={activeVideoIndex > 0} />
            {activeVideo.description && <p className={styles.videoDescription}>{activeVideo.description}</p>}
            {tutorialVideos.length > 1 && (
              <div className={styles.videoList}>
                {tutorialVideos.map((video: any, index: number) => (
                  <button key={video.id} className={`${styles.videoListItem} ${index === activeVideoIndex ? styles.activeVideo : ''}`} onClick={() => setActiveVideoIndex(index)}>
                    <PlayCircle size={16} /><span>{video.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={styles.guideGrid}>
          {guides.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <div key={index} className={styles.guideCard}>
                <div className={styles.iconWrapper}><Icon className={styles.guideIcon} size={32} /></div>
                <h3 className={styles.guideTitle}>{guide.title}</h3>
                <p className={styles.guideDescription}>{guide.description}</p>
                <div className={styles.stepNumber}>{index + 1}</div>
              </div>
            );
          })}
        </div>

        <div className={styles.tipsSection}>
          <h3 className={styles.tipsTitle}>Important Tips</h3>
          <ul className={styles.tipsList}>
            <li>Make sure your payment screenshots are clear and show all transaction details</li>
            <li>Wait for admin approval before accessing course content</li>
            <li>Check notifications regularly for updates on your enrollments and payments</li>
            <li>Use the in-app notifications to stay updated on your account</li>
            <li>Your device will be bound to your account for security purposes</li>
          </ul>
        </div>
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
