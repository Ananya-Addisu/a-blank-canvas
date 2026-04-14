import type { Route } from './+types/admin-settings';
import { Form } from 'react-router';
import { ProfileAvatar } from '~/components/profile-avatar';
import styles from './admin-settings.module.css';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card/card';
import { Download, Smartphone, KeyRound, LayoutGrid } from 'lucide-react';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';




export async function clientLoader() {
  const { getAppSettings } = await import('~/services/admin.client');
  const { getAdminAuth } = await import('~/lib/auth.client');
  const admin = await getAdminAuth();
  const settingsArr = await getAppSettings();
  const settings: Record<string, string> = {};
  for (const s of settingsArr) { settings[s.setting_key] = s.setting_value; }
  return { admin, settings };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const { updateAppSetting } = await import('~/services/admin.client');
  if (intent === 'update_profile') {
    const { getAdminAuth } = await import('~/lib/auth.client');
    const admin = await getAdminAuth();
    if (admin) {
      await supabase.from('admins').update({ full_name: formData.get('full_name'), phone_number: formData.get('phone_number') }).eq('id', admin.id);
    }
    return { success: true, message: 'Profile updated' };
  } else if (intent === 'update_settings') {
    const keys = ['enable_library', 'enable_competitions', 'allow_student_edit_profile', 'allow_teacher_edit_profile',
      'teacher_withdrawal_terms', 'terms_of_service', 'privacy_policy', 'admin_access_code', 'enable_access_gate',
      'show_featured_paths', 'current_app_version', 'min_app_version', 'apk_download_url', 'home_ui_type'];
    const forcedSettings: Record<string, string> = {
      show_featured_paths: 'true',
      home_ui_type: 'type2',
    };
    const checkboxKeys = String(formData.get('checkbox_keys') || '')
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);

    for (const key of keys) {
      if (key in forcedSettings) {
        await updateAppSetting(key, forcedSettings[key]);
        continue;
      }

      if (!formData.has(key)) continue;
      const val = formData.get(key);
      if (val === null) continue;

      const v = (val === 'on' || val === 'true') ? 'true' : val as string;
      await updateAppSetting(key, v);
    }

    for (const cbKey of checkboxKeys) {
      if (!formData.has(cbKey)) {
        await updateAppSetting(cbKey, 'false');
      }
    }

    return { success: true, message: 'Settings updated' };
  }
  return { success: false, error: 'Unknown intent' };
}


export function ErrorBoundary() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Error</h1>
      <Card>
        <CardContent>
          <p style={{ color: 'var(--color-error-11)' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSettings({ loaderData: rawLoaderData, actionData: rawActionData }: Route.ComponentProps) {
  const loaderData = rawLoaderData as any;
  const actionData = rawActionData as any;

  if (!loaderData.admin) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Error</h1>
        <Card>
          <CardContent className={styles.errorMessage}>
            <p>Failed to load admin data. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
          <h1 className={styles.title}>Settings</h1>

          {actionData?.error && (
            <div className={styles.errorAlert}>
              {actionData.error}
            </div>
          )}

          {actionData?.success && (
            <div className={styles.successAlert}>
              {actionData.message}
            </div>
          )}

          <Card className={styles.settingsCard}>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className={styles.settingsContent}>
              <Form method="post" className={styles.profileSection}>
                <input type="hidden" name="intent" value="update_profile" />
                
                <div className={styles.avatarSection}>
                  <ProfileAvatar 
                    userName={loaderData.admin?.full_name || 'Admin'} 
                    size="lg"
                    className={styles.profileAvatar}
                  />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input 
                    id="full_name" 
                    name="full_name" 
                    defaultValue={loaderData.admin?.full_name} 
                    required 
                  />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input 
                    id="phone_number" 
                    name="phone_number" 
                    defaultValue={loaderData.admin?.phone_number} 
                    required 
                  />
                </div>

                <Button type="submit" className={styles.saveBtn}>
                  Save Profile
                </Button>
              </Form>
            </CardContent>
          </Card>

          <Card className={styles.settingsCard}>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
            </CardHeader>
            <CardContent className={styles.settingsContent}>
              <Form method="post">
                <input type="hidden" name="intent" value="update_settings" />
                <input type="hidden" name="checkbox_keys" value="enable_library,enable_competitions,allow_student_edit_profile,allow_teacher_edit_profile" />
                
                <div className={styles.toggleGroup}>
                  <div className={styles.toggleItem}>
                    <div className={styles.toggleLabel}>
                      <Label htmlFor="enable_library">Enable Library</Label>
                      <p className={styles.formDesc}>Allow students to access the library feature</p>
                    </div>
                    <input 
                      type="checkbox" 
                      id="enable_library" 
                      name="enable_library" 
                      defaultChecked={loaderData.settings?.enable_library !== 'false'} 
                    />
                  </div>

                  <div className={styles.toggleItem}>
                    <div className={styles.toggleLabel}>
                      <Label htmlFor="enable_competitions">Enable Competitions</Label>
                      <p className={styles.formDesc}>Allow students to access the competitions feature</p>
                    </div>
                    <input 
                      type="checkbox" 
                      id="enable_competitions" 
                      name="enable_competitions" 
                      defaultChecked={loaderData.settings?.enable_competitions !== 'false'} 
                    />
                  </div>

                  <div className={styles.toggleItem}>
                    <div className={styles.toggleLabel}>
                      <Label htmlFor="allow_student_edit_profile">Allow Students to Edit Profile</Label>
                      <p className={styles.formDesc}>When disabled, students cannot modify their profile details</p>
                    </div>
                    <input 
                      type="checkbox" 
                      id="allow_student_edit_profile" 
                      name="allow_student_edit_profile" 
                      defaultChecked={loaderData.settings?.allow_student_edit_profile !== 'false'} 
                    />
                  </div>

                  <div className={styles.toggleItem}>
                    <div className={styles.toggleLabel}>
                      <Label htmlFor="allow_teacher_edit_profile">Allow Teachers to Edit Profile</Label>
                      <p className={styles.formDesc}>When disabled, teachers cannot modify their profile details</p>
                    </div>
                    <input 
                      type="checkbox" 
                      id="allow_teacher_edit_profile" 
                      name="allow_teacher_edit_profile" 
                      defaultChecked={loaderData.settings?.allow_teacher_edit_profile !== 'false'} 
                    />
                  </div>
                </div>

                <Button type="submit" className={styles.saveBtn}>
                  Save Features
                </Button>
              </Form>
            </CardContent>
          </Card>

          <Card className={styles.settingsCard}>
            <CardHeader>
              <CardTitle>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LayoutGrid size={20} />
                  Home Page UI Style
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className={styles.settingsContent}>
              <Form method="post">
                <input type="hidden" name="intent" value="update_settings" />
                <div className={styles.formGroup}>
                  <Label htmlFor="home_ui_type">Home Page Layout</Label>
                  <p className={styles.formDesc}>
                    Type 2 is temporarily locked in while Featured Paths stays enabled everywhere.
                  </p>
                  <select
                    id="home_ui_type"
                    name="home_ui_type"
                    value="type2"
                    disabled
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-neutral-6, #ddd)',
                      fontSize: '14px',
                      background: 'var(--color-neutral-1, #fff)',
                      color: 'var(--color-neutral-12, #111)',
                    }}
                  >
                    <option value="type2">Type 2 — Horizontal Scroll with Images (Locked)</option>
                  </select>
                </div>
              </Form>
            </CardContent>
          </Card>

          <Card className={styles.settingsCard}>
            <CardHeader>
              <CardTitle>Teacher Withdrawal Terms</CardTitle>
            </CardHeader>
            <CardContent className={styles.settingsContent}>
              <Form method="post">
                <input type="hidden" name="intent" value="update_settings" />
                <div className={styles.formGroup}>
                  <Label htmlFor="teacher_withdrawal_terms">Withdrawal Terms & Conditions</Label>
                  <p className={styles.formDesc}>These terms are displayed to teachers on the Withdrawal Terms page</p>
                  <Textarea
                    id="teacher_withdrawal_terms"
                    name="teacher_withdrawal_terms"
                    defaultValue={loaderData.settings?.teacher_withdrawal_terms || ''}
                    rows={14}
                    placeholder="Enter withdrawal terms and conditions here..."
                  />
                </div>
                <Button type="submit" className={styles.saveBtn}>
                  Save Withdrawal Terms
                </Button>
              </Form>
            </CardContent>
          </Card>

          <Card className={styles.settingsCard}>
            <CardHeader>
              <CardTitle>Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className={styles.settingsContent}>
              <Form method="post">
                <input type="hidden" name="intent" value="update_settings" />
                <div className={styles.formGroup}>
                  <Label htmlFor="terms_of_service">Terms of Service</Label>
                  <p className={styles.formDesc}>Displayed to students during signup</p>
                  <Textarea
                    id="terms_of_service"
                    name="terms_of_service"
                    defaultValue={loaderData.settings?.terms_of_service || ''}
                    rows={14}
                    placeholder="Enter terms of service here..."
                  />
                </div>
                <Button type="submit" className={styles.saveBtn}>
                  Save Terms of Service
                </Button>
              </Form>
            </CardContent>
          </Card>

          <Card className={styles.settingsCard}>
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className={styles.settingsContent}>
              <Form method="post">
                <input type="hidden" name="intent" value="update_settings" />
                <div className={styles.formGroup}>
                  <Label htmlFor="privacy_policy">Privacy Policy</Label>
                  <p className={styles.formDesc}>Displayed to students during signup</p>
                  <Textarea
                    id="privacy_policy"
                    name="privacy_policy"
                    defaultValue={loaderData.settings?.privacy_policy || ''}
                    rows={14}
                    placeholder="Enter privacy policy here..."
                  />
                </div>
                <Button type="submit" className={styles.saveBtn}>
                  Save Privacy Policy
                </Button>
              </Form>
            </CardContent>
          </Card>

          <Card className={styles.settingsCard}>
            <CardHeader>
              <CardTitle>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <KeyRound size={20} />
                  Admin Portal Access Code
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className={styles.settingsContent}>
              <Form method="post">
                <input type="hidden" name="intent" value="update_settings" />
                <input type="hidden" name="checkbox_keys" value="enable_access_gate" />

                <div className={styles.toggleGroup}>
                  <div className={styles.toggleItem}>
                    <div className={styles.toggleLabel}>
                      <Label htmlFor="enable_access_gate">Require Access Code on Every Visit</Label>
                      <p className={styles.formDesc}>When enabled, admins must enter the access code each time they open the admin panel (e.g. on refresh)</p>
                    </div>
                    <input 
                      type="checkbox" 
                      id="enable_access_gate" 
                      name="enable_access_gate" 
                      defaultChecked={loaderData.settings?.enable_access_gate === 'true'} 
                    />
                  </div>
                  <div className={styles.toggleItem}>
                    <div className={styles.toggleLabel}>
                      <Label htmlFor="show_featured_paths">Show Featured Paths Section</Label>
                       <p className={styles.formDesc}>Featured Paths is temporarily locked on for the student home screen.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      id="show_featured_paths" 
                       checked
                       disabled
                       readOnly
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="admin_access_code">Access Code</Label>
                  <p className={styles.formDesc}>
                    This code is required when the access gate is enabled. 
                    Change it regularly for security.
                  </p>
                  <Input
                    id="admin_access_code"
                    name="admin_access_code"
                    type="text"
                    defaultValue={loaderData.settings?.admin_access_code || ''}
                    placeholder="Enter a secure access code"
                  />
                </div>
                <Button type="submit" className={styles.saveBtn}>
                  <KeyRound size={16} />
                  Save Access Code Settings
                </Button>
              </Form>
            </CardContent>
          </Card>


          <Card className={styles.settingsCard}>
            <CardHeader>
              <CardTitle>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Smartphone size={20} />
                  App Version & APK Management
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className={styles.settingsContent}>
              <Form method="post">
                <input type="hidden" name="intent" value="update_settings" />

                <div className={styles.formGroup}>
                  <Label htmlFor="current_app_version">Current App Version</Label>
                  <p className={styles.formDesc}>The version number of the latest APK you've distributed (e.g., 1.0.0, 1.1.0)</p>
                  <Input
                    id="current_app_version"
                    name="current_app_version"
                    defaultValue={loaderData.settings?.current_app_version || ''}
                    placeholder="e.g., 1.2.0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="min_app_version">Minimum Required Version</Label>
                  <p className={styles.formDesc}>
                    Users with versions below this will be blocked and forced to update. 
                    Set this to the same value as Current App Version to force all old versions to update.
                  </p>
                  <Input
                    id="min_app_version"
                    name="min_app_version"
                    defaultValue={loaderData.settings?.min_app_version || ''}
                    placeholder="e.g., 1.1.0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="apk_download_url">APK Download URL</Label>
                  <p className={styles.formDesc}>
                    Direct link to the latest APK file. Users will be shown this link to download the update.
                    Upload the APK to Google Drive, Supabase Storage, or any file hosting service.
                  </p>
                  <Input
                    id="apk_download_url"
                    name="apk_download_url"
                    defaultValue={loaderData.settings?.apk_download_url || ''}
                    placeholder="https://drive.google.com/... or direct download link"
                  />
                </div>

                <div className={styles.warning}>
                  <strong>⚠️ How it works:</strong> When you set a minimum version, all users running older APK versions 
                  will see a mandatory update screen and won't be able to use the app until they install the new APK. 
                  Make sure the download URL is correct before setting the minimum version.
                </div>

                <Button type="submit" className={styles.saveBtn}>
                  <Download size={16} />
                  Save Version Settings
                </Button>
              </Form>
            </CardContent>
          </Card>
    </div>
  );
}
