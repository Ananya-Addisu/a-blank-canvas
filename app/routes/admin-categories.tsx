import { useState, useEffect } from 'react';
import { useFetcher, useRevalidator } from 'react-router';
import type { Route } from './+types/admin-categories';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { FolderTree, Plus, Trash2, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog/dialog';
import styles from './admin-categories.module.css';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';



export async function clientLoader() {
  const { data } = await supabase.from('home_categories').select('*').order('display_order');
  return { categories: data || [] };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  if (intent === 'create') {
    const maxOrder = await supabase.from('home_categories').select('display_order').order('display_order', { ascending: false }).limit(1);
    const nextOrder = ((maxOrder.data?.[0]?.display_order || 0) + 1);
    await supabase.from('home_categories').insert({ name: formData.get('name'), display_order: nextOrder, is_active: true, is_system: false });
  } else if (intent === 'reorder') {
    const orders = JSON.parse(formData.get('orders') as string || '[]');
    for (const o of orders) { await supabase.from('home_categories').update({ display_order: o.order }).eq('id', o.id); }
  } else if (intent === 'delete') {
    await supabase.from('home_categories').delete().eq('id', formData.get('id'));
  }
  return { success: true };
}


export default function AdminCategories({ loaderData }: Route.ComponentProps) {
  const { categories: initialCategories } = loaderData as any;
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const [categories, setCategories] = useState(initialCategories);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setCategories(initialCategories); }, [initialCategories]);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data && (fetcher.data as any).success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newList = [...categories];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newList.length) return;
    [newList[index], newList[target]] = [newList[target], newList[index]];
    setCategories(newList);
  };

  const handleSaveOrder = () => {
    const fd = new FormData();
    fd.set('intent', 'reorder');
    fd.set('orders', JSON.stringify(categories.map((c: any, i: number) => ({ id: c.id, order: i }))));
    fetcher.submit(fd, { method: 'post' });
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('intent', 'create');
    fetcher.submit(fd, { method: 'post' });
    setShowCreate(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <FolderTree size={28} />
        </div>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Home Categories</h1>
            <p className={styles.subtitle}>Manage categories shown on the student home page</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add Category
          </Button>
        </div>
      </div>

      <div className={styles.list}>
        {categories.map((cat: any, index: number) => (
          <div key={cat.id} className={styles.listItem}>
            <div className={styles.listItemOrder}>{index + 1}</div>
            <div className={styles.listItemInfo}>
              <div className={styles.listItemName}>{cat.name}</div>
              <div className={styles.listItemMeta}>
                {cat.is_system ? 'System' : 'Custom'} · {cat.is_active ? 'Active' : 'Disabled'}
              </div>
            </div>
            <div className={styles.listItemActions}>
              <Button size="sm" variant="outline" disabled={index === 0} onClick={() => moveItem(index, 'up')}>
                <ArrowUp size={16} />
              </Button>
              <Button size="sm" variant="outline" disabled={index === categories.length - 1} onClick={() => moveItem(index, 'down')}>
                <ArrowDown size={16} />
              </Button>
              {!cat.is_system && (
                <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(cat)}>
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <Button onClick={handleSaveOrder} disabled={fetcher.state !== 'idle'}>
          {saved ? <Check size={18} /> : null}
          {fetcher.state !== 'idle' ? 'Saving...' : saved ? 'Saved!' : 'Save Order'}
        </Button>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category Name</label>
              <Input name="name" required placeholder="e.g. Computer Science" />
            </div>
            <Button type="submit">Create</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Category</DialogTitle></DialogHeader>
          <p>Delete "{deleteTarget?.name}"? Courses/bundles in this category won't be removed.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <fetcher.Form method="post" onSubmit={() => { setDeleteTarget(null); setTimeout(() => revalidator.revalidate(), 500); }}>
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={deleteTarget?.id} />
              <Button type="submit" variant="destructive">Delete</Button>
            </fetcher.Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
