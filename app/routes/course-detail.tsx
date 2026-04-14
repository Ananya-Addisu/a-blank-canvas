import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ChevronLeft, Bell, Clock, BookOpen, PlayCircle, CheckCircle, Lock, FileText, Video, ArrowRight, ClipboardCheck, Award, HelpCircle } from "lucide-react";
import { BottomNav } from "~/components/bottom-nav";
import { NotificationPanel } from "~/components/notification-panel";
import { NoConnectionScreen } from "~/components/no-connection-screen";
import { Badge } from "~/components/ui/badge/badge";
import { getStudentAuth } from "~/lib/auth.client";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { getCourseById } from "~/services/course.client";
import { hasAccessToCourse } from "~/services/enrollment.client";
import { getCourseProgress } from "~/services/progress.client";
import { getUserNotifications, getUnreadCount } from "~/services/notification.client";
import { supabase } from "~/lib/supabase.client";
import styles from "./course-detail.module.css";


export default function CourseDetail() {
  const params = useParams();
  const courseId = params.courseId || params.id || '';
  const isOnline = useOnlineStatus();
  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progressData, setProgressData] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCountState] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
        const [courseData, student] = await Promise.all([getCourseById(courseId), getStudentAuth()]);
        if (cancelled) return;
        if (!courseData) {
          setLoading(false);
          return;
        }
        setCourse(courseData);

        const { data: quizData } = await supabase.from('quizzes').select('*, questions:quiz_questions(*)').eq('course_id', courseId).eq('is_published', true);
        setQuizzes((quizData || []).map((q: any) => ({ ...q, question_count: q.questions?.length || 0 })));

        if (student) {
          const [access, notifs, count] = await Promise.all([
            hasAccessToCourse(student.id, courseId),
            getUserNotifications(student.id, 'student'),
            getUnreadCount(student.id, 'student'),
          ]);
          setIsEnrolled(access);
          setNotifications(notifs || []);
          setUnreadCountState(count || 0);

          if (access) {
            const { data: enrollment } = await supabase.from('enrollments').select('id').eq('student_id', student.id).eq('course_id', courseId).eq('status', 'approved').limit(1).single();
            if (enrollment) {
              const progress = await getCourseProgress(student.id, enrollment.id);
              setProgressData(progress.data);
            }
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
  }, [courseId, isOnline]);

  if (fetchError === 'offline') return <NoConnectionScreen />;
  if (loading || !course) return <div style={{ minHeight: '100dvh', background: 'var(--color-neutral-1)' }} />;

  const getLessonStatus = (lessonId: string) => {
    if (!progressData?.progressRecords) return 'not_started';
    const record = progressData.progressRecords.find((p: any) => p.lesson_id === lessonId);
    return record?.status || 'not_started';
  };

  const handleLessonClick = (lessonId: string, isPreview: boolean) => {
    if (!isEnrolled && !isPreview) return;
    navigate(`/course-player/${course.id}/${lessonId}`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => navigate(-1)} className={styles.backButton}><ChevronLeft size={24} /></button>
          <h1 className={styles.headerTitle}>{course.name}</h1>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.notificationButton} onClick={() => setNotificationsOpen(true)}>
            <Bell size={24} />
            {unreadCount > 0 && <Badge variant="destructive" className={styles.notificationBadge}>{unreadCount}</Badge>}
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {!isEnrolled && (
          <div className={styles.enrollBanner}>
            <Link to={`/enroll?type=course&id=${course.id}`} className={styles.enrollButton}>Enroll Now - {Number(course.price).toLocaleString()} ETB</Link>
          </div>
        )}

        <div className={styles.chapters}>
          <div className={styles.chaptersHeader}><h2 className={styles.sectionTitle}>Course Curriculum</h2></div>
          {course.chapters?.map((chapter: any) => (
            <div key={chapter.id} className={styles.chapter}>
              <div className={styles.chapterHeader}>
                <h2 className={styles.chapterTitle}>{chapter.title}</h2>
                {chapter.description && <p className={styles.chapterDescription}>{chapter.description}</p>}
              </div>
              <ul className={styles.lessons}>
                {chapter.lessons?.map((lesson: any) => {
                  const lessonStatus = getLessonStatus(lesson.id);
                  const isLocked = !isEnrolled && !lesson.is_preview;
                  const isCompleted = lessonStatus === 'completed';
                  return (
                    <li key={lesson.id} className={`${styles.lesson} ${isLocked ? styles.locked : ''}`} onClick={() => handleLessonClick(lesson.id, lesson.is_preview)}>
                      <div className={styles.lessonLeft}>
                        {isCompleted ? <CheckCircle className={`${styles.lessonIcon} ${styles.lessonCompleted}`} /> : isLocked ? <Lock className={`${styles.lessonIcon} ${styles.lessonLocked}`} /> : lesson.lesson_type === 'video' ? <Video className={styles.lessonIcon} /> : lesson.lesson_type === 'pdf' ? <FileText className={styles.lessonIcon} /> : <PlayCircle className={styles.lessonIcon} />}
                        <div className={styles.lessonContent}>
                          <div className={styles.lessonTitle}>{lesson.title}{lesson.is_preview && <Badge variant="secondary" className={styles.previewBadge}>Preview</Badge>}</div>
                          <div className={styles.lessonMeta}>
                            {lesson.lesson_type === 'video' && lesson.duration && <span>{lesson.duration} min</span>}
                            {lesson.lesson_type === 'pdf' && lesson.page_count && <span>{lesson.page_count} pages</span>}
                            <span className={styles.lessonType}>{lesson.lesson_type}</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.lessonRight}>{!isLocked ? <div className={styles.playAction}><ArrowRight size={20} /></div> : <Lock size={16} className={styles.lockIcon} />}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {isEnrolled && quizzes.length > 0 && (
          <div className={styles.chapters} style={{ marginTop: 'var(--space-6)' }}>
            <div className={styles.chaptersHeader}><h2 className={styles.sectionTitle}>Exams & Assessments</h2></div>
            <ul className={styles.lessons}>
              {quizzes.map((quiz: any) => (
                <li key={quiz.id}>
                  <Link to={`/course-exam/${course.id}`} className={styles.lesson} style={{ textDecoration: 'none' }}>
                    <div className={styles.lessonLeft}>
                      <ClipboardCheck className={styles.lessonIcon} style={{ color: 'var(--color-accent-9)' }} />
                      <div className={styles.lessonContent}>
                        <div className={styles.lessonTitle}>{quiz.title}</div>
                        <div className={styles.lessonMeta}>
                          <span><Clock size={12} /> {quiz.duration || 30} min</span>
                          <span><HelpCircle size={12} /> {quiz.question_count} questions</span>
                          <span><Award size={12} /> Pass: {quiz.passing_score || 70}%</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.lessonRight}><div className={styles.playAction} style={{ opacity: 1 }}><ArrowRight size={20} /></div></div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <BottomNav />
      <NotificationPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} notifications={notifications} unreadCount={unreadCount} />
    </div>
  );
}
