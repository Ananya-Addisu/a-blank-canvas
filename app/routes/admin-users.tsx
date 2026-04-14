import { useState, useEffect } from 'react';
import { useRevalidator, useFetcher } from 'react-router';
import { Plus, Search, Check, X, UserPlus, Pencil, LogOut, Clock, Shield, MonitorSmartphone } from 'lucide-react';
import styles from './admin-users.module.css';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
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
import { Label } from '~/components/ui/label/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select/select';
import type { Route } from './+types/admin-users';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';



export async function clientLoader() {
  const { getAllStudents, getPendingStudents } = await import('~/services/admin.client');
  const students = await getAllStudents();
  const pendingStudents = await getPendingStudents();
  const deviceMap: Record<string, any> = {};
  for (const s of students) {
    const activeDevice = s.trusted_device?.find((d: any) => !d.revoked);
    if (activeDevice) deviceMap[s.id] = activeDevice;
  }
  return { students, pendingStudents, deviceMap };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  if (intent === 'add') {
    const { error } = await supabase.from('students').insert({ full_name: formData.get('name'), phone_number: formData.get('phone'), institution: formData.get('institution'), academic_year: formData.get('academicLevel'), pin_hash: formData.get('pin'), is_approved: true });
    if (error) return { success: false, error: error.message };
  } else if (intent === 'edit') {
    const up: any = { full_name: formData.get('editName'), phone_number: formData.get('editPhone'), institution: formData.get('editInstitution'), academic_year: formData.get('editAcademicYear') };
    const pin = formData.get('editPin') as string;
    if (pin) up.pin_hash = pin;
    await supabase.from('students').update(up).eq('id', formData.get('studentId'));
  } else if (intent === 'approve') {
    await supabase.from('students').update({ is_approved: true }).eq('id', formData.get('studentId'));
  } else if (intent === 'reject') {
    await supabase.from('students').delete().eq('id', formData.get('studentId'));
  } else if (intent === 'force-logout-reset') {
    const studentId = formData.get('studentId') as string;
    await supabase.from('students').update({ force_logout: true, last_logout_at: new Date().toISOString() }).eq('id', studentId);
    await supabase.from('trusted_devices').update({ revoked: true }).eq('user_id', studentId).eq('user_type', 'student');
    await supabase.from('device_bindings').delete().eq('user_id', studentId).eq('user_type', 'student');
  }
  return { success: true };
}


export default function AdminUsers({ loaderData }: Route.ComponentProps) {
  const { students, pendingStudents, deviceMap } = loaderData as any;
  const revalidator = useRevalidator();
  const fetcher = useFetcher();
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterInstitution, setFilterInstitution] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editStudent, setEditStudent] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [studentToReject, setStudentToReject] = useState<any>(null);
  const [studentToForceLogout, setStudentToForceLogout] = useState<any>(null);

  // Fix #1: Add error feedback for admin add/edit user operations
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if ((fetcher.data as any).success) {
        setIsAddDialogOpen(false);
        setIsEditDialogOpen(false);
        setEditStudent(null);
        setStudentToForceLogout(null);
        setActionError(null);
        revalidator.revalidate();
      } else if ((fetcher.data as any).error) {
        setActionError((fetcher.data as any).error);
      }
    }
  }, [fetcher.state, fetcher.data]);

  const filteredUsers = students?.filter((user: any) => {
    const matchesSearch = 
      (user.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (user.phone_number || '').includes(search);
    
    const userInstitution = (user.institution || user.university || '').toLowerCase();
    const matchesInstitution = filterInstitution === 'all' || userInstitution.includes(filterInstitution.toLowerCase());
    
    const userYear = (user.academic_year || user.academic_level || '').toString();
    const matchesYear = filterYear === 'all' || userYear === filterYear;
    
    const matchesStatus = activeTab === 'all' || 
                         (activeTab === 'active' && user.is_approved) ||
                         (activeTab === 'pending' && !user.is_approved);
    
    return matchesSearch && matchesInstitution && matchesYear && matchesStatus;
  }) || [];

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const allInstitutions = [
    'College',
    'High School',
    'AA SCI. & TECH UNIVERSITY',
    'Adama Science & Technology',
    'Addis Ababa University',
    'Adigrat University',
    'Ambo University',
    'Arba Minch University',
    'Arsi University',
    'Asossa University',
    'Axum University',
    'Bahir Dar University',
    'Bonga University',
    'Bule Hora University',
    'Debark University',
    'Debrebirhan University',
    'Debremarkos University',
    'Debretabor University',
    'Dembi Dolo University',
    'Dilla University',
    'Dire Dawa University',
    'Gambella University',
    'Gondar University',
    'Haramaya University',
    'Hawassa University',
    'Injibara University',
    'Jigjiga University',
    'Jimma University',
    'Jinka University',
    'Kebri Dehar University',
    'Kotebe Metropolitan University',
    'Meda Welabu University',
    'Mekelle University',
    'Mekidela Amba University',
    'Metu University',
    'Mizan-Tepi University',
    'Oda Bultum University',
    'Raya University',
    'Selale University',
    'Semera University',
    'Wachamo University',
    'Welketie University',
    'Werabe University',
    'Wolayita Sodo University',
    'Woldiya University',
    'Wollega University',
    'Wollo University',
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetcher.submit(new FormData(e.currentTarget), { method: 'post' });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetcher.submit(new FormData(e.currentTarget), { method: 'post' });
  };

  const openEditDialog = (student: any) => {
    setEditStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleApprove = (studentId: string) => {
    const form = document.createElement('form');
    form.method = 'post';
    form.innerHTML = `
      <input type="hidden" name="intent" value="approve" />
      <input type="hidden" name="studentId" value="${studentId}" />
    `;
    document.body.appendChild(form);
    form.submit();
    setTimeout(() => revalidator.revalidate(), 100);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Users Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className={styles.addButton}>
              <Plus size={20} />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className={styles.dialogContent}>
            <DialogHeader className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <UserPlus size={28} />
              </div>
              <DialogTitle className={styles.modalTitle}>Add New User</DialogTitle>
              <DialogDescription className={styles.modalDescription}>
                Create a new student account manually.
              </DialogDescription>
            </DialogHeader>
            <form method="post" onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <input type="hidden" name="intent" value="add" />
              <DialogBody>
                <div style={{ padding: 'var(--space-6)' }}>
                  {/* Fix #1: Show error feedback when adding user fails */}
                  {actionError && (
                    <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#dc2626', fontSize: '14px', fontWeight: 500 }}>
                      Error: {actionError}
                    </div>
                  )}
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" placeholder="Enter user's full name" required />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" placeholder="Enter user's phone number" required />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="institution">Institution</Label>
                      <Select name="institution" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Institution" />
                        </SelectTrigger>
                        <SelectContent>
                          {allInstitutions.map((inst) => (
                            <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="academicLevel">Academic Year</Label>
                      <Select name="academicLevel" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Academic Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Year 1</SelectItem>
                          <SelectItem value="2">Year 2</SelectItem>
                          <SelectItem value="3">Year 3</SelectItem>
                          <SelectItem value="4">Year 4</SelectItem>
                          <SelectItem value="5">Year 5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="pin">Password</Label>
                      <Input id="pin" name="pin" type="password" placeholder="Enter password for user account" required />
                    </div>
                  </div>
                </div>
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className={styles.submitButton}>Add User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Approvals Section */}
      {pendingStudents.length > 0 && (
        <div className={styles.pendingSection}>
          <h2 className={styles.pendingTitle}>
            Pending Approvals ({pendingStudents.length})
          </h2>
          <div className={styles.pendingGrid}>
            {pendingStudents.map((student: any) => {
              const initials = student.full_name
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase() || 'U';

              return (
                <div key={student.id} className={styles.pendingCard}>
                  <div className={styles.pendingCardHeader}>
                    <div className={styles.userAvatar}>{initials}</div>
                    <div className={styles.pendingCardInfo}>
                      <div className={styles.pendingCardName}>{student.full_name}</div>
                      <div className={styles.pendingCardPhone}>{student.phone_number}</div>
                    </div>
                  </div>
                  <div className={styles.pendingCardDetails}>
                    <div className={styles.pendingCardDetail}>
                      <span className={styles.pendingCardLabel}>Institution:</span>
                      <span>{student.institution || 'N/A'}</span>
                    </div>
                    <div className={styles.pendingCardDetail}>
                      <span className={styles.pendingCardLabel}>Academic Year:</span>
                      <span>{student.academic_year || 'N/A'}</span>
                    </div>
                    <div className={styles.pendingCardDetail}>
                      <span className={styles.pendingCardLabel}>Stream:</span>
                      <span>{student.stream || 'N/A'}</span>
                    </div>
                    <div className={styles.pendingCardDetail}>
                      <span className={styles.pendingCardLabel}>Gender:</span>
                      <span>{student.gender || 'N/A'}</span>
                    </div>
                  </div>
                  <div className={styles.pendingCardActions}>
                    <Button
                      onClick={() => handleApprove(student.id)}
                      className={styles.approveButton}
                      size="sm"
                    >
                      <Check size={16} />
                      Approve
                    </Button>
                    <Button
                      onClick={() => setStudentToReject(student)}
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

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Students
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
            {pendingStudents.length > 0 && <span className={styles.tabBadge}>{pendingStudents.length}</span>}
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'active' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
        </div>

        <div className={styles.filterRow}>
          <Select value={filterInstitution} onValueChange={setFilterInstitution}>
            <SelectTrigger className={styles.filterSelect}>
              <SelectValue placeholder="All Institutions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Institutions</SelectItem>
              {allInstitutions.map((inst) => (
                <SelectItem key={inst} value={inst}>{inst}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className={styles.filterSelect}>
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="1">Year 1</SelectItem>
              <SelectItem value="2">Year 2</SelectItem>
              <SelectItem value="3">Year 3</SelectItem>
              <SelectItem value="4">Year 4</SelectItem>
              <SelectItem value="5">Year 5</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className={styles.filterSelect}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={styles.search}>
        <Search size={20} className={styles.searchIcon} />
        <Input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableWrapper} style={{ marginTop: '20px' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Institution</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  No students match your search
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user: any) => {
              const initials = user.full_name
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase() || 'U';

              return (
                <tr key={user.id} style={{ cursor: 'pointer' }} onClick={() => openEditDialog(user)}>
                  <td>
                    <div className={styles.nameCell}>
                      <div className={styles.userAvatar}>{initials}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.full_name}</div>
                        <div style={{ fontSize: '13px', color: '#5f6368' }}>{user.phone_number}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.phone_number}</td>
                  <td>{user.university || user.institution || 'N/A'}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: user.is_approved ? '#e8f5e9' : '#fff3e0',
                      color: user.is_approved ? '#2e7d32' : '#f57c00'
                    }}>
                      {user.is_approved ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openEditDialog(user); }}>
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

        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div className={styles.paginationButtons}>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              1
            </button>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(2)}
              disabled={totalPages < 2}
            >
              2
            </button>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(3)}
              disabled={totalPages < 3}
            >
              3
            </button>
            <span className={styles.pageButton} style={{ border: 'none', cursor: 'default' }}>...</span>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              {totalPages}
            </button>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setEditStudent(null); }}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <Pencil size={28} />
            </div>
            <DialogTitle className={styles.modalTitle}>Edit Student</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              Update student credentials. Leave password blank to keep current.
            </DialogDescription>
          </DialogHeader>
          {editStudent && (
            <form method="post" onSubmit={handleEditSubmit} style={{ display: 'contents' }}>
              <input type="hidden" name="intent" value="edit" />
              <input type="hidden" name="studentId" value={editStudent.id} />
              <DialogBody>
                <div style={{ padding: 'var(--space-6)' }}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <Label htmlFor="editName">Full Name</Label>
                      <Input id="editName" name="editName" defaultValue={editStudent.full_name} required />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="editPhone">Phone Number</Label>
                      <Input id="editPhone" name="editPhone" defaultValue={editStudent.phone_number} required />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="editInstitution">Institution</Label>
                      <Select name="editInstitution" defaultValue={editStudent.institution || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Institution" />
                        </SelectTrigger>
                        <SelectContent>
                          {allInstitutions.map((inst) => (
                            <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="editAcademicYear">Academic Year</Label>
                      <Input id="editAcademicYear" name="editAcademicYear" defaultValue={editStudent.academic_year || ''} />
                    </div>
                    <div className={styles.formGroup}>
                      <Label htmlFor="editPin">New Password</Label>
                      <Input id="editPin" name="editPin" type="password" placeholder="Leave blank to keep current" />
                    </div>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <Label>Security & Session</Label>
                      <div style={{ 
                        padding: '16px', 
                        borderRadius: '12px', 
                        backgroundColor: 'var(--color-neutral-2)', 
                        border: '1px solid var(--color-neutral-4)',
                        fontSize: '13px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}>
                        {/* Logout Status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={15} style={{ color: 'var(--color-neutral-9)', flexShrink: 0 }} />
                          <span style={{ color: 'var(--color-neutral-10)' }}>Last Logout:</span>
                          <span style={{ fontWeight: 600 }}>
                            {editStudent.last_logout_at 
                              ? new Date(editStudent.last_logout_at).toLocaleString() 
                              : '—'}
                          </span>
                        </div>
                        {editStudent.last_logout_at ? (() => {
                          const diffMinutes = (Date.now() - new Date(editStudent.last_logout_at).getTime()) / (1000 * 60);
                          return (
                            <div style={{ 
                              padding: '6px 12px', 
                              borderRadius: '8px', 
                              fontSize: '12px',
                              fontWeight: 500,
                              backgroundColor: diffMinutes < 30 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: diffMinutes < 30 ? '#16a34a' : '#d97706',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}>
                              {diffMinutes < 30 ? '✓ Logged out recently' : '⚠ Not logged out recently — consider forcing logout before resetting device'}
                            </div>
                          );
                        })() : (
                          <div style={{ 
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#dc2626',
                          }}>
                            ⚠ No logout record found
                          </div>
                        )}

                        {/* Last Login */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Shield size={15} style={{ color: 'var(--color-neutral-9)', flexShrink: 0 }} />
                          <span style={{ color: 'var(--color-neutral-10)' }}>Last Login:</span>
                          <span style={{ fontWeight: 600 }}>
                            {deviceMap[editStudent.id]?.last_seen 
                              ? new Date(deviceMap[editStudent.id].last_seen).toLocaleString() 
                              : '—'}
                          </span>
                        </div>

                        {/* Bound Device */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MonitorSmartphone size={15} style={{ color: 'var(--color-neutral-9)', flexShrink: 0 }} />
                          <span style={{ color: 'var(--color-neutral-10)' }}>Bound Device:</span>
                          <span style={{ fontWeight: 600 }}>
                            {deviceMap[editStudent.id] 
                              ? `${deviceMap[editStudent.id].device_name || 'Unknown Device'} — since ${new Date(deviceMap[editStudent.id].created_at).toLocaleDateString()}`
                              : 'No device bound'}
                          </span>
                        </div>
                        {deviceMap[editStudent.id]?.user_agent && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '23px' }}>
                            <span style={{ color: 'var(--color-neutral-9)', fontSize: '12px', wordBreak: 'break-all' }}>
                              {deviceMap[editStudent.id].user_agent}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'row', gap: '12px' }}>
                      <Button
                        type="button"
                        variant="destructive"
                        style={{ flex: 1, gap: '8px' }}
                        onClick={() => setStudentToForceLogout(editStudent)}
                      >
                        <LogOut size={16} />
                        Force Logout & Reset Device
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditStudent(null); }}>
                  Cancel
                </Button>
                <Button type="submit" className={styles.submitButton}>Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!studentToReject} onOpenChange={(open) => !open && setStudentToReject(null)}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <X size={28} />
            </div>
            <DialogTitle className={styles.modalTitle}>Reject Student</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              Delete {studentToReject?.full_name}&apos;s account? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setStudentToReject(null)}>
              Cancel
            </Button>
            <form method="post">
              <input type="hidden" name="intent" value="reject" />
              <input type="hidden" name="studentId" value={studentToReject?.id || ''} />
              <Button type="submit" variant="destructive">
                Reject Student
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!studentToForceLogout} onOpenChange={(open) => !open && setStudentToForceLogout(null)}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <LogOut size={28} />
            </div>
            <DialogTitle className={styles.modalTitle}>Force Logout &amp; Reset Device</DialogTitle>
            <DialogDescription className={styles.modalDescription}>
              Immediately log out {studentToForceLogout?.full_name} and unbind their current device?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setStudentToForceLogout(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={fetcher.state !== 'idle'}
              onClick={() => {
                if (!studentToForceLogout) return;
                const fd = new FormData();
                fd.set('intent', 'force-logout-reset');
                fd.set('studentId', studentToForceLogout.id);
                fetcher.submit(fd, { method: 'post' });
              }}
            >
              {fetcher.state !== 'idle' ? 'Resetting...' : 'Confirm Reset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
