import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronLeft, Clock, Award, CheckCircle, XCircle, HelpCircle, Play, FileText, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '~/components/ui/button/button';
import { Badge } from '~/components/ui/badge/badge';
import { BottomNav } from '~/components/bottom-nav';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog/dialog';
import { MarkdownRenderer } from '~/components/markdown-renderer';
import { getStudentAuth } from '~/lib/auth.client';
import { getStudentQuizAttempts, startQuizAttempt, submitQuizAttempt } from '~/services/quiz.client';
import { supabase } from '~/lib/supabase.client';
import { LoadingScreen } from '~/components/loading-screen';
import styles from './course-exam.$courseId.module.css';

export default function CourseExam() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [lockedQuestions, setLockedQuestions] = useState<Set<string>>(new Set());
  const [immediateFeedback, setImmediateFeedback] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [feedbackChoice, setFeedbackChoice] = useState<'immediate' | 'after_submit' | null>(null);

  useEffect(() => {
    (async () => {
      const student = await getStudentAuth();
      if (!student) { navigate('/login'); return; }
      setStudentId(student.id);

      const [courseRes, quizzesRes, attemptsRes] = await Promise.all([
        supabase.from('courses').select('id, name').eq('id', courseId).single(),
        supabase.from('quizzes').select('*, questions:quiz_questions(*)').eq('course_id', courseId).eq('status', 'active'),
        getStudentQuizAttempts(student.id),
      ]);
      setCourse(courseRes.data);
      const qz = (quizzesRes.data || []).map((q: any) => ({ ...q, questions: q.questions?.sort((a: any, b: any) => a.order_index - b.order_index) }));
      setQuizzes(qz);
      setAttempts(attemptsRes.filter((a: any) => qz.some((q: any) => q.id === a.quiz_id)));
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  const activeQuiz = quizzes.find((q: any) => q.id === activeQuizId);
  const isImmediate = feedbackChoice === 'immediate';

  const getAttempts = (quizId: string) => attempts.filter((a: any) => a.quiz_id === quizId);
  const getBestScore = (quizId: string) => {
    const qAttempts = getAttempts(quizId).filter((a: any) => a.status === 'completed');
    if (qAttempts.length === 0) return null;
    return Math.max(...qAttempts.map((a: any) => a.score || 0));
  };

  const handleAnswer = (questionId: string, answer: string, correctAnswer: string) => {
    if (lockedQuestions.has(questionId)) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    if (isImmediate) {
      setLockedQuestions(prev => new Set(prev).add(questionId));
      setImmediateFeedback(prev => ({ ...prev, [questionId]: answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim() }));
    }
  };

  const handleStartQuiz = async (quizId: string) => {
    const result = await startQuizAttempt(quizId, studentId);
    if (result.success) { setActiveQuizId(quizId); setActiveAttemptId(result.data.id); setAnswers({}); setLockedQuestions(new Set()); setImmediateFeedback({}); setFeedbackChoice(null); }
  };

  const handleSubmitExam = async () => {
    setShowSubmitConfirm(false);
    const result = await submitQuizAttempt(activeAttemptId!, answers, activeQuizId!);
    if (result.success) {
      setResultData({ score: result.data.score, totalPoints: result.data.total_points, earnedPoints: Math.round((result.data.score / 100) * result.data.total_points), submitted: true });
      setShowResults(true);
    }
  };

  // Feedback mode selection
  if (activeQuiz && activeAttemptId && !showResults && feedbackChoice === null) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={() => { setActiveQuizId(null); setActiveAttemptId(null); }} className={styles.backButton}><ChevronLeft size={24} /></button>
          <h1 className={styles.headerTitle}>{activeQuiz.title}</h1>
        </header>
        <main className={styles.examMain}>
          <div className={styles.resultCard}>
            <h2 className={styles.resultTitle}>Choose Feedback Mode</h2>
            <p style={{ color: 'var(--color-neutral-10)', marginBottom: 'var(--space-5)', fontSize: '0.9rem' }}>How would you like to receive feedback on your answers?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', width: '100%', maxWidth: 360 }}>
              <Button onClick={() => setFeedbackChoice('immediate')} variant="outline" style={{ padding: 'var(--space-4)', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <strong>Immediate Feedback</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-10)' }}>See if your answer is correct right away. Answers lock after selection.</span>
              </Button>
              <Button onClick={() => setFeedbackChoice('after_submit')} variant="outline" style={{ padding: 'var(--space-4)', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <strong>After Submission</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-10)' }}>Review all results after you submit the exam. You can change answers anytime.</span>
              </Button>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Exam taking view
  if (activeQuiz && activeAttemptId && !showResults && feedbackChoice !== null) {
    const questions = activeQuiz.questions || [];
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = questions.length - answeredCount;

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={() => { setActiveQuizId(null); setActiveAttemptId(null); setAnswers({}); }} className={styles.backButton}><ChevronLeft size={24} /></button>
          <h1 className={styles.headerTitle}>{activeQuiz.title}</h1>
          <div className={styles.timer}><Clock size={16} /> {activeQuiz.duration || 30} min</div>
        </header>
        <main className={styles.examMain}>
          {activeQuiz.content_markdown && <div className={styles.contentSection}><MarkdownRenderer content={activeQuiz.content_markdown} /></div>}
          <div className={styles.questionsList}>
            {questions.map((q: any, i: number) => {
              const isLocked = lockedQuestions.has(q.id);
              const feedbackResult = immediateFeedback[q.id];
              const showFeedback = isImmediate && isLocked;
              return (
                <div key={q.id} className={`${styles.questionCard} ${showFeedback ? (feedbackResult ? styles.correctCard : styles.wrongCard) : ''}`}>
                  <div className={styles.questionCardContent}>
                    <div className={styles.questionHeader}>
                      <div className={styles.questionNumber}><span>Question {i + 1}</span></div>
                      <Badge variant="outline">{q.points || 1} pt{(q.points || 1) > 1 ? 's' : ''}</Badge>
                    </div>
                    <div className={styles.questionForm}>
                      <p className={styles.qText}>{q.question_text}</p>
                      {q.question_type === 'multiple_choice' && q.options && (
                        <div className={styles.optionsContainer}>
                          {Object.entries(q.options as Record<string, string>).map(([key, value]) => (
                            <div key={key} className={styles.optionField}>
                              <label className={`${styles.optionItem} ${answers[q.id] === key ? styles.selected : ''} ${showFeedback && key === q.correct_answer ? styles.correctOption : ''} ${showFeedback && answers[q.id] === key && key !== q.correct_answer ? styles.wrongOption : ''}`} style={isLocked ? { pointerEvents: 'none' } : {}}>
                                <input type="radio" name={`q-${q.id}`} value={key} checked={answers[q.id] === key} onChange={() => handleAnswer(q.id, key, q.correct_answer)} className={styles.radioInput} disabled={isLocked} />
                                <span className={styles.optionLetter}>{key}</span><span>{value}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      {q.question_type === 'true_false' && (
                        <div className={styles.optionsContainer}>
                          {['A', 'B'].map(key => (
                            <div key={key} className={styles.optionField}>
                              <label className={`${styles.optionItem} ${answers[q.id] === key ? styles.selected : ''}`} style={isLocked ? { pointerEvents: 'none' } : {}}>
                                <input type="radio" name={`q-${q.id}`} value={key} checked={answers[q.id] === key} onChange={() => handleAnswer(q.id, key, q.correct_answer)} className={styles.radioInput} disabled={isLocked} />
                                <span>{key === 'A' ? 'True' : 'False'}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      {q.question_type === 'short_answer' && (
                        <input type="text" className={styles.shortAnswerInput} placeholder="Type your answer..." value={answers[q.id] || ''} onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} disabled={isLocked} />
                      )}
                      {showFeedback && q.explanation && <div className={styles.explanationBox}><strong>Explanation:</strong> {q.explanation}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Button className={styles.submitExamBtn} onClick={() => setShowSubmitConfirm(true)}>Submit Exam</Button>
        </main>
        <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
          <DialogContent>
            <DialogHeader><DialogTitle>Submit Exam</DialogTitle><DialogDescription>{answeredCount}/{questions.length} answered. {unansweredCount > 0 ? `${unansweredCount} unanswered.` : ''}</DialogDescription></DialogHeader>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <Button variant="outline" onClick={() => setShowSubmitConfirm(false)}>Go Back</Button>
              <Button onClick={handleSubmitExam}><CheckCircle size={16} /> Confirm Submit</Button>
            </div>
          </DialogContent>
        </Dialog>
        <BottomNav />
      </div>
    );
  }

  // Results view
  if (showResults && resultData) {
    const quiz = quizzes.find((q: any) => q.id === activeQuizId);
    const passed = (resultData.score || 0) >= (quiz?.passing_score || 70);
    const questions = quiz?.questions || [];
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={() => { setActiveQuizId(null); setActiveAttemptId(null); setAnswers({}); setShowResults(false); setResultData(null); window.location.reload(); }} className={styles.backButton}><ChevronLeft size={24} /></button>
          <h1 className={styles.headerTitle}>Exam Results</h1>
        </header>
        <main className={styles.examMain}>
          <div className={styles.resultCard}>
            <div className={`${styles.resultIcon} ${passed ? styles.passed : styles.failed}`}>{passed ? <CheckCircle size={48} /> : <XCircle size={48} />}</div>
            <h2 className={styles.resultTitle}>{passed ? 'Congratulations!' : 'Try Again'}</h2>
            <p className={styles.resultScore}>{Math.round(resultData.score || 0)}%</p>
          </div>
          <div className={styles.questionsList}>
            {questions.map((q: any, i: number) => {
              const studentAnswer = answers[q.id];
              const isCorrect = studentAnswer?.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim();
              return (
                <div key={q.id} className={`${styles.questionCard} ${isCorrect ? styles.correctCard : styles.wrongCard}`}>
                  <div className={styles.questionCardContent}>
                    <div className={styles.questionHeader}><div className={styles.questionNumber}><span>Q {i + 1}</span></div>{isCorrect ? <CheckCircle size={18} className={styles.correctMark} /> : <XCircle size={18} className={styles.wrongMark} />}</div>
                    <div className={styles.questionForm}>
                      <p className={styles.qText}>{q.question_text}</p>
                      {q.options && (
                        <div className={styles.optionsContainer}>
                          {Object.entries(q.options as Record<string, string>).map(([key, value]) => (
                            <div key={key} className={styles.optionField}>
                              <div className={`${styles.optionItem} ${key === q.correct_answer ? styles.correctOption : ''} ${key === studentAnswer && key !== q.correct_answer ? styles.wrongOption : ''}`}>
                                <span className={styles.optionLetter}>{key}</span><span>{value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {q.explanation && <div className={styles.explanationBox}><strong>Explanation:</strong> {q.explanation}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Quiz list view
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}><ChevronLeft size={24} /></button>
        <h1 className={styles.headerTitle}>Exams - {course?.name}</h1>
      </header>
      <main className={styles.examMain}>
        {quizzes.length === 0 ? (
          <div className={styles.emptyState}><HelpCircle size={48} /><p>No exams available for this course yet.</p></div>
        ) : (
          <div className={styles.questionsList}>
            {quizzes.map((quiz: any) => {
              const best = getBestScore(quiz.id);
              const qAttempts = getAttempts(quiz.id);
              return (
                <div key={quiz.id} className={styles.questionCard}>
                  <div className={styles.questionCardContent}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{quiz.title}</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', fontSize: '0.85rem', color: 'var(--color-neutral-9)' }}>
                      <span><Clock size={14} /> {quiz.duration || 30} min</span>
                      <span><Award size={14} /> Pass: {quiz.passing_score || 70}%</span>
                      <span>{quiz.questions?.length || 0} questions</span>
                    </div>
                    {best !== null && <p style={{ marginTop: 8, fontSize: '0.85rem' }}>Best score: <strong>{Math.round(best)}%</strong> ({qAttempts.length} attempt{qAttempts.length > 1 ? 's' : ''})</p>}
                    <Button style={{ marginTop: 12 }} onClick={() => handleStartQuiz(quiz.id)}><Play size={16} /> {best !== null ? 'Retake Exam' : 'Start Exam'}</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
