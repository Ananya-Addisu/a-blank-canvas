import { useState, useEffect } from 'react';
import { useRevalidator, useFetcher } from 'react-router';
import { Plus, Video, FileText, Check, X, Search, GraduationCap, Pencil, Smartphone } from 'lucide-react';
import styles from './admin-teachers.module.css';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '~/components/ui/dialog/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card/card';
import type { Route } from './+types/admin-teachers';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';



export async function clientLoader() {
  const { getAllTeachers } = await import('~/services/admin.client');
  const allTeachers = await getAllTeachers();
  const teachers = allTeachers.filter((t: any) => t.is_approved);
  const pendingTeachers = allTeachers.filter((t: any) => !t.is_approved);
  const { data: pendingUploads } = await supabase.from('lessons').select('*, chapter:chapters(title, course:courses(id, name, teacher:teachers(id, full_name)))').eq('approval_status', 'pending').order('created_at', { ascending: false });
  const deviceMap: Record<string, any> = {};
  const bindingMap: Record<string, any> = {};
  for (const t of allTeachers) {
    const activeDevice = t.trusted_device?.find((d: any) => !d.revoked);
    if (activeDevice) deviceMap[t.id] = activeDevice;
  }
  const { data: bindings } = await supabase.from('device_bindings').select('*').eq('user_type', 'teacher');
  for (const b of (bindings || [])) { bindingMap[b.user_id] = b; }
  return { teachers, pendingTeachers, pendingUploads: pendingUploads || [], deviceMap, bindingMap };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  if (intent === 'add') {
    const { error } = await supabase.from('teachers').insert({ full_name: formData.get('name'), phone_number: formData.get('phone'), specialization: formData.get('subject'), experience: formData.get('experience'), qualifications: formData.get('qualifications'), pin_hash: formData.get('pin'), is_approved: true });
    if (error) return { success: false, error: error.message };
  } else if (intent === 'edit-teacher') {
    const up: any = { full_name: formData.get('editName'), phone_number: formData.get('editPhone'), specialization: formData.get('editSpecialization'), experience: formData.get('editExperience') };
    const pin = formData.get('editPin') as string;
    if (pin) up.pin_hash = pin;
    await supabase.from('teachers').update(up).eq('id', formData.get('teacherId'));
  } else if (intent === 'approve-teacher') {
    await supabase.from('teachers').update({ is_approved: true }).eq('id', formData.get('teacherId'));
  } else if (intent === 'reject-teacher') {
    await supabase.from('teachers').delete().eq('id', formData.get('teacherId'));
  } else if (intent === 'approve-upload') {
    await supabase.from('lessons').update({ approval_status: 'approved' }).eq('id', formData.get('uploadId'));
  } else if (intent === 'reject-upload') {
    await supabase.from('lessons').update({ approval_status: 'rejected' }).eq('id', formData.get('uploadId'));
  } else if (intent === 'reset-device') {
    const teacherId = formData.get('teacherId') as string;
    await supabase.from('trusted_devices').update({ revoked: true }).eq('user_id', teacherId).eq('user_type', 'teacher');
    await supabase.from('device_bindings').delete().eq('user_id', teacherId).eq('user_type', 'teacher');
  }
  return { success: true };
}


export default function AdminTeachers({ loaderData }: Route.ComponentProps) {
  const { teachers, pendingTeachers, pendingUploads, deviceMap, bindingMap } = loaderData as any;
  const revalidator = useRevalidator();
  const fetcher = useFetcher();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [editTeacher, setEditTeacher] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [teacherToReject, setTeacherToReject] = useState<any>(null);
  const [uploadToReject, setUploadToReject] = useState<any>(null);
  const [teacherToResetDevice, setTeacherToResetDevice] = useState<any>(null);

  // Close dialogs on successful fetcher response
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data && (fetcher.data as any).success) {
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditTeacher(null);
      setTeacherToResetDevice(null);
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data]);

  const filteredTeachers = teachers?.filter((teacher: any) => {
    const matchesSearch = 
      (teacher.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (teacher.phone_number || '').includes(search) ||
      (teacher.specialization?.toLowerCase() || '').includes(search.toLowerCase());
    
    const matchesStatus = activeTab === 'all' || 
                         (activeTab === 'active' && teacher.is_approved) ||
                         (activeTab === 'pending' && !teacher.is_approved);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    fetcher.submit(new FormData(form), { method: 'post' });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    fetcher.submit(new FormData(form), { method: 'post' });
  };

  const openEditDialog = (teacher: any) => {
    setEditTeacher(teacher);
    setIsEditDialogOpen(true);
  };

  const handleApproveTeacher = (teacherId: string) => {
    const form = document.createElement('form');
    form.method = 'post';
    form.innerHTML = `
      <input type="hidden" name="intent" value="approve-teacher" />
      <input type="hidden" name="teacherId" value="${teacherId}" />
    `;
    document.body.appendChild(form);
    form.submit();
    setTimeout(() => revalidator.revalidate(), 100);
  };

  const handleApproveUpload = (uploadId: string) => {
    const form = document.createElement('form');
    form.method = 'post';
    form.innerHTML = `
      <input type="hidden" name="intent" value="approve-upload" />
      <input type="hidden" name="uploadId" value="${uploadId}" />
    `;
    document.body.appendChild(form);
    form.submit();
    setTimeout(() => revalidator.revalidate(), 100);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Teachers Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className={styles.addButton}>
              <Plus size={20} />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className={styles.dialogContent}>
            <DialogHeader className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <GraduationCap size={28} />
              </div>
              <DialogTitle className={styles.modalTitle}>Add New Teacher</DialogTitle>
              <DialogDescription className={styles.modalDescription}>
                Create a new teacher account manually.
              </DialogDescription>
            </DialogHeader>
            <form method="post" onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <input type="hidden" name="intent" value="add" />
              <DialogBody>
                <div style={{ padding: 'var(--space-6)' }}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" placeholder="Enter teacher's full name" required />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" placeholder="Enter teacher's phone number" required />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" name="subject" placeholder="e.g., Mathematics" required />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="experience">Experience (Years)</Label>
                      <Input id="experience" name="experience" type="number" placeholder="Enter years of experience" required />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="qualifications">Qualifications</Label>
                      <Input id="qualifications" name="qualifications" placeholder="e.g., MSc in Mathematics" required />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="pin">Password</Label>
                      <Input id="pin" name="pin" type="password" placeholder="Enter password for teacher account" required />
                    </div>
                  </div>
                </div>
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className={styles.submitButton}>Add Teacher</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Teacher Approvals Section */}
      {pendingTeachers.length > 0 && (
        <div className={styles.pendingSection} style={{ marginBottom: '24px' }}>
          <h2 className={styles.pendingTitle}>
            Pending Teacher Approvals ({pendingTeachers.length})
          </h2>
          <div className={styles.pendingGrid}>
            {pendingTeachers.map((teacher: any) => {
              const initials = teacher.full_name
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase() || 'T';

              return (
                <div key={teacher.id} className={styles.pendingCard}>
                  <div className={styles.pendingCardHeader}>
                    <div className={styles.teacherAvatar}>{initials}</div>
                    <div className={styles.pendingCardInfo}>
                      <div className={styles.pendingCardName}>{teacher.full_name}</div>
                      <div className={styles.pendingCardPhone}>{teacher.phone_number}</div>
                    </div>
                  </div>
                    <div className={styles.pendingCardDetails}>
                    <div className={styles.pendingCardDetail}>
                      <span className={styles.pendingCardLabel}>Specialization:</span>
                      <span>{teacher.specialization || 'N/A'}</span>
                    </div>
                    <div className={styles.pendingCardDetail}>
                     <span className={styles.pendingCardLabel}>Experience:</span>
                      <span>{teacher.experience || 'N/A'}</span>
                    </div>
                    {teacher.credentials_url && (
                      <div className={styles.pendingCardDetail}>
                        <span className={styles.pendingCardLabel}>Credentials:</span>
                        <a href={teacher.credentials_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-9, #1a73e8)', textDecoration: 'underline', fontSize: '13px' }} onClick={(e) => e.stopPropagation()}>View Credentials</a>
                      </div>
                    )}
                    {teacher.intro_video_url && (
                      <div className={styles.pendingCardDetail}>
                        <span className={styles.pendingCardLabel}>Intro Video:</span>
                        <a href={teacher.intro_video_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-9, #1a73e8)', textDecoration: 'underline', fontSize: '13px' }} onClick={(e) => e.stopPropagation()}>Watch Video</a>
                      </div>
                    )}
                  </div>
                  <div className={styles.pendingCardActions}>
                    <Button
                      onClick={() => handleApproveTeacher(teacher.id)}
                      className={styles.approveButton}
                      size="sm"
                    >
                      <Check size={16} />
                      Approve
                    </Button>
                    <Button
                      onClick={() => setTeacherToReject(teacher)}
                      variant="outline"
                      className={styles.rejectButton}
                      size="sm"
                    >
                      <X size={16} />
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Upload Approvals Section */}
      {pendingUploads.length > 0 && (
        <Card className={styles.pendingCard} style={{ marginBottom: '24px' }}>
          <CardHeader>
            <div className={styles.pendingHeader}>
              <CardTitle>Pending Upload Approvals</CardTitle>
              <span className={styles.pendingBadge}>{pendingUploads.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className={styles.pendingList}>
              {pendingUploads.map((item: any) => {
                const teacherName = item.chapter?.course?.teacher?.full_name || 'Unknown Teacher';
                const courseName = item.chapter?.course?.name || 'Unknown Course';
                return (
                <div key={item.id} className={styles.pendingItem}>
                  <div className={styles.pendingIcon}>
                    {item.lesson_type === 'video' ? <Video size={24} /> : <FileText size={24} />}
                  </div>
                  <div className={styles.pendingInfo}>
                    <h4 className={styles.pendingTitle}>{item.title}</h4>
                    <p className={styles.pendingMeta}>
                      {teacherName} - {item.lesson_type} - {courseName}
                    </p>
                    <p className={styles.pendingDate}>
                      Uploaded: {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className={styles.pendingActions}>
                    <button 
                      className={styles.approveButton}
                      onClick={() => handleApproveUpload(item.id)}
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      className={styles.rejectButton}
                      onClick={() => setUploadToReject(item)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Teachers
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
          {pendingTeachers.length > 0 && <span className={styles.tabBadge}>{pendingTeachers.length}</span>}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'active' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
      </div>

      {/* Search bar for approved teachers */}
      <div className={styles.search}>
        <Search size={20} className={styles.searchIcon} />
        <Input
          type="text"
          placeholder="Search teachers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Approved Teachers Table */}
      <div className={styles.tableWrapper} style={{ marginTop: '20px' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Specialization</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  No teachers match your search
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher: any) => {
                const initials = teacher.full_name
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase() || 'T';

                return (
                  <tr key={teacher.id} style={{ cursor: 'pointer' }} onClick={() => openEditDialog(teacher)}>
                    <td>
                      <div className={styles.nameCell}>
                        <div className={styles.teacherAvatar}>{initials}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{teacher.full_name}</div>
                          <div style={{ fontSize: '13px', color: '#5f6368' }}>{teacher.phone_number}</div>
                        </div>
                      </div>
                    </td>
                    <td>{teacher.phone_number}</td>
                    <td>{teacher.specialization || 'N/A'}</td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: teacher.is_approved ? '#e8f5e9' : '#fff3e0',
                        color: teacher.is_approved ? '#2e7d32' : '#f57c00'
                      }}>
                        {teacher.is_approved ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openEditDialog(teacher); }}>
                        <Pencil size={14} />
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Teacher Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setEditTeacher(null); }}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <Pencil size={28} />
            </div>
            <DialogTitle className={styles.modalTitle}>Edit Teacher</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              Update teacher credentials. Leave password blank to keep current.
            </DialogDescription>
          </DialogHeader>
          {editTeacher && (
            <form method="post" onSubmit={handleEditSubmit} style={{ display: 'contents' }}>
              <input type="hidden" name="intent" value="edit-teacher" />
              <input type="hidden" name="teacherId" value={editTeacher.id} />
              <DialogBody>
                <div style={{ padding: 'var(--space-6)' }}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <Label htmlFor="editName">Full Name</Label>
                      <Input id="editName" name="editName" defaultValue={editTeacher.full_name} required />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="editPhone">Phone Number</Label>
                      <Input id="editPhone" name="editPhone" defaultValue={editTeacher.phone_number} required />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="editSpecialization">Specialization</Label>
                      <Input id="editSpecialization" name="editSpecialization" defaultValue={editTeacher.specialization || ''} />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="editExperience">Experience</Label>
                      <Input id="editExperience" name="editExperience" defaultValue={editTeacher.experience || ''} />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="editPin">New Password</Label>
                      <Input id="editPin" name="editPin" type="password" placeholder="Leave blank to keep current" />
                    </div>
                    {editTeacher.credentials_url && (
                      <div className={styles.formGroup}>
                        <Label>Credentials URL</Label>
                        <a href={editTeacher.credentials_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'var(--color-primary-3, #e8f0fe)', color: 'var(--color-primary-11, #1a73e8)', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>
                          <FileText size={14} />
                          View Credentials Document
                        </a>
                      </div>
                    )}
                    {editTeacher.intro_video_url && (
                      <div className={styles.formGroup}>
                        <Label>Intro Video URL</Label>
                        <a href={editTeacher.intro_video_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'var(--color-primary-3, #e8f0fe)', color: 'var(--color-primary-11, #1a73e8)', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>
                          <Video size={14} />
                          Watch Intro Video
                        </a>
                      </div>
                    )}
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <Label>Security & Session Info</Label>
                      <div style={{ 
                        padding: '12px', 
                        borderRadius: '8px', 
                        backgroundColor: 'hsl(var(--muted))', 
                        fontSize: '13px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        marginBottom: '8px'
                      }}>
                        {/* Last Logout */}
                        <div>
                          <strong>Last Logout:</strong>{' '}
                          {editTeacher.last_logout_at 
                            ? new Date(editTeacher.last_logout_at).toLocaleString() 
                            : <span style={{ color: 'var(--color-warning-11, #f57c00)' }}>⚠ No logout record found</span>}
                        </div>
                        {editTeacher.last_logout_at && (() => {
                          const diffMinutes = (Date.now() - new Date(editTeacher.last_logout_at).getTime()) / (1000 * 60);
                          return diffMinutes < 30
                            ? <div style={{ color: 'var(--color-success-11, #2e7d32)', fontSize: '12px' }}>✓ Logged out recently</div>
                            : <div style={{ color: 'var(--color-warning-11, #f57c00)', fontSize: '12px' }}>⚠ Not logged out recently. Ask to logout before resetting.</div>;
                        })()}

                        {/* Last Login (last_seen from trusted device) */}
                        <div>
                          <strong>Last Login:</strong>{' '}
                          {deviceMap[editTeacher.id]?.last_seen 
                            ? new Date(deviceMap[editTeacher.id].last_seen).toLocaleString() 
                            : 'N/A'}
                        </div>

                        {/* Device Binding Status */}
                        <div>
                          <strong>Device Bound:</strong>{' '}
                          {bindingMap[editTeacher.id] 
                            ? <span style={{ color: 'var(--color-success-11, #2e7d32)' }}>✓ Yes — {bindingMap[editTeacher.id].device_model} ({bindingMap[editTeacher.id].device_os})</span>
                            : <span style={{ color: 'hsl(var(--muted-foreground))' }}>No device bound</span>}
                        </div>

                        {/* Trusted Device */}
                        <div>
                          <strong>Trusted Device:</strong>{' '}
                          {deviceMap[editTeacher.id] 
                            ? <span>{deviceMap[editTeacher.id].device_name || 'Unknown'} — registered {new Date(deviceMap[editTeacher.id].created_at).toLocaleDateString()}</span>
                            : <span style={{ color: 'hsl(var(--muted-foreground))' }}>None</span>}
                        </div>
                      </div>
                    </div>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <Button
                        type="button"
                        variant="outline"
                        style={{ width: '100%', gap: '8px' }}
                        onClick={() => setTeacherToResetDevice(editTeacher)}
                      >
                        <Smartphone size={16} />
                        Reset Device Binding
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditTeacher(null); }}>
                  Cancel
                </Button>
                <Button type="submit" className={styles.submitButton}>Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!teacherToReject} onOpenChange={(open) => !open && setTeacherToReject(null)}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <X size={28} />
            </div>
            <DialogTitle className={styles.modalTitle}>Reject Teacher</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              Delete {teacherToReject?.full_name}&apos;s account? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTeacherToReject(null)}>
              Cancel
            </Button>
            <form method="post">
              <input type="hidden" name="intent" value="reject-teacher" />
              <input type="hidden" name="teacherId" value={teacherToReject?.id || ''} />
              <Button type="submit" variant="destructive">
                Reject Teacher
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!uploadToReject} onOpenChange={(open) => !open && setUploadToReject(null)}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <X size={28} />
            </div>
            <DialogTitle className={styles.modalTitle}>Reject Upload</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              Reject the upload "{uploadToReject?.title}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUploadToReject(null)}>
              Cancel
            </Button>
            <form method="post">
              <input type="hidden" name="intent" value="reject-upload" />
              <input type="hidden" name="uploadId" value={uploadToReject?.id || ''} />
              <Button type="submit" variant="destructive">
                Reject Upload
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!teacherToResetDevice} onOpenChange={(open) => !open && setTeacherToResetDevice(null)}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <Smartphone size={28} />
            </div>
            <DialogTitle className={styles.modalTitle}>Reset Device Binding</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              Reset {teacherToResetDevice?.full_name}&apos;s device binding so they can log in on a new device?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTeacherToResetDevice(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={fetcher.state !== 'idle'}
              onClick={() => {
                if (!teacherToResetDevice) return;
                const fd = new FormData();
                fd.set('intent', 'reset-device');
                fd.set('teacherId', teacherToResetDevice.id);
                fetcher.submit(fd, { method: 'post' });
              }}
            >
              {fetcher.state !== 'idle' ? 'Resetting...' : 'Reset Device'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
