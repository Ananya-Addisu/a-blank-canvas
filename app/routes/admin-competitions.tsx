import { useState } from 'react';
import { Form, Link } from 'react-router';
import { Plus, Calendar, Clock, Users, Edit, Eye, Trash2, Trophy, BookOpen } from 'lucide-react';
import type { Route } from './+types/admin-competitions';
import styles from './admin-competitions.module.css';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Switch } from '~/components/ui/switch/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '~/components/ui/dialog/dialog';
import { Card, CardContent } from '~/components/ui/card/card';
import { Badge } from '~/components/ui/badge/badge';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';
import { ETHIOPIAN_TIMEZONE, formatEthiopianDate, formatEthiopianTime } from '~/utils/ethiopian-time';



export async function clientLoader() {
  const [compsRes, settingsRes, coursesRes] = await Promise.all([
    supabase.from('competitions').select('*').order('date', { ascending: false }),
    supabase.from('app_settings').select('setting_value').eq('setting_key', 'enable_competitions').single(),
    supabase.from('courses').select('id, name').order('name'),
  ]);
  return { competitions: compsRes.data || [], competitionsEnabled: settingsRes.data?.setting_value !== 'false', courses: coursesRes.data || [] };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  if (intent === 'create' || intent === 'update') {
    const d: any = {
      title: formData.get('title'), description: formData.get('description'),
      date: formData.get('date'), time: formData.get('time'),
      duration: Number(formData.get('duration')), max_participants: Number(formData.get('maxParticipants')),
      is_published: formData.get('isPublished') === 'true',
      gated_course_id: formData.get('gatedCourseId') === 'none' ? null : formData.get('gatedCourseId'),
    };
    if (intent === 'update') { await supabase.from('competitions').update(d).eq('id', formData.get('id')); }
    else { await supabase.from('competitions').insert(d); }
  } else if (intent === 'delete') {
    await supabase.from('competitions').delete().eq('id', formData.get('id'));
  } else if (intent === 'toggle_competitions') {
    await supabase.from('app_settings').update({ setting_value: formData.get('enabled') }).eq('setting_key', 'enable_competitions');
  } else if (intent === 'toggle_publish') {
    await supabase.from('competitions').update({ is_published: formData.get('published') === 'true' }).eq('id', formData.get('id'));
  } else if (intent === 'toggle_finished') {
    await supabase.from('competitions').update({ is_finished: formData.get('finished') === 'true' }).eq('id', formData.get('id'));
  }
  return { success: true };
}


export default function AdminCompetitions({ loaderData: rawLoaderData }: Route.ComponentProps) {
  const loaderData = rawLoaderData as any;
  const [enabled, setEnabled] = useState(loaderData.competitionsEnabled);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<any>(null);
  const [viewingRegistrations, setViewingRegistrations] = useState<any>(null);
  const [viewingResults, setViewingResults] = useState<any>(null);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    const form = new FormData();
    form.set('intent', 'toggle_competitions');
    form.set('enabled', checked.toString());
    fetch('', { method: 'POST', body: form });
  };

  const handleEdit = (competition: any) => {
    setEditingCompetition(competition);
    setIsDialogOpen(true);
  };

  const handleViewRegistrations = async (competition: any) => {
    const { data } = await supabase
      .from('competition_participants')
      .select('*, student:students(id, full_name, phone_number)')
      .eq('competition_id', competition.id);
    setViewingRegistrations({ ...competition, registrations: data || [] });
  };

  const handleViewResults = async (competition: any) => {
    const { data } = await supabase
      .from('student_competitions')
      .select('*, student:students(id, full_name, phone_number)')
      .eq('competition_id', competition.id)
      .order('score', { ascending: false });
    setViewingResults({ ...competition, results: data || [] });
  };

  const handleTogglePublish = (comp: any) => {
    const form = new FormData();
    form.set('intent', 'toggle_publish');
    form.set('id', comp.id);
    form.set('published', (!comp.is_published).toString());
    fetch('', { method: 'POST', body: form }).then(() => window.location.reload());
  };

  const handleToggleFinished = (comp: any) => {
    const form = new FormData();
    form.set('intent', 'toggle_finished');
    form.set('id', comp.id);
    form.set('finished', (!comp.is_finished).toString());
    fetch('', { method: 'POST', body: form }).then(() => window.location.reload());
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'upcoming': return styles.upcomingBadge;
      case 'completed': return styles.completedBadge;
      default: return styles.upcomingBadge;
    }
  };

  const courses = (loaderData as any).courses || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Competitions Management</h1>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setEditingCompetition(null);
      }}>
        <DialogTrigger asChild>
          <Button className={styles.createButton}>
            <Plus size={20} />
            Create Competition
          </Button>
        </DialogTrigger>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <Trophy size={28} />
            </div>
            <DialogTitle className={styles.dialogTitle}>
              {editingCompetition ? 'Edit Competition' : 'Create New Competition'}
            </DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              Configure the competition details for students.
            </DialogDescription>
          </DialogHeader>
          <Form method="post" onSubmit={() => setIsDialogOpen(false)}>
            <input type="hidden" name="intent" value={editingCompetition ? 'update' : 'create'} />
            {editingCompetition && <input type="hidden" name="id" value={editingCompetition.id} />}
            
            <div className={styles.modalBody}>
              <div className={styles.formField}>
                <Label htmlFor="title" className={styles.formLabel}>Competition Title</Label>
                <Input 
                  id="title" name="title" placeholder="Enter competition title" required 
                  defaultValue={editingCompetition?.title}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formField}>
                <Label htmlFor="description" className={styles.formLabel}>Description</Label>
                <Textarea
                  id="description" name="description" placeholder="Enter competition description" required rows={4}
                  defaultValue={editingCompetition?.description}
                  className={styles.formTextarea}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <Label htmlFor="date" className={styles.formLabel}>Date</Label>
                  <Input id="date" name="date" type="date" required defaultValue={editingCompetition?.date} className={styles.formInput} />
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="time" className={styles.formLabel}>Time</Label>
                  <Input id="time" name="time" type="time" required defaultValue={editingCompetition?.time} className={styles.formInput} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <Label htmlFor="duration" className={styles.formLabel}>Duration (minutes)</Label>
                  <Input id="duration" name="duration" type="number" placeholder="30" required defaultValue={editingCompetition?.duration} className={styles.formInput} />
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="maxParticipants" className={styles.formLabel}>Max Participants</Label>
                  <Input id="maxParticipants" name="maxParticipants" type="number" placeholder="100" required defaultValue={editingCompetition?.max_participants} className={styles.formInput} />
                </div>
              </div>

              <div className={styles.formField}>
                <Label className={styles.formLabel}>Gated Course (optional)</Label>
                <select name="gatedCourseId" className={styles.formInput} defaultValue={editingCompetition?.gated_course_id || 'none'}>
                  <option value="none">No gating - open to all</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formField}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" name="isPublished" value="true" defaultChecked={editingCompetition?.is_published || false} />
                  Publish immediately (visible to students)
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className={styles.cancelButton}>
                Cancel
              </Button>
              <Button type="submit" className={styles.addButton}>
                {editingCompetition ? 'Update' : 'Create'} Competition
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Registrations Dialog */}
      <Dialog open={!!viewingRegistrations} onOpenChange={(open) => !open && setViewingRegistrations(null)}>
        <DialogContent className={styles.registrationsDialog}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}><Users size={28} /></div>
            <DialogTitle className={styles.dialogTitle}>Registrations</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              Participants for {viewingRegistrations?.title}
            </DialogDescription>
          </DialogHeader>
          <div className={styles.registrationsList}>
            {!viewingRegistrations?.registrations || viewingRegistrations.registrations.length === 0 ? (
              <div className={styles.emptyRegistrations}>
                <Users size={48} style={{ color: 'var(--color-neutral-8)' }} />
                <p className={styles.emptyText}>No registrations yet</p>
              </div>
            ) : (
              viewingRegistrations.registrations.map((reg: any) => (
                <div key={reg.id} className={styles.registrationItem}>
                  <div className={styles.registrationAvatar}>
                    {reg.student?.full_name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className={styles.registrationInfo}>
                    <p className={styles.studentName}>{reg.student?.full_name || 'Unknown Student'}</p>
                    <p className={styles.studentPhone}>{reg.student?.phone_number || 'N/A'}</p>
                  </div>
                  <Badge variant={reg.status === 'confirmed' ? 'default' : 'secondary'} className={styles.statusBadge}>
                    {reg.status || 'Registered'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={!!viewingResults} onOpenChange={(open) => !open && setViewingResults(null)}>
        <DialogContent className={styles.registrationsDialog}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}><Trophy size={28} /></div>
            <DialogTitle className={styles.dialogTitle}>Results</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              Scores for {viewingResults?.title}
            </DialogDescription>
          </DialogHeader>
          <div className={styles.registrationsList}>
            {!viewingResults?.results || viewingResults.results.length === 0 ? (
              <div className={styles.emptyRegistrations}>
                <Trophy size={48} style={{ color: 'var(--color-neutral-8)' }} />
                <p className={styles.emptyText}>No results yet</p>
              </div>
            ) : (
              viewingResults.results.map((r: any, i: number) => (
                <div key={r.id} className={styles.registrationItem}>
                  <div className={styles.registrationAvatar}>#{i + 1}</div>
                  <div className={styles.registrationInfo}>
                    <p className={styles.studentName}>{r.student?.full_name || 'Unknown'}</p>
                    <p className={styles.studentPhone}>
                      Status: {r.status} | Start: {r.start_time ? new Date(r.start_time).toLocaleTimeString('en-US', { timeZone: ETHIOPIAN_TIMEZONE, hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      {r.end_time ? ` | End: ${new Date(r.end_time).toLocaleTimeString('en-US', { timeZone: ETHIOPIAN_TIMEZONE, hour: '2-digit', minute: '2-digit' })}` : ''}
                    </p>
                  </div>
                  <Badge variant={r.status === 'disqualified' ? 'destructive' : 'default'}>
                    {r.status === 'disqualified' ? 'DQ' : `${r.score}%`}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Card className={styles.featureCard}>
        <CardContent className={styles.featureContent}>
          <div className={styles.featureInfo}>
            <h3 className={styles.featureTitle}>Competitions Feature</h3>
            <p className={styles.featureDesc}>Enable or disable competitions for all students</p>
          </div>
          <Switch checked={enabled} onCheckedChange={handleToggle} />
        </CardContent>
      </Card>

      {enabled && (
        <div className={styles.statusIndicator}>
          <span className={styles.statusDot}></span>
          <span className={styles.statusText}>Competitions are currently enabled</span>
        </div>
      )}

      <div className={styles.competitionsList}>
        {loaderData.competitions.map((competition: any) => {
          const status = competition.status || 'Upcoming';
          const courseName = courses.find((c: any) => c.id === competition.gated_course_id)?.name;
          
          return (
            <Card key={competition.id} className={styles.competitionCard}>
              <CardContent className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardBadges}>
                    <Badge className={getStatusBadgeClass(status)}>{status}</Badge>
                    {competition.is_published && <Badge className={styles.publishedBadge}>Published</Badge>}
                    {competition.is_finished && <Badge className={styles.completedBadge}>Practice Mode</Badge>}
                  </div>
                </div>
                
                <h3 className={styles.cardTitle}>{competition.title}</h3>
                <p className={styles.cardDescription}>{competition.description}</p>
                
                {courseName && (
                  <div className={styles.gatedCourse}>
                    <BookOpen size={14} /> Requires: {courseName}
                  </div>
                )}
                
                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <Calendar size={16} />
                    <span>{competition.date ? formatEthiopianDate(competition.date, competition.time, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Clock size={16} />
                    <span>{competition.date ? formatEthiopianTime(competition.date, competition.time) : 'TBD'}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Users size={16} />
                    <span>{competition.registered_count || 0} registered</span>
                  </div>
                </div>
                
                <div className={styles.cardActions}>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(competition)} className={styles.actionBtn}>Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => handleTogglePublish(competition)} className={styles.actionBtn}>
                    {competition.is_published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleViewRegistrations(competition)} className={styles.actionBtn}>
                    Registrations
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleViewResults(competition)} className={styles.actionBtn}>
                    Results
                  </Button>
                  <Link to={`/admin/competitions/${competition.id}/questions`} className={styles.actionLink}>
                    <Button variant="outline" size="sm" className={styles.actionBtn}>Questions</Button>
                  </Link>
                  <Form method="post" style={{ display: 'inline' }}>
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={competition.id} />
                    <Button variant="outline" size="sm" type="submit" className={styles.deleteBtn}>Delete</Button>
                  </Form>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
