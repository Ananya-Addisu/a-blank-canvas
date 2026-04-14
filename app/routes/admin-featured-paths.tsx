import { useState } from "react";
import { useRevalidator } from "react-router";
import type { Route } from "./+types/admin-featured-paths";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Label } from "~/components/ui/label/label";
import { Textarea } from "~/components/ui/textarea/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "~/components/ui/dialog/dialog";
import { Checkbox } from "~/components/ui/checkbox/checkbox";
import { Badge } from "~/components/ui/badge/badge";
import { ThumbnailCatalog } from "~/components/thumbnail-catalog";
import {
  Star, Edit, Trash2, Plus, Package, ArrowUp, ArrowDown, EyeOff
} from "lucide-react";
import { supabaseAdmin as supabase } from "~/lib/supabase.client";
import styles from "./admin-featured-paths.module.css";

export function meta() {
  return [{ title: "Featured Paths - Admin" }];
}

export async function clientLoader() {
  const [bundlesRes, coursesRes] = await Promise.all([
    supabase
      .from("bundles")
      .select("*, bundle_courses(course_id, courses(id, name, price))")
      .order("featured_path_order"),
    supabase.from("courses").select("id, name, price, category").order("name"),
  ]);

  const allBundles = (bundlesRes.data || []).map((b: any) => ({
    ...b,
    courses: b.bundle_courses?.map((bc: any) => bc.courses).filter(Boolean) || [],
    course_count: b.bundle_courses?.length || 0,
  }));

  return {
    featuredPaths: allBundles.filter((b: any) => b.is_featured_path).sort((a: any, b: any) => (a.featured_path_order ?? 0) - (b.featured_path_order ?? 0)),
    availableBundles: allBundles.filter((b: any) => !b.is_featured_path),
    allCourses: coursesRes.data || [],
  };
}

export default function AdminFeaturedPaths({ loaderData }: Route.ComponentProps) {
  const { featuredPaths: initialFeatured, availableBundles: initialAvailable } = loaderData as any;
  const revalidator = useRevalidator();
  const [featured, setFeatured] = useState<any[]>(initialFeatured);
  const [available, setAvailable] = useState<any[]>(initialAvailable);
  const [editDialog, setEditDialog] = useState(false);
  const [editingBundle, setEditingBundle] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editExclusive, setEditExclusive] = useState(false);
  const [editBundleExclusive, setEditBundleExclusive] = useState(false);

  const openEdit = (bundle: any) => {
    setEditingBundle(bundle);
    setEditName(bundle.name);
    setEditDescription(bundle.description || "");
    setEditThumbnail(bundle.thumbnail_url || "");
    setEditPrice(Number(bundle.price) || 0);
    setEditDiscount(Number(bundle.discount_percentage) || 0);
    setEditExclusive(bundle.is_featured_path_exclusive || false);
    setEditBundleExclusive(bundle.is_bundle_exclusive || false);
    setEditDialog(true);
  };

  const saveEdit = async () => {
    if (!editingBundle) return;
    setSaving(true);
    await supabase.from("bundles").update({
      name: editName,
      description: editDescription,
      thumbnail_url: editThumbnail || null,
      price: editPrice,
      discount_percentage: editDiscount,
      is_featured_path_exclusive: editExclusive,
      is_bundle_exclusive: editBundleExclusive,
    }).eq("id", editingBundle.id);
    setEditDialog(false);
    setSaving(false);
    revalidator.revalidate();
  };

  const addToFeatured = async (bundle: any) => {
    const maxOrder = featured.reduce((max: number, b: any) => Math.max(max, b.featured_path_order ?? 0), 0);
    await supabase.from("bundles").update({
      is_featured_path: true,
      featured_path_order: maxOrder + 1,
    }).eq("id", bundle.id);
    revalidator.revalidate();
  };

  const removeFromFeatured = async (bundle: any) => {
    await supabase.from("bundles").update({
      is_featured_path: false,
      featured_path_order: 0,
      is_featured_path_exclusive: false,
    }).eq("id", bundle.id);
    revalidator.revalidate();
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newList = [...featured];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    await saveOrder(newList);
  };

  const moveDown = async (index: number) => {
    if (index === featured.length - 1) return;
    const newList = [...featured];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    await saveOrder(newList);
  };

  const saveOrder = async (list: any[]) => {
    setFeatured(list);
    for (let i = 0; i < list.length; i++) {
      await supabase.from("bundles").update({ featured_path_order: i + 1 }).eq("id", list[i].id);
    }
    revalidator.revalidate();
  };

  // Sync state after revalidation
  if (revalidator.state === "idle") {
    if (JSON.stringify(initialFeatured.map((f: any) => f.id)) !== JSON.stringify(featured.map((f: any) => f.id))) {
      // Only sync if IDs changed (avoids infinite loop)
    }
  }

  // Use loader data when revalidation completes
  const displayFeatured = revalidator.state === "idle" ? initialFeatured : featured;
  const displayAvailable = revalidator.state === "idle" ? initialAvailable : available;

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Star size={24} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} />
              Featured Paths
            </h1>
            <p className={styles.subtitle}>
              Appoint bundles as featured paths, reorder them, and manage their appearance on the student home page.
            </p>
          </div>
        </div>

        {/* Featured Paths List */}
        {displayFeatured.length === 0 ? (
          <div className={styles.emptyState}>
            <Star size={48} className={styles.emptyIcon} />
            <p>No featured paths yet. Add bundles from below to feature them on the home page.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {displayFeatured.map((bundle: any, index: number) => (
              <div key={bundle.id} className={styles.card}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={styles.orderBadge}>{index + 1}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Button variant="outline" size="icon" onClick={() => moveUp(index)} disabled={index === 0}>
                      <ArrowUp size={14} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => moveDown(index)} disabled={index === displayFeatured.length - 1}>
                      <ArrowDown size={14} />
                    </Button>
                  </div>
                </div>

                <div className={styles.thumbnail}>
                  {bundle.thumbnail_url ? (
                    <img src={bundle.thumbnail_url} alt={bundle.name} />
                  ) : (
                    <Package size={32} className={styles.thumbnailPlaceholder} />
                  )}
                </div>

                <div className={styles.info}>
                  <span className={styles.name}>{bundle.name}</span>
                  <div className={styles.meta}>
                    <span>{bundle.year_level} · {bundle.semester}</span>
                    <span>{bundle.course_count} courses</span>
                    <span>{Number(bundle.price).toLocaleString()} ETB</span>
                  </div>
                  <div className={styles.badges}>
                    {bundle.is_featured_path_exclusive && (
                      <Badge variant="secondary">
                        <EyeOff size={12} style={{ marginRight: 4 }} /> Exclusive
                      </Badge>
                    )}
                    {bundle.is_bundle_exclusive && (
                      <Badge variant="outline">Bundle Only</Badge>
                    )}
                    {!bundle.is_active && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                </div>

                <div className={styles.actions}>
                  <Button variant="outline" size="sm" onClick={() => openEdit(bundle)}>
                    <Edit size={14} style={{ marginRight: 4 }} /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => removeFromFeatured(bundle)}>
                    <Trash2 size={14} style={{ marginRight: 4 }} /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Available Bundles */}
        {displayAvailable.length > 0 && (
          <div className={styles.availableSection}>
            <h2 className={styles.availableTitle}>Available Bundles</h2>
            <div className={styles.availableGrid}>
              {displayAvailable.map((bundle: any) => (
                <div key={bundle.id} className={styles.availableCard}>
                  <div className={styles.thumbnail} style={{ width: 64, height: 44, minWidth: 64 }}>
                    {bundle.thumbnail_url ? (
                      <img src={bundle.thumbnail_url} alt={bundle.name} />
                    ) : (
                      <Package size={20} className={styles.thumbnailPlaceholder} />
                    )}
                  </div>
                  <div className={styles.availableCardInfo}>
                    <div className={styles.availableCardName}>{bundle.name}</div>
                    <div className={styles.availableCardMeta}>
                      {bundle.year_level} · {bundle.course_count} courses
                    </div>
                  </div>
                  <Button size="sm" onClick={() => addToFeatured(bundle)}>
                    <Plus size={14} style={{ marginRight: 4 }} /> Feature
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent style={{ maxWidth: 560 }}>
          <DialogHeader>
            <DialogTitle>Edit Featured Path</DialogTitle>
          </DialogHeader>
          <DialogBody style={{ padding: "var(--space-5) var(--space-6)" }}>
            <div className={styles.editGrid}>
              {editThumbnail && (
                <img src={editThumbnail} alt="Preview" className={styles.thumbnailPreview} />
              )}

              <div>
                <Label>Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
              </div>

              <div>
                <Label>Thumbnail</Label>
                <ThumbnailCatalog value={editThumbnail} onChange={setEditThumbnail} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <Label>Price (ETB)</Label>
                  <Input type="number" value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Discount %</Label>
                  <Input type="number" value={editDiscount} onChange={(e) => setEditDiscount(Number(e.target.value))} min={0} max={100} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <Checkbox checked={editExclusive} onCheckedChange={(v) => setEditExclusive(!!v)} />
                  <span>Exclusive (hide contents from non-owners)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <Checkbox checked={editBundleExclusive} onCheckedChange={(v) => setEditBundleExclusive(!!v)} />
                  <span>Bundle-only courses (courses hidden outside bundle)</span>
                </label>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
