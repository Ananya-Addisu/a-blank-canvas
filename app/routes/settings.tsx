import { useState, useEffect } from "react";
import { Menu, Bell, CheckCircle, AlertCircle } from "lucide-react";
import { BottomNav } from "~/components/bottom-nav";
import { Sheet, SheetContent } from "~/components/ui/sheet/sheet";
import { SideMenu } from "~/components/side-menu";
import { Switch } from "~/components/ui/switch/switch";
import { Label } from "~/components/ui/label/label";
import { Input } from "~/components/ui/input/input";
import { Button } from "~/components/ui/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select/select";
import { useColorScheme } from "@dazl/color-scheme/react";
import { OfflineBanner } from "~/components/offline-banner";
import { getStudentAuth } from "~/lib/auth.client";
import { getAppSettings } from "~/services/admin.client";
import { supabase } from "~/lib/supabase.client";
import styles from "./home-page.module.css";

export function meta() {
  return [{ title: "Settings - Magster" }, { name: "description", content: "Manage your preferences" }];
}

export default function Settings() {
  const [student, setStudent] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { configScheme, setColorScheme } = useColorScheme();
  const isDark = configScheme === 'dark';

  useEffect(() => {
    async function load() {
      const [s, settings] = await Promise.all([getStudentAuth(), getAppSettings()]);
      setStudent(s);
      const editSetting = settings?.find((s: any) => s.setting_key === 'allow_student_edit_profile');
      setCanEdit(editSetting?.setting_value !== 'false');
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div style={{ minHeight: '100dvh', background: 'var(--color-neutral-1)' }} />;

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!student || !canEdit) return;
    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.from('students').update({
      full_name: formData.get('full_name') as string,
      phone_number: formData.get('phone_number') as string,
      institution: formData.get('institution') as string,
      academic_year: formData.get('academic_year') as string,
      stream: formData.get('stream') as string,
    }).eq('id', student.id);
    setFeedback(error ? { type: 'error', message: error.message } : { type: 'success', message: 'Profile updated successfully' });
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!student) return;
    const formData = new FormData(e.currentTarget);
    const newPin = formData.get('new_password') as string;
    const confirmPin = formData.get('confirm_password') as string;
    if (newPin !== confirmPin) { setFeedback({ type: 'error', message: 'PINs do not match' }); return; }
    const { error } = await supabase.rpc('change_student_pin', { p_student_id: student.id, p_current_pin: formData.get('current_password') as string, p_new_pin: newPin });
    setFeedback(error ? { type: 'error', message: error.message } : { type: 'success', message: 'PIN changed successfully' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.menuButton} onClick={() => setMenuOpen(true)}><Menu size={24} /></button>
        <h1 className={styles.logo}>Magster</h1>
        <button className={styles.notificationButton}><Bell size={24} /></button>
      </div>
      <OfflineBanner />
      <main className={styles.main}>
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-neutral-12)', margin: 0 }}>Settings</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-10)', marginTop: '4px' }}>Manage your profile and preferences</p>
        </div>

        {feedback && (
          <Card style={{ marginBottom: 'var(--space-4)', border: `1px solid var(--color-${feedback.type === 'error' ? 'error' : 'success'}-6)` }}>
            <CardContent style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              {feedback.type === 'error' ? <AlertCircle size={18} style={{ color: 'var(--color-error-9)', flexShrink: 0 }} /> : <CheckCircle size={18} style={{ color: 'var(--color-success-9)', flexShrink: 0 }} />}
              <p style={{ color: `var(--color-${feedback.type === 'error' ? 'error' : 'success'}-11)`, fontSize: '14px', margin: 0 }}>{feedback.message}</p>
            </CardContent>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {!canEdit && (
            <Card>
              <CardContent style={{ padding: 'var(--space-4)', background: 'var(--color-warning-3)', borderRadius: 'var(--radius-3)' }}>
                <p style={{ color: 'var(--color-warning-11)', fontSize: '14px', margin: 0 }}>Profile editing is currently disabled by the administrator.</p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', opacity: canEdit ? 1 : 0.5, pointerEvents: canEdit ? 'auto' : 'none' }}>
                <div><Label htmlFor="full_name">Full Name</Label><Input id="full_name" name="full_name" defaultValue={student?.full_name} disabled={!canEdit} /></div>
                <div><Label htmlFor="phone_number">Phone Number</Label><Input id="phone_number" name="phone_number" defaultValue={student?.phone_number} disabled={!canEdit} /></div>
                <div><Label htmlFor="institution">Institution</Label>
                  <Select name="institution" defaultValue={student?.institution} disabled={!canEdit}>
                    <SelectTrigger><SelectValue placeholder="Select Institution" /></SelectTrigger>
                    <SelectContent>
                      {["College","High School","AA SCI. & TECH UNIVERSITY","Adama Science & Technology","Addis Ababa University","Adigrat University","Ambo University","Arba Minch University","Arsi University","Asossa University","Axum University","Bahir Dar University","Bonga University","Bule Hora University","Debark University","Debrebirhan University","Debremarkos University","Debretabor University","Dembi Dolo University","Dilla University","Dire Dawa University","Gambella University","Gondar University","Haramaya University","Hawassa University","Injibara University","Jigjiga University","Jimma University","Jinka University","Kebri Dehar University","Kotebe Metropolitan University","Meda Welabu University","Mekelle University","Mekidela Amba University","Metu University","Mizan-Tepi University","Oda Bultum University","Raya University","Selale University","Semera University","Wachamo University","Welketie University","Werabe University","Wolayita Sodo University","Woldiya University","Wollega University","Wollo University"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="academic_year">Academic Year</Label>
                  <Select name="academic_year" defaultValue={student?.academic_year} disabled={!canEdit}>
                    <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                    <SelectContent>{[1,2,3,4,5,6,7].map(y => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="stream">Stream</Label>
                  <Select name="stream" defaultValue={student?.stream} disabled={!canEdit}>
                    <SelectTrigger><SelectValue placeholder="Select Stream" /></SelectTrigger>
                    <SelectContent><SelectItem value="natural">Natural Science</SelectItem><SelectItem value="social">Social Science</SelectItem></SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={!canEdit}>Save Changes</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Security</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div><Label htmlFor="current_password">Current PIN</Label><Input id="current_password" name="current_password" type="password" placeholder="Enter current PIN" /></div>
                <div><Label htmlFor="new_password">New PIN</Label><Input id="new_password" name="new_password" type="password" placeholder="Enter new PIN" /></div>
                <div><Label htmlFor="confirm_password">Confirm New PIN</Label><Input id="confirm_password" name="confirm_password" type="password" placeholder="Confirm new PIN" /></div>
                <Button type="submit">Change PIN</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Label htmlFor="darkMode" style={{ fontWeight: 600 }}>Dark Mode</Label>
                    <p style={{ fontSize: '13px', color: 'var(--color-neutral-10)', marginTop: '4px' }}>Use dark theme for reduced eye strain</p>
                  </div>
                  <Switch id="darkMode" checked={isDark} onCheckedChange={(checked) => setColorScheme(checked ? 'dark' : 'light')} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left"><SideMenu onClose={() => setMenuOpen(false)} /></SheetContent>
      </Sheet>
    </div>
  );
}
