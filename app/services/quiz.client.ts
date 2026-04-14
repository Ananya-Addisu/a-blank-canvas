import { supabase } from '~/lib/supabase.client';

export async function getQuizzesByTeacher(teacherId: string) {
  const { data, error } = await supabase.from('quizzes').select('*, course:courses(id, name), questions:quiz_questions(id), attempts:quiz_attempts(id, score, status)').eq('teacher_id', teacherId).order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(quiz => ({
    ...quiz, question_count: quiz.questions?.length || 0, attempt_count: quiz.attempts?.length || 0,
    average_score: quiz.attempts?.length > 0 ? quiz.attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / quiz.attempts.length : 0,
  }));
}

export async function getQuizById(quizId: string) {
  const { data, error } = await supabase.from('quizzes').select('*, course:courses(id, name), teacher:teachers(id, full_name), questions:quiz_questions(*)').eq('id', quizId).single();
  if (error) return null;
  if (data?.questions) data.questions.sort((a: any, b: any) => a.order_index - b.order_index);
  return data;
}

export async function createQuiz(teacherId: string, quizData: { title: string; description?: string; courseId?: string; duration?: number; passingScore?: number; }) {
  const { data, error } = await supabase.from('quizzes').insert({ teacher_id: teacherId, course_id: quizData.courseId, title: quizData.title, description: quizData.description, duration: quizData.duration, passing_score: quizData.passingScore || 70, status: 'draft' }).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateQuiz(quizId: string, quizData: Partial<{ title: string; description: string; duration: number; passingScore: number; status: string; contentMarkdown: string; videoUrl: string; feedbackMode: string; }>) {
  const updateData: any = {};
  if (quizData.title) updateData.title = quizData.title;
  if (quizData.description !== undefined) updateData.description = quizData.description;
  if (quizData.duration !== undefined) updateData.duration = quizData.duration;
  if (quizData.passingScore !== undefined) updateData.passing_score = quizData.passingScore;
  if (quizData.status) updateData.status = quizData.status;
  if (quizData.contentMarkdown !== undefined) updateData.content_markdown = quizData.contentMarkdown;
  if (quizData.videoUrl !== undefined) updateData.video_url = quizData.videoUrl;
  if (quizData.feedbackMode) updateData.feedback_mode = quizData.feedbackMode;

  const { data, error } = await supabase.from('quizzes').update(updateData).eq('id', quizId).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteQuiz(quizId: string) {
  const { error } = await supabase.from('quizzes').delete().eq('id', quizId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function addQuizQuestion(quizId: string, questionData: { questionText: string; questionType: 'multiple_choice' | 'true_false' | 'short_answer'; options?: Record<string, string>; correctAnswer: string; points?: number; orderIndex: number; explanation?: string; }) {
  const { data, error } = await supabase.from('quiz_questions').insert({ quiz_id: quizId, question_text: questionData.questionText, question_type: questionData.questionType, options: questionData.options, correct_answer: questionData.correctAnswer, points: questionData.points || 1, order_index: questionData.orderIndex, explanation: questionData.explanation } as any).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateQuizQuestion(questionId: string, questionData: Partial<{ questionText: string; options: Record<string, string>; correctAnswer: string; points: number; orderIndex: number; }>) {
  const updateData: any = {};
  if (questionData.questionText) updateData.question_text = questionData.questionText;
  if (questionData.options) updateData.options = questionData.options;
  if (questionData.correctAnswer) updateData.correct_answer = questionData.correctAnswer;
  if (questionData.points !== undefined) updateData.points = questionData.points;
  if (questionData.orderIndex !== undefined) updateData.order_index = questionData.orderIndex;
  const { data, error } = await supabase.from('quiz_questions').update(updateData).eq('id', questionId).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteQuizQuestion(questionId: string) {
  const { error } = await supabase.from('quiz_questions').delete().eq('id', questionId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function startQuizAttempt(quizId: string, studentId: string) {
  const { data, error } = await supabase.from('quiz_attempts').insert({ quiz_id: quizId, student_id: studentId, status: 'in_progress' }).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function submitQuizAttempt(attemptId: string, answers: Record<string, string>, quizId: string) {
  const { data: questions } = await supabase.from('quiz_questions').select('*').eq('quiz_id', quizId);
  if (!questions) return { success: false, error: 'Quiz questions not found' };

  let totalPoints = 0, earnedPoints = 0;
  questions.forEach(question => {
    totalPoints += question.points || 1;
    if (answers[question.id] === question.correct_answer) earnedPoints += question.points || 1;
  });
  const score = (earnedPoints / totalPoints) * 100;

  const { data, error } = await supabase.from('quiz_attempts').update({ answers, score, total_points: totalPoints, completed_at: new Date().toISOString(), status: 'completed' }).eq('id', attemptId).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getStudentQuizAttempts(studentId: string, quizId?: string) {
  let query = supabase.from('quiz_attempts').select('*, quiz:quizzes(id, title, passing_score, course:courses(id, name))').eq('student_id', studentId);
  if (quizId) query = query.eq('quiz_id', quizId);
  const { data, error } = await query.order('started_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function getQuizAttemptResults(attemptId: string) {
  const { data, error } = await supabase.from('quiz_attempts').select('*, quiz:quizzes(id, title, passing_score, questions:quiz_questions(*))').eq('id', attemptId).single();
  if (error) return null;
  return data;
}
