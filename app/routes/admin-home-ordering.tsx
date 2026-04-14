import { useState, useEffect } from 'react';
import { useFetcher, useRevalidator } from 'react-router';
import type { Route } from './+types/admin-home-ordering';
import { Button } from '~/components/ui/button/button';
import { ArrowUp, ArrowDown, LayoutGrid, Package, BookOpen, Check, Star, Pin, X } from 'lucide-react';
import styles from './admin-home-ordering.module.css';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';



export async function clientLoader() {
  const [bundlesRes, coursesRes, catsRes, pinnedRes] = await Promise.all([
    supabase.from('bundles').select('id, name, year_level, is_active, display_order, home_category_id, is_featured_path, featured_path_order').eq('is_active', true).order('display_order'),
    supabase.from('courses').select('id, name, category, is_bundle_exclusive, display_order, home_category_id').order('display_order'),
    supabase.from('home_categories').select('*').eq('is_active', true).order('display_order'),
    supabase.from('pinned_home_items').select('*').order('display_order'),
  ]);
  return { bundles: bundlesRes.data || [], courses: coursesRes.data || [], categories: catsRes.data || [], pinnedItems: pinnedRes.data || [] };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  if (intent === 'reorder-items') {
    const items = JSON.parse(formData.get('items') as string || '[]');
    for (const item of items) {
      const table = item.type === 'bundle' ? 'bundles' : 'courses';
      await supabase.from(table).update({ display_order: item.order, home_category_id: item.categoryId }).eq('id', item.id);
    }
    const pinnedOrders = JSON.parse(formData.get('pinnedOrders') as string || '[]');
    for (const p of pinnedOrders) { await supabase.from('pinned_home_items').update({ display_order: p.order }).eq('id', p.id); }
  } else if (intent === 'reorder-categories') {
    const orders = JSON.parse(formData.get('orders') as string || '[]');
    for (const o of orders) { await supabase.from('home_categories').update({ display_order: o.order }).eq('id', o.id); }
  } else if (intent === 'pin-item') {
    await supabase.from('pinned_home_items').insert({ item_id: formData.get('item_id'), item_type: formData.get('item_type'), display_order: 999 });
  } else if (intent === 'unpin-item') {
    await supabase.from('pinned_home_items').delete().eq('id', formData.get('id'));
  } else if (intent === 'assign-category') {
    const table = formData.get('item_type') === 'bundle' ? 'bundles' : 'courses';
    await supabase.from(table).update({ home_category_id: formData.get('category_id') }).eq('id', formData.get('item_id'));
  }
  return { success: true };
}


export default function AdminHomeOrdering({ loaderData }: Route.ComponentProps) {
  const { bundles: initialBundles, courses: initialCourses, categories: initialCategories, pinnedItems: initialPinned } = loaderData as any;
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [saved, setSaved] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [pinnedItems, setPinnedItems] = useState(initialPinned);

  // Build items grouped by category
  const allItems = [
    ...initialBundles.map((b: any) => ({ ...b, type: 'bundle' as const })),
    ...initialCourses.map((c: any) => ({ ...c, type: 'course' as const })),
  ];

  const buildItemsByCategory = (items: typeof allItems, cats: typeof initialCategories) => {
    const result: Record<string, typeof allItems> = {};
    for (const cat of cats) {
      result[cat.id] = items
        .filter((item: any) => {
          if (item.home_category_id === cat.id) return true;
          if (!item.home_category_id) {
            if (item.type === 'bundle' && item.year_level === cat.name) return true;
            if (item.type === 'course' && item.category === cat.name) return true;
          }
          return false;
        })
        .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
    }
    const categorizedIds = new Set(Object.values(result).flat().map(i => i.id));
    const uncategorized = items.filter(i => !categorizedIds.has(i.id));
    if (uncategorized.length > 0) result['uncategorized'] = uncategorized;
    return result;
  };

  const [itemsState, setItemsState] = useState(() => buildItemsByCategory(allItems, initialCategories));

  useEffect(() => {
    setCategories(initialCategories);
    setPinnedItems(initialPinned);
    const allI = [
      ...initialBundles.map((b: any) => ({ ...b, type: 'bundle' as const })),
      ...initialCourses.map((c: any) => ({ ...c, type: 'course' as const })),
    ];
    setItemsState(buildItemsByCategory(allI, initialCategories));
  }, [initialBundles, initialCourses, initialCategories, initialPinned]);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data && (fetcher.data as any).success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data]);

  const moveItemInCategory = (categoryId: string, index: number, direction: 'up' | 'down') => {
    const list = [...(itemsState[categoryId] || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setItemsState({ ...itemsState, [categoryId]: list });
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newList = [...categories];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newList.length) return;
    [newList[index], newList[target]] = [newList[target], newList[index]];
    setCategories(newList);
  };

  const movePinned = (index: number, direction: 'up' | 'down') => {
    const newList = [...pinnedItems];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newList.length) return;
    [newList[index], newList[target]] = [newList[target], newList[index]];
    setPinnedItems(newList);
  };

  const handleSaveItems = () => {
    const allOrders: any[] = [];
    for (const [categoryId, items] of Object.entries(itemsState)) {
      items.forEach((item: any, i: number) => {
        allOrders.push({
          id: item.id,
          type: item.type,
          order: i,
          categoryId: categoryId === 'uncategorized' ? null : categoryId,
        });
      });
    }
    // Also save pinned order
    const pinnedOrders = pinnedItems.map((p: any, i: number) => ({ id: p.id, order: i }));

    const fd = new FormData();
    fd.set('intent', 'reorder-items');
    fd.set('items', JSON.stringify(allOrders));
    fd.set('pinnedOrders', JSON.stringify(pinnedOrders));
    fetcher.submit(fd, { method: 'post' });
  };

  const handleSaveCategories = () => {
    const fd = new FormData();
    fd.set('intent', 'reorder-categories');
    fd.set('orders', JSON.stringify(categories.map((c: any, i: number) => ({ id: c.id, order: i }))));
    fetcher.submit(fd, { method: 'post' });
  };

  const handlePin = (itemId: string, itemType: string) => {
    const fd = new FormData();
    fd.set('intent', 'pin-item');
    fd.set('item_id', itemId);
    fd.set('item_type', itemType);
    fetcher.submit(fd, { method: 'post' });
  };

  const handleUnpin = (pinId: string) => {
    const fd = new FormData();
    fd.set('intent', 'unpin-item');
    fd.set('id', pinId);
    fetcher.submit(fd, { method: 'post' });
  };

  const handleAssignCategory = (itemId: string, itemType: string, categoryId: string) => {
    const fd = new FormData();
    fd.set('intent', 'assign-category');
    fd.set('item_id', itemId);
    fd.set('item_type', itemType);
    fd.set('category_id', categoryId);
    fetcher.submit(fd, { method: 'post' });
  };

  const pinnedItemIds = new Set(pinnedItems.map((p: any) => p.item_id));

  const getItemName = (pinned: any) => {
    const item = allItems.find(i => i.id === pinned.item_id);
    return item?.name || 'Unknown';
  };

  const getItemType = (pinned: any) => {
    const item = allItems.find(i => i.id === pinned.item_id);
    return item?.type || 'course';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <LayoutGrid size={28} />
        </div>
        <h1 className={styles.title}>Home Page Ordering</h1>
        <p className={styles.subtitle}>Control the display order of content on the student home page</p>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'items' ? styles.tabActive : ''}`} onClick={() => setActiveTab('items')}>
          <BookOpen size={18} />
          Bundles / Courses
        </button>
        <button className={`${styles.tab} ${activeTab === 'categories' ? styles.tabActive : ''}`} onClick={() => setActiveTab('categories')}>
          <Package size={18} />
          Categories
        </button>
      </div>

      {activeTab === 'items' && (
        <>
          {/* Pinned / Top Courses section with sorting */}
          <div className={styles.pinnedSection}>
            <div className={styles.pinnedHeader}>
              <div className={styles.pinnedTitle}>
                <Star size={18} /> Top Courses (Pinned)
              </div>
            </div>
            {pinnedItems.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--color-neutral-9)' }}>No pinned items yet. Use the pin button below to add.</p>
            ) : (
              <div className={styles.pinnedList}>
                {pinnedItems.map((pin: any, index: number) => (
                  <div key={pin.id} className={`${styles.pinnedItemRow} ${getItemType(pin) === 'bundle' ? styles.pinnedItemBundle : ''}`}>
                    <div className={styles.pinnedItemOrder}>{index + 1}</div>
                    <span className={styles.pinnedItemName}>{getItemName(pin)}</span>
                    <span className={styles.itemCardType}>{getItemType(pin) === 'bundle' ? 'Bundle' : 'Course'}</span>
                    <Button size="sm" variant="outline" onClick={() => movePinned(index, 'up')} disabled={index === 0}>
                      <ArrowUp size={14} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => movePinned(index, 'down')} disabled={index === pinnedItems.length - 1}>
                      <ArrowDown size={14} />
                    </Button>
                    <button className={styles.removePin} onClick={() => handleUnpin(pin.id)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Items by category */}
          <div className={styles.homePreview}>
            {categories.map((cat: any) => {
              const items = itemsState[cat.id] || [];
              return (
                <div key={cat.id}>
                  <div className={styles.sectionLabel}>{cat.name}</div>
                  <div className={styles.sectionItems}>
                    {items.length === 0 && (
                      <div className={styles.emptyCategory}>No items in this category</div>
                    )}
                    {items.map((item: any, index: number) => (
                      <div key={item.id} className={`${styles.itemCard} ${item.type === 'bundle' ? styles.itemCardBundle : ''}`}>
                        <div className={styles.itemCardOrder}>{index + 1}</div>
                        <div className={styles.itemCardName}>{item.name}</div>
                        <span className={styles.itemCardType}>{item.type === 'bundle' ? 'Bundle' : 'Course'}</span>
                        <Button size="sm" variant="outline" onClick={() => moveItemInCategory(cat.id, index, 'up')} disabled={index === 0}>
                          <ArrowUp size={14} />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => moveItemInCategory(cat.id, index, 'down')} disabled={index === items.length - 1}>
                          <ArrowDown size={14} />
                        </Button>
                        {!pinnedItemIds.has(item.id) ? (
                          <Button size="sm" variant="outline" onClick={() => handlePin(item.id, item.type)} title="Pin to Top">
                            <Pin size={14} />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className={styles.pinnedStatusButton} title="Pinned">
                            <Star size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {itemsState['uncategorized']?.length > 0 && (
              <div>
                <div className={styles.sectionLabel}>Uncategorized</div>
                <div className={styles.sectionItems}>
                  {itemsState['uncategorized'].map((item: any, index: number) => (
                    <div key={item.id} className={`${styles.itemCard} ${item.type === 'bundle' ? styles.itemCardBundle : ''}`}>
                      <div className={styles.itemCardOrder}>{index + 1}</div>
                      <div className={styles.itemCardName}>{item.name}</div>
                      <span className={styles.itemCardType}>{item.type === 'bundle' ? 'Bundle' : 'Course'}</span>
                      <select
                        className={styles.categorySelect}
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) handleAssignCategory(item.id, item.type, e.target.value);
                        }}
                      >
                        <option value="" disabled>Assign to...</option>
                        {categories.map((cat: any) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      {!pinnedItemIds.has(item.id) ? (
                        <Button size="sm" variant="outline" onClick={() => handlePin(item.id, item.type)} title="Pin to Top">
                          <Pin size={14} />
                        </Button>
                      ) : (
                          <Button size="sm" variant="outline" className={styles.pinnedStatusButton} title="Pinned">
                          <Star size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <Button onClick={handleSaveItems} disabled={fetcher.state !== 'idle'} className={styles.saveButton}>
              {saved ? <Check size={18} /> : null}
              {fetcher.state !== 'idle' ? 'Saving...' : saved ? 'Saved!' : 'Save Order'}
            </Button>
          </div>
        </>
      )}

      {activeTab === 'categories' && (
        <>
          <div className={styles.categoryList}>
            <div className={`${styles.categoryItem} ${styles.categoryItemLocked}`}>
              <div className={styles.categoryItemOrder}>★</div>
              <div className={styles.categoryItemName}>Top Courses</div>
              <span className={styles.categoryItemLockBadge}>ALWAYS ON TOP</span>
            </div>

            {categories.map((cat: any, index: number) => (
              <div key={cat.id} className={styles.categoryItem}>
                <div className={styles.categoryItemOrder}>{index + 2}</div>
                <div className={styles.categoryItemName}>{cat.name}</div>
                <div className={styles.categoryItemActions}>
                  <Button size="sm" variant="outline" disabled={index === 0} onClick={() => moveCategory(index, 'up')}>
                    <ArrowUp size={16} />
                  </Button>
                  <Button size="sm" variant="outline" disabled={index === categories.length - 1} onClick={() => moveCategory(index, 'down')}>
                    <ArrowDown size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <Button onClick={handleSaveCategories} disabled={fetcher.state !== 'idle'} className={styles.saveButton}>
              {saved ? <Check size={18} /> : null}
              {fetcher.state !== 'idle' ? 'Saving...' : saved ? 'Saved!' : 'Save Order'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
