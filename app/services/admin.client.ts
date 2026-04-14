import { supabase, supabaseAdmin } from '~/lib/supabase.client';

// Content Approval Functions
export async function getPendingContentApprovals() {
  const { data: pendingLessons, error: lessonsError } = await supabaseAdmin
    .from('lessons')
    .select(`
      id, title, lesson_type, content_url, youtube_url, video_source, created_at,
      chapter:chapters(
        title,
        course:courses(id, name, teacher:teachers(id, full_name))
      )
    `)
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: false });

  if (lessonsError) console.error('Error fetching pending lessons:', lessonsError);

  const { data: pendingLibrary, error: libraryError } = await supabaseAdmin
    .from('library_content')
    .select('*')
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: false });

  if (libraryError) console.error('Error fetching pending library content:', libraryError);

  const results: any[] = [];

  (pendingLessons || []).forEach(lesson => {
    const course = (lesson.chapter as any)?.course;
    const teacher = course?.teacher;
    results.push({
      id: lesson.id, title: lesson.title, content_type: 'lesson',
      lesson_type: lesson.lesson_type, content_url: lesson.content_url,
      youtube_url: lesson.youtube_url, video_source: lesson.video_source,
      course_title: course?.name || 'Unknown Course',
      teacher_name: teacher?.full_name || 'Unknown Teacher',
      created_at: lesson.created_at,
    });
  });

  (pendingLibrary || []).forEach(content => {
    results.push({
      id: content.id, title: content.title, content_type: 'library',
      lesson_type: content.content_type, content_url: content.file_url,
      youtube_url: content.youtube_url, video_source: content.video_source,
      course_title: null, teacher_name: content.author || 'Unknown',
      created_at: content.created_at,
    });
  });

  return results;
}

export async function approveContent(contentType: 'lesson' | 'library', contentId: string, adminId: string) {
  const table = contentType === 'lesson' ? 'lessons' : 'library_content';
  const { error } = await supabaseAdmin
    .from(table)
    .update({ approval_status: 'approved', approved_by: adminId, approved_at: new Date().toISOString() })
    .eq('id', contentId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function rejectContent(contentType: 'lesson' | 'library', contentId: string, adminId: string, reason: string) {
  const table = contentType === 'lesson' ? 'lessons' : 'library_content';
  const { error } = await supabaseAdmin
    .from(table)
    .update({ approval_status: 'rejected', approved_by: adminId, approved_at: new Date().toISOString(), rejection_reason: reason })
    .eq('id', contentId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// User Management
export async function getPendingStudents() {
  const { data, error } = await supabaseAdmin.from('students').select('*').eq('is_approved', false).order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function getAllStudents() {
  const [studentsResult, enrollmentsResult, trustedDevicesResult] = await Promise.all([
    supabaseAdmin.from('students').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('enrollments').select('id, student_id'),
    supabaseAdmin
      .from('trusted_devices')
      .select('id, user_id, device_name, user_agent, created_at, last_seen, revoked')
      .eq('user_type', 'student'),
  ]);

  if (studentsResult.error) {
    console.error('Error fetching students:', studentsResult.error);
    return [];
  }

  if (enrollmentsResult.error) {
    console.error('Error fetching student enrollments:', enrollmentsResult.error);
  }

  if (trustedDevicesResult.error) {
    console.error('Error fetching student devices:', trustedDevicesResult.error);
  }

  const enrollmentMap = new Map<string, any[]>();
  for (const enrollment of enrollmentsResult.data || []) {
    const list = enrollmentMap.get(enrollment.student_id) || [];
    list.push(enrollment);
    enrollmentMap.set(enrollment.student_id, list);
  }

  const deviceMap = new Map<string, any[]>();
  for (const device of trustedDevicesResult.data || []) {
    const list = deviceMap.get(device.user_id) || [];
    list.push(device);
    deviceMap.set(device.user_id, list);
  }

  return (studentsResult.data || []).map(student => {
    const enrollments = enrollmentMap.get(student.id) || [];
    const trustedDevices = deviceMap.get(student.id) || [];

    return {
      ...student,
      enrollments,
      trusted_device: trustedDevices,
      enrollment_count: enrollments.length,
      device_bound: trustedDevices.some((d: any) => !d.revoked),
    };
  });
}

export async function getAllTeachers() {
  const [teachersResult, coursesResult, trustedDevicesResult] = await Promise.all([
    supabaseAdmin.from('teachers').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('courses').select('id, teacher_id'),
    supabaseAdmin
      .from('trusted_devices')
      .select('id, user_id, device_name, user_agent, created_at, last_seen, revoked')
      .eq('user_type', 'teacher'),
  ]);

  if (teachersResult.error) {
    console.error('Error fetching teachers:', teachersResult.error);
    return [];
  }

  if (coursesResult.error) {
    console.error('Error fetching teacher courses:', coursesResult.error);
  }

  if (trustedDevicesResult.error) {
    console.error('Error fetching teacher devices:', trustedDevicesResult.error);
  }

  const courseMap = new Map<string, any[]>();
  for (const course of coursesResult.data || []) {
    if (!course.teacher_id) continue;
    const list = courseMap.get(course.teacher_id) || [];
    list.push(course);
    courseMap.set(course.teacher_id, list);
  }

  const deviceMap = new Map<string, any[]>();
  for (const device of trustedDevicesResult.data || []) {
    const list = deviceMap.get(device.user_id) || [];
    list.push(device);
    deviceMap.set(device.user_id, list);
  }

  return (teachersResult.data || []).map(teacher => {
    const courses = courseMap.get(teacher.id) || [];
    const trustedDevices = deviceMap.get(teacher.id) || [];

    return {
      ...teacher,
      courses,
      trusted_device: trustedDevices,
      course_count: courses.length,
      device_bound: trustedDevices.some((d: any) => !d.revoked),
    };
  });
}

export async function approveStudent(studentId: string) {
  const { data, error } = await supabaseAdmin.from('students').update({ is_approved: true }).eq('id', studentId).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function approveTeacher(teacherId: string) {
  const { data, error } = await supabaseAdmin.from('teachers').update({ is_approved: true }).eq('id', teacherId).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function rejectUser(userId: string, userType: 'student' | 'teacher') {
  const table = userType === 'student' ? 'students' : 'teachers';
  const { data, error } = await supabaseAdmin.from(table).update({ is_approved: false, is_active: false }).eq('id', userId).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function suspendUser(userId: string, userType: 'student' | 'teacher') {
  const table = userType === 'student' ? 'students' : 'teachers';
  const { data, error } = await supabaseAdmin.from(table).update({ is_active: false }).eq('id', userId).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function activateUser(userId: string, userType: 'student' | 'teacher') {
  const table = userType === 'student' ? 'students' : 'teachers';
  const { data, error } = await supabaseAdmin.from(table).update({ is_active: true }).eq('id', userId).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

// Payment Management
export async function getAllPaymentSubmissions() {
  const { data, error } = await supabaseAdmin
    .from('payment_submissions')
    .select('*, student:students(id, full_name, phone_number), enrollment:enrollments(id, course:courses(id, name), bundle:bundles(id, name))')
    .order('submitted_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function getPendingPayments() {
  const { data, error } = await supabaseAdmin
    .from('payment_submissions')
    .select('*, student:students(id, full_name, phone_number), enrollment:enrollments(id, course:courses(id, name), bundle:bundles(id, name))')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true });
  if (error) return [];
  return data || [];
}

export async function approvePayment(paymentId: string, adminId: string) {
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payment_submissions')
    .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: adminId })
    .eq('id', paymentId)
    .select('enrollment_id')
    .single();

  if (paymentError) return { success: false, error: paymentError.message };

  const { error: enrollmentError } = await supabaseAdmin
    .from('enrollments')
    .update({ status: 'approved' })
    .eq('id', payment.enrollment_id);

  if (enrollmentError) return { success: false, error: enrollmentError.message };
  return { success: true };
}

export async function rejectPayment(paymentId: string, adminId: string, notes?: string) {
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payment_submissions')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: adminId, admin_notes: notes })
    .eq('id', paymentId)
    .select('enrollment_id')
    .single();

  if (paymentError) return { success: false, error: paymentError.message };

  const { error: enrollmentError } = await supabaseAdmin
    .from('enrollments')
    .update({ status: 'rejected' })
    .eq('id', payment.enrollment_id);

  if (enrollmentError) return { success: false, error: enrollmentError.message };
  return { success: true };
}

// Analytics
export async function getDashboardStats() {
  try {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (error) return await getDashboardStatsManual();

    if (data && data.length > 0) {
      const result = data[0];
      const { count: totalCourses } = await supabaseAdmin.from('courses').select('*', { count: 'exact', head: true });
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
  } catch {
    return await getDashboardStatsManual();
  }
}

async function getDashboardStatsManual() {
  const [s, ps, t, pt, pp, c] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('teachers').select('*', { count: 'exact', head: true }),
    supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('payment_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
  ]);

  return {
    totalStudents: s.count || 0, pendingStudents: ps.count || 0,
    totalTeachers: t.count || 0, pendingTeachers: pt.count || 0,
    pendingPayments: pp.count || 0, totalCourses: c.count || 0,
  };
}

// Settings Management
export async function getAppSettings() {
  const { data, error } = await supabaseAdmin.from('app_settings').select('*').order('setting_key');
  if (error) return [];
  return data || [];
}

export async function updateAppSetting(settingKey: string, settingValue: string) {
  const { data, error } = await supabaseAdmin
    .from('app_settings')
    .update({ setting_value: settingValue, updated_at: new Date().toISOString() })
    .eq('setting_key', settingKey)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getPaymentMethods() {
  const { data, error } = await supabaseAdmin.from('payment_methods').select('*').eq('is_active', true).order('created_at');
  if (error) return [];
  return data || [];
}
