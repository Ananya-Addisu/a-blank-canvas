import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "~/components/ui/dialog/dialog";
import { Button } from "~/components/ui/button/button";
import { Badge } from "~/components/ui/badge/badge";
import { BookOpen, Package, Clock, Award, X, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router";
import styles from "./enrollment-modal.module.css";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: 'course' | 'bundle';
  isBundleExclusive?: boolean;
}

export function EnrollmentModal({ isOpen, onClose, item, type, isBundleExclusive }: EnrollmentModalProps) {
  const navigate = useNavigate();

  if (!item) return null;

  // Bundle exclusive courses can't be enrolled individually
  if (isBundleExclusive) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={styles.modal}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <Package size={32} />
            </div>
            <DialogTitle className={styles.modalTitle}>Bundle Exclusive Course</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              This course is only available as part of a bundle package. To access this course, you need to purchase the bundle that includes it.
            </DialogDescription>
          </DialogHeader>
          <div className={styles.modalBody}>
            <div style={{ padding: '16px', background: 'var(--color-warning-3, #fff8e1)', borderRadius: '12px', border: '1px solid var(--color-warning-6, #ffe082)', textAlign: 'center' }}>
              <Package size={40} style={{ color: 'var(--color-warning-11, #f57c00)', marginBottom: '8px' }} />
              <p style={{ fontWeight: 600, color: 'var(--color-warning-11, #f57c00)', margin: '0 0 4px' }}>Bundle Purchase Required</p>
              <p style={{ fontSize: '13px', color: 'var(--color-neutral-11, #666)', margin: 0 }}>
                Go to the home page and find the bundle that contains this course to enroll.
              </p>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <DialogClose asChild>
              <Button variant="outline" className={styles.cancelButton}>Close</Button>
            </DialogClose>
            <Button onClick={() => { onClose(); navigate('/home-page'); }} className={styles.enrollButton}>
              Browse Bundles
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleEnroll = () => {
    onClose();
    // For selected courses, pass the data differently
    if (item.selected_course_ids) {
      const queryParams = new URLSearchParams({
        type: 'bundle',
        id: item.id,
        selected_courses: item.selected_course_ids.join(','),
        amount: item.price.toString()
      });
      navigate(`/enroll?${queryParams}`);
    } else {
      navigate(`/enroll?type=${type}&id=${item.id}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.modal}>
        <DialogHeader className={styles.modalHeader}>
          <div className={styles.modalIcon}>
            {type === 'bundle' ? (
              <Package size={32} />
            ) : (
              <BookOpen size={32} />
            )}
          </div>
          <DialogTitle className={styles.modalTitle}>{item.name}</DialogTitle>
          <DialogDescription className={styles.modalDescription}>
            {item.description}
          </DialogDescription>
        </DialogHeader>

        <div className={styles.modalBody}>
          <div className={styles.infoGrid}>
            {type === 'bundle' && (
              <>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className={styles.infoLabel}>Semester</div>
                    <div className={styles.infoValue}>{item.semester}</div>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <Award size={20} />
                  </div>
                  <div>
                    <div className={styles.infoLabel}>Year Level</div>
                    <div className={styles.infoValue}>{item.year_level}</div>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <div className={styles.infoLabel}>Courses Included</div>
                    <div className={styles.infoValue}>{item.course_count || 0} courses</div>
                  </div>
                </div>
                {item.discount_percentage > 0 && (
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <Badge variant="destructive">{item.discount_percentage}% OFF</Badge>
                    </div>
                    <div>
                      <div className={styles.infoLabel}>Discount</div>
                      <div className={styles.infoValue}>Limited Time Offer</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {type === 'course' && (
              <>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <Award size={20} />
                  </div>
                  <div>
                    <div className={styles.infoLabel}>Category</div>
                    <div className={styles.infoValue}>{item.category}</div>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <Users size={20} />
                  </div>
                  <div>
                    <div className={styles.infoLabel}>Department</div>
                    <div className={styles.infoValue}>{item.department}</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className={styles.priceSection}>
            <div className={styles.priceLabel}>Total Price</div>
            <div className={styles.priceValue}>{Number(item.price).toLocaleString()} ETB</div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <DialogClose asChild>
            <Button variant="outline" className={styles.cancelButton}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleEnroll} className={styles.enrollButton}>
            Proceed to Enroll
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
