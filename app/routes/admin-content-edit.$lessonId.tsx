import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { MarkdownEditor } from '~/components/markdown-editor';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { ArrowLeft, Save } from 'lucide-react';
import { getAdminAuth } from '~/lib/auth.client';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';
import styles from './admin-content-edit.$lessonId.module.css';
import { LoadingScreen } from '~/components/loading-screen';

export default function AdminContentEdit() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const admin = await getAdminAuth();
      if (!admin) { navigate('/admin/login'); return; }
      const { data } = await supabase.from('lessons').select('*, chapter:chapters(title, course:courses(name))').eq('id', lessonId).single();
      setLesson(data);
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from('lessons').update({ title: fd.get('title') as string, content_url: fd.get('markdownContent') as string }).eq('id', lessonId);
    setMessage(error ? { type: 'error', text: error.message } : { type: 'success', text: 'Saved!' });
  };

  if (loading || !lesson) return <LoadingScreen />;

  const courseName = lesson.chapter?.course?.name || 'Unknown Course';
  const chapterTitle = lesson.chapter?.title || 'Unknown Chapter';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</Button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Edit Markdown Content</h1>
          <p className={styles.subtitle}>{courseName} → {chapterTitle} → {lesson.title}</p>
        </div>
      </div>
      {message?.type === 'error' && <div className={styles.errorAlert}>{message.text}</div>}
      {message?.type === 'success' && <div className={styles.successAlert}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}><Label>Lesson Title</Label><Input name="title" defaultValue={lesson.title} required /></div>
        <div className={styles.editorWrapper}>
          <MarkdownEditor name="markdownContent" defaultValue={lesson.content_url || ''} placeholder="Write your lesson content in Markdown..." />
        </div>
        <div className={styles.actions}><Button type="submit"><Save size={16} /> Save Changes</Button></div>
      </form>
    </div>
  );
}
