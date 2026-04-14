import { redirect } from "react-router";
import type { Route } from "./+types/teacher-how-to-use";
import { TeacherHeader } from "~/components/teacher-header";
import { TeacherSidebar } from "~/components/teacher-sidebar";
import { 
  BookOpen, 
  Video, 
  Users, 
  DollarSign,
  Upload,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { useState } from "react";
import styles from "./teacher-how-to-use.module.css";


export default function TeacherHowToUse() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.mainWrapper}>
        <TeacherHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.header}>
            <HelpCircle size={40} className={styles.headerIcon} />
            <h1 className={styles.title}>How to Use Magster Teacher Portal</h1>
            <p className={styles.subtitle}>Your complete guide to managing courses, students, and earnings</p>
          </div>

          <div className={styles.sections}>
            {/* Getting Started */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <BookOpen size={24} />
                <h2>Getting Started</h2>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepContent}>
                    <h3>Complete Your Profile</h3>
                    <p>Navigate to <strong>Profile</strong> and fill in your information, qualifications, and expertise areas.</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepContent}>
                    <h3>Wait for Approval</h3>
                    <p>Your profile will be reviewed by our admin team. Check <strong>Approval Status</strong> to track progress.</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepContent}>
                    <h3>Start Creating Content</h3>
                    <p>Once approved, you can begin uploading courses and educational materials.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Managing Courses */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <Video size={24} />
                <h2>Managing Your Courses</h2>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.feature}>
                  <Upload className={styles.featureIcon} />
                  <div>
                    <h3>Upload New Courses</h3>
                    <p>Go to <strong>Content Manager</strong> → Click "Add New Course" → Fill in course details, upload videos, and set pricing.</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <CheckCircle className={styles.featureIcon} />
                  <div>
                    <h3>Track Course Status</h3>
                    <p>View all your courses in <strong>My Courses</strong>. Courses go through admin approval before becoming available to students.</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <AlertCircle className={styles.featureIcon} />
                  <div>
                    <h3>Course Requirements</h3>
                    <ul>
                      <li>High-quality video content (minimum 720p)</li>
                      <li>Clear course description and objectives</li>
                      <li>Appropriate pricing (reviewed by admin)</li>
                      <li>Complete curriculum outline</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Student Management */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <Users size={24} />
                <h2>Managing Students</h2>
              </div>
              <div className={styles.sectionContent}>
                <p>In the <strong>Students</strong> section, you can:</p>
                <ul className={styles.list}>
                  <li>View all students enrolled in your courses</li>
                  <li>Track student progress and completion rates</li>
                  <li>Monitor quiz and exam performance</li>
                  <li>Communicate with students (when enabled)</li>
                </ul>
              </div>
            </section>

            {/* Earnings & Payments */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <DollarSign size={24} />
                <h2>Earnings & Withdrawals</h2>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepContent}>
                    <h3>Track Your Earnings</h3>
                    <p>View your total earnings, pending payments, and withdrawal history in the <strong>Earnings</strong> section.</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepContent}>
                    <h3>Review Withdrawal Terms</h3>
                    <p>Read the <strong>Withdrawal Terms</strong> carefully to understand minimum balance, processing times, and payment methods.</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepContent}>
                    <h3>Request Withdrawal</h3>
                    <p>Once you meet the minimum balance, submit a withdrawal request with your payment details.</p>
                  </div>
                </div>
                <div className={styles.alert}>
                  <AlertCircle size={20} />
                  <p><strong>Important:</strong> All withdrawals are reviewed and processed by the admin team within 5-7 business days.</p>
                </div>
              </div>
            </section>

            {/* Tips for Success */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <CheckCircle size={24} />
                <h2>Tips for Success</h2>
              </div>
              <div className={styles.sectionContent}>
                <ul className={styles.tipsList}>
                  <li>
                    <strong>Create Engaging Content:</strong> Use clear explanations, examples, and visual aids.
                  </li>
                  <li>
                    <strong>Keep Courses Updated:</strong> Regularly review and update your content to maintain quality.
                  </li>
                  <li>
                    <strong>Price Competitively:</strong> Research similar courses and set fair, competitive prices.
                  </li>
                  <li>
                    <strong>Add Quizzes:</strong> Include assessments to help students test their knowledge.
                  </li>
                  <li>
                    <strong>Monitor Performance:</strong> Check your dashboard regularly to track enrollments and earnings.
                  </li>
                  <li>
                    <strong>Stay Professional:</strong> Maintain high standards in all your content and interactions.
                  </li>
                </ul>
              </div>
            </section>

            {/* Need Help */}
            <section className={`${styles.section} ${styles.helpSection}`}>
              <div className={styles.sectionHeader}>
                <HelpCircle size={24} />
                <h2>Need More Help?</h2>
              </div>
              <div className={styles.sectionContent}>
                <p>If you have questions or encounter issues, reach out through the app's support channels or check the notifications for updates from the admin team.</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
