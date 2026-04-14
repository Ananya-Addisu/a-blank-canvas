import { useState, useRef } from 'react';
import { useFetcher, useRevalidator } from 'react-router';
import type { Route } from './+types/admin-popup-notices';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Megaphone, Plus, Trash2, Eye, EyeOff, Link as LinkIcon, Pencil, Upload, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '~/components/ui/dialog/dialog';
import styles from './admin-popup-notices.module.css';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';

export async function clientLoader() {
  const [noticesRes, catsRes, coursesRes, bundlesRes] = await Promise.all([
    supabase.from('popup_notices').select('*').order('created_at', { ascending: false }),
    supabase.from('home_categories').select('id, name').eq('is_active', true).order('display_order'),
    supabase.from('courses').select('id, name').eq('status', 'active').order('name'),
    supabase.from('bundles').select('id, name').eq('is_active', true).order('name'),
  ]);
  return {
    notices: noticesRes.data || [],
    categories: catsRes.data || [],
    courses: coursesRes.data || [],
    bundles: bundlesRes.data || [],
  };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  if (intent === 'create') {
    const linkType = formData.get('link_type') as string;
    await supabase.from('popup_notices').insert({
      title: formData.get('title'), image_url: formData.get('image_url'),
      target_year_level: formData.get('target_year_level') || null,
      start_date: formData.get('start_date'), end_date: formData.get('end_date'),
      display_interval_hours: Number(formData.get('display_interval_hours') || 8), is_active: true,
      link_type: linkType || null,
      link_id: formData.get('link_id') || null,
      button_text: formData.get('button_text') || null,
    });
  } else if (intent === 'update') {
    const linkType = formData.get('link_type') as string;
    await supabase.from('popup_notices').update({
      title: formData.get('title'),
      image_url: formData.get('image_url'),
      target_year_level: formData.get('target_year_level') || null,
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      display_interval_hours: Number(formData.get('display_interval_hours') || 8),
      link_type: linkType || null,
      link_id: formData.get('link_id') || null,
      button_text: formData.get('button_text') || null,
    }).eq('id', formData.get('id'));
  } else if (intent === 'toggle') {
    const isActive = formData.get('is_active') === 'true';
    await supabase.from('popup_notices').update({ is_active: !isActive }).eq('id', formData.get('id'));
  } else if (intent === 'delete') {
    await supabase.from('popup_notices').delete().eq('id', formData.get('id'));
  }
  return { success: true };
}

function formatDateForInput(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface NoticeFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  categories: any[];
  courses: any[];
  bundles: any[];
  defaultValues?: any;
  submitLabel: string;
}

function NoticeForm({ onSubmit, categories, courses, bundles, defaultValues, submitLabel }: NoticeFormProps) {
  const [linkType, setLinkType] = useState(defaultValues?.link_type || '');
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `popup-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('popup-notice-images')
        .upload(fileName, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('popup-notice-images').getPublicUrl(data.path);
      setUploadedUrl(urlData.publicUrl);
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={styles.formGrid}>
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Title</label>
        <Input name="title" required placeholder="e.g. New Course Available!" defaultValue={defaultValues?.title} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Image Source</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="button" size="sm" variant={imageSource === 'url' ? 'default' : 'outline'} onClick={() => setImageSource('url')}>
            <LinkIcon size={14} /> URL
          </Button>
          <Button type="button" size="sm" variant={imageSource === 'upload' ? 'default' : 'outline'} onClick={() => setImageSource('upload')}>
            <Upload size={14} /> Upload
          </Button>
        </div>
      </div>

      {imageSource === 'url' ? (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Image URL</label>
          <Input name="image_url" required={!uploadedUrl} placeholder="https://..." defaultValue={defaultValues?.image_url} />
        </div>
      ) : (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Upload Image</label>
          <input type="hidden" name="image_url" value={uploadedUrl} />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <><Loader2 size={14} className={styles.spin} /> Uploading...</> : 'Choose File'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
            />
          </div>
          {uploadedUrl && (
            <img src={uploadedUrl} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
          )}
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Target Year Level (leave empty for all)</label>
        <select name="target_year_level" defaultValue={defaultValues?.target_year_level || ''} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-neutral-5)' }}>
          <option value="">All Students</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Start Date</label>
          <Input name="start_date" type="datetime-local" required defaultValue={defaultValues ? formatDateForInput(defaultValues.start_date) : ''} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>End Date</label>
          <Input name="end_date" type="datetime-local" required defaultValue={defaultValues ? formatDateForInput(defaultValues.end_date) : ''} />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Display Interval (hours)</label>
        <Input name="display_interval_hours" type="number" defaultValue={defaultValues?.display_interval_hours ?? 8} min="1" max="168" />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Link to Course/Bundle (optional)</label>
        <select
          name="link_type"
          value={linkType}
          onChange={(e) => setLinkType(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-neutral-5)' }}
        >
          <option value="">No link</option>
          <option value="course">Course</option>
          <option value="bundle">Bundle</option>
        </select>
      </div>
      {linkType === 'course' && (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Select Course</label>
          <select name="link_id" required defaultValue={defaultValues?.link_id || ''} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-neutral-5)' }}>
            <option value="">Choose a course...</option>
            {courses.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}
      {linkType === 'bundle' && (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Select Bundle</label>
          <select name="link_id" required defaultValue={defaultValues?.link_id || ''} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-neutral-5)' }}>
            <option value="">Choose a bundle...</option>
            {bundles.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}
      {linkType && (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Button Text</label>
          <Input name="button_text" required placeholder="e.g. View Course, Enroll Now" defaultValue={defaultValues?.button_text} />
        </div>
      )}

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}

export default function AdminPopupNotices({ loaderData }: Route.ComponentProps) {
  const { notices, categories, courses, bundles } = loaderData as any;
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('intent', 'create');
    fetcher.submit(fd, { method: 'post' });
    setShowCreate(false);
    setTimeout(() => revalidator.revalidate(), 500);
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('intent', 'update');
    fetcher.submit(fd, { method: 'post' });
    setEditTarget(null);
    setTimeout(() => revalidator.revalidate(), 500);
  };

  const now = new Date();

  const getLinkLabel = (notice: any) => {
    if (!notice.link_type || !notice.link_id) return null;
    if (notice.link_type === 'course') {
      const c = courses.find((x: any) => x.id === notice.link_id);
      return c ? `Course: ${c.name}` : 'Course (deleted)';
    }
    const b = bundles.find((x: any) => x.id === notice.link_id);
    return b ? `Bundle: ${b.name}` : 'Bundle (deleted)';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Megaphone size={28} />
        </div>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Popup Notices</h1>
            <p className={styles.subtitle}>Create targeted image notices that appear to students</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add Notice
          </Button>
        </div>
      </div>

      {notices.length === 0 ? (
        <div className={styles.emptyState}>
          <Megaphone size={48} />
          <p>No popup notices yet</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {notices.map((notice: any) => {
            const endDate = new Date(notice.end_date);
            const startDate = new Date(notice.start_date);
            const isExpired = endDate < now;
            const isScheduled = startDate > now;
            const linkedLabel = getLinkLabel(notice);
            return (
              <div key={notice.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <img src={notice.image_url} alt={notice.title} className={styles.cardImage} />
                  <div className={styles.cardInfo}>
                    <div className={styles.cardTitle}>{notice.title}</div>
                    <div className={styles.cardMeta}>
                      Target: {notice.target_year_level || 'All Students'}
                    </div>
                    <div className={styles.cardMeta}>
                      {new Date(notice.start_date).toLocaleDateString()} → {endDate.toLocaleDateString()}
                    </div>
                    <div className={styles.cardMeta}>
                      Shows every {notice.display_interval_hours}h
                    </div>
                    {linkedLabel && (
                      <div className={styles.cardMeta}>
                        <LinkIcon size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                        {linkedLabel} — "{notice.button_text}"
                      </div>
                    )}
                    <span className={`${styles.cardBadge} ${isExpired ? styles.badgeExpired : notice.is_active ? styles.badgeActive : styles.badgeInactive}`}>
                      {isExpired ? 'Expired' : isScheduled ? 'Scheduled' : notice.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Button size="sm" variant="outline" onClick={() => setEditTarget(notice)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="toggle" />
                    <input type="hidden" name="id" value={notice.id} />
                    <input type="hidden" name="is_active" value={String(notice.is_active)} />
                    <Button type="submit" size="sm" variant="outline">
                      {notice.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                      {notice.is_active ? 'Disable' : 'Enable'}
                    </Button>
                  </fetcher.Form>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(notice)}>
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Popup Notice</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <NoticeForm
              onSubmit={handleCreate}
              categories={categories}
              courses={courses}
              bundles={bundles}
              submitLabel="Create Notice"
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Popup Notice</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {editTarget && (
              <NoticeForm
                key={editTarget.id}
                onSubmit={handleEdit}
                categories={categories}
                courses={courses}
                bundles={bundles}
                defaultValues={editTarget}
                submitLabel="Save Changes"
              />
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notice</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p style={{ padding: 'var(--space-4) var(--space-6)' }}>Are you sure you want to delete &quot;{deleteTarget?.title}&quot;?</p>
            <div style={{ display: 'flex', gap: '8px', padding: '0 var(--space-6) var(--space-5)', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <fetcher.Form method="post" onSubmit={() => { setDeleteTarget(null); setTimeout(() => revalidator.revalidate(), 500); }}>
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={deleteTarget?.id} />
                <Button type="submit" variant="destructive">Delete</Button>
              </fetcher.Form>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
