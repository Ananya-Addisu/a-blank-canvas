import { useState } from "react";
import { useLoaderData, Form, useNavigate, useNavigation } from "react-router";
import type { Route } from "./+types/admin-bundles";
import { AdminHeader } from "~/components/admin-header";
import { AdminSidebar } from "~/components/admin-sidebar";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Label } from "~/components/ui/label/label";
import { Textarea } from "~/components/ui/textarea/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select/select";
import { Checkbox } from "~/components/ui/checkbox/checkbox";
import { Badge } from "~/components/ui/badge/badge";
import { Package, Plus, Edit, Trash2, BookOpen, ArrowUp, ArrowDown, Star } from "lucide-react";
import { ThumbnailCatalog } from "~/components/thumbnail-catalog";
import { redirect } from "react-router";
import styles from "./admin-bundles.module.css";
import { supabaseAdmin as supabase } from '~/lib/supabase.client';



export async function clientLoader() {
  const [bundlesRes, coursesRes] = await Promise.all([
    supabase.from('bundles').select('*, bundle_courses(course_id, courses(id, name, price))').order('created_at', { ascending: false }),
    supabase.from('courses').select('id, name, price, category').order('name'),
  ]);
  const bundles = (bundlesRes.data || []).map((b: any) => ({
    ...b,
    courses: b.bundle_courses?.map((bc: any) => bc.courses) || [],
    course_count: b.bundle_courses?.length || 0,
  }));
  return { bundles, courses: coursesRes.data || [] };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const action = formData.get('_action') as string;
  if (action === 'create' || action === 'update') {
    const bundleData: any = {
      name: formData.get('name'), description: formData.get('description'),
      year_level: formData.get('year_level'), semester: formData.get('semester'),
      price: Number(formData.get('price')),
      discount_percentage: Number(formData.get('discount_percentage') || 0),
      is_active: formData.get('is_active') === 'true',
      thumbnail_url: formData.get('thumbnail_url') || null,
    };
    const courseIds = JSON.parse(formData.get('course_ids') as string || '[]');
    if (action === 'update') {
      const id = formData.get('id') as string;
      await supabase.from('bundles').update(bundleData).eq('id', id);
      await supabase.from('bundle_courses').delete().eq('bundle_id', id);
      if (courseIds.length > 0) await supabase.from('bundle_courses').insert(courseIds.map((cid: string) => ({ bundle_id: id, course_id: cid })));
    } else {
      const { data } = await supabase.from('bundles').insert(bundleData).select().single();
      if (data && courseIds.length > 0) await supabase.from('bundle_courses').insert(courseIds.map((cid: string) => ({ bundle_id: data.id, course_id: cid })));
    }
  } else if (action === 'delete') {
    const id = formData.get('id') as string;
    await supabase.from('bundle_courses').delete().eq('bundle_id', id);
    await supabase.from('bundles').delete().eq('id', id);
  } else if (action === 'reorder_featured') {
    const orders = JSON.parse(formData.get('orders') as string || '[]');
    for (const o of orders) { await supabase.from('bundles').update({ featured_path_order: o.order }).eq('id', o.id); }
  }
  return { success: true };
}


export default function AdminBundles({ loaderData }: Route.ComponentProps) {
  const { bundles, courses } = loaderData as any;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<any>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [bundleToDelete, setBundleToDelete] = useState<any>(null);
  const [bundleThumbnail, setBundleThumbnail] = useState('');
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const handleCreate = () => {
    setEditingBundle(null);
    setSelectedCourses([]);
    setBundleThumbnail('');
    setDialogOpen(true);
  };

  const handleEdit = (bundle: any) => {
    setEditingBundle(bundle);
    setSelectedCourses(bundle.courses?.map((c: any) => c.id) || []);
    setBundleThumbnail(bundle.thumbnail_url || '');
    setDialogOpen(true);
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const selectedCoursesData = courses.filter(c => selectedCourses.includes(c.id));
  const totalOriginalPrice = selectedCoursesData.reduce((sum, c) => sum + Number(c.price), 0);

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={styles.main}>

        <div className={styles.content}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Bundle Management</h1>
              <p className={styles.subtitle}>Create and manage course bundles</p>
            </div>
            <Button onClick={handleCreate}>
              <Plus size={20} />
              Create Bundle
            </Button>
          </div>

          <div className={styles.bundlesGrid}>
            {bundles.map((bundle: any) => (
              <div key={bundle.id} className={styles.bundleCard}>
                <div className={styles.bundleHeader}>
                  <div className={styles.bundleIcon}>
                    <Package size={32} />
                  </div>
                  <div className={styles.bundleActions}>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(bundle)}>
                      <Edit size={16} />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setBundleToDelete(bundle)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <h3 className={styles.bundleName}>{bundle.name}</h3>
                <p className={styles.bundleDescription}>{bundle.description}</p>

                <div className={styles.bundleMeta}>
                  <Badge variant={bundle.is_active ? "default" : "outline"}>
                    {bundle.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {bundle.is_featured_path && (
                    <Badge variant="secondary"><Star size={10} /> Featured Path #{bundle.featured_path_order}</Badge>
                  )}
                  {bundle.is_featured_path_exclusive && (
                    <Badge variant="outline">FP Exclusive</Badge>
                  )}
                  {bundle.is_bundle_exclusive && (
                    <Badge variant="outline">Bundle Exclusive</Badge>
                  )}
                  {bundle.discount_percentage > 0 && (
                    <Badge variant="destructive">{bundle.discount_percentage}% OFF</Badge>
                  )}
                </div>

                <div className={styles.bundleDetails}>
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Year Level:</span>
                    <span className={styles.detailValue}>{bundle.year_level}</span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Semester:</span>
                    <span className={styles.detailValue}>{bundle.semester}</span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Courses:</span>
                    <span className={styles.detailValue}>{bundle.course_count}</span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Price:</span>
                    <span className={styles.detailPrice}>{Number(bundle.price).toLocaleString()} ETB</span>
                  </div>
                </div>
              </div>
            ))}

            {bundles.length === 0 && (
              <div className={styles.emptyState}>
                <Package size={48} />
                <p>No bundles created yet</p>
                <Button onClick={handleCreate}>
                  <Plus size={20} />
                  Create Your First Bundle
                </Button>
              </div>
            )}
          </div>

          {/* Featured Paths Ordering */}
          {bundles.filter((b: any) => b.is_featured_path).length > 0 && (
            <div className={styles.featuredOrderSection}>
              <h2 className={styles.sectionTitle}><Star size={18} /> Featured Paths Order</h2>
              <Form method="post">
                <input type="hidden" name="_action" value="reorder_featured" />
                <div className={styles.orderList}>
                  {bundles
                    .filter((b: any) => b.is_featured_path)
                    .sort((a: any, b: any) => a.featured_path_order - b.featured_path_order)
                    .map((bundle: any, idx: number, arr: any[]) => (
                      <div key={bundle.id} className={styles.orderItem}>
                        <span className={styles.orderNum}>#{bundle.featured_path_order}</span>
                        <span className={styles.orderName}>{bundle.name}</span>
                        <div className={styles.orderButtons}>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={idx === 0}
                            onClick={() => {
                              // Swap with previous
                              const prev = arr[idx - 1];
                              const form = new FormData();
                              form.set('_action', 'reorder_featured');
                              form.set('orders', JSON.stringify([
                                { id: bundle.id, order: prev.featured_path_order },
                                { id: prev.id, order: bundle.featured_path_order },
                              ]));
                              const fetcher = document.createElement('form');
                              // Use submit via navigation
                              const f = new FormData();
                              f.set('_action', 'reorder_featured');
                              f.set('orders', JSON.stringify([
                                { id: bundle.id, order: prev.featured_path_order },
                                { id: prev.id, order: bundle.featured_path_order },
                              ]));
                              fetch('', { method: 'POST', body: f }).then(() => window.location.reload());
                            }}
                          >
                            <ArrowUp size={14} />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={idx === arr.length - 1}
                            onClick={() => {
                              const next = arr[idx + 1];
                              const f = new FormData();
                              f.set('_action', 'reorder_featured');
                              f.set('orders', JSON.stringify([
                                { id: bundle.id, order: next.featured_path_order },
                                { id: next.id, order: bundle.featured_path_order },
                              ]));
                              fetch('', { method: 'POST', body: f }).then(() => window.location.reload());
                            }}
                          >
                            <ArrowDown size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </Form>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={styles.dialog}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <Package size={28} />
            </div>
            <DialogTitle className={styles.modalTitle}>
              {editingBundle ? "Edit Bundle" : "Create New Bundle"}
            </DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              Configure the bundle settings and select included courses.
            </DialogDescription>
          </DialogHeader>

          <Form method="post">
            <input type="hidden" name="_action" value={editingBundle ? "update" : "create"} />
            {editingBundle && <input type="hidden" name="id" value={editingBundle.id} />}
            <input type="hidden" name="course_ids" value={JSON.stringify(selectedCourses)} />

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <Label htmlFor="name">Bundle Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingBundle?.name}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editingBundle?.description}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <Label htmlFor="year_level">Year Level</Label>
                  <Select name="year_level" defaultValue={editingBundle?.year_level || "Year 1"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Year 1">Year 1</SelectItem>
                      <SelectItem value="Year 2">Year 2</SelectItem>
                      <SelectItem value="Year 3">Year 3</SelectItem>
                      <SelectItem value="Year 4">Year 4</SelectItem>
                      <SelectItem value="Year 5">Year 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="semester">Semester</Label>
                  <Select name="semester" defaultValue={editingBundle?.semester || "Semester 1"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Semester 1">Semester 1</SelectItem>
                      <SelectItem value="Semester 2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <Label>Select Courses ({selectedCourses.length})</Label>
                <div className={styles.coursesList}>
                  {courses.map((course: any) => (
                    <label key={course.id} className={styles.courseItem}>
                      <Checkbox
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={() => toggleCourse(course.id)}
                      />
                      <div className={styles.courseItemInfo}>
                        <span className={styles.courseName}>{course.name}</span>
                        <span className={styles.coursePrice}>{Number(course.price).toLocaleString()} ETB</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {selectedCourses.length > 0 && (
                <div className={styles.pricingSection}>
                  <div className={styles.pricingRow}>
                    <span>Total Original Price:</span>
                    <span className={styles.originalPrice}>{totalOriginalPrice.toLocaleString()} ETB</span>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <Label htmlFor="discount_percentage">Discount %</Label>
                      <Input
                        id="discount_percentage"
                        name="discount_percentage"
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={editingBundle?.discount_percentage || 0}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="price">Bundle Price (ETB)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={editingBundle?.price}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <ThumbnailCatalog
                value={bundleThumbnail}
                onChange={setBundleThumbnail}
              />

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <Checkbox name="is_active" value="true" defaultChecked={editingBundle?.is_active ?? true} />
                  <span>Active (visible to students)</span>
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className={styles.cancelButton}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || selectedCourses.length === 0} className={styles.submitButton}>
                {isSubmitting ? "Saving..." : (editingBundle ? "Update Bundle" : "Create Bundle")}
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!bundleToDelete} onOpenChange={(open) => !open && setBundleToDelete(null)}>
        <DialogContent className={styles.dialog}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <Trash2 size={28} />
            </div>
            <DialogTitle className={styles.modalTitle}>Delete Bundle</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              Delete "{bundleToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className={styles.modalFooter}>
            <Button type="button" variant="outline" onClick={() => setBundleToDelete(null)} className={styles.cancelButton}>
              Cancel
            </Button>
            <Form method="post">
              <input type="hidden" name="_action" value="delete" />
              <input type="hidden" name="id" value={bundleToDelete?.id || ""} />
              <Button type="submit" variant="destructive">
                Delete Bundle
              </Button>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
