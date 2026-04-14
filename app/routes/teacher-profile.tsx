import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { TeacherHeader } from '../components/teacher-header';
import { TeacherSidebar } from '../components/teacher-sidebar';
import styles from './teacher-profile.module.css';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Button } from '~/components/ui/button/button';
import { getTeacherAuth } from '~/lib/auth.client';
import { supabase } from '~/lib/supabase.client';
import { LoadingScreen } from '~/components/loading-screen';

export default function TeacherProfile() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const [stats, setStats] = useState({ courses: 0, students: 0, rating: '4.9' });
  const [canEdit, setCanEdit] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const t = await getTeacherAuth();
      if (!t) { navigate('/teacher-login', { replace: true }); return; }
      setTeacher(t);
      const { data: courses } = await supabase.from('courses').select('id, enrollments:enrollments(id)').eq('teacher_id', t.id);
      setStats({
        courses: courses?.length || 0,
        students: courses?.reduce((s: number, c: any) => s + (c.enrollments?.length || 0), 0) || 0,
        rating: '4.9',
      });
      const { data: settings } = await supabase.from('app_settings').select('setting_value').eq('setting_key', 'allow_teacher_edit_profile').single();
      setCanEdit(settings?.setting_value !== 'false');
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from('teachers').update({
      full_name: fd.get('full_name') as string,
      phone_number: fd.get('phone_number') as string,
      specialization: fd.get('specialization') as string,
      experience: fd.get('experience') as string,
      bio: fd.get('bio') as string,
    }).eq('id', teacher.id);
    setMessage(error ? { type: 'error', text: error.message } : { type: 'success', text: 'Profile updated!' });
    setIsSubmitting(false);
  };

  if (loading) return <LoadingScreen />;

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={styles.container}>
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={styles.main}>
        <TeacherHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>My Profile</h1>
          {message?.type === 'success' && <div style={{ padding: 'var(--space-3) var(--space-4)', background: '#e8f5e9', borderRadius: 'var(--radius-2)', marginBottom: 'var(--space-4)' }}><p style={{ color: '#2e7d32', fontSize: '14px', margin: 0 }}>{message.text}</p></div>}
          {message?.type === 'error' && <div style={{ padding: 'var(--space-3) var(--space-4)', background: '#fce4ec', borderRadius: 'var(--radius-2)', marginBottom: 'var(--space-4)' }}><p style={{ color: '#c62828', fontSize: '14px', margin: 0 }}>{message.text}</p></div>}

          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarContainer}><div className={styles.avatarPlaceholder}>{getInitials(teacher?.full_name || 'Teacher')}</div></div>
              <div className={styles.profileInfo}>
                <h2 className={styles.profileName}>{teacher?.full_name}</h2>
                <p className={styles.profileRole}>{teacher?.specialization || 'Instructor'}</p>
                <div className={styles.profileStats}>
                  <div className={styles.profileStat}><div className={styles.profileStatValue}>{stats.courses}</div><div className={styles.profileStatLabel}>Courses</div></div>
                  <div className={styles.profileStat}><div className={styles.profileStatValue}>{stats.students}</div><div className={styles.profileStatLabel}>Students</div></div>
                  <div className={styles.profileStat}><div className={styles.profileStatValue}>{stats.rating}</div><div className={styles.profileStatLabel}>Rating</div></div>
                </div>
              </div>
            </div>
            <div className={styles.aboutSection}><h3 className={styles.sectionTitle}>About</h3><p className={styles.bio}>{teacher?.bio || 'No bio added yet.'}</p></div>
          </div>

          <div className={styles.settingsCard}>
            <h2 className={styles.cardTitle}>Account Settings</h2>
            {!canEdit && <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-warning-3)', borderRadius: 'var(--radius-2)', marginBottom: 'var(--space-4)' }}><p style={{ color: 'var(--color-warning-11)', fontSize: '14px', margin: 0 }}>Profile editing is currently disabled by the administrator.</p></div>}
            <form onSubmit={handleSubmit} className={styles.form} style={{ opacity: canEdit ? 1 : 0.5, pointerEvents: canEdit ? 'auto' : 'none' }}>
              <div className={styles.formGroup}><Label className={styles.label}>Full Name</Label><Input type="text" name="full_name" className={styles.input} defaultValue={teacher?.full_name} required disabled={!canEdit} /></div>
              <div className={styles.formGroup}><Label className={styles.label}>Phone Number</Label><Input type="tel" name="phone_number" className={styles.input} defaultValue={teacher?.phone_number} required disabled={!canEdit} /></div>
              <div className={styles.formGroup}><Label className={styles.label}>Specialization</Label><Input type="text" name="specialization" className={styles.input} defaultValue={teacher?.specialization || ''} disabled={!canEdit} /></div>
              <div className={styles.formGroup}><Label className={styles.label}>Experience</Label><Input type="text" name="experience" className={styles.input} defaultValue={teacher?.experience || ''} disabled={!canEdit} /></div>
              <div className={styles.formGroup}><Label className={styles.label}>Bio</Label><Textarea className={styles.textarea} name="bio" rows={4} defaultValue={teacher?.bio || ''} disabled={!canEdit} /></div>
              <Button type="submit" className={styles.saveButton} disabled={!canEdit || isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
