import { useLoaderData, Form, useNavigation } from "react-router";
import type { Route } from "./+types/admin-payment-approvals";

import { Button } from "~/components/ui/button/button";
import { Badge } from "~/components/ui/badge/badge";
import { Textarea } from "~/components/ui/textarea/textarea";
import { Label } from "~/components/ui/label/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "~/components/ui/dialog/dialog";
import { CheckCircle, XCircle, Eye, Clock, Package, BookOpen, FileCheck, Image as ImageIcon } from "lucide-react";
import { redirect } from "react-router";
import styles from "./admin-payment-approvals.module.css";
import { useState } from "react";
import { supabaseAdmin as supabase } from '~/lib/supabase.client';



export async function clientLoader() {
  const { getAllPaymentSubmissions } = await import('~/services/admin.client');
  const submissions = await getAllPaymentSubmissions();
  return { submissions };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const submissionId = formData.get('submission_id') as string;
  const status = formData.get('status') as string;
  const adminNotes = formData.get('admin_notes') as string;
  const { getSession } = await import('~/lib/auth.client');
  const session = getSession();
  const adminId = session?.userId || 'unknown';
  const { approvePayment, rejectPayment } = await import('~/services/admin.client');
  if (status === 'approved') { return await approvePayment(submissionId, adminId); }
  else if (status === 'rejected') { return await rejectPayment(submissionId, adminId, adminNotes); }
  return { success: false };
}


export default function AdminPaymentApprovals({ loaderData }: Route.ComponentProps) {
  const { submissions } = loaderData as any;
  const navigation = useNavigation();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [viewingScreenshots, setViewingScreenshots] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  const pendingSubmissions = submissions.filter((s: any) => s.status === 'pending');
  const processedSubmissions = submissions.filter((s: any) => s.status !== 'pending');

  const closeDialogs = () => {
    setSelectedSubmission(null);
    setViewingScreenshots(false);
  };

  return (
    <div className={styles.container}>
          <h1 className={styles.pageTitle}>Payment Approvals</h1>
          
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <Clock className={styles.statIcon} />
              <div>
                <div className={styles.statValue}>{pendingSubmissions.length}</div>
                <div className={styles.statLabel}>Pending</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <CheckCircle className={styles.statIconSuccess} />
              <div>
                <div className={styles.statValue}>
                  {submissions.filter((s: any) => s.status === 'approved').length}
                </div>
                <div className={styles.statLabel}>Approved</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <XCircle className={styles.statIconError} />
              <div>
                <div className={styles.statValue}>
                  {submissions.filter((s: any) => s.status === 'rejected').length}
                </div>
                <div className={styles.statLabel}>Rejected</div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Pending Approvals</h2>
            {pendingSubmissions.length === 0 ? (
              <div className={styles.empty}>No pending payment submissions</div>
            ) : (
              <div className={styles.submissionsList}>
                {pendingSubmissions.map((submission: any) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    onViewScreenshots={() => {
                      setSelectedSubmission(submission);
                      setViewingScreenshots(true);
                    }}
                    onApprove={() => {
                      setSelectedSubmission(submission);
                      setViewingScreenshots(false);
                    }}
                    isSubmitting={isSubmitting}
                  />
                ))}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Processed Submissions</h2>
            {processedSubmissions.length === 0 ? (
              <div className={styles.empty}>No processed submissions</div>
            ) : (
              <div className={styles.submissionsList}>
                {processedSubmissions.map((submission: any) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    onViewScreenshots={() => {
                      setSelectedSubmission(submission);
                      setViewingScreenshots(true);
                    }}
                    isProcessed
                    isSubmitting={isSubmitting}
                  />
                ))}
              </div>
            )}
          </div>

      {selectedSubmission && !viewingScreenshots && (
        <Dialog open={!!selectedSubmission} onOpenChange={closeDialogs}>
          <DialogContent className={styles.modalContent}>
            <DialogHeader className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <FileCheck size={28} />
              </div>
              <DialogTitle className={styles.modalTitle}>Review Payment</DialogTitle>
              <DialogDescription className={styles.modalDescription}>
                Verify the student's payment details and decide whether to approve or reject.
              </DialogDescription>
            </DialogHeader>
            
            <Form method="post" onSubmit={closeDialogs}>
              <div className={styles.modalBody}>
                <div className={styles.reviewGrid}>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Student</span>
                    <span className={styles.reviewValue}>{selectedSubmission.student?.full_name}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Phone</span>
                    <span className={styles.reviewValue}>{selectedSubmission.student?.phone_number}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Amount</span>
                    <span className={styles.reviewValueAccent}>{Number(selectedSubmission.amount).toLocaleString()} ETB</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Method</span>
                    <span className={styles.reviewValue}>{selectedSubmission.payment_method}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Submitted</span>
                    <span className={styles.reviewValue}>{new Date(selectedSubmission.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className={styles.notesSection}>
                  <Label htmlFor="admin_notes" className={styles.notesLabel}>Internal Notes</Label>
                  <Textarea
                    id="admin_notes"
                    name="admin_notes"
                    placeholder="Add any internal notes about this submission..."
                    className={styles.notesInput}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <input type="hidden" name="submission_id" value={selectedSubmission.id} />
                <DialogClose asChild>
                  <Button type="button" variant="outline" className={styles.cancelButton}>
                    Cancel
                  </Button>
                </DialogClose>
                <div className={styles.actionButtons}>
                  <Button
                    type="submit"
                    name="status"
                    value="rejected"
                    variant="destructive"
                    disabled={isSubmitting}
                    className={styles.rejectButton}
                  >
                    <XCircle size={18} />
                    Reject
                  </Button>
                  <Button
                    type="submit"
                    name="status"
                    value="approved"
                    className={styles.approveButton}
                    disabled={isSubmitting}
                  >
                    <CheckCircle size={18} />
                    Approve
                  </Button>
                </div>
              </div>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {viewingScreenshots && selectedSubmission && (
        <Dialog open={viewingScreenshots} onOpenChange={closeDialogs}>
          <DialogContent className={styles.screenshotsModal}>
            <DialogHeader className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <ImageIcon size={28} />
              </div>
              <DialogTitle className={styles.modalTitle}>Payment Proof</DialogTitle>
              <DialogDescription className={styles.modalDescription}>
                Screenshot(s) submitted by {selectedSubmission.student?.full_name}
              </DialogDescription>
            </DialogHeader>
            <div className={styles.modalBody}>
              <div className={styles.screenshotsGrid}>
                {selectedSubmission.screenshot_urls?.map((url: string, index: number) => {
                  const isBase64 = url.startsWith('data:');
                  return (
                    <div key={index} className={styles.screenshotWrapper}>
                      <img 
                        src={url} 
                        alt={`Screenshot ${index + 1}`} 
                        className={styles.screenshot} 
                        onError={(e) => {
                          console.error('Failed to load image:', url.substring(0, 50) + '...');
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x800?text=Image+Load+Failed';
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={closeDialogs} className={styles.closeBtn}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function SubmissionCard({ 
  submission, 
  onViewScreenshots, 
  onApprove,
  isProcessed = false,
  isSubmitting 
}: { 
  submission: any; 
  onViewScreenshots: () => void; 
  onApprove?: () => void;
  isProcessed?: boolean;
  isSubmitting: boolean;
}) {
  const enrollment = submission.enrollment;
  const item = enrollment?.bundle || enrollment?.course;
  const itemName = item?.name || 'Unknown';

  return (
    <div className={styles.submissionCard}>
      <div className={styles.cardHeader}>
        <div className={styles.studentInfo}>
          <h3 className={styles.studentName}>{submission.student?.full_name}</h3>
          <p className={styles.studentContact}>{submission.student?.phone_number}</p>
        </div>
        <Badge variant={submission.status === 'approved' ? 'default' : submission.status === 'rejected' ? 'destructive' : 'secondary'}>
          {submission.status}
        </Badge>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.enrollmentInfo}>
          <div className={styles.enrollmentIcon}>
            {enrollment?.enrollment_type === 'bundle' ? <Package size={20} /> : <BookOpen size={20} />}
          </div>
          <div>
            <div className={styles.itemName}>{itemName}</div>
            <div className={styles.itemType}>
              {enrollment?.enrollment_type === 'bundle' ? 'Bundle' : 'Course'}
            </div>
          </div>
        </div>

        <div className={styles.paymentDetails}>
          <div className={styles.detail}>
            <span>Amount:</span>
            <strong>{Number(submission.amount).toLocaleString()} ETB</strong>
          </div>
          <div className={styles.detail}>
            <span>Method:</span>
            <strong>{submission.payment_method}</strong>
          </div>
          <div className={styles.detail}>
            <span>Submitted:</span>
            <strong>{new Date(submission.submitted_at).toLocaleDateString()}</strong>
          </div>
        </div>

        {submission.admin_notes && (
          <div className={styles.adminNotes}>
            <strong>Admin Notes:</strong> {submission.admin_notes}
          </div>
        )}
      </div>

      <div className={styles.cardFooterMain}>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewScreenshots}
          className={styles.viewBtn}
        >
          <Eye size={16} />
          View Proof
        </Button>
        
        {!isProcessed && onApprove && (
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isSubmitting}
            className={styles.reviewBtn}
          >
            Review
          </Button>
        )}
      </div>
    </div>
  );
}
