import { useState } from 'react';
import { useLoaderData, useNavigate, Form } from 'react-router';
import type { Route } from './+types/admin-library-manage.$id';
import { Button } from '~/components/ui/button/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog/dialog';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import styles from './admin-library.module.css';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';



export async function clientLoader({ params }: any) {
  const [catRes, contentRes] = await Promise.all([
    supabase.from('library_items').select('*').eq('id', params.id).single(),
    supabase.from('library_content').select('*').eq('category_id', params.id).order('created_at', { ascending: false }),
  ]);
  return { category: catRes.data, content: contentRes.data || [] };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  if (intent === 'delete') { await supabase.from('library_content').delete().eq('id', formData.get('contentId')); }
  return { success: true };
}


export default function AdminLibraryManage({ loaderData }: Route.ComponentProps) {
  const { category, content } = loaderData as any;
  const navigate = useNavigate();
  const [contentToDelete, setContentToDelete] = useState<any>(null);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="outline" onClick={() => navigate('/admin/library')}>
          <ArrowLeft size={20} />
          Back to Library
        </Button>
        <h1 className={styles.title}>Manage Content - {category?.name}</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.toolbar}>
          <Button onClick={() => navigate(`/admin/library-content-add/${category?.id}`)}>
            <Plus size={20} />
            Add Content
          </Button>
        </div>

        <div className={styles.contentList}>
          {content.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No content in this category yet</p>
              <Button onClick={() => navigate(`/admin/library-content-add/${category?.id}`)}>
                <Plus size={20} />
                Add First Content
              </Button>
            </div>
          ) : (
            content.map((item: any) => (
              <div key={item.id} className={styles.contentItemCard}>
                <div className={styles.contentInfo}>
                  <h3>{item.title}</h3>
                  <p className={styles.contentMeta}>
                    {item.subject} - {item.content_type} - {item.status}
                  </p>
                  <p className={styles.contentDesc}>{item.description}</p>
                </div>
                <div className={styles.contentActions}>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/library-content-edit/${item.id}`)}>
                    <Edit size={16} />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => setContentToDelete(item)}
                  >
                      <Trash2 size={16} />
                      Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!contentToDelete} onOpenChange={(open) => !open && setContentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Content</DialogTitle>
            <DialogDescription>
              Delete "{contentToDelete?.title}" from this library category?
            </DialogDescription>
          </DialogHeader>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
            <Button type="button" variant="outline" onClick={() => setContentToDelete(null)}>
              Cancel
            </Button>
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="contentId" value={contentToDelete?.id || ''} />
              <Button type="submit" variant="destructive">
                Delete Content
              </Button>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
