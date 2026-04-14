import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { TeacherSidebar } from '~/components/teacher-sidebar';
import { TeacherHeader } from '~/components/teacher-header';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '~/components/ui/dialog/dialog';
import { Badge } from '~/components/ui/badge/badge';
import { Plus, Trash2, Save, ArrowLeft, CheckCircle, Video, FileText, HelpCircle } from 'lucide-react';
import { getTeacherAuth } from '~/lib/auth.client';
import { getQuizById, updateQuiz, addQuizQuestion, deleteQuizQuestion } from '~/services/quiz.client';
import styles from './teacher-quiz-edit.$quizId.module.css';
import { LoadingScreen } from '~/components/loading-screen';

export default function TeacherQuizEdit() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [showSettings, setShowSettings] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<any>(null);

  const loadQuiz = async () => {
    const q = await getQuizById(quizId!);
    if (!q) { navigate('/teacher/quizzes'); return; }
    setQuiz(q);
  };

  useEffect(() => {
    (async () => {
      const t = await getTeacherAuth();
      if (!t) { navigate('/teacher-login', { replace: true }); return; }
      await loadQuiz();
      setLoading(false);
    })();
  }, []);

  const handleUpdateSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await updateQuiz(quizId!, {
      title: fd.get('title') as string, status: fd.get('status') as string, duration: Number(fd.get('duration')),
      passingScore: Number(fd.get('passingScore')), description: fd.get('description') as string,
      videoUrl: fd.get('videoUrl') as string, contentMarkdown: fd.get('contentMarkdown') as string,
      feedbackMode: fd.get('feedbackMode') as string,
    });
    await loadQuiz();
  };

  const handleAddQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const qt = fd.get('questionType') as string;
    const options: Record<string, string> | undefined = qt === 'multiple_choice' ? { A: fd.get('optionA') as string, B: fd.get('optionB') as string, C: fd.get('optionC') as string, D: fd.get('optionD') as string } : qt === 'true_false' ? { A: 'True', B: 'False' } : undefined;
    await addQuizQuestion(quizId!, {
      questionText: fd.get('questionText') as string, questionType: qt as any, options, correctAnswer: fd.get('correctAnswer') as string,
      points: Number(fd.get('points') || 1), orderIndex: quiz.questions?.length || 0, explanation: fd.get('explanation') as string,
    });
    setIsAddOpen(false);
    await loadQuiz();
  };

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    await deleteQuizQuestion(questionToDelete.id);
    setQuestionToDelete(null);
    await loadQuiz();
  };

  if (loading || !quiz) return <LoadingScreen />;

  const getStatusColor = (status: string) => {
    switch (status) { case 'active': return 'default'; case 'draft': return 'secondary'; case 'closed': return 'destructive'; default: return 'secondary'; }
  };

  return (
    <div className={styles.container}>
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={styles.main}>
        <TeacherHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <a href="/teacher/quizzes" className={styles.backLink}><ArrowLeft size={20} /></a>
              <div><h1 className={styles.title}>{quiz.title}</h1><p className={styles.subtitle}>{quiz.course?.name || 'No course'} - <Badge variant={getStatusColor(quiz.status)}>{quiz.status}</Badge></p></div>
            </div>
            <div className={styles.headerActions}><Button variant="outline" onClick={() => setShowSettings(!showSettings)}>Settings</Button></div>
          </div>

          {showSettings && (
            <form onSubmit={handleUpdateSettings} className={styles.settingsPanel}>
              <h2 className={styles.sectionTitle}>Exam Settings</h2>
              <div className={styles.settingsGrid}>
                <div className={styles.formGroup}><Label>Title</Label><Input name="title" defaultValue={quiz.title} /></div>
                <div className={styles.formGroup}><Label>Status</Label><Select name="status" defaultValue={quiz.status}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></div>
                <div className={styles.formGroup}><Label>Duration (mins)</Label><Input name="duration" type="number" defaultValue={quiz.duration || 30} /></div>
                <div className={styles.formGroup}><Label>Passing Score (%)</Label><Input name="passingScore" type="number" defaultValue={quiz.passing_score || 70} /></div>
                <div className={styles.formGroup}><Label>Feedback Mode</Label><Select name="feedbackMode" defaultValue={quiz.feedback_mode || 'after_submit'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="after_submit">After Submit</SelectItem><SelectItem value="immediate">Immediate</SelectItem></SelectContent></Select></div>
              </div>
              <div className={styles.formGroup}><Label>Description</Label><Textarea name="description" defaultValue={quiz.description || ''} /></div>
              <div className={styles.formGroup}><Label><Video size={16} style={{ display: 'inline', marginRight: 6 }} />Video URL</Label><Input name="videoUrl" defaultValue={quiz.video_url || ''} /></div>
              <div className={styles.formGroup}><Label><FileText size={16} style={{ display: 'inline', marginRight: 6 }} />Content (Markdown)</Label><Textarea name="contentMarkdown" defaultValue={quiz.content_markdown || ''} style={{ minHeight: 200 }} /></div>
              <Button type="submit" className={styles.saveButton}><Save size={16} /> Save Settings</Button>
            </form>
          )}

          <div className={styles.questionsSection}>
            <div className={styles.questionsHeader}>
              <h2 className={styles.sectionTitle}><HelpCircle size={20} /> Questions ({quiz.questions?.length || 0})</h2>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild><Button><Plus size={16} /> Add Question</Button></DialogTrigger>
                <DialogContent className={styles.questionModal}>
                  <DialogHeader><DialogTitle>Add Question</DialogTitle><DialogDescription>Create a new question.</DialogDescription></DialogHeader>
                  <form onSubmit={handleAddQuestion}>
                    <div className={styles.modalBody}>
                      <div className={styles.formGroup}><Label>Question Type</Label><Select name="questionType" value={questionType} onValueChange={setQuestionType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="multiple_choice">Multiple Choice</SelectItem><SelectItem value="true_false">True/False</SelectItem><SelectItem value="short_answer">Short Answer</SelectItem></SelectContent></Select></div>
                      <div className={styles.formGroup}><Label>Question Text</Label><Textarea name="questionText" required /></div>
                      {questionType === 'multiple_choice' && (
                        <div className={styles.optionsGrid}>
                          <div className={styles.formGroup}><Label>Option A</Label><Input name="optionA" required /></div>
                          <div className={styles.formGroup}><Label>Option B</Label><Input name="optionB" required /></div>
                          <div className={styles.formGroup}><Label>Option C</Label><Input name="optionC" required /></div>
                          <div className={styles.formGroup}><Label>Option D</Label><Input name="optionD" required /></div>
                        </div>
                      )}
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}><Label>Correct Answer</Label>
                          {questionType === 'multiple_choice' ? <Select name="correctAnswer" required><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem><SelectItem value="D">D</SelectItem></SelectContent></Select> : questionType === 'true_false' ? <Select name="correctAnswer" required><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="A">True</SelectItem><SelectItem value="B">False</SelectItem></SelectContent></Select> : <Input name="correctAnswer" required />}
                        </div>
                        <div className={styles.formGroup}><Label>Points</Label><Input name="points" type="number" defaultValue="1" min="1" /></div>
                      </div>
                      <div className={styles.formGroup}><Label>Explanation</Label><Textarea name="explanation" /></div>
                    </div>
                    <div className={styles.modalFooter}><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit">Add Question</Button></div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className={styles.questionList}>
              {(!quiz.questions || quiz.questions.length === 0) ? (
                <div className={styles.emptyState}><HelpCircle size={48} /><p>No questions yet.</p></div>
              ) : quiz.questions.map((q: any, index: number) => (
                <div key={q.id} className={styles.questionCard}>
                  <div className={styles.questionHeader}>
                    <div className={styles.questionNumber}>Q{index + 1}</div>
                    <div className={styles.questionInfo}><Badge variant="outline" className={styles.typeBadge}>{q.question_type === 'multiple_choice' ? 'MCQ' : q.question_type === 'true_false' ? 'T/F' : 'Short'}</Badge><span className={styles.points}>{q.points || 1} pt</span></div>
                    <Button type="button" variant="outline" className={styles.deleteBtn} onClick={() => setQuestionToDelete(q)}><Trash2 size={16} /></Button>
                  </div>
                  <p className={styles.questionText}>{q.question_text}</p>
                  {q.options && (
                    <div className={styles.optionsList}>
                      {Object.entries(q.options as Record<string, string>).map(([key, value]) => (
                        <div key={key} className={`${styles.optionItem} ${key === q.correct_answer ? styles.correctOption : ''}`}><span className={styles.optionKey}>{key}</span><span>{value}</span>{key === q.correct_answer && <CheckCircle size={16} className={styles.correctIcon} />}</div>
                      ))}
                    </div>
                  )}
                  {q.question_type === 'short_answer' && <div className={styles.correctAnswerBox}><CheckCircle size={14} /> Answer: {q.correct_answer}</div>}
                  {q.explanation && <div className={styles.explanationBox}><strong>Explanation:</strong> {q.explanation}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!questionToDelete} onOpenChange={(open) => !open && setQuestionToDelete(null)}>
        <DialogContent className={styles.questionModal}>
          <DialogHeader><DialogTitle>Delete Question</DialogTitle><DialogDescription>Delete this question?</DialogDescription></DialogHeader>
          <div className={styles.modalFooter}><Button variant="outline" onClick={() => setQuestionToDelete(null)}>Cancel</Button><Button variant="destructive" onClick={handleDeleteQuestion}>Delete</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
