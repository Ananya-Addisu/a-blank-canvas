import { useState } from 'react';
import { Form, useActionData, useNavigation, useFetcher, useRevalidator } from 'react-router';
import type { Route } from './+types/admin-send-notification';
import { Button } from '~/components/ui/button/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card/card';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select/select';
import { SearchableSelect } from '~/components/searchable-select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog/dialog';
import { Send, Users, GraduationCap, UserCog, Trash2, Bell, Clock } from 'lucide-react';

import styles from './admin-send-notification.module.css';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';



export async function clientLoader() {
  const [studentsRes, teachersRes, notifsRes] = await Promise.all([
    supabase.from('students').select('id, full_name, phone_number').eq('is_approved', true).order('full_name'),
    supabase.from('teachers').select('id, full_name, email').eq('is_approved', true).order('full_name'),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
  ]);
  return { students: studentsRes.data || [], teachers: teachersRes.data || [], recentNotifications: notifsRes.data || [] };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  if (intent === 'send') {
    const title = formData.get('title') as string;
    const message = formData.get('message') as string;
    const type = formData.get('type') as string;
    const recipientType = formData.get('recipientType') as string;
    const expiresAt = formData.get('expiresAt') as string || null;
    let userIds: string[] = [];
    let userType = 'student';
    if (recipientType === 'all_students') {
      const { data } = await supabase.from('students').select('id').eq('is_approved', true);
      userIds = (data || []).map((s: any) => s.id);
    } else if (recipientType === 'all_teachers') {
      const { data } = await supabase.from('teachers').select('id').eq('is_approved', true);
      userIds = (data || []).map((t: any) => t.id); userType = 'teacher';
    } else if (recipientType === 'all_users') {
      const { data: students } = await supabase.from('students').select('id').eq('is_approved', true);
      const { data: teachers } = await supabase.from('teachers').select('id').eq('is_approved', true);
      const notifs = [
        ...(students || []).map((s: any) => ({ user_id: s.id, user_type: 'student', title, message, type, expires_at: expiresAt })),
        ...(teachers || []).map((t: any) => ({ user_id: t.id, user_type: 'teacher', title, message, type, expires_at: expiresAt })),
      ];
      if (notifs.length > 0) await supabase.from('notifications').insert(notifs);
      return { success: `Sent to ${notifs.length} users` };
    } else if (recipientType === 'specific') {
      userIds = [formData.get('specificUserId') as string];
      userType = formData.get('specificUserType') as string || 'student';
    }
    if (userIds.length > 0) {
      const notifs = userIds.map(uid => ({ user_id: uid, user_type: userType, title, message, type, expires_at: expiresAt }));
      await supabase.from('notifications').insert(notifs);
    }
    return { success: `Sent to ${userIds.length} ${recipientType}` };
  } else if (intent === 'delete') {
    await supabase.from('notifications').delete().eq('id', formData.get('notificationId'));
  } else if (intent === 'delete_all') {
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } else if (intent === 'delete_expired') {
    await supabase.from('notifications').delete().lt('expires_at', new Date().toISOString());
  }
  return { success: true };
}


export default function AdminSendNotification({ loaderData }: Route.ComponentProps) {
  const { students, teachers, recentNotifications } = loaderData as any;
  const actionData = useActionData<typeof clientAction>() as any;
  const navigation = useNavigation();
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const [recipientType, setRecipientType] = useState('all_students');
  const [specificUserType, setSpecificUserType] = useState('student');
  const [specificUserId, setSpecificUserId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  // Group notifications by title for display
  const groupedNotifs = recentNotifications.reduce((acc: any, n: any) => {
    const key = `${n.title}__${n.type}__${n.created_at?.substring(0, 16)}`;
    if (!acc[key]) {
      acc[key] = { ...n, count: 1 };
    } else {
      acc[key].count++;
    }
    return acc;
  }, {} as Record<string, any>);
  const uniqueNotifs = Object.values(groupedNotifs) as any[];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Send Notification</h1>

      {actionData?.error && <div className={styles.error}>{actionData.error}</div>}
      {actionData?.success && <div className={styles.success}>{actionData.success}</div>}

      <Card className={styles.formCard}>
        <CardHeader>
          <CardTitle>Notification Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className={styles.form}>
            <input type="hidden" name="intent" value="send" />
            <div className={styles.formGroup}>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Enter notification title" required />
            </div>
            <div className={styles.formGroup}>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" placeholder="Enter notification message" rows={4} required />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <div className={styles.formGroup} style={{ flex: 1, minWidth: '200px' }}>
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue="info" required>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={styles.formGroup} style={{ flex: 1, minWidth: '200px' }}>
                <Label htmlFor="expiresAt">Expires At (optional)</Label>
                <Input id="expiresAt" name="expiresAt" type="datetime-local" />
              </div>
            </div>
            <div className={styles.formGroup}>
              <Label htmlFor="recipientType">Recipients</Label>
              <Select name="recipientType" value={recipientType} onValueChange={setRecipientType} required>
                <SelectTrigger><SelectValue placeholder="Select recipients" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_students"><div className={styles.selectOption}><Users size={16} /> All Students</div></SelectItem>
                  <SelectItem value="all_teachers"><div className={styles.selectOption}><GraduationCap size={16} /> All Teachers</div></SelectItem>
                  <SelectItem value="all_users"><div className={styles.selectOption}><UserCog size={16} /> All Users</div></SelectItem>
                  <SelectItem value="specific"><div className={styles.selectOption}><UserCog size={16} /> Specific User</div></SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recipientType === 'specific' && (
              <>
                <div className={styles.formGroup}>
                  <Label>User Type</Label>
                  <Select name="specificUserType" value={specificUserType} onValueChange={setSpecificUserType} required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className={styles.formGroup}>
                  <Label>Select User</Label>
                  <SearchableSelect
                    options={(specificUserType === 'student' ? students : teachers).map((user: any) => ({
                      value: user.id,
                      label: `${user.full_name}${user.phone_number ? ` (${user.phone_number})` : user.email ? ` (${user.email})` : ''}`,
                    }))}
                    value={specificUserId}
                    onValueChange={setSpecificUserId}
                    placeholder="Search and select a user..."
                    searchPlaceholder="Search by name..."
                  />
                  <input type="hidden" name="specificUserId" value={specificUserId} />
                </div>
              </>
            )}

            <div className={styles.actions}>
              <Button type="submit" disabled={isSubmitting} className={styles.sendBtn}>
                <Send size={16} />
                {isSubmitting ? 'Sending...' : 'Send Notification'}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* Recent Notifications Management */}
      <Card className={styles.formCard} style={{ marginTop: 'var(--space-6)' }}>
        <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} /> Recent Notifications ({recentNotifications.length})
          </CardTitle>
          <div style={{ display: 'flex', gap: '8px' }}>
            <fetcher.Form method="post" onSubmit={() => setTimeout(() => revalidator.revalidate(), 500)}>
              <input type="hidden" name="intent" value="delete_expired" />
              <Button type="submit" variant="outline" size="sm">
                <Clock size={14} /> Clean Expired
              </Button>
            </fetcher.Form>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteAll(true)}>
              <Trash2 size={14} /> Delete All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {uniqueNotifs.length === 0 ? (
            <p style={{ color: 'var(--color-neutral-9)', textAlign: 'center', padding: 'var(--space-4)' }}>No notifications yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {uniqueNotifs.map((n: any) => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: 'var(--radius-2)', border: '1px solid var(--color-neutral-5)', background: 'var(--color-neutral-2)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-neutral-12)' }}>{n.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-9)', marginTop: '2px' }}>
                      {n.count > 1 ? `${n.count} recipients • ` : ''}{n.user_type} • {n.type}
                      {n.expires_at && ` • Expires: ${new Date(n.expires_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-8)', whiteSpace: 'nowrap' }}>
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setDeleteTarget(n)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete single notification dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
          </DialogHeader>
          <p>Delete "{deleteTarget?.title}"? {deleteTarget?.count > 1 ? `This will only remove one instance. To remove all ${deleteTarget?.count}, use "Delete All".` : ''}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <fetcher.Form method="post" onSubmit={() => { setDeleteTarget(null); setTimeout(() => revalidator.revalidate(), 500); }}>
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="notificationId" value={deleteTarget?.id} />
              <Button type="submit" variant="destructive">Delete</Button>
            </fetcher.Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete all dialog */}
      <Dialog open={showDeleteAll} onOpenChange={setShowDeleteAll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Notifications</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete ALL notifications? This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowDeleteAll(false)}>Cancel</Button>
            <fetcher.Form method="post" onSubmit={() => { setShowDeleteAll(false); setTimeout(() => revalidator.revalidate(), 500); }}>
              <input type="hidden" name="intent" value="delete_all" />
              <Button type="submit" variant="destructive">Delete All</Button>
            </fetcher.Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
