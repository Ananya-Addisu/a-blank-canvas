import { useState, useEffect } from 'react';
import { useIsNativePlatform } from '~/hooks/use-is-native';
import { BrowserOnlyScreen } from '~/components/browser-only-screen';
import { useNavigate, useSearchParams } from 'react-router';
import { TeacherSidebar } from '~/components/teacher-sidebar';
import { TeacherHeader } from '~/components/teacher-header';
import { Button } from '~/components/ui/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '~/components/ui/dialog/dialog';
import { Input } from '~/components/ui/input/input';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Label } from '~/components/ui/label/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select/select';
import { Video, FileText, Plus, Layers, FilePlus, Pencil, GripVertical } from 'lucide-react';
import { MarkdownRenderer } from '~/components/markdown-renderer';
import { getTeacherAuth } from '~/lib/auth.client';
import { getTeacherCourses, createChapter, createLesson, updateLesson } from '~/services/teacher.client';
import { supabase } from '~/lib/supabase.client';
import { validateAndFormatYouTubeUrl } from '~/utils/youtube';
import styles from './teacher-content-manager.module.css';

export default function TeacherContentManager() {
  const isNative = useIsNativePlatform();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isEditLessonDialogOpen, setIsEditLessonDialogOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonType, setLessonType] = useState('video');
  const [editLessonType, setEditLessonType] = useState('video');
  const [markdownPreviewContent, setMarkdownPreviewContent] = useState('');
  const [editMarkdownContent, setEditMarkdownContent] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async (courseId?: string) => {
    const t = await getTeacherAuth();
    if (!t) { navigate('/teacher-login', { replace: true }); return; }
    const c = await getTeacherCourses(t.id);
    setCourses(c);

    const selectedId = courseId || searchParams.get('course');
    if (selectedId) {
      const sc = c.find((co: any) => co.id === selectedId);
      setSelectedCourse(sc || null);
      if (sc) {
        const { data: chaps } = await supabase.from('chapters').select('*, lessons:lessons(*)').eq('course_id', sc.id).order('order_index');
        setChapters((chaps || []).map((ch: any) => ({ ...ch, lessons: ch.lessons?.sort((a: any, b: any) => a.order_index - b.order_index) || [] })));
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [searchParams.get('course')]);

  const handleCourseChange = (courseId: string) => setSearchParams({ course: courseId });

  const handleCreateChapter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createChapter(selectedCourse.id, { title: fd.get('title') as string, description: fd.get('description') as string, order_index: Number(fd.get('order_index')) });
      setIsChapterDialogOpen(false);
      setActionMessage({ type: 'success', text: 'Chapter created!' });
      await loadData(selectedCourse.id);
    } catch (err: any) { setActionMessage({ type: 'error', text: err.message }); }
  };

  const handleCreateLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const lt = fd.get('lessonType') as string;
    const lessonData: any = { title: fd.get('title') as string, order_index: chapters.reduce((s: number, ch: any) => s + (ch.lessons?.length || 0), 0) };

    if (lt === 'video') {
      const url = fd.get('contentUrl') as string;
      const validation = validateAndFormatYouTubeUrl(url);
      if (!validation.isValid) { setActionMessage({ type: 'error', text: validation.error || 'Invalid YouTube URL' }); return; }
      lessonData.lesson_type = 'video';
      lessonData.youtube_url = validation.embedUrl;
      lessonData.video_source = 'youtube';
    } else {
      lessonData.lesson_type = 'pdf';
      lessonData.content_url = fd.get('markdownContent') as string;
    }

    try {
      await createLesson(selectedChapterId!, lessonData);
      setIsLessonDialogOpen(false);
      setActionMessage({ type: 'success', text: 'Lesson created!' });
      await loadData(selectedCourse.id);
    } catch (err: any) { setActionMessage({ type: 'error', text: err.message }); }
  };

  const handleEditLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const updateData: any = { title: fd.get('title') as string };
    if (editLessonType === 'video') {
      const url = fd.get('contentUrl') as string;
      if (url) {
        const validation = validateAndFormatYouTubeUrl(url);
        if (validation.isValid) { updateData.youtube_url = validation.embedUrl; updateData.video_source = 'youtube'; }
      }
    } else {
      updateData.content_url = fd.get('markdownContent') as string;
    }
    try {
      await updateLesson(editingLesson.id, updateData);
      setIsEditLessonDialogOpen(false);
      setActionMessage({ type: 'success', text: 'Lesson updated!' });
      await loadData(selectedCourse.id);
    } catch (err: any) { setActionMessage({ type: 'error', text: err.message }); }
  };

  if (isNative === null || loading) return null;
  if (isNative) return <BrowserOnlyScreen />;

  return (
    <div className={styles.container}>
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={styles.main}>
        <TeacherHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <div className={styles.content}>
          <h1 className={styles.title}>Content Manager</h1>

          {actionMessage?.type === 'error' && <div className={styles.errorAlert}>{actionMessage.text}</div>}
          {actionMessage?.type === 'success' && <div className={styles.successAlert}>{actionMessage.text}</div>}

          <div className={styles.controls}>
            <Select value={selectedCourse?.id || ''} onValueChange={handleCourseChange}>
              <SelectTrigger className={styles.courseSelect}><SelectValue placeholder="Select a course" /></SelectTrigger>
              <SelectContent>{courses.map((course: any) => (<SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>))}</SelectContent>
            </Select>

            {selectedCourse && (
              <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
                <DialogTrigger asChild><Button className={styles.addButton}><Plus size={20} /> Add Chapter</Button></DialogTrigger>
                <DialogContent className={styles.modalContent}>
                  <DialogHeader className={styles.modalHeader}>
                    <div className={styles.modalIcon}><Layers size={28} /></div>
                    <DialogTitle className={styles.modalTitle}>Create New Chapter</DialogTitle>
                    <DialogDescription className={styles.modalDescription}>Organize your course by grouping lessons into chapters.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateChapter}>
                    <div className={styles.modalBody}>
                      <div className={styles.formGroup}><Label htmlFor="title">Chapter Title</Label><Input id="title" name="title" placeholder="e.g., Introduction" required /></div>
                      <div className={styles.formGroup}><Label htmlFor="description">Description</Label><Textarea id="description" name="description" placeholder="What will this chapter cover?" /></div>
                      <div className={styles.formGroup}><Label htmlFor="order_index">Order Position</Label><Input id="order_index" name="order_index" type="number" defaultValue={chapters.length} /></div>
                    </div>
                    <div className={styles.modalFooter}>
                      <DialogClose asChild><Button type="button" variant="outline" className={styles.cancelButton}>Cancel</Button></DialogClose>
                      <Button type="submit" className={styles.submitButton}>Create Chapter</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {!selectedCourse ? (
            <div className={styles.emptyState}><p>Select a course to manage its content</p></div>
          ) : (
            <div className={styles.chapterList}>
              {chapters.length === 0 ? (
                <div className={styles.emptyState}><p>No chapters yet. Create your first chapter!</p></div>
              ) : (
                chapters.map((chapter: any) => (
                  <div key={chapter.id} className={styles.chapterCard}>
                    <div className={styles.chapterHeader}>
                      <span className={styles.chapterBadge}>Chapter {chapter.order_index + 1}</span>
                      <h2 className={styles.chapterTitle}>{chapter.title}</h2>
                      <div className={styles.chapterActions}>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedChapterId(chapter.id); setIsLessonDialogOpen(true); }}><Plus size={18} /> Add Lesson</Button>
                      </div>
                    </div>
                    <div className={styles.lessonsList}>
                      {chapter.lessons?.length === 0 ? <p className={styles.noLessons}>No lessons yet</p> : (
                        [...(chapter.lessons || [])].sort((a: any, b: any) => a.order_index - b.order_index).map((lesson: any) => (
                          <div key={lesson.id} className={`${styles.lessonCard} ${styles.lessonCardClickable}`} onClick={() => { setEditingLesson(lesson); setEditLessonType(lesson.lesson_type === 'pdf' ? 'document' : lesson.lesson_type); setEditMarkdownContent(lesson.lesson_type === 'pdf' ? (lesson.content_url || '') : ''); setIsEditLessonDialogOpen(true); }}>
                            <div className={styles.lessonIcon}>{lesson.lesson_type === 'video' ? <Video size={20} /> : <FileText size={20} />}</div>
                            <div className={styles.lessonInfo}>
                              <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                              <p className={styles.lessonMeta}>{lesson.lesson_type === 'video' ? `Video${lesson.duration ? ` - ${lesson.duration}min` : ''}` : `PDF${lesson.page_count ? ` - ${lesson.page_count} pages` : ''}`}</p>
                            </div>
                            <span className={`${styles.statusBadge} ${styles[lesson.approval_status]}`}>{lesson.approval_status === 'approved' ? 'Approved' : lesson.approval_status === 'rejected' ? 'Rejected' : 'Pending'}</span>
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setEditingLesson(lesson); setEditLessonType(lesson.lesson_type === 'pdf' ? 'document' : lesson.lesson_type); setIsEditLessonDialogOpen(true); }}><Pencil size={18} /></Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Add Lesson Dialog */}
          <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
            <DialogContent className={styles.modalContent}>
              <DialogHeader className={styles.modalHeader}>
                <div className={styles.modalIcon}><FilePlus size={28} /></div>
                <DialogTitle className={styles.modalTitle}>Add New Lesson</DialogTitle>
                <DialogDescription className={styles.modalDescription}>Add a video or document lesson.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLesson}>
                <input type="hidden" name="lessonType" value={lessonType} />
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <Label>Lesson Type</Label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button type="button" variant={lessonType === 'video' ? 'default' : 'outline'} size="sm" onClick={() => setLessonType('video')} style={{ flex: 1 }}><Video size={16} /> Video</Button>
                      <Button type="button" variant={lessonType === 'document' ? 'default' : 'outline'} size="sm" onClick={() => setLessonType('document')} style={{ flex: 1 }}><FileText size={16} /> Document</Button>
                    </div>
                  </div>
                  <div className={styles.formGroup}><Label htmlFor="lesson-title">Lesson Title</Label><Input id="lesson-title" name="title" placeholder="e.g., Getting Started" required /></div>
                  {lessonType === 'video' ? (
                    <div className={styles.formGroup}><Label htmlFor="content-url">YouTube URL</Label><Input id="content-url" name="contentUrl" type="url" placeholder="https://www.youtube.com/watch?v=..." required /></div>
                  ) : (
                    <div className={styles.formGroup}><Label htmlFor="markdownContent">Document Content (Markdown)</Label><Textarea id="markdownContent" name="markdownContent" placeholder="Write content in Markdown..." style={{ minHeight: 200 }} /></div>
                  )}
                </div>
                <div className={styles.modalFooter}>
                  <DialogClose asChild><Button type="button" variant="outline" className={styles.cancelButton}>Cancel</Button></DialogClose>
                  <Button type="submit" className={styles.submitButton}>Create Lesson</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Lesson Dialog */}
          <Dialog open={isEditLessonDialogOpen} onOpenChange={setIsEditLessonDialogOpen}>
            <DialogContent className={styles.modalContent}>
              <DialogHeader className={styles.modalHeader}>
                <DialogTitle className={styles.modalTitle}>Edit Lesson</DialogTitle>
                <DialogDescription className={styles.modalDescription}>Update lesson details.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditLesson}>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}><Label>Title</Label><Input name="title" defaultValue={editingLesson?.title} required /></div>
                  {editLessonType === 'video' ? (
                    <div className={styles.formGroup}><Label>YouTube URL</Label><Input name="contentUrl" type="url" defaultValue={editingLesson?.youtube_url || ''} /></div>
                  ) : (
                    <div className={styles.formGroup}><Label>Content (Markdown)</Label><Textarea name="markdownContent" defaultValue={editMarkdownContent} style={{ minHeight: 200 }} /></div>
                  )}
                </div>
                <div className={styles.modalFooter}>
                  <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
