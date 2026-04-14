import { useState, useEffect } from 'react';
import { LoadingScreen } from '~/components/loading-screen';
import { useNavigate } from 'react-router';
import { TeacherSidebar } from '~/components/teacher-sidebar';
import { TeacherHeader } from '~/components/teacher-header';
import { Button } from '~/components/ui/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '~/components/ui/dialog/dialog';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select/select';
import { Plus, Edit, Trash2, ClipboardCheck, Clock, Award } from 'lucide-react';
import { getTeacherAuth } from '~/lib/auth.client';
import { getTeacherCourses } from '~/services/teacher.client';
import { getQuizzesByTeacher, createQuiz, deleteQuiz } from '~/services/quiz.client';
import styles from './teacher-quizzes.module.css';

export default function TeacherQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<any>(null);
  const [teacherId, setTeacherId] = useState('');

  const loadData = async (tid: string) => {
    const [q, c] = await Promise.all([getQuizzesByTeacher(tid), getTeacherCourses(tid)]);
    setQuizzes(q);
    setCourses(c);
  };

  useEffect(() => {
    (async () => {
      const t = await getTeacherAuth();
      if (!t) { navigate('/teacher-login', { replace: true }); return; }
      setTeacherId(t.id);
      await loadData(t.id);
      setLoading(false);
    })();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createQuiz(teacherId, { title: fd.get('title') as string, courseId: fd.get('courseId') as string, duration: Number(fd.get('timeLimit')), passingScore: Number(fd.get('passingScore')) });
    setIsCreateOpen(false);
    await loadData(teacherId);
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;
    await deleteQuiz(quizToDelete.id);
    setQuizToDelete(null);
    await loadData(teacherId);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className={styles.container}>
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={styles.main}>
        <TeacherHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Quizzes & Exams</h1>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild><Button className={styles.createButton}><Plus size={20} /> Create New Quiz</Button></DialogTrigger>
              <DialogContent className={styles.modalContent}>
                <DialogHeader className={styles.modalHeader}>
                  <div className={styles.modalIcon}><ClipboardCheck size={28} /></div>
                  <DialogTitle className={styles.modalTitle}>Create New Quiz</DialogTitle>
                  <DialogDescription className={styles.modalDescription}>Set up a new assessment.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate}>
                  <div className={styles.modalBody}>
                    <div className={styles.formGroup}><Label htmlFor="title">Quiz Title</Label><Input id="title" name="title" placeholder="e.g., Mid-Term Exam" required /></div>
                    <div className={styles.formGroup}><Label htmlFor="courseId">Course</Label>
                      <Select name="courseId" required><SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger><SelectContent>{courses.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><Label>Time Limit (mins)</Label><Input name="timeLimit" type="number" defaultValue="30" required /></div>
                      <div className={styles.formGroup}><Label>Passing Score (%)</Label><Input name="passingScore" type="number" defaultValue="70" required /></div>
                    </div>
                  </div>
                  <div className={styles.modalFooter}>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit">Create Quiz</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className={styles.quizList}>
            {quizzes.length === 0 ? <div className={styles.emptyState}><p>No quizzes yet.</p></div> : quizzes.map((quiz: any) => (
              <div key={quiz.id} className={styles.quizCard}>
                <div className={styles.quizHeader}><div><h2 className={styles.quizTitle}>{quiz.title}</h2><p className={styles.courseName}>{quiz.course?.name || quiz.course_name}</p></div><span className={`${styles.statusBadge} ${styles[quiz.status || 'active']}`}>{quiz.status || 'Active'}</span></div>
                <div className={styles.quizStats}><div className={styles.stat}><strong>{quiz.duration}</strong> mins</div><div className={styles.stat}><strong>{quiz.passing_score}%</strong> to pass</div><div className={styles.stat}><strong>{quiz.question_count || 0}</strong> questions</div></div>
                <div className={styles.quizActions}>
                  <Button variant="outline" className={styles.actionButton} onClick={() => navigate(`/teacher/quiz-edit/${quiz.id}`)}><Edit size={16} /> Edit Questions</Button>
                  <Button type="button" variant="outline" className={styles.deleteButton} onClick={() => setQuizToDelete(quiz)}><Trash2 size={16} /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!quizToDelete} onOpenChange={(open) => !open && setQuizToDelete(null)}>
        <DialogContent className={styles.modalContent}>
          <DialogHeader className={styles.modalHeader}><DialogTitle>Delete Quiz</DialogTitle><DialogDescription>Delete "{quizToDelete?.title}"?</DialogDescription></DialogHeader>
          <div className={styles.modalFooter}>
            <Button variant="outline" onClick={() => setQuizToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Quiz</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
