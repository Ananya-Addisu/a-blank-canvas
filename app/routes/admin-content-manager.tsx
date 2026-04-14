// Fix #12: Course content sorting with drag-and-drop reorder (realtime via form submit)
import { useEffect, useState } from 'react';
import { Form, useSearchParams, useActionData } from 'react-router';
import type { Route } from './+types/admin-content-manager';
import { Button } from '~/components/ui/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '~/components/ui/dialog/dialog';
import { Input } from '~/components/ui/input/input';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Label } from '~/components/ui/label/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select/select';
import { Video, FileText, Trash2, Plus, Layers, FilePlus, Pencil, GripVertical, FileCode, Upload, Loader2 } from 'lucide-react';
import { Progress } from '~/components/ui/progress/progress';
import { MarkdownEditor } from '~/components/markdown-editor';
import styles from './admin-content-manager.module.css';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';




export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const courseId = url.searchParams.get('course');
  const { data: courses } = await supabase.from('courses').select('*, teacher:teachers(id, full_name)').order('name');
  let selectedCourse = null;
  let chapters: any[] = [];
  if (courseId) {
    const { data: course } = await supabase.from('courses').select('*, teacher:teachers(id, full_name)').eq('id', courseId).single();
    selectedCourse = course;
    const { data: chapterData } = await supabase.from('chapters').select('*, lessons(*)').eq('course_id', courseId).order('order_index');
    chapters = chapterData || [];
  }
  return { courses: courses || [], selectedCourse, chapters };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  try {
    if (intent === 'create-chapter') {
      await supabase.from('chapters').insert({ course_id: formData.get('courseId'), title: formData.get('title'), description: formData.get('description'), order_index: Number(formData.get('order_index') || 0) });
    } else if (intent === 'create-lesson') {
      const lessonType = formData.get('lessonType') as string;
      const videoSource = formData.get('videoSource') as string;
      const lessonData: any = { chapter_id: formData.get('chapterId'), title: formData.get('title'), lesson_type: lessonType === 'document' || lessonType === 'markdown' ? 'pdf' : 'video', is_preview: formData.get('isPreview') === 'true', approval_status: 'approved' };
      if (lessonType === 'markdown') { lessonData.content_url = formData.get('markdownContent'); lessonData.video_source = null; }
      else if (lessonType === 'document') { lessonData.content_url = formData.get('contentUrl'); }
      else if (videoSource === 'gdrive') { lessonData.youtube_url = formData.get('contentUrl'); lessonData.content_url = formData.get('gdriveContentUrl'); lessonData.video_source = 'gdrive'; }
      else if (videoSource === 'upload') { lessonData.content_url = formData.get('uploadedVideoPath'); lessonData.video_source = 'upload'; }
      else { lessonData.youtube_url = formData.get('contentUrl'); lessonData.content_url = formData.get('contentUrl'); lessonData.video_source = 'youtube'; }
      await supabase.from('lessons').insert(lessonData);
    } else if (intent === 'update-lesson') {
      const lessonType = formData.get('lessonType') as string;
      const videoSource = formData.get('videoSource') as string;
      const up: any = { title: formData.get('title'), description: formData.get('description'), is_preview: formData.get('isPreview') === 'true' };
      if (lessonType === 'markdown') { up.content_url = formData.get('markdownContent'); up.video_source = null; up.lesson_type = 'pdf'; }
      else if (lessonType === 'document') { up.content_url = formData.get('contentUrl'); up.lesson_type = 'pdf'; }
      else if (videoSource === 'gdrive') { up.youtube_url = formData.get('contentUrl'); up.content_url = formData.get('gdriveContentUrl'); up.video_source = 'gdrive'; up.lesson_type = 'video'; }
      else if (videoSource === 'upload') { const p = formData.get('uploadedVideoPath'); if (p) up.content_url = p; up.video_source = 'upload'; up.lesson_type = 'video'; }
      else { up.youtube_url = formData.get('contentUrl'); up.content_url = formData.get('contentUrl'); up.video_source = 'youtube'; up.lesson_type = 'video'; }
      await supabase.from('lessons').update(up).eq('id', formData.get('lessonId'));
    } else if (intent === 'delete-chapter') {
      await supabase.from('chapters').delete().eq('id', formData.get('chapterId'));
    } else if (intent === 'delete-lesson') {
      await supabase.from('lessons').delete().eq('id', formData.get('lessonId'));
    } else if (intent === 'reorder-lessons') {
      const order = JSON.parse(formData.get('order') as string || '[]');
      for (let i = 0; i < order.length; i++) { await supabase.from('lessons').update({ order_index: i }).eq('id', order[i]); }
    } else if (intent === 'reorder-chapters') {
      const order = JSON.parse(formData.get('order') as string || '[]');
      for (let i = 0; i < order.length; i++) { await supabase.from('chapters').update({ order_index: i }).eq('id', order[i]); }
    }
    return { success: true, message: 'Done' };
  } catch (e: any) { return { success: false, error: e.message }; }
}


export default function AdminContentManager({ loaderData }: Route.ComponentProps) {
  const { courses, selectedCourse, chapters } = loaderData as any;
  const actionData = useActionData<typeof clientAction>() as { success?: boolean; error?: string; message?: string } | undefined;
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonType, setLessonType] = useState('video');
  const [editLessonType, setEditLessonType] = useState('video');
  const [videoSource, setVideoSource] = useState<'youtube' | 'upload' | 'gdrive'>('youtube');
  const [editVideoSource, setEditVideoSource] = useState<'youtube' | 'upload' | 'gdrive'>('youtube');
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadedVideoPath, setUploadedVideoPath] = useState('');
  const [editUploadedVideoPath, setEditUploadedVideoPath] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragLessonId, setDragLessonId] = useState<string | null>(null);
  const [dragOverLessonId, setDragOverLessonId] = useState<string | null>(null);
  const [dragChapterId, setDragChapterId] = useState<string | null>(null);
  const [dragOverChapterId, setDragOverChapterId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pendingDelete, setPendingDelete] = useState<{ type: 'chapter' | 'lesson'; id: string; title: string } | null>(null);
  const [courseSearch, setCourseSearch] = useState('');

  const filteredCourses = courses.filter((c: any) =>
    !courseSearch || c.name.toLowerCase().includes(courseSearch.toLowerCase()) || c.teacher?.full_name?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleCourseChange = (courseId: string) => {
    setSearchParams({ course: courseId });
  };

  const resetUploadedVideoState = () => {
    setUploadedVideoPath('');
    setUploadPercent(0);
    setUploadProgress('');
    setIsUploading(false);
  };

  const cleanupUploadedVideo = async (path: string) => {
    if (!path) return;

    const formData = new FormData();
    formData.append('intent', 'delete-upload');
    formData.append('path', path);

    try {
      await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });
    } catch {
      // Ignore cleanup failures; they shouldn't block the UI.
    }
  };

  const discardPendingUploadedVideo = () => {
    if (uploadedVideoPath) {
      void cleanupUploadedVideo(uploadedVideoPath);
    }
    resetUploadedVideoState();
  };

  const handleLessonDialogOpenChange = (open: boolean) => {
    if (!open && !isSavingLesson) {
      discardPendingUploadedVideo();
      setSelectedChapterId(null);
      setLessonType('video');
      setVideoSource('youtube');
    }

    setIsLessonDialogOpen(open);
  };

  useEffect(() => {
    if (!isSavingLesson || !actionData) return;

    setIsSavingLesson(false);

    if (actionData.success) {
      setIsLessonDialogOpen(false);
      setSelectedChapterId(null);
      setLessonType('video');
      setVideoSource('youtube');
      resetUploadedVideoState();
    }
  }, [actionData, isSavingLesson]);

  return (
    <div className={styles.content}>
      <h1 className={styles.title}>Content Manager</h1>

      {actionData?.error && <div className={styles.errorAlert}>{actionData.error}</div>}
      {actionData?.success && <div className={styles.successAlert}>{actionData.message}</div>}

      <div className={styles.controls}>
        <Select value={selectedCourse?.id || ''} onValueChange={handleCourseChange}>
          <SelectTrigger className={styles.courseSelect}>
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            <div style={{ padding: 'var(--space-2)', position: 'sticky', top: 0, background: 'var(--color-neutral-1)', zIndex: 1 }}>
              <Input
                placeholder="Search courses..."
                value={courseSearch}
                onChange={(e) => { e.stopPropagation(); setCourseSearch(e.target.value); }}
                onKeyDown={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
            {filteredCourses.map((course: any) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name} {course.teacher?.full_name ? `(${course.teacher.full_name})` : ''}
              </SelectItem>
            ))}
            {filteredCourses.length === 0 && (
              <div style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--color-neutral-9)', fontSize: '0.85rem' }}>No courses found</div>
            )}
          </SelectContent>
        </Select>

        {selectedCourse && (
          <Button className={styles.addButton} onClick={() => setIsChapterDialogOpen(true)}>
            <Plus size={20} /> Add Chapter
          </Button>
        )}
      </div>

      {!selectedCourse ? (
        <div className={styles.emptyState}><p>Select a course to manage its content</p></div>
      ) : (
        <div className={styles.chapterList}>
          {chapters.length === 0 ? (
            <div className={styles.emptyState}><p>No chapters yet. Create one to get started!</p></div>
          ) : (
            (() => {
              const handleChapterDrop = (e: React.DragEvent, targetId: string) => {
                e.preventDefault();
                setDragOverChapterId(null);
                if (!dragChapterId || dragChapterId === targetId) return;
                const ids = chapters.map((c: any) => c.id);
                const fromIdx = ids.indexOf(dragChapterId);
                const toIdx = ids.indexOf(targetId);
                if (fromIdx === -1 || toIdx === -1) return;
                ids.splice(fromIdx, 1);
                ids.splice(toIdx, 0, dragChapterId);
                const form = document.createElement('form');
                form.method = 'post';
                form.style.display = 'none';
                const addHidden = (n: string, v: string) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = n; i.value = v; form.appendChild(i); };
                addHidden('intent', 'reorder-chapters');
                addHidden('courseId', selectedCourse.id);
                addHidden('order', JSON.stringify(ids));
                document.body.appendChild(form);
                form.submit();
              };

              return chapters.map((chapter: any) => (
              <div key={chapter.id}
                className={`${styles.chapterCard} ${dragOverChapterId === chapter.id ? styles.dragOver : ''}`}
                draggable
                onDragStart={(e) => { e.stopPropagation(); setDragChapterId(chapter.id); e.dataTransfer.effectAllowed = 'move'; }}
                onDragEnd={() => { setDragChapterId(null); setDragOverChapterId(null); }}
                onDragOver={(e) => { e.preventDefault(); if (!dragChapterId) return; setDragOverChapterId(chapter.id); }}
                onDragLeave={() => setDragOverChapterId(null)}
                onDrop={(e) => { if (dragChapterId) handleChapterDrop(e, chapter.id); }}
              >
                <div className={styles.chapterHeader}>
                  <div className={styles.dragHandle} onClick={(e) => e.stopPropagation()}>
                    <GripVertical size={18} />
                  </div>
                  <span className={styles.chapterBadge}>Chapter {chapter.order_index + 1}</span>
                  <h2 className={styles.chapterTitle}>{chapter.title}</h2>
                  <div className={styles.chapterActions}>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedChapterId(chapter.id); setIsLessonDialogOpen(true); }}>
                      <Plus size={18} /> Add Lesson
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingDelete({ type: 'chapter', id: chapter.id, title: chapter.title })}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
                <div className={styles.lessonsList}>
                  {chapter.lessons?.length === 0 ? (
                    <p className={styles.noLessons}>No lessons yet</p>
                  ) : (
                    (() => {
                      const sortedLessons = [...(chapter.lessons || [])].sort((a: any, b: any) => a.order_index - b.order_index);
                      
                      const handleDrop = (e: React.DragEvent, targetId: string) => {
                        e.preventDefault();
                        setDragOverLessonId(null);
                        if (!dragLessonId || dragLessonId === targetId) return;
                        const ids = sortedLessons.map((l: any) => l.id);
                        const fromIdx = ids.indexOf(dragLessonId);
                        const toIdx = ids.indexOf(targetId);
                        if (fromIdx === -1 || toIdx === -1) return;
                        ids.splice(fromIdx, 1);
                        ids.splice(toIdx, 0, dragLessonId);
                        const form = document.createElement('form');
                        form.method = 'post';
                        form.style.display = 'none';
                        const addHidden = (n: string, v: string) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = n; i.value = v; form.appendChild(i); };
                        addHidden('intent', 'reorder-lessons');
                        addHidden('chapterId', chapter.id);
                        addHidden('order', JSON.stringify(ids));
                        document.body.appendChild(form);
                        form.submit();
                      };

                      return sortedLessons.map((lesson: any) => (
                      <div key={lesson.id}
                        className={`${styles.lessonCard} ${dragOverLessonId === lesson.id ? styles.dragOver : ''} ${dragLessonId === lesson.id ? styles.dragging : ''}`}
                        draggable
                        onDragStart={(e) => { setDragLessonId(lesson.id); e.dataTransfer.effectAllowed = 'move'; }}
                        onDragEnd={() => { setDragLessonId(null); setDragOverLessonId(null); }}
                        onDragOver={(e) => { e.preventDefault(); setDragOverLessonId(lesson.id); }}
                        onDragLeave={() => setDragOverLessonId(null)}
                        onDrop={(e) => handleDrop(e, lesson.id)}
                        onClick={() => {
                         if (dragLessonId) return;
                          const type = lesson.lesson_type === 'pdf' && lesson.video_source === null && !lesson.content_url?.startsWith('http') ? 'markdown' : (lesson.lesson_type === 'pdf' ? 'document' : lesson.lesson_type);
                          setEditingLesson(lesson);
                          setEditLessonType(type);
                          setEditVideoSource(lesson.video_source === 'upload' ? 'upload' : lesson.video_source === 'gdrive' ? 'gdrive' : 'youtube');
                          setEditUploadedVideoPath('');
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <div className={styles.dragHandle} onClick={(e) => e.stopPropagation()}>
                          <GripVertical size={18} />
                        </div>
                        <div className={styles.lessonIcon}>
                          {lesson.lesson_type === 'video' ? <Video size={20} /> : (lesson.video_source === null && !lesson.content_url?.startsWith('http') ? <FileCode size={20} /> : <FileText size={20} />)}
                        </div>
                        <div className={styles.lessonInfo}>
                          <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                          <p className={styles.lessonMeta}>
                            {lesson.lesson_type === 'video' ? `Video${lesson.duration ? ` - ${lesson.duration}min` : ''}` : `PDF${lesson.page_count ? ` - ${lesson.page_count} pages` : ''}`}
                          </p>
                        </div>
                        <span className={`${styles.statusBadge} ${styles[lesson.approval_status]}`}>
                          {lesson.approval_status === 'approved' ? 'Approved' : lesson.approval_status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); const t = lesson.lesson_type === 'pdf' && lesson.video_source === null && !lesson.content_url?.startsWith('http') ? 'markdown' : (lesson.lesson_type === 'pdf' ? 'document' : lesson.lesson_type); setEditingLesson(lesson); setEditLessonType(t); setEditVideoSource(lesson.video_source === 'upload' ? 'upload' : lesson.video_source === 'gdrive' ? 'gdrive' : 'youtube'); setEditUploadedVideoPath(''); setIsEditDialogOpen(true); }}>
                          <Pencil size={18} />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingDelete({ type: 'lesson', id: lesson.id, title: lesson.title });
                          }}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    ));
                    })()
                  )}
                </div>
              </div>
            ));
            })()
          )}
        </div>
      )}

      {/* Create Chapter Dialog */}
      <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
        <DialogContent className={styles.modalContent}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}><Layers size={28} /></div>
            <DialogTitle className={styles.modalTitle}>Create New Chapter</DialogTitle>
            <DialogDescription className={styles.modalDescription}>Organize the course by grouping lessons into chapters.</DialogDescription>
          </DialogHeader>
          <Form method="post" onSubmit={() => setIsChapterDialogOpen(false)}>
            <input type="hidden" name="intent" value="create-chapter" />
            <input type="hidden" name="courseId" value={selectedCourse?.id || ''} />
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <Label htmlFor="title">Chapter Title</Label>
                <Input id="title" name="title" placeholder="e.g., Introduction" required />
              </div>
              <div className={styles.formGroup}>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="What will this chapter cover?" />
              </div>
              <div className={styles.formGroup}>
                <Label htmlFor="order_index">Order Position</Label>
                <Input id="order_index" name="order_index" type="number" defaultValue={chapters.length} />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <DialogClose asChild><Button type="button" variant="outline" className={styles.cancelButton}>Cancel</Button></DialogClose>
              <Button type="submit" className={styles.submitButton}>Create Chapter</Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={handleLessonDialogOpenChange}>
        <DialogContent className={styles.modalContent}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}><FilePlus size={28} /></div>
            <DialogTitle className={styles.modalTitle}>Add New Lesson</DialogTitle>
            <DialogDescription className={styles.modalDescription}>Upload a video or document to this chapter.</DialogDescription>
          </DialogHeader>
          <Form method="post" onSubmit={() => setIsSavingLesson(true)}>
            <input type="hidden" name="intent" value="create-lesson" />
            <input type="hidden" name="chapterId" value={selectedChapterId || ''} />
            <input type="hidden" name="videoSource" value={videoSource} />
            <input type="hidden" name="uploadedVideoPath" value={uploadedVideoPath} />
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <Label htmlFor="lesson-title">Lesson Title</Label>
                <Input id="lesson-title" name="title" placeholder="e.g., Getting Started" required />
              </div>
              <div className={styles.formGroup}>
                <Label htmlFor="lesson-type">Content Type</Label>
                <Select name="lessonType" value={lessonType} onValueChange={(v) => { if (uploadedVideoPath) discardPendingUploadedVideo(); else resetUploadedVideoState(); setLessonType(v); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Document (URL)</SelectItem>
                    <SelectItem value="markdown">Markdown Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {lessonType === 'video' && (
                <>
                  <div className={styles.formGroup}>
                    <Label>Video Source</Label>
                    <Select value={videoSource} onValueChange={(v: any) => { if (uploadedVideoPath && v !== 'upload') discardPendingUploadedVideo(); else resetUploadedVideoState(); setVideoSource(v); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube URL</SelectItem>
                        <SelectItem value="upload">Upload Video</SelectItem>
                        <SelectItem value="gdrive">Google Drive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {videoSource === 'youtube' && (
                    <div className={styles.formGroup}>
                      <Label>YouTube URL</Label>
                      <Input name="contentUrl" type="url" placeholder="https://www.youtube.com/watch?v=..." required />
                    </div>
                  )}
                  {videoSource === 'gdrive' && (
                    <>
                      <div className={styles.formGroup}>
                        <Label>YouTube URL (Primary)</Label>
                        <Input name="contentUrl" type="url" placeholder="https://www.youtube.com/watch?v=..." required />
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-9)', marginTop: '4px' }}>The same video uploaded on YouTube — played first</p>
                      </div>
                      <div className={styles.formGroup}>
                        <Label>Google Drive URL (Fallback)</Label>
                        <Input name="gdriveContentUrl" type="url" placeholder="https://drive.google.com/file/d/FILE_ID/view" required />
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-9)', marginTop: '4px' }}>Used as fallback if YouTube requires sign-in. Must be shared as "Anyone with the link"</p>
                      </div>
                    </>
                  )}
                  {videoSource === 'upload' && (
                    <div className={styles.formGroup}>
                      <Label>Video File</Label>
                      {uploadedVideoPath ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--color-success-3)', borderRadius: 'var(--radius-2)', color: 'var(--color-success-11)', fontSize: '0.875rem' }}>
                          <Video size={16} /> Video uploaded successfully
                            <Button type="button" variant="outline" size="sm" onClick={discardPendingUploadedVideo} style={{ marginLeft: 'auto' }}>Change</Button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input
                            type="file"
                            accept="video/*"
                            disabled={isUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !selectedCourse) return;
                              setIsUploading(true);
                              setUploadProgress('Uploading...');
                              setUploadPercent(0);
                              try {
                                const ext = file.name.split('.').pop() || 'mp4';
                                const filePath = `${selectedCourse.id}/${Date.now()}.${ext}`;
                                
                                // Use Supabase storage directly
                                const { data, error } = await supabase.storage
                                  .from('course-videos')
                                  .upload(filePath, file, {
                                    cacheControl: '3600',
                                    upsert: false,
                                  });
                                
                                if (error) {
                                  setUploadProgress(`Upload failed: ${error.message}`);
                                } else {
                                  const { data: urlData } = supabase.storage.from('course-videos').getPublicUrl(filePath);
                                  setUploadedVideoPath(urlData.publicUrl || filePath);
                                  setUploadProgress('Upload complete');
                                  setUploadPercent(100);
                                }
                              } catch (err: any) {
                                setUploadProgress(`Upload failed: ${err.message}`);
                              }
                              setIsUploading(false);
                            }}
                          />
                          {isUploading && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--color-accent-11)' }}>
                                <Loader2 size={14} className={styles.spinning} /> {uploadProgress}
                              </div>
                              <Progress value={uploadPercent} style={{ height: '8px' }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              {lessonType === 'document' && (
                <div className={styles.formGroup}>
                  <Label>Content URL</Label>
                  <Input name="contentUrl" type="url" placeholder="https://..." required />
                </div>
              )}
              {lessonType === 'markdown' && (
                <div className={styles.formGroup}>
                  <Label>Content</Label>
                  <MarkdownEditor name="markdownContent" placeholder="Write your lesson content in Markdown..." required />
                </div>
              )}
              <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="isPreview" name="isPreview" value="true" />
                <Label htmlFor="isPreview" style={{ marginBottom: 0 }}>Mark as Free Preview</Label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <DialogClose asChild><Button type="button" variant="outline" className={styles.cancelButton}>Cancel</Button></DialogClose>
              <Button type="submit" className={styles.submitButton} disabled={(lessonType === 'video' && videoSource === 'upload' && !uploadedVideoPath) || isUploading || isSavingLesson}>Add Lesson</Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className={styles.modalContent}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}><Pencil size={28} /></div>
            <DialogTitle className={styles.modalTitle}>Edit Lesson</DialogTitle>
            <DialogDescription className={styles.modalDescription}>Update this lesson's details and URLs.</DialogDescription>
          </DialogHeader>
          {editingLesson && (
            <Form method="post" onSubmit={() => setIsEditDialogOpen(false)}>
              <input type="hidden" name="intent" value="update-lesson" />
              <input type="hidden" name="lessonId" value={editingLesson.id} />
              <input type="hidden" name="lessonType" value={editLessonType} />
              <input type="hidden" name="videoSource" value={editVideoSource} />
              <input type="hidden" name="uploadedVideoPath" value={editUploadedVideoPath} />
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <Label>Lesson Title</Label>
                  <Input name="title" defaultValue={editingLesson.title} required />
                </div>
                <div className={styles.formGroup}>
                  <Label>Description</Label>
                  <Textarea name="description" defaultValue={editingLesson.description || ''} />
                </div>
                {editLessonType === 'video' && (
                  <>
                    <div className={styles.formGroup}>
                      <Label>Video Source</Label>
                      <Select value={editVideoSource} onValueChange={(v: any) => setEditVideoSource(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="youtube">YouTube URL</SelectItem>
                          <SelectItem value="upload">Upload Video</SelectItem>
                          <SelectItem value="gdrive">Google Drive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {editVideoSource === 'youtube' && (
                      <div className={styles.formGroup}>
                        <Label>YouTube URL</Label>
                        <Input name="contentUrl" type="url" defaultValue={editingLesson.youtube_url || editingLesson.content_url || ''} required />
                      </div>
                    )}
                    {editVideoSource === 'gdrive' && (
                      <>
                        <div className={styles.formGroup}>
                          <Label>YouTube URL (Primary)</Label>
                          <Input name="contentUrl" type="url" defaultValue={editingLesson.youtube_url || ''} placeholder="https://www.youtube.com/watch?v=..." required />
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-9)', marginTop: '4px' }}>Played first — the same video on YouTube</p>
                        </div>
                        <div className={styles.formGroup}>
                          <Label>Google Drive URL (Fallback)</Label>
                          <Input name="gdriveContentUrl" type="url" defaultValue={editingLesson.content_url || ''} placeholder="https://drive.google.com/file/d/FILE_ID/view" required />
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-9)', marginTop: '4px' }}>Fallback if YouTube requires sign-in. Must be shared as "Anyone with the link"</p>
                        </div>
                      </>
                    )}
                    {editVideoSource === 'upload' && (
                      <div className={styles.formGroup}>
                        <Label>Video File</Label>
                        {(editUploadedVideoPath || (editingLesson.video_source === 'upload' && editingLesson.content_url)) ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--color-success-3)', borderRadius: 'var(--radius-2)', color: 'var(--color-success-11)', fontSize: '0.875rem' }}>
                            <Video size={16} /> {editUploadedVideoPath ? 'New video uploaded' : 'Current video attached'}
                            <Button type="button" variant="outline" size="sm" onClick={() => setEditUploadedVideoPath('')} style={{ marginLeft: 'auto' }}>Change</Button>
                          </div>
                        ) : (
                          <input
                            type="file"
                            accept="video/*"
                            disabled={isUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !selectedCourse) return;
                              setIsUploading(true);
                              setUploadProgress('Uploading...');
                              setUploadPercent(0);
                              try {
                                const ext = file.name.split('.').pop() || 'mp4';
                                const filePath = `${selectedCourse.id}/${Date.now()}.${ext}`;
                                
                                const { data, error } = await supabase.storage
                                  .from('course-videos')
                                  .upload(filePath, file, {
                                    cacheControl: '3600',
                                    upsert: false,
                                  });
                                
                                if (error) {
                                  setUploadProgress(`Upload failed: ${error.message}`);
                                } else {
                                  const { data: urlData } = supabase.storage.from('course-videos').getPublicUrl(filePath);
                                  setEditUploadedVideoPath(urlData.publicUrl || filePath);
                                  setUploadProgress('');
                                  setUploadPercent(100);
                                }
                              } catch (err: any) {
                                setUploadProgress(`Upload failed: ${err.message}`);
                              }
                              setIsUploading(false);
                            }}
                          />
                        )}
                        {isUploading && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--color-accent-11)' }}>
                              <Loader2 size={14} className={styles.spinning} /> {uploadProgress}
                            </div>
                            <Progress value={uploadPercent} style={{ height: '8px' }} />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
                {editLessonType === 'document' && (
                  <div className={styles.formGroup}>
                    <Label>Content URL</Label>
                    <Input name="contentUrl" type="url" defaultValue={editingLesson.content_url || ''} required />
                  </div>
                )}
                {editLessonType === 'markdown' && (
                  <div className={styles.formGroup}>
                    <Label>Content</Label>
                    <MarkdownEditor name="markdownContent" defaultValue={editingLesson.content_url || ''} placeholder="Write your lesson content in Markdown..." required />
                  </div>
                )}
                <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="editIsPreview" name="isPreview" value="true" defaultChecked={editingLesson.is_preview} />
                  <Label htmlFor="editIsPreview" style={{ marginBottom: 0 }}>Mark as Free Preview</Label>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <DialogClose asChild><Button type="button" variant="outline" className={styles.cancelButton}>Cancel</Button></DialogClose>
                <Button type="submit" className={styles.submitButton}>Save Changes</Button>
              </div>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className={styles.modalContent}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}><Trash2 size={28} /></div>
            <DialogTitle className={styles.modalTitle}>
              Delete {pendingDelete?.type === 'chapter' ? 'Chapter' : 'Lesson'}
            </DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              {pendingDelete?.type === 'chapter'
                ? `Delete "${pendingDelete?.title}" and all its lessons?`
                : `Delete "${pendingDelete?.title}"?`}
            </DialogDescription>
          </DialogHeader>
          {pendingDelete && (
            <Form method="post">
              <input type="hidden" name="intent" value={pendingDelete.type === 'chapter' ? 'delete-chapter' : 'delete-lesson'} />
              <input type="hidden" name={pendingDelete.type === 'chapter' ? 'chapterId' : 'lessonId'} value={pendingDelete.id} />
              <div className={styles.modalFooter}>
                <Button type="button" variant="outline" className={styles.cancelButton} onClick={() => setPendingDelete(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" className={styles.submitButton}>
                  Delete {pendingDelete.type === 'chapter' ? 'Chapter' : 'Lesson'}
                </Button>
              </div>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
