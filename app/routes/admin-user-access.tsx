// Fix #15: Admin ban/unban user from courses page
import { useState } from 'react';
import { Form, useSearchParams } from 'react-router';
import type { Route } from './+types/admin-user-access';
import { Button } from '~/components/ui/button/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog/dialog';
import { SearchableSelect } from '~/components/searchable-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table/table';
import { ShieldOff, ShieldCheck } from 'lucide-react';
import styles from './admin-user-access.module.css';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';



export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const view = url.searchParams.get('view') || 'by-course';
  const courseId = url.searchParams.get('course') || null;
  const studentId = url.searchParams.get('student') || null;
  const [coursesRes, studentsRes] = await Promise.all([
    supabase.from('courses').select('id, name, category').order('name'),
    supabase.from('students').select('id, full_name, phone_number').eq('is_approved', true).order('full_name'),
  ]);
  let enrollments: any[] = [];
  if (view === 'by-course' && courseId) {
    const { data } = await supabase.from('enrollments').select('*, student:students(id, full_name, phone_number)').eq('course_id', courseId);
    enrollments = data || [];
  } else if (view === 'by-student' && studentId) {
    const { data } = await supabase.from('enrollments').select('*, course:courses(id, name), bundle:bundles(id, name)').eq('student_id', studentId);
    enrollments = data || [];
  }
  return { courses: coursesRes.data || [], students: studentsRes.data || [], enrollments, view, courseId, studentId };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const enrollmentId = formData.get('enrollmentId') as string;
  if (intent === 'ban') { await supabase.from('enrollments').update({ status: 'rejected' }).eq('id', enrollmentId); }
  else if (intent === 'unban') { await supabase.from('enrollments').update({ status: 'approved' }).eq('id', enrollmentId); }
  return { success: true };
}


function getTimeRemaining(expiresAt: string | null): { text: string; level: string } {
  if (!expiresAt) return { text: 'No expiry', level: 'normal' };
  const now = new Date();
  const exp = new Date(expiresAt);
  const diffMs = exp.getTime() - now.getTime();
  if (diffMs <= 0) return { text: 'Expired', level: 'danger' };
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days > 30) return { text: `${days} days left`, level: 'normal' };
  if (days > 7) return { text: `${days} days left`, level: 'warning' };
  return { text: `${days} days left`, level: 'danger' };
}

export default function AdminUserAccess({ loaderData }: Route.ComponentProps) {
  const { courses, students, enrollments, view, courseId, studentId } = loaderData as any;
  const [searchParams, setSearchParams] = useSearchParams();
  const [banTarget, setBanTarget] = useState<{ enrollmentId: string; title: string; description: string } | null>(null);

  const switchView = (v: string) => {
    setSearchParams({ view: v });
  };

  const courseOptions = courses.map((c: any) => ({
    value: c.id,
    label: `${c.name} (${c.category})`,
  }));

  const studentOptions = students.map((s: any) => ({
    value: s.id,
    label: `${s.full_name} (${s.phone_number})`,
  }));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Access Management</h1>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${view === 'by-course' ? styles.tabActive : ''}`}
          onClick={() => switchView('by-course')}
        >
          By Course
        </button>
        <button
          className={`${styles.tab} ${view === 'by-student' ? styles.tabActive : ''}`}
          onClick={() => switchView('by-student')}
        >
          By Student
        </button>
      </div>

      {view === 'by-course' && (
        <>
          <div className={styles.selectRow}>
            <SearchableSelect
              options={courseOptions}
              value={courseId || ''}
              onValueChange={(v) => setSearchParams({ view: 'by-course', course: v })}
              placeholder="Search and select a course..."
              searchPlaceholder="Search courses..."
            />
          </div>

          {courseId && (
            <div className={styles.tableCard}>
              {enrollments.length === 0 ? (
                <div className={styles.emptyState}>No students enrolled in this course</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Access Time Left</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((e: any) => {
                      const remaining = getTimeRemaining(e.expires_at);
                      return (
                        <TableRow key={e.id}>
                          <TableCell className={styles.nameCell}>{e.student?.full_name || 'Unknown'}</TableCell>
                          <TableCell>{e.student?.phone_number || '-'}</TableCell>
                          <TableCell>
                            <span className={remaining.level === 'danger' ? styles.expiryDanger : remaining.level === 'warning' ? styles.expiryWarning : styles.expiry}>
                              {remaining.text}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`${styles.badge} ${e.status === 'approved' ? styles.badgeActive : styles.badgeBanned}`}>
                              {e.status === 'approved' ? 'Active' : 'Banned'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {e.status === 'approved' ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                type="button"
                                className={styles.banButton}
                                onClick={() => setBanTarget({
                                  enrollmentId: e.id,
                                  title: 'Ban Student',
                                  description: 'Ban this student from this course?'
                                })}
                              >
                                <ShieldOff size={14} /> Ban
                              </Button>
                            ) : (
                              <Form method="post" style={{ display: 'inline' }}>
                                <input type="hidden" name="enrollmentId" value={e.id} />
                                <input type="hidden" name="intent" value="unban" />
                                <Button size="sm" variant="outline" type="submit" className={styles.banButton}>
                                  <ShieldCheck size={14} /> Restore
                                </Button>
                              </Form>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </>
      )}

      {view === 'by-student' && (
        <>
          <div className={styles.selectRow}>
            <SearchableSelect
              options={studentOptions}
              value={studentId || ''}
              onValueChange={(v) => setSearchParams({ view: 'by-student', student: v })}
              placeholder="Search and select a student..."
              searchPlaceholder="Search by name or phone..."
            />
          </div>

          {studentId && (
            <div className={styles.tableCard}>
              {enrollments.length === 0 ? (
                <div className={styles.emptyState}>No enrollments found for this student</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course/Bundle</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Access Time Left</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((e: any) => {
                      const remaining = getTimeRemaining(e.expires_at);
                      const name = e.course?.name || e.bundle?.name || 'Unknown';
                      return (
                        <TableRow key={e.id}>
                          <TableCell className={styles.nameCell}>{name}</TableCell>
                          <TableCell>{e.course ? 'Course' : 'Bundle'}</TableCell>
                          <TableCell>
                            <span className={remaining.level === 'danger' ? styles.expiryDanger : remaining.level === 'warning' ? styles.expiryWarning : styles.expiry}>
                              {remaining.text}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`${styles.badge} ${e.status === 'approved' ? styles.badgeActive : styles.badgeBanned}`}>
                              {e.status === 'approved' ? 'Active' : e.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {e.status === 'approved' ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                type="button"
                                className={styles.banButton}
                                onClick={() => setBanTarget({
                                  enrollmentId: e.id,
                                  title: 'Ban Access',
                                  description: `Ban access to "${name}"?`
                                })}
                              >
                                <ShieldOff size={14} /> Ban
                              </Button>
                            ) : e.status === 'rejected' ? (
                              <Form method="post" style={{ display: 'inline' }}>
                                <input type="hidden" name="enrollmentId" value={e.id} />
                                <input type="hidden" name="intent" value="unban" />
                                <Button size="sm" variant="outline" type="submit" className={styles.banButton}>
                                  <ShieldCheck size={14} /> Restore
                                </Button>
                              </Form>
                            ) : (
                              <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-10)' }}>Pending</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </>
      )}

      <Dialog open={!!banTarget} onOpenChange={(open) => !open && setBanTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{banTarget?.title}</DialogTitle>
            <DialogDescription>{banTarget?.description}</DialogDescription>
          </DialogHeader>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
            <Button type="button" variant="outline" onClick={() => setBanTarget(null)}>
              Cancel
            </Button>
            <Form method="post">
              <input type="hidden" name="intent" value="ban" />
              <input type="hidden" name="enrollmentId" value={banTarget?.enrollmentId || ''} />
              <Button type="submit" variant="destructive">
                Confirm Ban
              </Button>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
