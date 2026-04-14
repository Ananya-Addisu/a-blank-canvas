import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { BottomNav } from "~/components/bottom-nav";
import { Sheet, SheetContent } from "~/components/ui/sheet/sheet";
import { SideMenu } from "~/components/side-menu";
import { EnrollmentModal } from "~/components/enrollment-modal";
import { NoConnectionScreen } from "~/components/no-connection-screen";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { Button } from "~/components/ui/button/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs/tabs";
import { CustomVideoPlayer } from "~/components/custom-video-player";
import { MarkdownRenderer } from "~/components/markdown-renderer";
import { FileText, PlayCircle, BookOpen, Clock, X, Video, Lock, ArrowRight } from "lucide-react";
import { getCourseById } from "~/services/course.client";
import styles from "./course-preview.module.css";


export default function CoursePreview() {
  const params = useParams();
  const courseId = params.courseId || params.id || '';
  const isOnline = useOnlineStatus();
  const [course, setCourse] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
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
        const data = await getCourseById(courseId);
        if (cancelled) return;
        if (data) {
          setCourse({
            ...data,
            originalPrice: Number(data.price),
            discountedPrice: data.discount_percentage > 0 ? Math.round(Number(data.price) * (1 - data.discount_percentage / 100)) : Number(data.price),
            hasDiscount: data.discount_percentage > 0,
          });
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

  const previewLessons = course.chapters?.flatMap((ch: any) =>
    (ch.lessons || []).filter((l: any) => l.is_preview).map((l: any) => ({ ...l, chapterTitle: ch.title }))
  ) || [];

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <button className={styles.closeButton} onClick={() => navigate(-1)}><X size={24} /></button>
        <div className={styles.hero}>
          <div className={styles.heroIcon}><BookOpen size={80} /></div>
          <div className={styles.heroOverlay}>
            <span className={styles.category}>{course.category}</span>
            <h1 className={styles.title}>{course.name}</h1>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.priceSection}>
            <div className={styles.priceWrapper}>
              {course.hasDiscount && <div className={styles.originalPrice}>{course.originalPrice.toLocaleString()} ETB</div>}
              <div className={styles.price}>{course.discountedPrice.toLocaleString()} ETB</div>
              {course.hasDiscount && <div className={styles.discountBadge}>{course.discount_percentage}% OFF</div>}
            </div>
            <Button size="lg" onClick={() => setEnrollModalOpen(true)} className={styles.enrollButton}>Enroll Now</Button>
          </div>

          <Tabs defaultValue="overview" className={styles.tabs}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
              <TabsTrigger value="samples">Samples</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className={styles.tabContent}>
              <div className={styles.overview}>
                <h2 className={styles.sectionTitle}>Course Description</h2>
                <p className={styles.description}>{course.description}</p>
                <div className={styles.stats}>
                  <div className={styles.stat}><BookOpen className={styles.statIcon} /><div><div className={styles.statLabel}>Department</div><div className={styles.statValue}>{course.department}</div></div></div>
                  <div className={styles.stat}><Clock className={styles.statIcon} /><div><div className={styles.statLabel}>Category</div><div className={styles.statValue}>{course.category}</div></div></div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="syllabus" className={styles.tabContent}>
              <div className={styles.syllabus}>
                <h2 className={styles.sectionTitle}>Course Outline</h2>
                {course.syllabus ? <div className={styles.syllabusContent}>{course.syllabus}</div> : course.chapters && course.chapters.length > 0 ? (
                  <div className={styles.chapterList}>
                    {course.chapters.map((chapter: any, index: number) => (
                      <div key={chapter.id || index} className={styles.chapterItem}>
                        <div className={styles.chapterNumber}>{index + 1}</div>
                        <div><h3 className={styles.chapterTitle}>{chapter.title}</h3>{chapter.description && <p className={styles.chapterDescription}>{chapter.description}</p>}{chapter.lessons && <p className={styles.lessonCount}>{chapter.lessons.length} lesson{chapter.lessons.length !== 1 ? 's' : ''}</p>}</div>
                      </div>
                    ))}
                  </div>
                ) : <p className={styles.noContent}>Syllabus information is not yet available.</p>}
              </div>
            </TabsContent>
            <TabsContent value="samples" className={styles.tabContent}>
              <div className={styles.samples}>
                <h2 className={styles.sectionTitle}>Course Content</h2>
                <p className={styles.samplesSubtitle}>Browse the course curriculum. Preview lessons are available to watch before enrolling.</p>
                {course.chapters && course.chapters.length > 0 && (
                  <div className={styles.curriculumList}>
                    {course.chapters.map((chapter: any) => (
                      <div key={chapter.id} className={styles.curriculumChapter}>
                        <div className={styles.curriculumChapterHeader}><h3 className={styles.curriculumChapterTitle}>{chapter.title}</h3>{chapter.description && <p className={styles.chapterDescription}>{chapter.description}</p>}</div>
                        <ul className={styles.curriculumLessons}>
                          {(chapter.lessons || []).map((lesson: any) => {
                            const isPreview = lesson.is_preview;
                            const isExpanded = expandedLesson === lesson.id && isPreview;
                            return (
                              <li key={lesson.id} className={styles.curriculumLesson}>
                                <div className={`${styles.curriculumLessonRow} ${isPreview ? styles.curriculumLessonPreview : styles.curriculumLessonLocked}`} onClick={() => { if (isPreview) setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id); }}>
                                  <div className={styles.curriculumLessonLeft}>
                                    {lesson.lesson_type === 'video' ? <Video size={18} className={isPreview ? styles.previewIcon : styles.lockedIcon} /> : <FileText size={18} className={isPreview ? styles.previewIcon : styles.lockedIcon} />}
                                    <div className={styles.curriculumLessonInfo}>
                                      <span className={styles.curriculumLessonTitle}>{lesson.title}</span>
                                      <span className={styles.curriculumLessonMeta}>{lesson.lesson_type === 'video' && lesson.duration ? `${lesson.duration} min` : ''}{lesson.lesson_type === 'pdf' && lesson.page_count ? `${lesson.page_count} pages` : ''}{!lesson.duration && !lesson.page_count ? lesson.lesson_type : ''}</span>
                                    </div>
                                  </div>
                                  <div className={styles.curriculumLessonRight}>{isPreview ? <span className={styles.previewBadge}>Preview</span> : <Lock size={14} className={styles.lockedIcon} />}</div>
                                </div>
                                {isExpanded && (
                                  <div className={styles.expandedContent}>
                                    {lesson.lesson_type === 'video' && lesson.youtube_url && <CustomVideoPlayer videoUrl={lesson.youtube_url} gdriveUrl={lesson.video_source === 'gdrive' ? lesson.content_url : undefined} title={lesson.title} className={styles.videoPlayer} />}
                                    {(lesson.lesson_type === 'pdf' || lesson.lesson_type === 'markdown' || lesson.lesson_type === 'text') && lesson.content_url && <div className={styles.pdfPreview}><MarkdownRenderer content={lesson.content_url} compact /></div>}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {course.sample_video_url && <div className={styles.sampleItem}><div className={styles.sampleHeader}><Video className={styles.sampleIcon} /><div><h3 className={styles.sampleTitle}>Sample Lecture</h3><p className={styles.sampleDescription}>Watch a preview of the course content</p></div></div><CustomVideoPlayer videoUrl={course.sample_video_url} title="Sample Lecture" className={styles.videoPlayer} /></div>}
                {course.sample_pdf_url && <div className={styles.sampleItem}><div className={styles.sampleHeader}><FileText className={styles.sampleIcon} /><div><h3 className={styles.sampleTitle}>Sample Study Material</h3><p className={styles.sampleDescription}>Review course materials</p></div></div><div className={styles.pdfPreview}><MarkdownRenderer content={course.sample_pdf_url} compact /></div></div>}
                {!course.sample_video_url && !course.sample_pdf_url && (!course.chapters || course.chapters.length === 0) && <div className={styles.noContent}><PlayCircle size={48} /><p>Sample materials will be available soon</p></div>}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <BottomNav />
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetContent side="left"><SideMenu onClose={() => setMenuOpen(false)} /></SheetContent></Sheet>
      <EnrollmentModal isOpen={enrollModalOpen} onClose={() => setEnrollModalOpen(false)} item={course} type="course" isBundleExclusive={course.is_bundle_exclusive} />
    </div>
  );
}
