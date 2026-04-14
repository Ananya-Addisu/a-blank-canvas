import { useState } from 'react';
import { Plus, Book, FileText, Edit, Video, Trash2, Library, Search, Loader2 } from 'lucide-react';
import type { Route } from './+types/admin-library';
import styles from './admin-library.module.css';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Switch } from '~/components/ui/switch/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '~/components/ui/dialog/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select/select';
import { Card, CardContent } from '~/components/ui/card/card';
import { Badge } from '~/components/ui/badge/badge';
import { Progress } from '~/components/ui/progress/progress';
import { MarkdownEditor } from '~/components/markdown-editor';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';

export async function clientLoader() {
  const [settingsRes, contentRes, coursesRes] = await Promise.all([
    supabase.from('app_settings').select('setting_value').eq('setting_key', 'enable_library').single(),
    supabase.from('library_content').select('*, course:courses(id, name)').order('created_at', { ascending: false }),
    supabase.from('courses').select('id, name').eq('status', 'active').order('name'),
  ]);
  return {
    libraryEnabled: settingsRes.data?.setting_value !== 'false',
    items: contentRes.data || [],
    courses: coursesRes.data || [],
  };
}

const contentTypeIcons: Record<string, any> = { book: Book, exam: FileText, video: Video };

export default function AdminLibrary({ loaderData }: Route.ComponentProps) {
  const data = loaderData as any;
  const [enabled, setEnabled] = useState(data.libraryEnabled);
  const [items, setItems] = useState<any[]>(data.items);
  const [courses] = useState<any[]>(data.courses);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<'book' | 'exam' | 'video'>('book');
  const [courseId, setCourseId] = useState('');
  const [subject, setSubject] = useState('');
  const [author, setAuthor] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [videoSource, setVideoSource] = useState<'youtube' | 'youtube_gdrive' | 'upload'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [gdriveUrl, setGdriveUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadPercent, setUploadPercent] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);
    await supabase.from('app_settings').upsert({ setting_key: 'enable_library', setting_value: checked.toString() }, { onConflict: 'setting_key' });
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setContentType('book'); setCourseId(''); setSubject('');
    setAuthor(''); setContentMarkdown(''); setVideoSource('youtube'); setYoutubeUrl('');
    setGdriveUrl(''); setFileUrl(''); setEditingItem(null);
    setIsUploading(false); setUploadProgress(''); setUploadPercent(0);
  };

  const handleVideoUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress('Uploading...');
    setUploadPercent(0);

    try {
      const ext = file.name.split('.').pop() || 'mp4';
      const filePath = `${courseId || 'library'}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('course-videos').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        setUploadProgress(`Upload failed: ${error.message}`);
        return;
      }

      const { data: urlData } = supabase.storage.from('course-videos').getPublicUrl(filePath);
      setFileUrl(urlData.publicUrl || filePath);
      setUploadProgress('Upload complete');
      setUploadPercent(100);
    } catch (err: any) {
      setUploadProgress(`Upload failed: ${err.message}`);
    }

    setIsUploading(false);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setTitle(item.title || '');
    setDescription(item.description || '');
    setContentType(item.content_type || 'book');
    setCourseId(item.course_id || '');
    setSubject(item.subject || '');
    setAuthor(item.author || '');
    setContentMarkdown(item.content_markdown || '');
    setVideoSource(item.video_source === 'youtube' ? (item.file_url && !item.file_url.includes('youtube') ? 'youtube_gdrive' : 'youtube') : 'upload');
    setYoutubeUrl(item.youtube_url || '');
    setGdriveUrl(item.video_source === 'youtube' && item.file_url && !item.file_url.includes('youtube') ? item.file_url : '');
    setFileUrl(item.video_source !== 'youtube' ? (item.file_url || '') : '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const missingVideoSourceValue = contentType === 'video' && (
      (videoSource === 'youtube' && !youtubeUrl.trim()) ||
      (videoSource === 'youtube_gdrive' && (!youtubeUrl.trim() || !gdriveUrl.trim())) ||
      (videoSource === 'upload' && !fileUrl.trim())
    );

    if (!title || !courseId || !contentType || missingVideoSourceValue || isUploading) return;
    setSaving(true);

    const record: any = {
      title, description, content_type: contentType, course_id: courseId,
      subject, author, approval_status: 'approved',
    };

    if (contentType === 'book' || contentType === 'exam') {
      record.content_markdown = contentMarkdown;
      record.file_url = '';
      record.video_source = null;
      record.youtube_url = null;
    } else {
      record.content_markdown = null;
      if (videoSource === 'youtube') {
        record.youtube_url = youtubeUrl;
        record.file_url = youtubeUrl;
        record.video_source = 'youtube';
      } else if (videoSource === 'youtube_gdrive') {
        record.youtube_url = youtubeUrl;
        record.file_url = gdriveUrl; // GDrive as fallback stored in file_url
        record.video_source = 'youtube';
      } else {
        record.file_url = fileUrl;
        record.video_source = 'upload';
        record.youtube_url = null;
      }
    }

    if (editingItem) {
      const { data: updated } = await supabase.from('library_content').update(record).eq('id', editingItem.id).select('*, course:courses(id, name)').single();
      if (updated) setItems(prev => prev.map(i => i.id === editingItem.id ? updated : i));
    } else {
      const { data: created } = await supabase.from('library_content').insert(record).select('*, course:courses(id, name)').single();
      if (created) setItems(prev => [created, ...prev]);
    }

    setSaving(false);
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this library item?')) return;
    await supabase.from('library_content').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const filtered = items.filter(item => {
    const matchType = filterType === 'all' || item.content_type === filterType;
    const matchSearch = !searchQuery || item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || item.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Library Management</h1>
      </div>

      <Card className={styles.featureCard}>
        <CardContent className={styles.featureContent}>
          <div className={styles.featureInfo}>
            <h3 className={styles.featureTitle}>Library Feature</h3>
            <p className={styles.featureDesc}>Enable or disable library access for students</p>
          </div>
          <Switch checked={enabled} onCheckedChange={handleToggle} />
        </CardContent>
      </Card>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={16} />
          <input placeholder="Search items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={styles.searchInput} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger style={{ width: 140 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="book">Books</SelectItem>
            <SelectItem value="exam">Exams</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={openCreate}><Plus size={16} /> Add Item</Button>
      </div>

      <div className={styles.tabsList}>
        {filtered.map(item => {
          const Icon = contentTypeIcons[item.content_type] || Book;
          return (
            <div key={item.id} className={styles.tabItem}>
              <div className={styles.tabIcon}><Icon size={22} /></div>
              <div className={styles.tabInfo}>
                <h3 className={styles.tabName}>{item.title}</h3>
                <p className={styles.tabMeta}>
                  <Badge variant="outline" style={{ marginRight: 6 }}>{item.content_type}</Badge>
                  {item.course?.name && <span>Course: {item.course.name}</span>}
                  {item.subject && <span> · {item.subject}</span>}
                </p>
              </div>
              <div className={styles.tabActions}>
                <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                  <Edit size={14} /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} style={{ color: 'var(--color-error-9)' }}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <Library size={48} />
            <p>No library items yet. Click "Add Item" to create one.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { if (!open) { setDialogOpen(false); resetForm(); } else setDialogOpen(true); }}>
        <DialogContent className={styles.dialog} style={{ maxWidth: 700, maxHeight: '90vh', overflow: 'auto' }}>
          <DialogHeader className={styles.modalHeader}>
            <DialogTitle className={styles.dialogTitle}>{editingItem ? 'Edit' : 'Create'} Library Item</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              {editingItem ? 'Update the details of this library item.' : 'Add a new item to the student library.'}
            </DialogDescription>
          </DialogHeader>

          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <Label>Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Item title" />
            </div>

            <div className={styles.formGroup}>
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description" rows={2} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className={styles.formGroup}>
                <Label>Category *</Label>
                <Select value={contentType} onValueChange={v => setContentType(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="book">Book (Markdown)</SelectItem>
                    <SelectItem value="exam">Exam (Markdown)</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.formGroup}>
                <Label>Linked Course *</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className={styles.formGroup}>
                <Label>Subject</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Mathematics" />
              </div>
              <div className={styles.formGroup}>
                <Label>Author</Label>
                <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" />
              </div>
            </div>

            {(contentType === 'book' || contentType === 'exam') && (
              <div className={styles.formGroup}>
                <Label>Content (Markdown) *</Label>
                <MarkdownEditor value={contentMarkdown} onChange={setContentMarkdown} />
              </div>
            )}

            {contentType === 'video' && (
              <>
                <div className={styles.formGroup}>
                  <Label>Video Source</Label>
                  <Select value={videoSource} onValueChange={v => setVideoSource(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="youtube_gdrive">YouTube + GDrive Fallback</SelectItem>
                    <SelectItem value="upload">Direct Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(videoSource === 'youtube' || videoSource === 'youtube_gdrive') && (
                  <div className={styles.formGroup}>
                    <Label>YouTube URL *</Label>
                    <Input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                  </div>
                )}

                {videoSource === 'youtube_gdrive' && (
                  <div className={styles.formGroup}>
                    <Label>Google Drive Fallback URL</Label>
                    <Input value={gdriveUrl} onChange={e => setGdriveUrl(e.target.value)} placeholder="https://drive.google.com/file/d/..." />
                  </div>
                )}

                {videoSource === 'upload' && (
                  <div className={styles.formGroup}>
                    <Label>Video File *</Label>
                    {fileUrl ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--color-success-3)', borderRadius: 'var(--radius-2)', color: 'var(--color-success-11)', fontSize: '0.875rem' }}>
                        <Video size={16} /> Video uploaded successfully
                        <Button type="button" variant="outline" size="sm" onClick={() => setFileUrl('')} style={{ marginLeft: 'auto' }}>Change</Button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="file"
                          accept="video/*"
                          disabled={isUploading || !courseId}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVideoUpload(file);
                          }}
                        />
                        {!courseId && <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-9)' }}>Select the linked course first before uploading.</p>}
                        {isUploading && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--color-accent-11)' }}>
                              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {uploadProgress}
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
          </div>

          <div className={styles.modalFooter}>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || isUploading || !title || !courseId || (contentType === 'video' && videoSource === 'upload' && !fileUrl.trim())}>
              {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
