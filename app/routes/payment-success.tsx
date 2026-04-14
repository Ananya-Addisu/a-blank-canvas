import { Link } from "react-router";
import { Button } from "~/components/ui/button/button";
import { CheckCircle } from "lucide-react";
import styles from "./payment-success.module.css";


export default function PaymentSuccess() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.successIcon}>
            <CheckCircle size={80} />
          </div>

          <h1 className={styles.title}>Payment Proof Submitted!</h1>
          
          <p className={styles.message}>
            Your payment proof has been recorded successfully. Our admin will review and verify your payment within 24 hours. You'll receive a notification once approved.
          </p>

          <div className={styles.infoBox}>
            <h3 className={styles.infoTitle}>What happens next?</h3>
            <ul className={styles.infoList}>
              <li>Our admin will verify your payment within 24 hours</li>
              <li>Once approved, you'll get access to your enrolled courses</li>
              <li>You'll receive a notification when your payment is verified</li>
            </ul>
          </div>

          <div className={styles.actions}>
            <Link to="/my-enrollments" className={styles.link}>
              <Button variant="outline" size="lg" className={styles.button}>
                View My Enrollments
              </Button>
            </Link>
            <Link to="/home-page" className={styles.link}>
              <Button variant="outline" size="lg" className={styles.button}>
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
