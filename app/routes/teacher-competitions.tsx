import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useIsNativePlatform } from '~/hooks/use-is-native';
import { BrowserOnlyScreen } from '~/components/browser-only-screen';
import { TeacherSidebar } from '~/components/teacher-sidebar';
import { TeacherHeader } from '~/components/teacher-header';
import { Trophy, Users, Award, Calendar } from 'lucide-react';
import { Card, CardContent } from '~/components/ui/card/card';
import { Badge } from '~/components/ui/badge/badge';
import { getTeacherAuth } from '~/lib/auth.client';
import { getTeacherCourses } from '~/services/teacher.client';
import { supabase } from '~/lib/supabase.client';
import { formatEthiopianDate, parseEthiopianDateTime } from '~/utils/ethiopian-time';
import styles from './teacher-competitions.module.css';

function sortCompetitionsDescending(items: any[]) {
  return [...items].sort((a, b) => {
    const aTime = a?.date ? parseEthiopianDateTime(a.date, a.time).getTime() : Number.NEGATIVE_INFINITY;
    const bTime = b?.date ? parseEthiopianDateTime(b.date, b.time).getTime() : Number.NEGATIVE_INFINITY;

    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
    if (Number.isNaN(aTime)) return 1;
    if (Number.isNaN(bTime)) return -1;

    return bTime - aTime;
  });
}

export default function TeacherCompetitions() {
  const isNative = useIsNativePlatform();
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [courseMap, setCourseMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentSort, setStudentSort] = useState<'score' | 'name' | 'date'>('score');

  useEffect(() => {
    (async () => {
      const t = await getTeacherAuth();
      if (!t) { navigate('/teacher-login', { replace: true }); return; }
      const courses = await getTeacherCourses(t.id);
      const courseIds = courses.map((c: any) => c.id);
      const map: Record<string, string> = {};
      courses.forEach((c: any) => { map[c.id] = c.name; });
      setCourseMap(map);

      if (courseIds.length > 0) {
        const { data: comps } = await supabase.from('competitions').select('*').in('gated_course_id', courseIds);
        setCompetitions(sortCompetitionsDescending(comps || []));
        const compIds = (comps || []).map((c: any) => c.id);
        if (compIds.length > 0) {
          const { data: res } = await supabase.from('student_competitions').select('*, student:students(id, full_name)').in('competition_id', compIds).order('score', { ascending: false });
          setResults(res || []);
        }
      }
      setLoading(false);
    })();
  }, []);

  if (isNative === null || loading) return null;
  if (isNative) return <BrowserOnlyScreen />;

  const getCompResults = (compId: string) => results.filter(r => r.competition_id === compId);
  const getResultTimestamp = (result: any) => {
    const value = result?.end_time || result?.start_time || result?.created_at || '';
    const time = value ? new Date(value).getTime() : Number.NEGATIVE_INFINITY;
    return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
  };
  const sortStudents = (items: any[]) => {
    return [...items].sort((a, b) => {
      if (studentSort === 'name') {
        return (a.student?.full_name || '').localeCompare(b.student?.full_name || '');
      }

      if (studentSort === 'date') {
        return getResultTimestamp(b) - getResultTimestamp(a);
      }

      return (b.score || 0) - (a.score || 0);
    });
  };
  const getAvgScore = (compId: string) => {
    const r = getCompResults(compId).filter(x => x.status === 'submitted');
    if (r.length === 0) return null;
    return Math.round(r.reduce((sum, x) => sum + (x.score || 0), 0) / r.length);
  };

  return (
    <div className={styles.layout}>
      <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.mainWrapper}>
        <TeacherHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className={styles.container}>
          <div className={styles.header}><Trophy size={28} className={styles.headerIcon} /><h1 className={styles.title}>Competition Insights</h1><p className={styles.subtitle}>Competitions linked to your courses</p></div>
          <div className={styles.sortBar}>
            <span className={styles.sortLabel}>Students:</span>
            <div className={styles.sortOptions}>
              <button type="button" className={`${styles.sortButton} ${studentSort === 'score' ? styles.sortButtonActive : ''}`} onClick={() => setStudentSort('score')}>Score</button>
              <button type="button" className={`${styles.sortButton} ${studentSort === 'name' ? styles.sortButtonActive : ''}`} onClick={() => setStudentSort('name')}>Name</button>
              <button type="button" className={`${styles.sortButton} ${studentSort === 'date' ? styles.sortButtonActive : ''}`} onClick={() => setStudentSort('date')}>Date</button>
            </div>
          </div>
          {competitions.length === 0 ? (
            <div className={styles.empty}><Trophy size={48} /><p>No competitions linked to your courses yet.</p></div>
          ) : (
            <div className={styles.list}>
              {competitions.map((comp: any) => {
                const compResults = getCompResults(comp.id);
                const avg = getAvgScore(comp.id);
                const submitted = sortStudents(compResults.filter(r => r.status === 'submitted'));
                const courseName = courseMap[comp.gated_course_id] || 'Unknown';
                return (
                  <Card key={comp.id} className={styles.card}>
                    <CardContent className={styles.cardContent}>
                      <div className={styles.cardHeader}><h3 className={styles.compTitle}>{comp.title}</h3><Badge variant={comp.is_finished ? 'secondary' : 'default'}>{comp.is_finished ? 'Finished' : comp.is_published ? 'Active' : 'Draft'}</Badge></div>
                      <p className={styles.courseName}>Course: {courseName}</p>
                      <div className={styles.stats}>
                        <div className={styles.stat}><Users size={16} /><span>{submitted.length} submissions</span></div>
                        <div className={styles.stat}><Award size={16} /><span>Avg: {avg !== null ? `${avg}%` : 'N/A'}</span></div>
                        <div className={styles.stat}><Calendar size={16} /><span>{comp.date ? formatEthiopianDate(comp.date, comp.time, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}</span></div>
                      </div>
                      {submitted.length > 0 && (
                        <div className={styles.rankings}>
                          <h4 className={styles.rankTitle}>{studentSort === 'score' ? 'Top Students' : 'Students'}</h4>
                          {submitted.slice(0, 5).map((r: any, i: number) => (
                            <div key={r.id} className={styles.rankRow}>
                              <span className={styles.rankNum}>#{i + 1}</span>
                              <div className={styles.rankInfo}>
                                <span className={styles.rankName}>{r.student?.full_name || 'Unknown'}</span>
                                {studentSort === 'date' && getResultTimestamp(r) > Number.NEGATIVE_INFINITY && (
                                  <span className={styles.rankMeta}>{new Date(r.end_time || r.start_time || r.created_at).toLocaleDateString()}</span>
                                )}
                              </div>
                              <span className={styles.rankScore}>{r.score}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
