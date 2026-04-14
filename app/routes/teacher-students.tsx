import { useState, useEffect } from 'react';
import { useIsNativePlatform } from '~/hooks/use-is-native';
import { BrowserOnlyScreen } from '~/components/browser-only-screen';
import { useNavigate, useSearchParams } from 'react-router';
import { TeacherHeader } from '~/components/teacher-header';
import { TeacherSidebar } from '~/components/teacher-sidebar';
import { Users, Search } from 'lucide-react';
import { getTeacherAuth } from '~/lib/auth.client';
import { getTeacherStudents } from '~/services/teacher.client';
import styles from './teacher-students.module.css';

export default function TeacherStudents() {
  const isNative = useIsNativePlatform();
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    (async () => {
      const t = await getTeacherAuth();
      if (!t) { navigate('/teacher-login', { replace: true }); return; }
      const s = await getTeacherStudents(t.id, searchQuery || undefined);
      setStudents(s);
      setLoading(false);
    })();
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('q') as string;
    if (query) setSearchParams({ q: query }); else setSearchParams({});
  };

  if (isNative === null || loading) return null;
  if (isNative) return <BrowserOnlyScreen />;

  return (
    <div className={styles.container}>
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={styles.main}>
        <TeacherHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Students</h1>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <Search size={20} />
              <input type="search" name="q" placeholder="Search students..." defaultValue={searchQuery} className={styles.searchInput} />
            </form>
          </div>
          <div className={styles.statsBar}>
            <div className={styles.statItem}><Users size={24} /><div><div className={styles.statValue}>{students.length}</div><div className={styles.statLabel}>Total Students</div></div></div>
          </div>
          <div className={styles.studentList}>
            {students.length === 0 ? (
              <div className={styles.emptyState}><p>{searchQuery ? 'No students found' : 'No students enrolled yet'}</p></div>
            ) : (
              <table className={styles.table}>
                <thead><tr><th>Student Name</th><th>Email</th><th>Phone</th><th>Institution</th><th>Course</th><th>Enrolled</th></tr></thead>
                <tbody>
                  {students.map((enrollment: any) => (
                    <tr key={enrollment.id}>
                      <td className={styles.studentName}>{enrollment.student?.full_name || 'N/A'}</td>
                      <td>{enrollment.student?.email || 'N/A'}</td>
                      <td>{enrollment.student?.phone_number || 'N/A'}</td>
                      <td>{enrollment.student?.institution || 'N/A'}</td>
                      <td className={styles.courseName}>{enrollment.course?.name || 'N/A'}</td>
                      <td className={styles.date}>{new Date(enrollment.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
