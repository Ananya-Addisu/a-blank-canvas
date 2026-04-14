import type { Route } from './+types/admin-content-approvals';
import { Form, useActionData } from 'react-router';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card/card';
import { Button } from '~/components/ui/button/button';
import { Badge } from '~/components/ui/badge/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '~/components/ui/dialog/dialog';
import { Label } from '~/components/ui/label/label';
import { Textarea } from '~/components/ui/textarea/textarea';
import { CheckCircle, XCircle, Video, FileText, Youtube, Upload, AlertCircle, Eye } from 'lucide-react';
import { useState } from 'react';
import { CustomVideoPlayer } from '~/components/custom-video-player';
import { MarkdownRenderer } from '~/components/markdown-renderer';
import styles from './admin-content-approvals.module.css';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';



export async function clientLoader() {
  const { getPendingContentApprovals } = await import('~/services/admin.client');
  const pendingContent = await getPendingContentApprovals();
  return { pendingContent };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const action = formData.get('action') as string;
  const contentType = formData.get('contentType') as 'lesson' | 'library';
  const contentId = formData.get('contentId') as string;
  const { approveContent, rejectContent } = await import('~/services/admin.client');
  if (action === 'approve') {
    return await approveContent(contentType, contentId, 'admin');
  } else if (action === 'reject') {
    return await rejectContent(contentType, contentId, 'admin', formData.get('reason') as string);
  }
  return { success: false, error: 'Unknown action' };
}


export default function AdminContentApprovals({ loaderData, actionData: rawActionData }: Route.ComponentProps) {
  const actionData = rawActionData as any;
  const { pendingContent } = loaderData as any;
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewContent, setPreviewContent] = useState<any>(null);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Content Approvals</h1>
        <Badge className={styles.badge}>{pendingContent.length} Pending</Badge>
      </div>

      {actionData?.success === false && (
        <div className={styles.error}>
          <XCircle size={20} />
          {actionData.error}
        </div>
      )}

      {actionData?.success === true && (
        <div className={styles.success}>
          <CheckCircle size={20} />
          Content processed successfully!
        </div>
      )}

      <div className={styles.grid}>
        {pendingContent.length === 0 ? (
          <Card className={styles.emptyCard}>
            <CardContent className={styles.empty}>
              <CheckCircle size={48} className={styles.emptyIcon} />
              <p className={styles.emptyText}>No pending content approvals</p>
            </CardContent>
          </Card>
        ) : (
          pendingContent.map((content: any) => (
            <Card key={content.id} className={styles.contentCard}>
              <CardHeader>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleRow}>
                    <CardTitle className={styles.cardTitle}>{content.title}</CardTitle>
                    <Badge variant={content.content_type === 'lesson' ? 'default' : 'secondary'}>
                      {content.content_type}
                    </Badge>
                  </div>
                  {content.course_title && (
                    <CardDescription className={styles.courseTitle}>Course: {content.course_title}</CardDescription>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className={styles.contentInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Type:</span>
                    <div className={styles.typeInfo}>
                      {content.lesson_type === 'video' ? (
                        <Video size={16} />
                      ) : (
                        <FileText size={16} />
                      )}
                      <span>{content.lesson_type}</span>
                    </div>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Source:</span>
                    <div className={styles.typeInfo}>
                      {content.video_source === 'youtube' ? (
                        <>
                          <Youtube size={16} />
                          <span>YouTube</span>
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          <span>Uploaded</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Teacher:</span>
                    <span>{content.teacher_name}</span>
                  </div>

                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Submitted:</span>
                    <span>{new Date(content.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className={styles.actions}>
                  <Button 
                    variant="outline" 
                    onClick={() => setPreviewContent(content)}
                    className={styles.previewBtn}
                  >
                    <Eye size={16} />
                    Preview
                  </Button>

                  <Form method="post">
                    <input type="hidden" name="action" value="approve" />
                    <input type="hidden" name="contentType" value={content.content_type} />
                    <input type="hidden" name="contentId" value={content.id} />
                    <Button type="submit" className={styles.approveBtn}>
                      <CheckCircle size={16} />
                      Approve
                    </Button>
                  </Form>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" onClick={() => setSelectedContent(content)}>
                        <XCircle size={16} />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent className={styles.modalContent}>
                      <DialogHeader className={styles.modalHeader}>
                        <div className={styles.modalIconReject}>
                          <AlertCircle size={28} />
                        </div>
                        <DialogTitle className={styles.modalTitle}>Reject Content</DialogTitle>
                        <DialogDescription className={styles.modalDescription}>
                          Please provide a reason for rejecting this content.
                        </DialogDescription>
                      </DialogHeader>
                      <Form method="post">
                        <input type="hidden" name="action" value="reject" />
                        <input type="hidden" name="contentType" value={content.content_type} />
                        <input type="hidden" name="contentId" value={content.id} />
                        <div className={styles.modalBody}>
                          <div className={styles.formGroup}>
                            <Label htmlFor="reason">Rejection Reason</Label>
                            <Textarea
                              id="reason"
                              name="reason"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Explain why this content is being rejected..."
                              rows={4}
                              required
                            />
                          </div>
                        </div>
                        <div className={styles.modalFooter}>
                          <DialogClose asChild>
                            <Button type="button" variant="outline" className={styles.cancelButton}>
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button type="submit" variant="destructive" className={styles.rejectBtn}>
                            Confirm Rejection
                          </Button>
                        </div>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Live Content Preview Modal */}
      <Dialog open={!!previewContent} onOpenChange={(open) => !open && setPreviewContent(null)}>
        <DialogContent className={styles.previewModal}>
          <DialogHeader>
            <DialogTitle>{previewContent?.title || 'Content Preview'}</DialogTitle>
            <DialogDescription>
              {previewContent?.teacher_name} - {previewContent?.lesson_type} - {previewContent?.content_type}
            </DialogDescription>
          </DialogHeader>
          <div className={styles.previewBody}>
            {previewContent?.lesson_type === 'video' && (previewContent?.youtube_url || previewContent?.content_url) && (
              <div className={styles.previewVideo}>
                <CustomVideoPlayer 
                  videoUrl={previewContent.youtube_url || previewContent.content_url}
                  gdriveUrl={previewContent.video_source === 'gdrive' ? previewContent.content_url : undefined}
                />
              </div>
            )}
            {(previewContent?.lesson_type === 'pdf' || previewContent?.lesson_type === 'markdown' || previewContent?.lesson_type === 'text') && previewContent?.content_url && (
              <div className={styles.previewPdf}>
                <MarkdownRenderer content={previewContent.content_url} />
              </div>
            )}
            {!previewContent?.youtube_url && !previewContent?.content_url && (
              <div className={styles.noPreview}>
                <AlertCircle size={48} />
                <p>No preview available for this content</p>
              </div>
            )}
          </div>
          <div className={styles.previewActions}>
            <Form method="post" onSubmit={() => setPreviewContent(null)}>
              <input type="hidden" name="action" value="approve" />
              <input type="hidden" name="contentType" value={previewContent?.content_type} />
              <input type="hidden" name="contentId" value={previewContent?.id} />
              <Button type="submit" className={styles.approveBtn}>
                <CheckCircle size={16} />
                Approve
              </Button>
            </Form>
            <Button variant="outline" onClick={() => setPreviewContent(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}