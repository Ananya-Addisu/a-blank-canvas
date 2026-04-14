import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronLeft, Clock, CheckCircle, XCircle, AlertTriangle, Shield, Maximize } from 'lucide-react';
import { Button } from '~/components/ui/button/button';
import { Badge } from '~/components/ui/badge/badge';
import { BottomNav } from '~/components/bottom-nav';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog/dialog';
import { getStudentAuth } from '~/lib/auth.client';
import { getCompetitionById, getStudentCompetitionEntry, startStudentCompetition, submitStudentCompetition } from '~/services/competition.client';
import { supabase } from '~/lib/supabase.client';
import { addMinutesToEthiopianDateTime, parseEthiopianDateTime } from '~/utils/ethiopian-time';
import { LoadingScreen } from '~/components/loading-screen';
import styles from './competition-exam.$id.module.css';

function normalizeAnswerValue(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

function getQuestionOptions(question: any) {
  return question?.options && typeof question.options === 'object'
    ? (question.options as Record<string, string>)
    : {};
}

function getAnswerVariants(question: any, answer: unknown) {
  const normalizedAnswer = normalizeAnswerValue(answer);
  if (!normalizedAnswer) return [];

  const variants = new Set<string>([normalizedAnswer]);
  const options = getQuestionOptions(question);

  Object.entries(options).forEach(([key, value]) => {
    const normalizedKey = normalizeAnswerValue(key);
    const normalizedValue = normalizeAnswerValue(value);

    if (normalizedAnswer === normalizedKey || normalizedAnswer === normalizedValue) {
      variants.add(normalizedKey);
      variants.add(normalizedValue);
    }
  });

  if (question?.question_type === 'true_false') {
    if (normalizedAnswer === 'a' || normalizedAnswer === 'true') {
      variants.add('a');
      variants.add('true');
    }

    if (normalizedAnswer === 'b' || normalizedAnswer === 'false') {
      variants.add('b');
      variants.add('false');
    }
  }

  return Array.from(variants);
}

function isAnswerCorrect(question: any, answer: unknown) {
  const studentVariants = new Set(getAnswerVariants(question, answer));
  if (studentVariants.size === 0) return false;

  return getAnswerVariants(question, question?.correct_answer).some((variant) => studentVariants.has(variant));
}

function getOptionKeyFromAnswer(question: any, answer: unknown) {
  const answerVariants = new Set(getAnswerVariants(question, answer));
  const options = getQuestionOptions(question);

  const match = Object.entries(options).find(([key, value]) => {
    const normalizedKey = normalizeAnswerValue(key);
    const normalizedValue = normalizeAnswerValue(value);
    return answerVariants.has(normalizedKey) || answerVariants.has(normalizedValue);
  });

  return match?.[0] || '';
}

async function enterFullscreen() {
  try {
    const el = document.documentElement;
    if (el.requestFullscreen) await el.requestFullscreen();
    else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
    else if ((el as any).msRequestFullscreen) await (el as any).msRequestFullscreen();
  } catch (e) {
    console.warn('Fullscreen request failed:', e);
  }
}

function exitFullscreen() {
  try {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else if ((document as any).webkitFullscreenElement) (document as any).webkitExitFullscreen?.();
  } catch (e) { /* ignore */ }
}

function isInFullscreen() {
  return !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
}

export default function CompetitionExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [competition, setCompetition] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [existingEntry, setExistingEntry] = useState<any>(null);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [disqualified, setDisqualified] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [waitingForEnd, setWaitingForEnd] = useState(false);
  const [competitionDone, setCompetitionDone] = useState(false);
  const [studentId, setStudentId] = useState('');
  const timerRef = useRef<any>(null);
  const answersRef = useRef(answers);
  const startedRef = useRef(false);
  const isPracticeModeRef = useRef(false);
  const disqualifiedRef = useRef(false);
  answersRef.current = answers;
  startedRef.current = started;
  disqualifiedRef.current = disqualified;

  const doDisqualify = useCallback(async () => {
    if (disqualifiedRef.current || isPracticeModeRef.current) return;
    disqualifiedRef.current = true;
    setDisqualified(true);
    setStarted(false);
    const score = calculateScoreFrom(answersRef.current);
    await submitStudentCompetition(id!, studentId, score, 'disqualified');
    setResultData({ score, submitted: true, status: 'disqualified' });
    exitFullscreen();
  }, [id, studentId]);

  const calculateScoreFrom = (ans: Record<string, string>) => {
    let total = 0, earned = 0;
    questions.forEach(q => {
      total += q.points || 1;
      if (isAnswerCorrect(q, ans[q.id])) earned += q.points || 1;
    });
    return total > 0 ? Math.round((earned / total) * 100) : 0;
  };

  useEffect(() => {
    (async () => {
      const student = await getStudentAuth();
      if (!student) { navigate('/login'); return; }
      setStudentId(student.id);
      const comp = await getCompetitionById(id!);
      if (!comp) { navigate('/competitions'); return; }
      setCompetition(comp);

      const { data: qs } = await supabase.from('competition_questions').select('*').eq('competition_id', id).order('order_index');
      setQuestions(qs || []);

      const entry = await getStudentCompetitionEntry(id!, student.id);
      setExistingEntry(entry);

      const competitionStart = comp.date
        ? parseEthiopianDateTime(comp.date, comp.time)
        : null;
      const competitionEnd = comp.date
        ? addMinutesToEthiopianDateTime(comp.date, comp.time, comp.duration || 60)
        : null;
      const hasStarted = Boolean(competitionStart && competitionStart.getTime() <= Date.now());
      const hasEndedByTime = Boolean(competitionEnd && competitionEnd.getTime() <= Date.now());
      // Active exam = between start and end; practice = only after time window elapsed
      const isActiveWindow = hasStarted && !hasEndedByTime;
      const isFinished = hasEndedByTime || (Boolean(comp.is_finished) && !isActiveWindow);
      setCompetitionDone(isFinished);
      isPracticeModeRef.current = isFinished;

      if (!isFinished) {
        // If entry is in_progress and they're re-entering the page → disqualify
        if (entry?.status === 'in_progress') {
          disqualifiedRef.current = true;
          setDisqualified(true);
          const score = 0;
          await submitStudentCompetition(id!, student.id, score, 'disqualified');
          setResultData({ score, submitted: true, status: 'disqualified' });
        } else if (entry?.status === 'disqualified') {
          setDisqualified(true);
          setResultData({ score: entry.score, submitted: true, status: 'disqualified' });
        } else if (entry && (entry.status === 'submitted')) {
          setResultData({ score: entry.score, status: entry.status, submitted: true });
          setWaitingForEnd(true);
        }
      }

      setLoading(false);
    })();
  }, []);

  // Fullscreen & visibility listeners (only during strict exam)
  useEffect(() => {
    if (!started || isPracticeModeRef.current) return;

    const onFullscreenChange = () => {
      if (!isInFullscreen() && startedRef.current && !disqualifiedRef.current) {
        doDisqualify();
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden && startedRef.current && !disqualifiedRef.current) {
        doDisqualify();
      }
    };

    const onBlur = () => {
      if (startedRef.current && !disqualifiedRef.current) {
        doDisqualify();
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
    };
  }, [started, doDisqualify]);

  const competitionStart = competition?.date ? parseEthiopianDateTime(competition.date, competition.time) : null;
  const competitionEnd = competition?.date
    ? addMinutesToEthiopianDateTime(competition.date, competition.time, competition.duration || 60)
    : null;
  const hasCompetitionStarted = Boolean(competitionStart && competitionStart.getTime() <= Date.now());
  const hasEndedByTime = Boolean(competitionEnd && competitionEnd.getTime() <= Date.now());
  const isActiveWindow = hasCompetitionStarted && !hasEndedByTime;
  const isFinished = Boolean(competitionDone || hasEndedByTime || (competition?.is_finished && !isActiveWindow));
  const isPracticeMode = isFinished;
  isPracticeModeRef.current = isPracticeMode;
  const canStartCompetition = isPracticeMode || hasCompetitionStarted;

  // Timer
  useEffect(() => {
    if (isPracticeMode || !competitionEnd || (!started && !waitingForEnd) || showResults) return;

    const updateRemainingTime = () => {
      const remaining = Math.max(0, Math.floor((competitionEnd.getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (started) handleAutoSubmit();
        if (waitingForEnd) { setCompetitionDone(true); setShowResults(true); setWaitingForEnd(false); }
      }
    };

    updateRemainingTime();
    timerRef.current = setInterval(updateRemainingTime, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, showResults, waitingForEnd, competitionEnd, isPracticeMode]);

  const handleAutoSubmit = async () => {
    const score = calculateScoreFrom(answersRef.current);
    await submitStudentCompetition(id!, studentId, score, 'submitted');
    setResultData({ score, submitted: true, status: 'submitted' });
    exitFullscreen();
    if (isPracticeMode) { setShowResults(true); setStarted(false); }
    else { setWaitingForEnd(true); setStarted(false); }
  };

  const handleStart = async () => {
    await startStudentCompetition(id!, studentId);

    if (!isPracticeMode) {
      // Enter fullscreen for strict mode
      await enterFullscreen();
      if (competitionEnd) {
        setTimeLeft(Math.max(0, Math.floor((competitionEnd.getTime() - Date.now()) / 1000)));
      }
    }

    setAnswers({});
    setShowResults(false);
    setWaitingForEnd(false);
    setDisqualified(false);
    disqualifiedRef.current = false;
    setStarted(true);
  };

  const handleSubmit = async () => {
    setShowSubmitConfirm(false);
    const score = calculateScoreFrom(answers);
    await submitStudentCompetition(id!, studentId, score, 'submitted');
    setResultData({ score, submitted: true, status: 'submitted', totalPoints: questions.reduce((s, q) => s + (q.points || 1), 0), earnedPoints: questions.filter(q => isAnswerCorrect(q, answers[q.id])).reduce((s, q) => s + (q.points || 1), 0) });
    exitFullscreen();
    if (isPracticeMode) { setShowResults(true); setStarted(false); }
    else { setWaitingForEnd(true); setStarted(false); }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingScreen />;

  // Waiting for end
  if (waitingForEnd) {
    return (
      <div className={styles.container}><main className={styles.examMain}>
        <div className={styles.resultCard}>
          <div className={styles.resultIcon} style={{ color: 'var(--color-accent-9)' }}><Clock size={48} /></div>
          <h2 className={styles.resultTitle}>Exam Submitted!</h2>
          <p className={styles.resultDetail}>Results will be available when the competition ends.</p>
          <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-accent-2)', borderRadius: 'var(--radius-3)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-accent-11)', fontWeight: 600 }}>Time remaining: {formatTime(timeLeft)}</p>
          </div>
        </div>
      </main></div>
    );
  }

  // Disqualified
  if (disqualified && !showResults) {
    return (
      <div className={styles.container}><main className={styles.examMain}>
        <div className={styles.resultCard}>
          <div className={styles.disqualifiedIcon}><AlertTriangle size={48} /></div>
          <h2 className={styles.resultTitle}>Disqualified</h2>
          <p className={styles.resultDetail}>You left the exam, switched tabs, or exited fullscreen mode. This action is not allowed during strict exam mode.</p>
          <Button onClick={() => navigate('/competitions')} className={styles.backToList}>Back to Competitions</Button>
        </div>
      </main></div>
    );
  }

  // Results
  if (showResults && resultData) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={() => navigate('/competitions')} className={styles.backButton}><ChevronLeft size={24} /></button>
          <h1 className={styles.headerTitle}>Results - {competition.title}</h1>
        </header>
        <main className={styles.examMain}>
          <div className={styles.resultCard}>
            {resultData.status === 'disqualified' ? (
              <><div className={styles.disqualifiedIcon}><AlertTriangle size={48} /></div><h2 className={styles.resultTitle}>Disqualified</h2></>
            ) : (
              <><div className={`${styles.resultIcon} ${styles.passed}`}><CheckCircle size={48} /></div><h2 className={styles.resultTitle}>Exam Complete</h2><p className={styles.resultScore}>{resultData.score}%</p></>
            )}
          </div>
          {questions.length > 0 && (
            <div className={styles.questionsList}>
              {questions.map((q: any, i: number) => {
                const studentAnswer = (answers[q.id] || '').trim();
                const selectedOptionKey = getOptionKeyFromAnswer(q, studentAnswer);
                const correctOptionKey = getOptionKeyFromAnswer(q, q.correct_answer);
                const isCorrect = isAnswerCorrect(q, studentAnswer);
                return (
                  <div key={q.id} className={`${styles.questionCard} ${isCorrect ? styles.correctCard : styles.wrongCard}`}>
                    <div className={styles.questionCardContent}>
                      <div className={styles.questionHeader}>
                        <span className={styles.questionNumber}>Question {i + 1}</span>
                        {isCorrect ? <CheckCircle size={18} className={styles.correctMark} /> : <XCircle size={18} className={styles.wrongMark} />}
                      </div>
                      <p className={styles.qText}>{q.question_text}</p>
                      {q.options && (
                        <div className={styles.optionsContainer}>
                          {Object.entries(q.options as Record<string, string>).map(([key, value]) => (
                            <div key={key} className={`${styles.optionItem} ${key === correctOptionKey ? styles.correctOption : ''} ${key === selectedOptionKey && key !== correctOptionKey ? styles.wrongOption : ''}`}>
                              <span className={styles.optionLetter}>{key}</span><span>{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {q.explanation && <div className={styles.explanationBox}><strong>Explanation:</strong> {q.explanation}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Button onClick={() => navigate('/competitions')} className={styles.backToList}>Back to Competitions</Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Pre-start
  if (!started) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={() => navigate('/competitions')} className={styles.backButton}><ChevronLeft size={24} /></button>
          <h1 className={styles.headerTitle}>{competition.title}</h1>
        </header>
        <main className={styles.examMain}>
          <div className={styles.preStartCard}>
            <h2>{competition.title}</h2>
            <p>{competition.description}</p>
            <div className={styles.preStartMeta}>
              {!isPracticeMode && <div><Clock size={16} /> Duration: {competition.duration} minutes</div>}
              {isPracticeMode && <div><Clock size={16} /> No time limit (Practice)</div>}
              <div>Questions: {questions.length}</div>
            </div>
            {!isPracticeMode && (
              <div className={styles.warningBox}>
                <Shield size={18} />
                <div>
                  <strong>Strict Exam Mode</strong>
                  <p style={{ margin: '4px 0 0' }}>The exam will enter fullscreen. Exiting fullscreen, switching tabs, or leaving the app will result in <strong>immediate disqualification</strong>. You cannot re-enter once you leave.</p>
                </div>
              </div>
            )}
            {isPracticeMode && <div className={styles.practiceBox}>This competition has ended. Practice mode — no restrictions.</div>}
            <Button className={styles.startBtn} onClick={handleStart} disabled={!isPracticeMode && !canStartCompetition}>
              <Maximize size={16} /> {isPracticeMode ? 'Start Practice' : 'Enter Fullscreen Exam'}
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Exam in progress
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className={styles.fullscreenContainer}>
      <header className={styles.examHeader}>
        <h1 className={styles.examHeaderTitle}>{competition.title}</h1>
        {!isPracticeMode && <div className={`${styles.timer} ${timeLeft < 60 ? styles.timerDanger : ''}`}><Clock size={16} /> {formatTime(timeLeft)}</div>}
      </header>
      <main className={styles.examBody}>
        <div className={styles.questionsList}>
          {questions.map((q: any, i: number) => (
            <div key={q.id} className={styles.questionCard}>
              <div className={styles.questionCardContent}>
                <div className={styles.questionHeader}>
                  <span className={styles.questionNumber}>Question {i + 1}</span>
                  <Badge variant="outline">{q.points || 1} pt{(q.points || 1) > 1 ? 's' : ''}</Badge>
                </div>
                <p className={styles.qText}>{q.question_text}</p>
                {q.question_type === 'multiple_choice' && q.options && (
                  <div className={styles.optionsContainer}>
                    {Object.entries(q.options as Record<string, string>).map(([key, value]) => (
                      <label key={key} className={`${styles.optionItem} ${answers[q.id] === key ? styles.selected : ''}`}>
                        <input type="radio" name={`q-${q.id}`} value={key} checked={answers[q.id] === key} onChange={() => setAnswers(prev => ({ ...prev, [q.id]: key }))} className={styles.radioInput} />
                        <span className={styles.optionLetter}>{key}</span><span>{value}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.question_type === 'true_false' && (
                  <div className={styles.optionsContainer}>
                    {['A', 'B'].map(key => (
                      <label key={key} className={`${styles.optionItem} ${answers[q.id] === key ? styles.selected : ''}`}>
                        <input type="radio" name={`q-${q.id}`} value={key} checked={answers[q.id] === key} onChange={() => setAnswers(prev => ({ ...prev, [q.id]: key }))} className={styles.radioInput} />
                        <span>{key === 'A' ? 'True' : 'False'}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.question_type === 'short_answer' && (
                  <input type="text" className={styles.shortAnswerInput} placeholder="Type your answer..." value={answers[q.id] || ''} onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} />
                )}
              </div>
            </div>
          ))}
        </div>
        <Button className={styles.submitExamBtn} onClick={() => setShowSubmitConfirm(true)}>Submit Exam</Button>
      </main>

      <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam</DialogTitle>
            <DialogDescription>You have answered {answeredCount}/{questions.length} questions. {unansweredCount > 0 ? `${unansweredCount} unanswered.` : ''}</DialogDescription>
          </DialogHeader>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button variant="outline" onClick={() => setShowSubmitConfirm(false)}>Go Back</Button>
            <Button onClick={handleSubmit}><CheckCircle size={16} /> Confirm Submit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
