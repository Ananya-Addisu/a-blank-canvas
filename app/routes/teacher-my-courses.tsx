import { useState, useEffect } from 'react';
import { useIsNativePlatform } from '~/hooks/use-is-native';
import { BrowserOnlyScreen } from '~/components/browser-only-screen';
import { useNavigate } from 'react-router';
import { TeacherSidebar } from '~/components/teacher-sidebar';
import { TeacherHeader } from '~/components/teacher-header';
import { Button } from '~/components/ui/button/button';
import { BookOpen, Layers } from 'lucide-react';
import { getTeacherAuth } from '~/lib/auth.client';
import { getTeacherCourses } from '~/services/teacher.client';
import styles from './teacher-my-courses.module.css';

export default function TeacherMyCourses() {
  const isNative = useIsNativePlatform();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await getTeacherAuth();
      if (!t) { navigate('/teacher-login', { replace: true }); return; }
      const c = await getTeacherCourses(t.id);
      setCourses(c);
      setLoading(false);
    })();
  }, []);

  if (isNative === null || loading) return null;
  if (isNative) return <BrowserOnlyScreen />;

  return (
    <div className={styles.container}>
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={styles.main}>
        <TeacherHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>My Courses</h1>
            <p style={{ fontSize: '13px', color: 'var(--color-neutral-10, #888)', marginTop: '4px' }}>Courses are created by the admin. You can upload content to your assigned courses.</p>
          </div>
          <div className={styles.courseList}>
            {courses.length === 0 ? (
              <div className={styles.emptyState}>
                <BookOpen size={48} style={{ color: 'var(--color-neutral-8)', marginBottom: '12px' }} />
                <p>No courses assigned to you yet.</p>
              </div>
            ) : (
              courses.map((course: any) => (
                <div key={course.id} className={styles.courseCard}>
                  <div className={styles.cardHeader}>
                    <span className={`${styles.statusBadge} ${styles[course.status]}`}>{course.status === 'active' ? 'Active' : course.status === 'inactive' ? 'Pending Approval' : 'Draft'}</span>
                  </div>
                  <h2 className={styles.courseTitle}>{course.name}</h2>
                  <p className={styles.courseDescription}>{course.description}</p>
                  <div className={styles.courseStats}>
                    <div className={styles.stat}><div className={styles.statValue}>{course.enrollments?.length || 0}</div><div className={styles.statLabel}>Students</div></div>
                    <div className={styles.stat}><div className={styles.statValue}>{course.chapters?.reduce((sum: number, ch: any) => sum + (ch.lessons?.length || 0), 0) || 0}</div><div className={styles.statLabel}>Lessons</div></div>
                    <div className={styles.stat}><div className={styles.statValue}>{course.price} ETB</div><div className={styles.statLabel}>Price</div></div>
                  </div>
                  <div className={styles.cardFooter}>
                    <Button variant="outline" className={styles.actionButton} onClick={() => navigate(`/teacher/content-manager?course=${course.id}`)}>
                      <Layers size={16} /> Manage Content
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
