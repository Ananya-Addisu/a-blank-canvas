import { supabaseAdmin as supabase } from '~/lib/supabase.server';

// Get teacher's courses
export async function getTeacherCourses(teacherId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      chapters:chapters(
        id,
        title,
        lessons:lessons(id, title)
      ),
      enrollments:enrollments(
        id,
        student:students(id, full_name)
      )
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Create a new course
export async function createCourse(teacherId: string, courseData: any) {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      teacher_id: teacherId,
      name: courseData.name,
      description: courseData.description,
      category: courseData.category,
      department: courseData.department,
      price: courseData.price,
      thumbnail_url: courseData.thumbnail_url,
      status: 'inactive', // Requires admin approval
      is_bundle_exclusive: courseData.is_bundle_exclusive || false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update course
export async function updateCourse(courseId: string, courseData: any) {
  const { data, error } = await supabase
    .from('courses')
    .update({
      name: courseData.name,
      description: courseData.description,
      category: courseData.category,
      department: courseData.department,
      price: courseData.price,
      thumbnail_url: courseData.thumbnail_url,
      sample_video_url: courseData.sample_video_url,
      sample_pdf_url: courseData.sample_pdf_url,
      syllabus: courseData.syllabus,
      is_bundle_exclusive: courseData.is_bundle_exclusive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete course
export async function deleteCourse(courseId: string) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) throw error;
  return true;
}

// Get course analytics
export async function getCourseAnalytics(courseId: string) {
  const [enrollmentsResult, progressResult] = await Promise.all([
    supabase
      .from('enrollments')
      .select('id, created_at, status')
      .eq('course_id', courseId),
    supabase
      .from('lesson_progress')
      .select('status, progress_percentage')
      .eq('enrollment_id', courseId),
  ]);

  const enrollments = enrollmentsResult.data || [];
  const progress = progressResult.data || [];

  return {
    totalEnrollments: enrollments.length,
    approvedEnrollments: enrollments.filter(e => e.status === 'approved').length,
    pendingEnrollments: enrollments.filter(e => e.status === 'pending').length,
    averageProgress: progress.length > 0 
      ? progress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / progress.length 
      : 0,
    completionRate: progress.length > 0
      ? (progress.filter(p => p.status === 'completed').length / progress.length) * 100
      : 0,
  };
}

// Create chapter
export async function createChapter(courseId: string, chapterData: any) {
  const { data, error } = await supabase
    .from('chapters')
    .insert({
      course_id: courseId,
      title: chapterData.title,
      description: chapterData.description,
      order_index: chapterData.order_index || 0,
      is_published: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update chapter
export async function updateChapter(chapterId: string, chapterData: any) {
  const { data, error } = await supabase
    .from('chapters')
    .update({
      title: chapterData.title,
      description: chapterData.description,
      order_index: chapterData.order_index,
      updated_at: new Date().toISOString(),
    })
    .eq('id', chapterId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete chapter
export async function deleteChapter(chapterId: string) {
  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', chapterId);

  if (error) throw error;
  return true;
}

// Create lesson (requires approval)
export async function createLesson(chapterId: string, lessonData: any) {
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      chapter_id: chapterId,
      title: lessonData.title,
      description: lessonData.description,
      lesson_type: lessonData.lesson_type,
      content_url: lessonData.content_url,
      youtube_url: lessonData.youtube_url,
      video_source: lessonData.video_source || 'upload',
      duration: lessonData.duration,
      page_count: lessonData.page_count,
      order_index: lessonData.order_index || 0,
      is_preview: lessonData.is_preview || false,
      is_published: false,
      approval_status: 'pending',
      download_url: lessonData.download_url || null,
      is_downloadable: lessonData.is_downloadable || false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update lesson
export async function updateLesson(lessonId: string, lessonData: any) {
  const updateData: any = {
    updated_at: new Date().toISOString(),
    approval_status: 'pending',
  };
  if (lessonData.title !== undefined) updateData.title = lessonData.title;
  if (lessonData.description !== undefined) updateData.description = lessonData.description;
  if (lessonData.content_url !== undefined) updateData.content_url = lessonData.content_url;
  if (lessonData.youtube_url !== undefined) updateData.youtube_url = lessonData.youtube_url;
  if (lessonData.video_source !== undefined) updateData.video_source = lessonData.video_source;
  if (lessonData.duration !== undefined) updateData.duration = lessonData.duration;
  if (lessonData.page_count !== undefined) updateData.page_count = lessonData.page_count;
  if (lessonData.order_index !== undefined) updateData.order_index = lessonData.order_index;
  if (lessonData.is_preview !== undefined) updateData.is_preview = lessonData.is_preview;
  if (lessonData.download_url !== undefined) updateData.download_url = lessonData.download_url;
  if (lessonData.is_downloadable !== undefined) updateData.is_downloadable = lessonData.is_downloadable;

  const { data, error } = await supabase
    .from('lessons')
    .update(updateData)
    .eq('id', lessonId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete lesson
export async function deleteLesson(lessonId: string) {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) throw error;
  return true;
}

// Get teacher's students
export async function getTeacherStudents(teacherId: string, searchQuery?: string) {
  let query = supabase
    .from('enrollments')
    .select(`
      id,
      status,
      created_at,
      student:students(
        id,
        full_name,
        phone_number,
        email,
        academic_year,
        institution
      ),
      course:courses!inner(
        id,
        name,
        teacher_id
      )
    `)
    .eq('course.teacher_id', teacherId)
    .eq('status', 'approved');

  if (searchQuery) {
    query = query.ilike('student.full_name', `%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// Get teacher earnings
export async function getTeacherEarnings(teacherId: string) {
  const { data, error } = await supabase
    .from('teacher_earnings')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const earnings = data || [];
  const totalEarnings = earnings
    .filter(e => e.type !== 'withdrawal' && e.status === 'approved')
    .reduce((sum, e) => sum + Number(e.amount), 0);
  
  const pendingPayout = earnings
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const thisMonth = earnings
    .filter(e => {
      const date = new Date(e.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear() &&
             e.type !== 'withdrawal' &&
             e.status === 'approved';
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return {
    earnings,
    totalEarnings,
    pendingPayout,
    thisMonth,
  };
}

// Request payout
export async function requestPayout(teacherId: string, amount: number, notes?: string) {
  // Get teacher's revenue share percentage from app_settings
  const { data: settingData } = await supabase
    .from('app_settings')
    .select('setting_value')
    .eq('setting_key', 'teacher_revenue_share')
    .single();

  const revenueShare = settingData ? parseFloat(settingData.setting_value) : 70; // Default 70%
  const actualAmount = (amount * revenueShare) / 100;

  const { data, error } = await supabase
    .from('teacher_earnings')
    .insert({
      teacher_id: teacherId,
      amount: -actualAmount, // Negative for withdrawal
      type: 'withdrawal',
      status: 'pending',
      withdrawal_request_date: new Date().toISOString(),
      notes: notes || `Withdrawal request: ${revenueShare}% of ${amount} ETB`,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get teacher's pending/approved/declined submissions
export async function getTeacherApprovals(teacherId: string) {
  const [coursesResult, lessonsResult, quizzesResult] = await Promise.all([
    supabase
      .from('courses')
      .select('id, name, status, created_at, updated_at')
      .eq('teacher_id', teacherId),
    supabase
      .from('lessons')
      .select(`
        id,
        title,
        approval_status,
        rejection_reason,
        created_at,
        updated_at,
        chapter:chapters(
          course:courses!inner(teacher_id)
        )
      `)
      .eq('chapter.course.teacher_id', teacherId),
    supabase
      .from('quizzes')
      .select('id, title, status, created_at, updated_at')
      .eq('teacher_id', teacherId),
  ]);

  return {
    courses: coursesResult.data || [],
    lessons: lessonsResult.data || [],
    quizzes: quizzesResult.data || [],
  };
}
