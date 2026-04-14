import { useState, useEffect } from "react";
import { LoadingScreen } from "~/components/loading-screen";
import { Link, useNavigate, useParams } from "react-router";
import { ChevronLeft, CheckCircle, PlayCircle, FileText, Lock, ChevronDown, ChevronUp, Download, CheckCircle2, BookOpen } from "lucide-react";
import { addVideoBookmark, isVideoBookmarked, addDownloadedPDF, isDownloaded } from "~/utils/local-storage";
import { downloadSecureLessonVideo, isVideoDownloaded } from "~/utils/video-download";
import { CustomVideoPlayer } from "~/components/custom-video-player";
import { SecureVideoPlayer } from "~/components/secure-video-player";
import { MarkdownRenderer } from "~/components/markdown-renderer";
import { Badge } from "~/components/ui/badge/badge";
import { useIsNativePlatform } from "~/hooks/use-is-native";
import { getStudentAuth } from "~/lib/auth.client";
import { getCourseById } from "~/services/course.client";
import { hasAccessToCourse } from "~/services/enrollment.client";
import { getCourseProgress, updateLessonProgress } from "~/services/progress.client";
import { supabase } from "~/lib/supabase.client";
import styles from "./course-player.$courseId.$lessonId.module.css";

export default function CoursePlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [progressData, setProgressData] = useState<any>(null);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [contentCollapsed, setContentCollapsed] = useState(false);
  const [videoSaved, setVideoSaved] = useState(false);
  const [videoDownloaded, setVideoDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [contentDownloaded, setContentDownloaded] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const isNative = useIsNativePlatform();

  useEffect(() => {
    (async () => {
      const student = await getStudentAuth();
      setStudent(student);
      const courseData = await getCourseById(courseId!);
      if (!courseData) { navigate('/my-courses'); return; }
      setCourse(courseData);

      let lesson: any = null;
      courseData.chapters?.forEach((ch: any) => {
        ch.lessons?.forEach((l: any) => { if (l.id === lessonId) lesson = l; });
      });
      if (!lesson) { navigate(`/course-detail?id=${courseId}`); return; }
      setCurrentLesson(lesson);

      if (student) {
        const access = await hasAccessToCourse(student.id, courseId!);
        setHasAccess(access);
        if (access) {
          // Get enrollment ID
          const { data: enrollments } = await supabase.from('enrollments').select('id').eq('student_id', student.id).eq('status', 'approved');
          const enrollmentId = enrollments?.[0]?.id;
          if (enrollmentId) {
            const progress = await getCourseProgress(student.id, enrollmentId);
            setProgressData({ enrollmentId, progressRecords: progress.data?.progressRecords || [] });
            // Mark as in_progress
            await updateLessonProgress(student.id, lessonId!, enrollmentId, { status: 'in_progress' });
          }
        }
      }
      setLoading(false);
    })();
  }, [courseId, lessonId]);

  useEffect(() => {
    if (!currentLesson) return;
    setVideoSaved(false);
    setVideoDownloaded(false);
    setDownloadProgress(null);

    if (currentLesson.lesson_type === 'video') {
      const uploadedVideo = currentLesson.video_source === 'upload' || currentLesson.video_source === 'supabase';

      if (uploadedVideo) {
        if (isNative === true) {
          void isVideoDownloaded(currentLesson.id).then(setVideoDownloaded);
        }
      } else {
        setVideoSaved(isVideoBookmarked(currentLesson.id));
      }
    }

    if (currentLesson.lesson_type === 'markdown' || currentLesson.lesson_type === 'text') setContentDownloaded(isDownloaded(currentLesson.id));

    course?.chapters?.forEach((chapter: any) => {
      if (chapter.lessons?.some((l: any) => l.id === currentLesson.id)) {
        setExpandedChapters(prev => Array.from(new Set([...prev, chapter.id])));
      }
    });
  }, [currentLesson?.id, currentLesson?.lesson_type, currentLesson?.video_source, isNative]);

  if (loading || !course || !currentLesson) return <LoadingScreen />;

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => prev.includes(chapterId) ? prev.filter(id => id !== chapterId) : [...prev, chapterId]);
  };

  const getLessonStatus = (lid: string) => {
    if (!progressData?.progressRecords) return 'not_started';
    const record = progressData.progressRecords.find((p: any) => p.lesson_id === lid);
    return record?.status || 'not_started';
  };

  const handleVideoComplete = async () => {
    if (hasAccess && progressData?.enrollmentId && student?.id) {
      await updateLessonProgress(student.id, currentLesson.id, progressData.enrollmentId, { status: 'completed' });
    }
  };

  const courseName = course.title || course.name || 'Course';
  const isUploadedVideo = currentLesson.lesson_type === 'video' && (currentLesson.video_source === 'upload' || currentLesson.video_source === 'supabase');
  const canDownloadUploadedVideo = Boolean(student?.id && hasAccess && isNative === true);

  const handleDownloadVideo = async () => {
    if (!isUploadedVideo || !student?.id || !canDownloadUploadedVideo || videoDownloaded || downloadProgress !== null) return;

    try {
      const downloadedVideo = await downloadSecureLessonVideo(
        currentLesson.id,
        student.id,
        course.id,
        courseName,
        currentLesson.title,
        setDownloadProgress
      );

      if (downloadedVideo) {
        setVideoDownloaded(true);
      }
    } finally {
      setDownloadProgress(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.playerArea}>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button onClick={() => window.history.back()} className={styles.backButton}><ChevronLeft size={24} /><span>Back</span></button>
          </div>
          <div className={styles.lessonInfo}><h2 className={styles.lessonTitle}>{currentLesson.title}</h2></div>
          <div style={{ width: 40 }} />
        </div>

        <div className={styles.contentWrapper}>
          {(!hasAccess && !currentLesson.is_preview) ? (
            <div className={styles.noContent}>
              <Lock size={64} /><h2>This lesson is locked</h2><p>Please enroll in the course to access this content.</p>
              <Link to={`/enroll?type=course&id=${course.id}`} className={styles.enrollBtn}>Enroll Now</Link>
            </div>
          ) : (
            <>
              {currentLesson.lesson_type === 'video' && (
                <div className={styles.videoContainer}>
                  <div className={styles.videoActions}>
                    {isUploadedVideo ? (
                      <button
                        className={`${styles.saveVideoBtn} ${videoDownloaded ? styles.savedBtn : ''}`}
                        onClick={() => void handleDownloadVideo()}
                        disabled={!canDownloadUploadedVideo || videoDownloaded || downloadProgress !== null}
                      >
                        {videoDownloaded ? <CheckCircle2 size={16} /> : <Download size={16} />}
                        <span>
                          {videoDownloaded
                            ? 'Downloaded'
                            : downloadProgress !== null
                              ? `Downloading ${downloadProgress}%`
                              : isNative === false
                                ? 'App Only'
                                : 'Download'}
                        </span>
                      </button>
                    ) : (
                      <button className={`${styles.saveVideoBtn} ${videoSaved ? styles.savedBtn : ''}`} onClick={() => {
                        if (videoSaved) return;
                        addVideoBookmark({ title: currentLesson.title, videoUrl: currentLesson.youtube_url || currentLesson.content_url, courseId: course.id, courseName, lessonId: currentLesson.id });
                        setVideoSaved(true);
                      }} disabled={videoSaved}>
                        {videoSaved ? <CheckCircle2 size={16} /> : <Download size={16} />}<span>{videoSaved ? 'Saved' : 'Save'}</span>
                      </button>
                    )}
                  </div>
                  {isUploadedVideo ? (
                    <SecureVideoPlayer
                      lessonId={currentLesson.id}
                      studentId={student?.id}
                      studentName={student?.full_name}
                      title={currentLesson.title}
                      onVideoEnd={handleVideoComplete}
                      showBackButton
                    />
                  ) : (
                    <CustomVideoPlayer videoUrl={currentLesson.youtube_url || currentLesson.content_url} gdriveUrl={currentLesson.video_source === 'gdrive' ? currentLesson.content_url : undefined} onVideoEnd={handleVideoComplete} showBackButton />
                  )}
                  <div className={styles.lessonDetails}>
                    <h3 className={styles.lessonDetailTitle}>{currentLesson.title}</h3>
                    {currentLesson.description && <p className={styles.lessonDetailDescription}>{currentLesson.description}</p>}
                  </div>
                  <div className={styles.belowVideoContent}>
                    <button className={styles.belowVideoToggle} onClick={() => setContentCollapsed(prev => !prev)}>
                      <h3 className={styles.belowVideoTitle}>Course Content</h3>
                      {contentCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                    {!contentCollapsed && (
                      <div className={styles.belowVideoChapters}>
                        {course.chapters?.map((chapter: any) => {
                          const isExpanded = expandedChapters.includes(chapter.id);
                          return (
                            <div key={chapter.id} className={styles.chapter}>
                              <div className={styles.chapterHeader} onClick={() => toggleChapter(chapter.id)}>
                                <h3 className={styles.chapterTitle}>{chapter.title}</h3>
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </div>
                              {isExpanded && (
                                <ul className={styles.lessonsList}>
                                  {chapter.lessons?.map((lesson: any) => {
                                    const lessonStatus = getLessonStatus(lesson.id);
                                    const lessonLocked = !hasAccess && !lesson.is_preview;
                                    const isActive = lesson.id === currentLesson.id;
                                    return (
                                      <Link key={lesson.id} to={`/course-player/${course.id}/${lesson.id}`} className={`${styles.lessonItem} ${isActive ? styles.activeLesson : ''} ${lessonLocked ? styles.locked : ''}`}>
                                        {lessonStatus === 'completed' ? <CheckCircle className={`${styles.lessonIcon} ${styles.completedIcon}`} size={18} /> : lessonLocked ? <Lock className={`${styles.lessonIcon} ${styles.lockedIcon}`} size={18} /> : lesson.lesson_type === 'video' ? <PlayCircle className={styles.lessonIcon} size={18} /> : <FileText className={styles.lessonIcon} size={18} />}
                                        <div className={styles.lessonTitleText}>
                                          {lesson.title}
                                          {lesson.is_preview && !hasAccess && <Badge variant="secondary" style={{ marginLeft: '8px', fontSize: '0.7rem' }}>Preview</Badge>}
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {(currentLesson.lesson_type === 'pdf' || currentLesson.lesson_type === 'markdown' || currentLesson.lesson_type === 'text') && (
                <div className={styles.docReaderContainer}>
                  <div className={styles.docReaderHeader}>
                    <div className={styles.docReaderInfo}>
                      <h3 className={styles.docReaderTitle}>{currentLesson.title}</h3>
                      {currentLesson.description && <p className={styles.docReaderDesc}>{currentLesson.description}</p>}
                    </div>
                    <button className={`${styles.saveOfflineBtn} ${contentDownloaded ? styles.savedBtn : ''}`} onClick={() => {
                      if (contentDownloaded) return;
                       addDownloadedPDF({ title: currentLesson.title, fileUrl: currentLesson.content_url || '', courseId: course.id, courseName, lessonId: currentLesson.id });
                      setContentDownloaded(true);
                    }} disabled={contentDownloaded}>
                      {contentDownloaded ? <CheckCircle2 size={16} /> : <Download size={16} />}<span>{contentDownloaded ? 'Saved' : 'Save Offline'}</span>
                    </button>
                  </div>
                  <div className={styles.docReaderBody}><MarkdownRenderer content={currentLesson.content_url || ''} /></div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
