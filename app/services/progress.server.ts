import { supabase } from '~/lib/supabase.server';

export async function getLessonProgress(
  studentId: string,
  lessonId: string,
  enrollmentId: string
) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('student_id', studentId)
    .eq('lesson_id', lessonId)
    .eq('enrollment_id', enrollmentId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching lesson progress:', error);
    return null;
  }

  return data;
}

export async function updateLessonProgress(
  studentId: string,
  lessonId: string,
  enrollmentId: string,
  progressData: {
    status?: 'not_started' | 'in_progress' | 'completed';
    progressPercentage?: number;
    lastPosition?: number;
  }
) {
  // Check if progress record exists
  const existing = await getLessonProgress(studentId, lessonId, enrollmentId);

  const updateData: any = {
    student_id: studentId,
    lesson_id: lessonId,
    enrollment_id: enrollmentId,
  };

  if (progressData.status) updateData.status = progressData.status;
  if (progressData.progressPercentage !== undefined) {
    updateData.progress_percentage = progressData.progressPercentage;
  }
  if (progressData.lastPosition !== undefined) {
    updateData.last_position = progressData.lastPosition;
  }

  // Mark as completed if progress is 100%
  if (progressData.progressPercentage === 100 || progressData.status === 'completed') {
    updateData.status = 'completed';
    updateData.completed_at = new Date().toISOString();
  }

  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('lesson_progress')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lesson progress:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('lesson_progress')
      .insert(updateData)
      .select()
      .single();

    if (error) {
      console.error('Error creating lesson progress:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }
}

export async function getCourseProgress(studentId: string, enrollmentId: string) {
  // Get all lesson progress for this enrollment
  const { data: progressRecords, error } = await supabase
    .from('lesson_progress')
    .select(`
      *,
      lesson:lessons(
        id,
        title,
        chapter:chapters(
          id,
          title,
          course_id
        )
      )
    `)
    .eq('student_id', studentId)
    .eq('enrollment_id', enrollmentId);

  if (error) {
    console.error('Error fetching course progress:', error);
    return { success: false, data: null };
  }

  // Calculate overall progress
  const totalLessons = progressRecords?.length || 0;
  const completedLessons = progressRecords?.filter(p => p.status === 'completed').length || 0;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    success: true,
    data: {
      totalLessons,
      completedLessons,
      overallProgress,
      progressRecords
    }
  };
}

export async function getStudentAllProgress(studentId: string) {
  // Get all enrollments for this student
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      course:courses(
        id,
        name,
        thumbnail_url
      ),
      created_at
    `)
    .eq('student_id', studentId)
    .eq('status', 'approved');

  if (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }

  if (!enrollments || enrollments.length === 0) {
    return [];
  }

  // Get progress for each enrollment
  const progressPromises = enrollments.map(async (enrollment) => {
    const progress = await getCourseProgress(studentId, enrollment.id);
    return {
      enrollment,
      progress: progress.data
    };
  });

  const allProgress = await Promise.all(progressPromises);

  return allProgress;
}
