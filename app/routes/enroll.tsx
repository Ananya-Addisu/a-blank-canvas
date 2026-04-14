import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AppHeader } from "~/components/app-header";
import { Button } from "~/components/ui/button/button";
import { ArrowLeft, Package, BookOpen } from "lucide-react";
import { getStudentAuth } from "~/lib/auth.client";
import { getCourseById, getBundleById, createEnrollment } from "~/services/enrollment.client";
import styles from "./enroll.module.css";
import { LoadingScreen } from "~/components/loading-screen";

export default function Enroll() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'course';
  const itemId = searchParams.get('id') || '';
  const [student, setStudent] = useState<any>(null);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getStudentAuth();
      if (!s) { navigate('/login'); return; }
      setStudent(s);
      const data = type === 'bundle' ? await getBundleById(itemId) : await getCourseById(itemId);
      setItem(data);
      setLoading(false);
    })();
  }, []);

  if (loading || !item || !student) return <LoadingScreen />;

  const itemName = item.name;
  const itemPrice = Number(item.price);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const enrollment = await createEnrollment({
        student_id: student.id,
        ...(type === 'bundle' ? { bundle_id: itemId } : { course_id: itemId }),
        enrollment_type: type as 'course' | 'bundle',
        payment_amount: itemPrice,
      });
      navigate(`/payment-instructions?enrollment_id=${enrollment.id}&amount=${itemPrice}`);
    } catch (e: any) {
      alert(e.message);
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.icon}>
              {type === "bundle" ? <Package size={32} /> : <BookOpen size={32} />}
            </div>
            <h1 className={styles.title}>Confirm Enrollment</h1>
            <p className={styles.subtitle}>Review your enrollment details before proceeding to payment</p>
          </div>

          <div className={styles.enrollmentCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Enrollment Details</h2>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Student Name</span>
              <span className={styles.value}>{student.full_name}</span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Student ID</span>
              <span className={styles.value}>{student.phone_number}</span>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.detail}>
              <span className={styles.label}>Enrollment Type</span>
              <span className={styles.value}>
                {type === "bundle" ? "Bundle Package" : "Single Course"}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>{type === "bundle" ? "Bundle" : "Course"}</span>
              <span className={styles.value}>{itemName}</span>
            </div>

            {type === "bundle" && item.course_count && (
              <div className={styles.detail}>
                <span className={styles.label}>Included Courses</span>
                <span className={styles.value}>{item.course_count} courses</span>
              </div>
            )}

            <div className={styles.divider}></div>

            <div className={styles.totalSection}>
              <span className={styles.totalLabel}>Total Amount</span>
              <span className={styles.totalValue}>{itemPrice.toLocaleString()} ETB</span>
            </div>
          </div>

          <Button type="button" size="lg" className={styles.submitButton} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Processing...' : 'Proceed to Payment'}
          </Button>

          <p className={styles.note}>
            After clicking "Proceed to Payment", you will be directed to submit your payment proof.
            Your enrollment will be activated once the admin approves your payment.
          </p>
        </div>
      </main>
    </div>
  );
}
