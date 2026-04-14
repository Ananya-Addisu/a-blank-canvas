import { supabase } from '~/lib/supabase.client';
import type { Bundle, Enrollment, PaymentMethod, PaymentSubmission } from '~/types/enrollment';

export async function getBundles(): Promise<Bundle[]> {
  const { data, error } = await supabase
    .from('bundles')
    .select('*, bundle_courses(course:courses(*))')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('year_level', { ascending: true })
    .order('semester', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map((bundle: any) => {
    const courses = bundle.bundle_courses?.map((bc: any) => bc.course).filter(Boolean) || [];
    return { ...bundle, courses, course_count: courses.length };
  });
}

export async function getBundleById(id: string): Promise<Bundle | null> {
  const { data, error } = await supabase.from('bundles').select('*, bundle_courses(course:courses(*))').eq('id', id).single();
  if (error) throw new Error(error.message);
  if (data) {
    const courses = data.bundle_courses?.map((bc: any) => bc.course).filter(Boolean) || [];
    return { ...data, courses, course_count: courses.length };
  }
  return null;
}

export async function getCourseById(id: string) {
  const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function hasAccessToCourse(studentId: string, courseId: string): Promise<boolean> {
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('id, status, course_id, bundle_id, expires_at, bundle:bundles(bundle_courses(course_id))')
    .eq('student_id', studentId)
    .eq('status', 'approved');

  if (error) return false;
  const now = new Date().toISOString();
  return enrollments.some(e => {
    if (e.expires_at && e.expires_at < now) return false;
    if (e.course_id === courseId) return true;
    if (e.bundle_id && e.bundle) {
      const bundleCourses = (e.bundle as any).bundle_courses || [];
      return bundleCourses.some((bc: any) => bc.course_id === courseId);
    }
    return false;
  });
}

export async function createEnrollment(data: { student_id: string; course_id?: string; bundle_id?: string; enrollment_type: 'course' | 'bundle'; payment_amount: number; }): Promise<Enrollment> {
  const { data: enrollment, error } = await supabase.from('enrollments').insert(data).select().single();
  if (error) throw new Error(error.message);
  return enrollment;
}

export async function getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, course:courses(*), bundle:bundles(*, bundle_courses(course_id, course:courses(*))), payment_submissions(*)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map((enrollment: any) => ({
    ...enrollment,
    payment_submissions: enrollment.payment_submissions?.[0] || null,
  }));
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { data, error } = await supabase.from('payment_methods').select('*').eq('is_active', true).order('method_name', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function submitPayment(data: { enrollment_id: string; student_id: string; screenshot_urls: string[]; payment_method: string; amount: number; }): Promise<PaymentSubmission> {
  if (!data.payment_method?.trim()) throw new Error('Please select a payment method.');
  if (data.screenshot_urls.length !== 1) throw new Error('Please upload exactly one payment screenshot.');
  const { data: submission, error } = await supabase.from('payment_submissions').insert(data).select().single();
  if (error) throw new Error(error.message);
  return submission;
}

export async function getAllPaymentSubmissions(): Promise<any[]> {
  const { data, error } = await supabase
    .from('payment_submissions')
    .select('*, enrollment:enrollments(*, course:courses(*), bundle:bundles(*)), student:students(id, full_name, phone_number, email)')
    .order('submitted_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function updatePaymentStatus(submissionId: string, status: 'approved' | 'rejected', adminId: string, adminNotes?: string): Promise<void> {
  const { data: submission } = await supabase
    .from('payment_submissions')
    .select('enrollment_id, amount, enrollment:enrollments(id, course_id, bundle_id, course:courses(teacher_id))')
    .eq('id', submissionId)
    .single();

  const { error: submissionError } = await supabase
    .from('payment_submissions')
    .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: adminId, admin_notes: adminNotes })
    .eq('id', submissionId);

  if (submissionError) throw new Error(submissionError.message);

  if (status === 'approved' && submission) {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);
    const { error: enrollmentError } = await supabase.from('enrollments').update({ status: 'approved', expires_at: expiresAt.toISOString() }).eq('id', submission.enrollment_id);
    if (enrollmentError) throw new Error(enrollmentError.message);

    const enrollment = submission.enrollment as any;
    if (enrollment?.course_id && enrollment?.course?.[0]?.teacher_id) {
      const teacherShare = Number(submission.amount) * 0.7;
      await supabase.from('teacher_earnings').insert({ teacher_id: enrollment.course[0].teacher_id, enrollment_id: submission.enrollment_id, amount: teacherShare, type: 'enrollment', status: 'approved' });
    }
  }
}
