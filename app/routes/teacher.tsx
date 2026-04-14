import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { TeacherHeader } from '../components/teacher-header';
import { TeacherSidebar } from '../components/teacher-sidebar';
import { BookOpen, Users, DollarSign, Star } from 'lucide-react';
import { LoadingScreen } from '~/components/loading-screen';
import { getTeacherAuth } from '~/lib/auth.client';
import { getTeacherCourses } from '~/services/teacher.client';
import { getTeacherEarnings as getEarningsData } from '~/services/teacher.client';
import styles from './teacher.module.css';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({ activeCourses: 0, totalStudents: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await getTeacherAuth();
      if (!t) { navigate('/teacher-login', { replace: true }); return; }
      setTeacher(t);
      const c = await getTeacherCourses(t.id);
      setCourses(c);
      const earnings = await getEarningsData(t.id);
      setStats({
        activeCourses: c.filter((co: any) => co.status === 'active').length,
        totalStudents: c.reduce((sum: number, co: any) => sum + (co.enrollments?.length || 0), 0),
        thisMonth: earnings.thisMonth,
      });
      setLoading(false);
    })();
  }, []);

  if (loading || !teacher) return <LoadingScreen />;

  const displayedCourses = courses.slice(0, 3);

  return (
    <div className={styles.container}>
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={styles.main}>
        <TeacherHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <div className={styles.content}>
          <div className={styles.welcome}>
            <h1 className={styles.title}>Welcome, {teacher.full_name.split(' ')[0]}!</h1>
            <p className={styles.subtitle}>Here's an overview of your teaching activity.</p>
          </div>
          <div className={styles.stats}>
            <div className={styles.statCard}><div className={styles.iconWrapper} style={{ background: '#DBEAFE' }}><BookOpen size={24} style={{ color: '#2563EB' }} /></div><div className={styles.statValue}>{stats.activeCourses}</div><div className={styles.statLabel}>Active Courses</div></div>
            <div className={styles.statCard}><div className={styles.iconWrapper} style={{ background: '#D1FAE5' }}><Users size={24} style={{ color: '#10B981' }} /></div><div className={styles.statValue}>{stats.totalStudents.toLocaleString()}</div><div className={styles.statLabel}>Total Students</div></div>
            <div className={styles.statCard}><div className={styles.iconWrapper} style={{ background: '#E9D5FF' }}><DollarSign size={24} style={{ color: '#9333EA' }} /></div><div className={styles.statValue}>ETB {stats.thisMonth.toLocaleString()}</div><div className={styles.statLabel}>Total Earnings</div></div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Courses</h2>
              {courses.length > 3 && <Link to="/teacher/my-courses" className={styles.viewAll}>View All ({courses.length})</Link>}
            </div>
            {courses.length === 0 ? (
              <div className={styles.emptyState}><BookOpen size={64} /><h3>No courses yet</h3><p>Create your first course to get started</p><Link to="/teacher/content-manager" className={styles.primaryButton}>Create Course</Link></div>
            ) : (
              <div className={styles.courseList}>
                {displayedCourses.map((course) => (
                  <div key={course.id} className={styles.courseItem}>
                    <div className={styles.courseIcon}><BookOpen size={24} style={{ color: 'white' }} /></div>
                    <div className={styles.courseInfo}>
                      <h3 className={styles.courseName}>{course.name || course.title}</h3>
                      <div className={styles.courseDetails}>
                        <span className={styles.rating}><Star size={14} style={{ color: '#F59E0B', fill: '#F59E0B' }} />{course.rating || '4.9'}</span>
                        <span className={styles.lessons}>{course.enrollments?.length || 0} students enrolled</span>
                      </div>
                    </div>
                    <Link to={`/teacher/content-manager?course=${course.id}`} className={styles.manageButton}>Manage</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
