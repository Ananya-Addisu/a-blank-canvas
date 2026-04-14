import { supabase } from '~/lib/supabase.client';

export async function getLessonProgress(studentId: string, lessonId: string, enrollmentId: string) {
  const { data, error } = await supabase.from('lesson_progress').select('*').eq('student_id', studentId).eq('lesson_id', lessonId).eq('enrollment_id', enrollmentId).single();
  if (error && error.code !== 'PGRST116') return null;
  return data;
}

export async function updateLessonProgress(studentId: string, lessonId: string, enrollmentId: string, progressData: { status?: 'not_started' | 'in_progress' | 'completed'; progressPercentage?: number; lastPosition?: number; }) {
  const existing = await getLessonProgress(studentId, lessonId, enrollmentId);

  const updateData: any = { student_id: studentId, lesson_id: lessonId, enrollment_id: enrollmentId };
  if (progressData.status) updateData.status = progressData.status;
  if (progressData.progressPercentage !== undefined) updateData.progress_percentage = progressData.progressPercentage;
  if (progressData.lastPosition !== undefined) updateData.last_position = progressData.lastPosition;
  if (progressData.progressPercentage === 100 || progressData.status === 'completed') {
    updateData.status = 'completed';
    updateData.completed_at = new Date().toISOString();
  }

  if (existing) {
    const { data, error } = await supabase.from('lesson_progress').update(updateData).eq('id', existing.id).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } else {
    const { data, error } = await supabase.from('lesson_progress').insert(updateData).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }
}

export async function getCourseProgress(studentId: string, enrollmentId: string) {
  const { data: progressRecords, error } = await supabase
    .from('lesson_progress')
    .select('*, lesson:lessons(id, title, chapter:chapters(id, title, course_id))')
    .eq('student_id', studentId)
    .eq('enrollment_id', enrollmentId);

  if (error) return { success: false, data: null };

  const totalLessons = progressRecords?.length || 0;
  const completedLessons = progressRecords?.filter(p => p.status === 'completed').length || 0;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return { success: true, data: { totalLessons, completedLessons, overallProgress, progressRecords } };
}

export async function getStudentAllProgress(studentId: string) {
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('id, course:courses(id, name, thumbnail_url), created_at')
    .eq('student_id', studentId)
    .eq('status', 'approved');

  if (error || !enrollments?.length) return [];

  const allProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const progress = await getCourseProgress(studentId, enrollment.id);
      return { enrollment, progress: progress.data };
    })
  );

  return allProgress;
}
