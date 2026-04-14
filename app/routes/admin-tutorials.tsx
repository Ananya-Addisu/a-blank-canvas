import { useState } from "react";
import { Form, useLoaderData, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/admin-tutorials";
import { Plus, Edit, Trash2, Eye, EyeOff, Play } from "lucide-react";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Textarea } from "~/components/ui/textarea/textarea";
import { Card } from "~/components/ui/card/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select/select";

import styles from "./admin-tutorials.module.css";
import { supabaseAdmin as supabase } from '~/lib/supabase.client';

export async function clientLoader() {
  const { data } = await supabase.from('tutorial_videos').select('*').order('display_order');
  return { tutorials: data || [] };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  if (intent === 'create') {
    await supabase.from('tutorial_videos').insert({ title: formData.get('title'), description: formData.get('description'), video_url: formData.get('video_url'), thumbnail_url: formData.get('thumbnail_url'), duration: Number(formData.get('duration') || 0), display_order: Number(formData.get('display_order') || 0), target_audience: formData.get('target_audience'), is_active: true });
  } else if (intent === 'update') {
    const up: any = { title: formData.get('title'), description: formData.get('description'), video_url: formData.get('video_url'), thumbnail_url: formData.get('thumbnail_url'), duration: Number(formData.get('duration') || 0), display_order: Number(formData.get('display_order') || 0), target_audience: formData.get('target_audience') };
    if (formData.has('is_active')) up.is_active = formData.get('is_active') === 'true';
    await supabase.from('tutorial_videos').update(up).eq('id', formData.get('videoId'));
  } else if (intent === 'toggle-active') {
    const isActive = formData.get('isActive') === 'true';
    await supabase.from('tutorial_videos').update({ is_active: !isActive }).eq('id', formData.get('videoId'));
  } else if (intent === 'delete') {
    await supabase.from('tutorial_videos').delete().eq('id', formData.get('videoId'));
  }
  return { success: true };
}


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tutorial Videos - Admin" },
    { name: "description", content: "Manage tutorial videos" },
  ];
}



export default function AdminTutorials({ loaderData, actionData: rawActionData }: Route.ComponentProps) {
  const { tutorials } = loaderData as any;
  const actionData = rawActionData as any;
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [tutorialToDelete, setTutorialToDelete] = useState<any>(null);
  const isSubmitting = navigation.state === "submitting";

  const handleEdit = (video: any) => {
    setEditingVideo(video);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingVideo(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVideo(null);
  };

  return (
    <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Tutorial Videos</h1>
            <Button onClick={handleCreate} className={styles.addBtn}>
              <Plus size={18} />
              Add Tutorial Video
            </Button>
          </div>

          {actionData?.success && (
            <div className={styles.success}>{actionData.success}</div>
          )}
          {actionData?.error && (
            <div className={styles.error}>{actionData.error}</div>
          )}

          <Card className={styles.tutorialsCard}>
            <div className={styles.tutorialsList}>
              {tutorials.map((video) => (
                <div key={video.id} className={styles.tutorialItem}>
                  <div className={styles.tutorialThumb}>
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} />
                    ) : (
                      <div className={styles.noThumb}>No Thumbnail</div>
                    )}
                  </div>
                  <div className={styles.tutorialInfo}>
                    <h4 className={styles.tutorialTitle}>{video.title}</h4>
                    <p className={styles.tutorialDesc}>
                      {video.description || 'No description provided'}
                    </p>
                    <div className={styles.tutorialMeta}>
                      <span className={styles.metaBadge}>{video.target_audience}</span>
                      {video.duration && (
                        <span className={styles.metaBadge}>
                          {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                        </span>
                      )}
                      {!video.is_active && (
                        <span className={styles.inactiveBadge}>Inactive</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.tutorialActions}>
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => handleEdit(video)}
                    >
                      <Edit size={16} />
                    </button>
                    <Form method="post" style={{ display: 'inline' }}>
                      <input type="hidden" name="intent" value="toggle-active" />
                      <input type="hidden" name="videoId" value={video.id} />
                      <input type="hidden" name="isActive" value={String(video.is_active)} />
                      <button
                        type="submit"
                        className={video.is_active ? styles.deactivateButton : styles.activateButton}
                        disabled={isSubmitting}
                      >
                        {video.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </Form>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      disabled={isSubmitting}
                      onClick={() => setTutorialToDelete(video)}
                    >
                        <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {tutorials.length === 0 && (
            <div className={styles.empty}>
              <p>No tutorial videos yet. Create your first one!</p>
            </div>
          )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className={styles.modal}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <Play size={28} />
            </div>
            <DialogTitle className={styles.modalTitle}>
              {editingVideo ? 'Edit Tutorial Video' : 'Add Tutorial Video'}
            </DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              {editingVideo
                ? 'Update the tutorial video details'
                : 'Add a new tutorial video to help users'}
            </DialogDescription>
          </DialogHeader>

          <Form method="post" onSubmit={closeModal}>
            <input
              type="hidden"
              name="intent"
              value={editingVideo ? 'update' : 'create'}
            />
            {editingVideo && (
              <input type="hidden" name="videoId" value={editingVideo.id} />
            )}

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label htmlFor="title" className={styles.label}>
                  Title
                </label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingVideo?.title}
                  required
                  placeholder="e.g., How to Use Magster Academy"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="description" className={styles.label}>
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingVideo?.description}
                  placeholder="Brief description of what this tutorial covers"
                  rows={3}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="video_url" className={styles.label}>
                  Video URL (YouTube embed)
                </label>
                <Input
                  id="video_url"
                  name="video_url"
                  defaultValue={editingVideo?.video_url}
                  required
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="thumbnail_url" className={styles.label}>
                  Thumbnail URL
                </label>
                <Input
                  id="thumbnail_url"
                  name="thumbnail_url"
                  defaultValue={editingVideo?.thumbnail_url}
                  placeholder="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="duration" className={styles.label}>
                    Duration (seconds)
                  </label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    defaultValue={editingVideo?.duration}
                    placeholder="180"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="display_order" className={styles.label}>
                    Display Order
                  </label>
                  <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    defaultValue={editingVideo?.display_order ?? 0}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="target_audience" className={styles.label}>
                  Target Audience
                </label>
                <Select
                  name="target_audience"
                  defaultValue={editingVideo?.target_audience || 'student'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="teacher">Teachers</SelectItem>
                    <SelectItem value="all">All Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingVideo && (
                <div className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    value="true"
                    defaultChecked={editingVideo.is_active}
                  />
                  <label htmlFor="is_active" className={styles.checkboxLabel}>
                    Active (visible to users)
                  </label>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                {isSubmitting
                  ? 'Saving...'
                  : editingVideo
                  ? 'Update Video'
                  : 'Create Video'}
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!tutorialToDelete} onOpenChange={(open) => !open && setTutorialToDelete(null)}>
        <DialogContent className={styles.modal}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <Trash2 size={28} />
            </div>
            <DialogTitle className={styles.modalTitle}>Delete Tutorial Video</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              Delete "{tutorialToDelete?.title}"? This tutorial will be removed for everyone.
            </DialogDescription>
          </DialogHeader>

          <div className={styles.modalFooter}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTutorialToDelete(null)}
              className={styles.cancelButton}
            >
              Cancel
            </Button>
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="videoId" value={tutorialToDelete?.id || ''} />
              <Button type="submit" variant="destructive" disabled={isSubmitting} className={styles.submitBtn}>
                Delete Tutorial
              </Button>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
