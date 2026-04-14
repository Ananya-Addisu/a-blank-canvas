import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeft, Trophy, Calendar, Users, Clock, Search, X, Lock } from "lucide-react";
import { Badge } from "~/components/ui/badge/badge";
import { Button } from "~/components/ui/button/button";
import { BottomNav } from "~/components/bottom-nav";
import { OfflineBanner } from "~/components/offline-banner";
import { getStudentAuth } from "~/lib/auth.client";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { getPublishedCompetitions, getStudentCompetitions, registerForCompetition, unregisterFromCompetition } from "~/services/competition.client";
import { getStudentEnrollments } from "~/services/enrollment.client";
import { setCacheData, getCacheData } from "~/utils/secure-cache";
import { NoConnectionScreen } from "~/components/no-connection-screen";
import { addMinutesToEthiopianDateTime, parseEthiopianDateTime, formatEthiopianDate } from "~/utils/ethiopian-time";
import { LoadingScreen } from "~/components/loading-screen";
import styles from "./competitions.module.css";

function getAccessibleCourseIds(enrollments: any[]) {
  const now = new Date().toISOString();
  const courseIds = new Set<string>();

  enrollments.forEach((enrollment: any) => {
    if (enrollment.status !== 'approved') return;
    if (enrollment.expires_at && enrollment.expires_at < now) return;

    if (enrollment.course_id) {
      courseIds.add(enrollment.course_id);
    }

    const bundleCourses = enrollment.bundle?.bundle_courses || [];
    bundleCourses.forEach((bundleCourse: any) => {
      if (bundleCourse.course_id) {
        courseIds.add(bundleCourse.course_id);
      }
    });
  });

  return Array.from(courseIds);
}

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

function getCompetitionTiming(comp: any) {
  const start = comp?.date ? parseEthiopianDateTime(comp.date, comp.time) : null;
  const end = comp?.date ? addMinutesToEthiopianDateTime(comp.date, comp.time, Number(comp.duration) || 60) : null;
  const now = Date.now();
  const hasStarted = Boolean(start && !Number.isNaN(start.getTime()) && start.getTime() <= now);
  const hasEndedByTime = Boolean(end && !Number.isNaN(end.getTime()) && end.getTime() <= now);
  // Active exam window: between start and end time
  const isActiveExam = hasStarted && !hasEndedByTime;
  // Practice mode: only after the exam time window has fully elapsed
  const isPracticeMode = hasEndedByTime || (Boolean(comp?.is_finished) && !isActiveExam);

  return {
    hasStarted,
    hasEnded: hasEndedByTime || isPracticeMode,
    isPracticeMode,
    isActiveExam,
  };
}

function CountdownTimer({ targetDate, targetTime }: { targetDate: string; targetTime?: string }) {
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = parseEthiopianDateTime(targetDate, targetTime).getTime() - Date.now();
      if (Number.isNaN(diff)) { setTimeStr('TBD'); return; }
      if (diff <= 0) { setTimeStr('Started'); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeStr(days > 0 ? `${days}d ${hours}h ${mins}m` : `${hours}h ${mins}m ${secs}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);
  return <span className={styles.countdown}>{timeStr}</span>;
}

export default function Competitions() {
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [accessibleCourseIds, setAccessibleCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<'offline' | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'registered' | 'past'>('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  useEffect(() => {
    const CACHE_KEY = 'competitions_data';
    const cached = getCacheData<any>(CACHE_KEY, 60 * 60 * 1000);
    let cancelled = false;

    const applyCachedData = (cachedData: any) => {
      setCompetitions(cachedData.competitions || []);
      setRegistrations(cachedData.registrations || []);
      setAccessibleCourseIds(cachedData.accessibleCourseIds || []);
      setStudentId(cachedData.studentId || '');
    };

    if (!isOnline) {
      if (cached) {
        applyCachedData(cached);
        setFetchError(null);
      } else {
        setFetchError('offline');
      }
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const student = await getStudentAuth();
        if (!student) { navigate('/login'); return; }
        if (cancelled) return;
        setStudentId(student.id);
        const [comps, regs, enrollments] = await Promise.all([
          getPublishedCompetitions(),
          getStudentCompetitions(student.id),
          getStudentEnrollments(student.id),
        ]);
        if (cancelled) return;
        setCompetitions(comps);
        setRegistrations(regs);
        const courseIds = getAccessibleCourseIds(enrollments);
        setAccessibleCourseIds(courseIds);
        setCacheData(CACHE_KEY, { competitions: comps, registrations: regs, accessibleCourseIds: courseIds, studentId: student.id });
        setFetchError(null);
        setLoading(false);
      } catch {
        if (cancelled) return;

        if (!isOnline) {
          if (cached) {
            applyCachedData(cached);
            setFetchError(null);
          } else {
            setFetchError('offline');
          }
        }
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOnline, navigate]);

  if (fetchError === 'offline') return <NoConnectionScreen />;
  if (loading) return <LoadingScreen />;

  const registeredIds = new Set(registrations.map((r: any) => r.competition_id));

  const filteredCompetitions = (() => {
    const filtered = competitions.filter((comp: any) => {
      const matchesSearch = !searchQuery || comp.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const { hasEnded } = getCompetitionTiming(comp);
      const matchesFilter = activeFilter === 'all' || (activeFilter === 'upcoming' && !hasEnded) || (activeFilter === 'registered' && registeredIds.has(comp.id)) || (activeFilter === 'past' && hasEnded);
      return matchesSearch && matchesFilter;
    });
    if (sortBy === 'name') {
      return [...filtered].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return sortCompetitionsDescending(filtered);
  })();

  const handleRegister = async (compId: string) => {
    setActionLoading(true);
    const result = await registerForCompetition(compId, studentId);
    if (result.success) {
      const regs = await getStudentCompetitions(studentId);
      setRegistrations(regs);
    }
    setActionLoading(false);
  };

  const handleUnregister = async (compId: string) => {
    setActionLoading(true);
    await unregisterFromCompetition(compId, studentId);
    const regs = await getStudentCompetitions(studentId);
    setRegistrations(regs);
    setActionLoading(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/home-page" className={styles.backButton}><ChevronLeft size={24} /></Link>
        <h1 className={styles.headerTitle}>Competitions</h1>
        <div style={{ width: 40 }} />
      </header>

      <OfflineBanner />
      <main className={styles.main}>
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input type="search" placeholder="Search competitions..." className={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {searchQuery && <button className={styles.clearSearch} onClick={() => setSearchQuery("")}><X size={16} /></button>}
          </div>
        </div>

        <div className={styles.filterBar}>
          {([{ key: 'all', label: 'All' }, { key: 'upcoming', label: 'Upcoming' }, { key: 'registered', label: 'Registered' }, { key: 'past', label: 'Past' }] as const).map((f) => (
            <button key={f.key} className={`${styles.filterChip} ${activeFilter === f.key ? styles.filterActive : ''}`} onClick={() => setActiveFilter(f.key)}>{f.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0', marginBottom: 'var(--space-4)' }}>
          <p className={styles.resultCount} style={{ margin: 0 }}>{filteredCompetitions.length} competition{filteredCompetitions.length !== 1 ? 's' : ''}</p>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className={`${styles.filterChip} ${sortBy === 'date' ? styles.filterActive : ''}`} onClick={() => setSortBy('date')} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>By Date</button>
            <button className={`${styles.filterChip} ${sortBy === 'name' ? styles.filterActive : ''}`} onClick={() => setSortBy('name')} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>By Name</button>
          </div>
        </div>

        {filteredCompetitions.length === 0 ? (
          <div className={styles.emptyState}><Trophy size={48} /><p>No competitions found.</p></div>
        ) : (
          <div className={styles.grid}>
            {filteredCompetitions.map((comp: any) => {
              const isRegistered = registeredIds.has(comp.id);
              const hasCourseAccess = !comp.gated_course_id || accessibleCourseIds.includes(comp.gated_course_id);
              const isGated = Boolean(comp.gated_course_id && !hasCourseAccess);
              const { hasStarted, hasEnded, isPracticeMode, isActiveExam } = getCompetitionTiming(comp);

              return (
                <div key={comp.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardIconArea}><Trophy size={24} className={styles.cardIcon} /></div>
                    <div className={styles.cardBadges}>
                      {isPracticeMode ? <Badge variant="secondary">Practice</Badge> : <Badge variant={hasEnded ? 'secondary' : 'default'}>{hasEnded ? 'Ended' : hasStarted ? 'Active' : 'Upcoming'}</Badge>}
                      {isRegistered && <Badge variant="outline" className={styles.registeredBadge}>Registered</Badge>}
                      {isGated && <Badge variant="outline" className={styles.lockedBadge}><Lock size={12} /> Locked</Badge>}
                    </div>
                  </div>
                  <div className={styles.content}>
                    <h3 className={styles.compTitle}>{comp.title}</h3>
                    <p className={styles.description}>{comp.description?.substring(0, 120)}{comp.description?.length > 120 ? '...' : ''}</p>
                    <div className={styles.meta}>
                      <div className={styles.metaItem}><Calendar size={14} /><span>{comp.date ? formatEthiopianDate(comp.date, comp.time, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}</span></div>
                      <div className={styles.metaItem}><Clock size={14} /><span>{comp.duration} min</span></div>
                      <div className={styles.metaItem}><Users size={14} /><span>{comp.participant_count || 0}/{comp.max_participants}</span></div>
                    </div>
                    {!hasStarted && !hasEnded && !isPracticeMode && comp.date && (
                      <div className={styles.countdownRow}><Clock size={14} /> Starts in: <CountdownTimer targetDate={comp.date} targetTime={comp.time} /></div>
                    )}
                    {isGated ? (
                      <div className={styles.gatedMessage}><Lock size={16} />You need to enroll in the required course to participate</div>
                    ) : isRegistered ? (
                      <div className={styles.actionRow}>
                        <Link to={`/competition-exam/${comp.id}`} className={styles.openLink}>
                          <Button className={styles.actionButton}>{isPracticeMode ? 'Practice' : hasEnded ? 'Practice' : 'Open Exam'}</Button>
                        </Link>
                      </div>
                    ) : !hasEnded && !isPracticeMode ? (
                      <Button type="button" className={styles.actionButton} disabled={actionLoading || comp.participant_count >= comp.max_participants} onClick={() => handleRegister(comp.id)}>
                        {comp.participant_count >= comp.max_participants ? 'Full' : 'Register Now'}
                      </Button>
                    ) : (hasEnded || isPracticeMode) && hasCourseAccess ? (
                      <Link to={`/competition-exam/${comp.id}`} className={styles.openLink}>
                        <Button className={styles.actionButton}>Practice Exam</Button>
                      </Link>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-9)', textAlign: 'center' }}>This competition has ended</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {registrations.length > 0 && (
          <div className={styles.historySection}>
            <h2 className={styles.sectionTitle}>Your History</h2>
            <div className={styles.historyList}>
              {registrations.map((reg: any) => {
                const comp = reg.competition;
                if (!comp) return null;
                return (
                  <div key={reg.id} className={styles.historyCard}>
                    <div className={styles.historyIcon}><Trophy size={20} /></div>
                    <div className={styles.historyInfo}>
                      <h4 className={styles.historyTitle}>{comp.title}</h4>
                      <div className={styles.historyMeta}>
                        <span>Score: {reg.score || 0}</span>
                        <span>Rank: #{reg.rank || '-'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
