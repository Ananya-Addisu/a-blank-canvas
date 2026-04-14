import { useState, useEffect } from 'react';
import { useIsNativePlatform } from '~/hooks/use-is-native';
import { BrowserOnlyScreen } from '~/components/browser-only-screen';
import { useNavigate } from 'react-router';
import { TeacherHeader } from '~/components/teacher-header';
import { TeacherSidebar } from '~/components/teacher-sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs/tabs';
import { Badge } from '~/components/ui/badge/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { getTeacherAuth } from '~/lib/auth.client';
import { getTeacherApprovals } from '~/services/teacher.client';
import styles from './teacher-approvals.module.css';

export default function TeacherApprovals() {
  const isNative = useIsNativePlatform();
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<any>({ courses: [], lessons: [], quizzes: [] });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await getTeacherAuth();
      if (!t) { navigate('/teacher-login', { replace: true }); return; }
      const a = await getTeacherApprovals(t.id);
      setApprovals(a);
      setLoading(false);
    })();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': case 'active': return <Badge className={styles.approved}><CheckCircle size={14} /> Approved</Badge>;
      case 'rejected': case 'inactive': return <Badge className={styles.rejected}><XCircle size={14} /> Rejected</Badge>;
      default: return <Badge className={styles.pending}><Clock size={14} /> Pending</Badge>;
    }
  };

  if (isNative === null || loading) return null;
  if (isNative) return <BrowserOnlyScreen />;

  return (
    <div className={styles.container}>
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={styles.main}>
        <TeacherHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <div className={styles.content}>
          <h1 className={styles.title}>Approval Status</h1>
          <p className={styles.subtitle}>Track the status of your courses, content, and quizzes</p>
          <Tabs defaultValue="courses" className={styles.tabs}>
            <TabsList>
              <TabsTrigger value="courses">Courses ({approvals.courses.length})</TabsTrigger>
              <TabsTrigger value="lessons">Lessons ({approvals.lessons.length})</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes ({approvals.quizzes.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="courses"><div className={styles.grid}>{approvals.courses.length === 0 ? <div className={styles.empty}><p>No courses yet</p></div> : approvals.courses.map((course: any) => (<div key={course.id} className={styles.card}><div className={styles.cardHeader}><h3>{course.name}</h3>{getStatusBadge(course.status)}</div><div className={styles.cardFooter}><span>Created: {new Date(course.created_at).toLocaleDateString()}</span></div></div>))}</div></TabsContent>
            <TabsContent value="lessons"><div className={styles.grid}>{approvals.lessons.length === 0 ? <div className={styles.empty}><p>No lessons yet</p></div> : approvals.lessons.map((lesson: any) => (<div key={lesson.id} className={styles.card}><div className={styles.cardHeader}><h3>{lesson.title}</h3>{getStatusBadge(lesson.approval_status)}</div>{lesson.rejection_reason && <div className={styles.rejection}><strong>Reason:</strong> {lesson.rejection_reason}</div>}<div className={styles.cardFooter}><span>Uploaded: {new Date(lesson.created_at).toLocaleDateString()}</span></div></div>))}</div></TabsContent>
            <TabsContent value="quizzes"><div className={styles.grid}>{approvals.quizzes.length === 0 ? <div className={styles.empty}><p>No quizzes yet</p></div> : approvals.quizzes.map((quiz: any) => (<div key={quiz.id} className={styles.card}><div className={styles.cardHeader}><h3>{quiz.title}</h3>{getStatusBadge(quiz.status)}</div><div className={styles.cardFooter}><span>Created: {new Date(quiz.created_at).toLocaleDateString()}</span></div></div>))}</div></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
