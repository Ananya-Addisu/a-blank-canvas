import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Plus, Trash2, GripVertical, Loader2, Check } from 'lucide-react';
import type { Route } from './+types/admin-competition-questions';
import styles from './admin-competition-questions.module.css';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog/dialog';
import { Card, CardContent } from '~/components/ui/card/card';
import { supabase } from '~/lib/supabase.client';

const MULTIPLE_CHOICE_OPTIONS = { A: '', B: '', C: '', D: '' };
const TRUE_FALSE_OPTIONS = { A: 'True', B: 'False' };

function normalizeQuestionForSave(question: any, index: number, competitionId: string) {
  const points = Number.parseInt(String(question.points ?? 1), 10);
  return {
    competition_id: competitionId,
    question_text: question.question_text?.trim() || '',
    question_type: question.question_type,
    options:
      question.question_type === 'multiple_choice'
        ? question.options || MULTIPLE_CHOICE_OPTIONS
        : question.question_type === 'true_false'
          ? TRUE_FALSE_OPTIONS
          : null,
    correct_answer: question.correct_answer?.trim() || '',
    points: Number.isNaN(points) ? 1 : points,
    order_index: index,
    explanation: question.explanation?.trim() || null,
  };
}

export async function clientLoader({ params }: any) {
  const competitionId = params.competitionId;
  if (!competitionId) return { competition: null, questions: [] };
  const [compRes, questionsRes] = await Promise.all([
    supabase.from('competitions').select('*').eq('id', competitionId).single(),
    supabase.from('competition_questions').select('*').eq('competition_id', competitionId).order('order_index'),
  ]);
  return { competition: compRes.data, questions: questionsRes.data || [] };
}

export default function AdminCompetitionQuestions({ loaderData }: Route.ComponentProps) {
  const [questions, setQuestions] = useState((loaderData as any).questions || []);
  const [questionToDelete, setQuestionToDelete] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');
  const competitionId = (loaderData as any).competition?.id;
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionsRef = useRef(questions);

  // Keep ref in sync
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  const saveAllQuestions = useCallback(async (questionsToSave: any[]) => {
    if (!competitionId) return;
    setSaving(true);
    setSaveStatus('saving');
    try {
      const validQuestions = questionsToSave.filter((q: any) => q.question_text?.trim());
      if (validQuestions.length === 0) {
        setSaving(false);
        setSaveStatus('idle');
        return;
      }
      const operations = validQuestions.map((question: any, index: number) => {
        const payload = normalizeQuestionForSave(question, index, competitionId);
        if (question.isNew) {
          return supabase.from('competition_questions').insert(payload).select().single();
        }
        return supabase.from('competition_questions').update(payload).eq('id', question.id).select().single();
      });
      const results = await Promise.all(operations);
      const failedResult = results.find((r) => r.error);
      if (failedResult?.error) {
        console.error('Save error:', failedResult.error);
        setSaveStatus('error');
        setErrorText(failedResult.error.message);
      } else {
        setSaveStatus('saved');
        // Refresh from DB to get real IDs for new questions
        const { data: freshQuestions } = await supabase.from('competition_questions').select('*').eq('competition_id', competitionId).order('order_index');
        setQuestions(freshQuestions || []);
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (err: any) {
      setSaveStatus('error');
      setErrorText(err.message);
    }
    setSaving(false);
  }, [competitionId]);

  const triggerAutoSave = useCallback((updatedQuestions: any[]) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveAllQuestions(updatedQuestions);
    }, 1500);
  }, [saveAllQuestions]);

  const updateQuestion = (questionId: string, field: string, value: any) => {
    const updated = questions.map(q => q.id === questionId ? { ...q, [field]: value } : q);
    setQuestions(updated);
    triggerAutoSave(updated);
  };

  const updateQuestionType = (questionId: string, value: 'multiple_choice' | 'true_false' | 'short_answer') => {
    const updated = questions.map((question) => {
      if (question.id !== questionId) return question;
      if (value === 'multiple_choice') {
        return { ...question, question_type: value, options: question.options && typeof question.options === 'object' ? { ...MULTIPLE_CHOICE_OPTIONS, ...question.options } : { ...MULTIPLE_CHOICE_OPTIONS }, correct_answer: ['A', 'B', 'C', 'D'].includes(question.correct_answer) ? question.correct_answer : '' };
      }
      if (value === 'true_false') {
        return { ...question, question_type: value, options: { ...TRUE_FALSE_OPTIONS }, correct_answer: ['A', 'B'].includes(question.correct_answer) ? question.correct_answer : '' };
      }
      return { ...question, question_type: value, options: null };
    });
    setQuestions(updated);
    triggerAutoSave(updated);
  };

  const updateOption = (questionId: string, optionKey: string, value: string) => {
    const updated = questions.map(q => q.id === questionId ? { ...q, options: { ...q.options, [optionKey]: value } } : q);
    setQuestions(updated);
    triggerAutoSave(updated);
  };

  const addNewQuestion = () => {
    const newQuestion = {
      id: `temp-${Date.now()}`,
      question_text: '',
      question_type: 'multiple_choice',
      options: { ...MULTIPLE_CHOICE_OPTIONS },
      correct_answer: '',
      points: 1,
      explanation: '',
      isNew: true
    };
    setQuestions([...questions, newQuestion]);
  };

  const deleteQuestion = (questionId: string) => {
    const updated = questions.filter(q => q.id !== questionId);
    setQuestions(updated);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/admin/competitions" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Competitions
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h1 className={styles.title}>{(loaderData as any).competition?.title}</h1>
          {saveStatus === 'saving' && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><Loader2 size={14} className="animate-spin" /> Saving...</span>}
          {saveStatus === 'saved' && <span style={{ fontSize: '0.8rem', color: 'var(--color-success-11, #16a34a)', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Saved</span>}
          {saveStatus === 'error' && <span style={{ fontSize: '0.8rem', color: 'var(--color-error-11, #dc2626)' }}>Error: {errorText}</span>}
        </div>
        <p className={styles.subtitle}>Manage Questions · Auto-saves on every change</p>
      </div>

      <div className={styles.content}>
        <div className={styles.questionsList}>
          {questions.map((question, index) => {
            const isNew = question.isNew;
            return (
              <Card key={question.id} className={styles.questionCard}>
                <CardContent className={styles.questionContent}>
                  <div className={styles.questionHeader}>
                    <div className={styles.questionNumber}>
                      <GripVertical size={20} className={styles.dragIcon} />
                      <span>Question {index + 1}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => isNew ? deleteQuestion(question.id) : setQuestionToDelete(question)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className={styles.questionForm}>
                    <div className={styles.formField}>
                      <Textarea
                        placeholder="Enter your question"
                        value={question.question_text}
                        rows={2}
                        className={styles.questionInput}
                        onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
                      />
                    </div>

                    <div className={styles.questionMeta}>
                      <div className={styles.formField}>
                        <Select value={question.question_type} onValueChange={(value) => updateQuestionType(question.id, value as any)}>
                          <SelectTrigger className={styles.selectTrigger}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="true_false">True/False</SelectItem>
                            <SelectItem value="short_answer">Short Answer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className={styles.formField}>
                        <Input type="number" placeholder="Points" value={question.points} className={styles.pointsInput} onChange={(e) => updateQuestion(question.id, 'points', e.target.value)} />
                      </div>
                    </div>

                    {question.question_type === 'multiple_choice' && (
                      <div className={styles.optionsContainer}>
                        <Label className={styles.optionsLabel}>Options</Label>
                        {['A', 'B', 'C', 'D'].map((letter) => (
                          <div key={letter} className={styles.optionField}>
                            <span className={styles.optionLetter}>{letter}</span>
                            <Input placeholder={`Option ${letter}`} value={question.options?.[letter] || ''} className={styles.optionInput} onChange={(e) => updateOption(question.id, letter, e.target.value)} />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={styles.formField}>
                      <Label className={styles.formLabel}>Correct Answer</Label>
                      {question.question_type === 'multiple_choice' ? (
                        <Select value={question.correct_answer} onValueChange={(value) => updateQuestion(question.id, 'correct_answer', value)}>
                          <SelectTrigger className={styles.selectTrigger}><SelectValue placeholder="Select correct answer" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem><SelectItem value="D">D</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : question.question_type === 'true_false' ? (
                        <Select value={question.correct_answer} onValueChange={(value) => updateQuestion(question.id, 'correct_answer', value)}>
                          <SelectTrigger className={styles.selectTrigger}><SelectValue placeholder="Select correct answer" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">True</SelectItem><SelectItem value="B">False</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input placeholder="Enter correct answer" value={question.correct_answer} className={styles.answerInput} onChange={(e) => updateQuestion(question.id, 'correct_answer', e.target.value)} />
                      )}
                    </div>

                    <div className={styles.formField}>
                      <Label className={styles.formLabel}>Explanation (shown after answering)</Label>
                      <Textarea placeholder="Explain why this is the correct answer..." value={question.explanation || ''} rows={2} className={styles.questionInput} onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className={styles.actionButtons}>
          <Button onClick={addNewQuestion} className={styles.addQuestionBtn}>
            <Plus size={20} />
            Add Question
          </Button>
          <Button
            type="button"
            className={styles.addQuestionBtn}
            disabled={saving}
            onClick={() => saveAllQuestions(questions)}
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save All Questions'}
          </Button>
        </div>
      </div>

      <Dialog open={!!questionToDelete} onOpenChange={(open) => !open && setQuestionToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>Delete this question from the competition?</DialogDescription>
          </DialogHeader>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
            <Button type="button" variant="outline" onClick={() => setQuestionToDelete(null)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={async () => {
              if (!questionToDelete) return;
              if (!questionToDelete.isNew) {
                await supabase.from('competition_questions').delete().eq('id', questionToDelete.id);
              }
              setQuestions(questions.filter(q => q.id !== questionToDelete.id));
              setQuestionToDelete(null);
            }}>Delete Question</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
