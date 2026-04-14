import { useState } from 'react';
import { Form } from 'react-router';
import type { Route } from './+types/admin-testimonials';
import { Button } from '~/components/ui/button/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog/dialog';
import { Textarea } from '~/components/ui/textarea/textarea';
import { CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react';
import styles from './admin-testimonials.module.css';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';



export async function clientLoader() {
  const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
  return { testimonials: data || [] };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const id = formData.get('id') as string;
  if (intent === 'approve') { await supabase.from('testimonials').update({ status: 'approved' }).eq('id', id); }
  else if (intent === 'reject') { await supabase.from('testimonials').update({ status: 'rejected' }).eq('id', id); }
  else if (intent === 'edit') { await supabase.from('testimonials').update({ admin_edited_content: formData.get('edited_content') }).eq('id', id); }
  else if (intent === 'delete') { await supabase.from('testimonials').delete().eq('id', id); }
  return { success: true };
}


export default function AdminTestimonials({ loaderData }: Route.ComponentProps) {
  const { testimonials } = loaderData as any;
  const [filter, setFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [testimonialToDelete, setTestimonialToDelete] = useState<any>(null);

  const filtered = filter === 'all' ? testimonials : testimonials.filter((t: any) => t.status === filter);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Testimonials</h1>
      </div>

      <div className={styles.tabs}>
        {['all', 'pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${filter === tab ? styles.tabActive : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'all' ? testimonials.length : testimonials.filter((t: any) => t.status === tab).length})
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>No testimonials found</div>
        ) : (
          filtered.map((t: any) => (
            <div key={t.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.cardAuthor}>{t.student_name}</div>
                  <div className={styles.cardDate}>{new Date(t.created_at).toLocaleDateString()}</div>
                </div>
                <span className={`${styles.badge} ${t.status === 'pending' ? styles.badgePending : t.status === 'approved' ? styles.badgeApproved : styles.badgeRejected}`}>
                  {t.status}
                </span>
              </div>
              <div className={styles.cardStars}>{'★'.repeat(t.rating || 5)}{'☆'.repeat(5 - (t.rating || 5))}</div>
              <div className={styles.cardContent}>"{t.admin_edited_content || t.content}"</div>
              {t.image_urls && t.image_urls.length > 0 && (
                <div className={styles.cardImages}>
                  {t.image_urls.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt="Testimonial image" className={styles.cardImage} />
                    </a>
                  ))}
                </div>
              )}
              
              {editingId === t.id && (
                <Form method="post" className={styles.editArea} onSubmit={() => setEditingId(null)}>
                  <input type="hidden" name="intent" value="edit" />
                  <input type="hidden" name="id" value={t.id} />
                  <Textarea
                    name="edited_content"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <Button type="submit" size="sm">Save Edit</Button>
                </Form>
              )}

              <div className={styles.cardActions}>
                {t.status === 'pending' && (
                  <>
                    <Form method="post" style={{ display: 'inline' }}>
                      <input type="hidden" name="intent" value="approve" />
                      <input type="hidden" name="id" value={t.id} />
                      <Button type="submit" size="sm"><CheckCircle size={14} /> Approve</Button>
                    </Form>
                    <Form method="post" style={{ display: 'inline' }}>
                      <input type="hidden" name="intent" value="reject" />
                      <input type="hidden" name="id" value={t.id} />
                      <Button type="submit" size="sm" variant="destructive"><XCircle size={14} /> Reject</Button>
                    </Form>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(editingId === t.id ? null : t.id);
                    setEditContent(t.admin_edited_content || t.content);
                  }}
                >
                  <Pencil size={14} /> Edit
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => setTestimonialToDelete(t)}><Trash2 size={14} /></Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!testimonialToDelete} onOpenChange={(open) => !open && setTestimonialToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Testimonial</DialogTitle>
            <DialogDescription>
              Delete the testimonial from {testimonialToDelete?.student_name}?
            </DialogDescription>
          </DialogHeader>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
            <Button type="button" variant="outline" onClick={() => setTestimonialToDelete(null)}>
              Cancel
            </Button>
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={testimonialToDelete?.id || ''} />
              <Button type="submit" variant="destructive">
                Delete Testimonial
              </Button>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
