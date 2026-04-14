import { supabaseAdmin as supabase } from '~/lib/supabase.server';

// Content Approval Functions
export async function getPendingContentApprovals() {
  // Get pending lessons
  const { data: pendingLessons, error: lessonsError } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      lesson_type,
      content_url,
      youtube_url,
      video_source,
      created_at,
      chapter:chapters(
        title,
        course:courses(
          id,
          name,
          teacher:teachers(id, full_name)
        )
      )
    `)
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: false });

  if (lessonsError) {
    console.error('Error fetching pending lessons:', lessonsError);
  }

  // Get pending library content
  const { data: pendingLibrary, error: libraryError } = await supabase
    .from('library_content')
    .select('*')
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: false });

  if (libraryError) {
    console.error('Error fetching pending library content:', libraryError);
  }

  const results: any[] = [];

  // Map lessons to unified format
  (pendingLessons || []).forEach(lesson => {
    const course = (lesson.chapter as any)?.course;
    const teacher = course?.teacher;
    results.push({
      id: lesson.id,
      title: lesson.title,
      content_type: 'lesson',
      lesson_type: lesson.lesson_type,
      content_url: lesson.content_url,
      youtube_url: lesson.youtube_url,
      video_source: lesson.video_source,
      course_title: course?.name || 'Unknown Course',
      teacher_name: teacher?.full_name || 'Unknown Teacher',
      created_at: lesson.created_at,
    });
  });

  // Map library content to unified format
  (pendingLibrary || []).forEach(content => {
    results.push({
      id: content.id,
      title: content.title,
      content_type: 'library',
      lesson_type: content.content_type,
      content_url: content.file_url,
      youtube_url: content.youtube_url,
      video_source: content.video_source,
      course_title: null,
      teacher_name: content.author || 'Unknown',
      created_at: content.created_at,
    });
  });

  return results;
}

export async function approveContent(contentType: 'lesson' | 'library', contentId: string, adminId: string) {
  const table = contentType === 'lesson' ? 'lessons' : 'library_content';
  
  const { error } = await supabase
    .from(table)
    .update({
      approval_status: 'approved',
      approved_by: adminId,
      approved_at: new Date().toISOString()
    })
    .eq('id', contentId);

  if (error) {
    console.error('Error approving content:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function rejectContent(
  contentType: 'lesson' | 'library',
  contentId: string,
  adminId: string,
  reason: string
) {
  const table = contentType === 'lesson' ? 'lessons' : 'library_content';
  
  const { error } = await supabase
    .from(table)
    .update({
      approval_status: 'rejected',
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      rejection_reason: reason
    })
    .eq('id', contentId);

  if (error) {
    console.error('Error rejecting content:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// User Management
export async function getPendingStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('is_approved', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending students:', error);
    return [];
  }

  return data || [];
}

export async function getAllStudents() {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      enrollments:enrollments(id),
      trusted_device:trusted_devices(id, device_name, user_agent, created_at, last_seen, revoked)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }

  return (data || []).map(student => ({
    ...student,
    enrollment_count: student.enrollments?.length || 0,
    device_bound: student.trusted_device?.some((d: any) => !d.revoked) || false
  }));
}

export async function getAllTeachers() {
  const { data, error } = await supabase
    .from('teachers')
    .select(`
      *,
      courses:courses(id),
      trusted_device:trusted_devices(id, device_name, user_agent, created_at, last_seen, revoked)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }

  return (data || []).map(teacher => ({
    ...teacher,
    course_count: teacher.courses?.length || 0,
    device_bound: teacher.trusted_device?.some((d: any) => !d.revoked) || false
  }));
}

export async function approveStudent(studentId: string) {
  const { data, error } = await supabase
    .from('students')
    .update({ is_approved: true })
    .eq('id', studentId)
    .select()
    .single();

  if (error) {
    console.error('Error approving student:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function approveTeacher(teacherId: string) {
  const { data, error } = await supabase
    .from('teachers')
    .update({ is_approved: true })
    .eq('id', teacherId)
    .select()
    .single();

  if (error) {
    console.error('Error approving teacher:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function rejectUser(
  userId: string,
  userType: 'student' | 'teacher'
) {
  const table = userType === 'student' ? 'students' : 'teachers';
  
  const { data, error } = await supabase
    .from(table)
    .update({ is_approved: false, is_active: false })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error rejecting user:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function suspendUser(
  userId: string,
  userType: 'student' | 'teacher'
) {
  const table = userType === 'student' ? 'students' : 'teachers';
  
  const { data, error } = await supabase
    .from(table)
    .update({ is_active: false })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error suspending user:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function activateUser(
  userId: string,
  userType: 'student' | 'teacher'
) {
  const table = userType === 'student' ? 'students' : 'teachers';
  
  const { data, error } = await supabase
    .from(table)
    .update({ is_active: true })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error activating user:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// Payment Management
export async function getAllPaymentSubmissions() {
  const { data, error } = await supabase
    .from('payment_submissions')
    .select(`
      *,
      student:students(id, full_name, phone_number),
      enrollment:enrollments(
        id,
        course:courses(id, name),
        bundle:bundles(id, name)
      )
    `)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching payment submissions:', error);
    return [];
  }

  return data || [];
}

export async function getPendingPayments() {
  const { data, error } = await supabase
    .from('payment_submissions')
    .select(`
      *,
      student:students(id, full_name, phone_number),
      enrollment:enrollments(
        id,
        course:courses(id, name),
        bundle:bundles(id, name)
      )
    `)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending payments:', error);
    return [];
  }

  return data || [];
}

export async function approvePayment(
  paymentId: string,
  adminId: string
) {
  // Update payment submission
  const { data: payment, error: paymentError } = await supabase
    .from('payment_submissions')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId
    })
    .eq('id', paymentId)
    .select('enrollment_id')
    .single();

  if (paymentError) {
    console.error('Error approving payment:', paymentError);
    return { success: false, error: paymentError.message };
  }

  // Update enrollment status
  const { error: enrollmentError } = await supabase
    .from('enrollments')
    .update({ status: 'approved' })
    .eq('id', payment.enrollment_id);

  if (enrollmentError) {
    console.error('Error updating enrollment:', enrollmentError);
    return { success: false, error: enrollmentError.message };
  }

  return { success: true };
}

export async function rejectPayment(
  paymentId: string,
  adminId: string,
  notes?: string
) {
  // Update payment submission
  const { data: payment, error: paymentError } = await supabase
    .from('payment_submissions')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
      admin_notes: notes
    })
    .eq('id', paymentId)
    .select('enrollment_id')
    .single();

  if (paymentError) {
    console.error('Error rejecting payment:', paymentError);
    return { success: false, error: paymentError.message };
  }

  // Update enrollment status
  const { error: enrollmentError } = await supabase
    .from('enrollments')
    .update({ status: 'rejected' })
    .eq('id', payment.enrollment_id);

  if (enrollmentError) {
    console.error('Error updating enrollment:', enrollmentError);
    return { success: false, error: enrollmentError.message };
  }

  return { success: true };
}

// Analytics
export async function getDashboardStats() {
  try {
    // Use the database function for efficient stats
    const { data, error } = await supabase.rpc('get_dashboard_stats');

    if (error) {
      console.error('Dashboard stats RPC error:', error);
      // Fallback to manual calculation
      return await getDashboardStatsManual();
    }

    if (data && data.length > 0) {
      const result = data[0];
      
      // Get total courses separately
      const { count: totalCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });
      
      return {
        totalStudents: Number(result.total_students) || 0,
        pendingStudents: Number(result.pending_students) || 0,
        totalTeachers: Number(result.total_teachers) || 0,
        pendingTeachers: Number(result.pending_teachers) || 0,
        pendingPayments: Number(result.pending_payments) || 0,
        totalCourses: totalCourses || 0,
      };
    }

    return await getDashboardStatsManual();
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return await getDashboardStatsManual();
  }
}

async function getDashboardStatsManual() {
  // Get ALL students (approved + pending)
  const { count: totalStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true });

  // Get pending students (not approved)
  const { count: pendingStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', false);

  // Get ALL teachers (approved + pending)
  const { count: totalTeachers } = await supabase
    .from('teachers')
    .select('*', { count: 'exact', head: true });

  // Get pending teachers (not approved)
  const { count: pendingTeachers } = await supabase
    .from('teachers')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', false);

  // Get pending payment submissions
  const { count: pendingPayments } = await supabase
    .from('payment_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Get total courses
  const { count: totalCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true });

  return {
    totalStudents: totalStudents || 0,
    pendingStudents: pendingStudents || 0,
    totalTeachers: totalTeachers || 0,
    pendingTeachers: pendingTeachers || 0,
    pendingPayments: pendingPayments || 0,
    totalCourses: totalCourses || 0,
  };
}

// Settings Management
export async function getAppSettings() {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .order('setting_key');

  if (error) {
    console.error('Error fetching app settings:', error);
    return [];
  }

  return data || [];
}

export async function updateAppSetting(
  settingKey: string,
  settingValue: string
) {
  const { data, error } = await supabase
    .from('app_settings')
    .update({ setting_value: settingValue, updated_at: new Date().toISOString() })
    .eq('setting_key', settingKey)
    .select()
    .single();

  if (error) {
    console.error('Error updating app setting:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function getPaymentMethods() {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('created_at');

  if (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }

  return data || [];
}
