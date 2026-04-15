// Fix #2: Manual enrollment approval page - admin can grant course/bundle access without payment
import { useState, useEffect } from 'react';
import { useFetcher, useRevalidator } from 'react-router';
import type { Route } from './+types/admin-manual-enrollment';
import { Button } from '~/components/ui/button/button';
import { Label } from '~/components/ui/label/label';
import { SearchableSelect } from '~/components/searchable-select';
import { UserPlus, Check, BookOpen, Package } from 'lucide-react';
import styles from './admin-manual-enrollment.module.css';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';



export async function clientLoader() {
  const [studentsRes, coursesRes, bundlesRes] = await Promise.all([
    supabase.from('students').select('id, full_name, phone_number').eq('is_approved', true).order('full_name'),
    supabase.from('courses').select('id, name, category, price').order('name'),
    supabase.from('bundles').select('id, name, year_level, price').eq('is_active', true).order('name'),
  ]);
  return { students: studentsRes.data || [], courses: coursesRes.data || [], bundles: bundlesRes.data || [] };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const studentId = formData.get('studentId') as string;
  if (intent === 'enroll-course') {
    const courseId = formData.get('courseId') as string;
    const { error } = await supabase.from('enrollments').insert({ student_id: studentId, course_id: courseId, enrollment_type: 'course', status: 'approved', payment_amount: 0 });
    if (error) return { error: error.message };
    return { success: true, message: 'Course access granted!' };
  } else if (intent === 'enroll-bundle') {
    const bundleId = formData.get('bundleId') as string;
    const { error } = await supabase.from('enrollments').insert({ student_id: studentId, bundle_id: bundleId, enrollment_type: 'bundle', status: 'approved', payment_amount: 0 });
    if (error) return { error: error.message };
    return { success: true, message: 'Bundle access granted!' };
  }
  return { error: 'Unknown intent' };
}


export default function AdminManualEnrollment({ loaderData }: Route.ComponentProps) {
  const { students, courses, bundles } = loaderData as any;
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const [enrollType, setEnrollType] = useState<'course' | 'bundle'>('course');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if ((fetcher.data as any).success) {
        setFeedback({ type: 'success', message: (fetcher.data as any).message });
        setSelectedStudent('');
        setSelectedItem('');
        revalidator.revalidate();
      } else if ((fetcher.data as any).error) {
        setFeedback({ type: 'error', message: (fetcher.data as any).error });
      }
    }
  }, [fetcher.state, fetcher.data]);

  const handleSubmit = () => {
    if (!selectedStudent || !selectedItem) return;
    const fd = new FormData();
    fd.set('intent', enrollType === 'course' ? 'enroll-course' : 'enroll-bundle');
    fd.set('studentId', selectedStudent);
    fd.set(enrollType === 'course' ? 'courseId' : 'bundleId', selectedItem);
    fetcher.submit(fd, { method: 'post' });
  };

  const studentOptions = students.map((s: any) => ({
    value: s.id,
    label: `${s.full_name} (${s.phone_number})`,
  }));

  const courseOptions = courses.map((c: any) => ({
    value: c.id,
    label: `${c.name} (${c.category}) - ${Number(c.price).toLocaleString()} ETB`,
  }));

  const bundleOptions = bundles.map((b: any) => ({
    value: b.id,
    label: `${b.name} (${b.year_level}) - ${Number(b.price).toLocaleString()} ETB`,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <UserPlus size={28} />
        </div>
        <h1 className={styles.title}>Manual Enrollment</h1>
        <p className={styles.subtitle}>Grant course or bundle access to a student without requiring payment proof</p>
      </div>

      {feedback && (
        <div className={`${styles.feedback} ${feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}`}>
          {feedback.type === 'success' ? <Check size={18} /> : null}
          {feedback.message}
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.typeToggle}>
          <button
            className={`${styles.typeButton} ${enrollType === 'course' ? styles.typeActive : ''}`}
            onClick={() => { setEnrollType('course'); setSelectedItem(''); }}
          >
            <BookOpen size={18} />
            Course
          </button>
          <button
            className={`${styles.typeButton} ${enrollType === 'bundle' ? styles.typeActive : ''}`}
            onClick={() => { setEnrollType('bundle'); setSelectedItem(''); }}
          >
            <Package size={18} />
            Bundle
          </button>
        </div>

        <div className={styles.formGroup}>
          <Label>Select Student</Label>
          <SearchableSelect
            options={studentOptions}
            value={selectedStudent}
            onValueChange={setSelectedStudent}
            placeholder="Search and select a student..."
            searchPlaceholder="Search by name or phone..."
          />
        </div>

        <div className={styles.formGroup}>
          <Label>Select {enrollType === 'course' ? 'Course' : 'Bundle'}</Label>
          <SearchableSelect
            options={enrollType === 'course' ? courseOptions : bundleOptions}
            value={selectedItem}
            onValueChange={setSelectedItem}
            placeholder={`Search and select a ${enrollType}...`}
            searchPlaceholder={`Search ${enrollType}s...`}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selectedStudent || !selectedItem || fetcher.state !== 'idle'}
          className={styles.submitButton}
        >
          <Check size={18} />
          {fetcher.state !== 'idle' ? 'Processing...' : `Approve ${enrollType === 'course' ? 'Course' : 'Bundle'} Access`}
        </Button>
      </div>
    </div>
  );
}
