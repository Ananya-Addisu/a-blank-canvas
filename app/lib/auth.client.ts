import { supabase } from './supabase.client';
import { probeRemoteConnectivity } from '~/utils/connectivity';
import { clearDeviceToken, verifyDeviceToken } from '~/services/device.client';

const SESSION_KEY = 'magster_session';

type SessionUserType = 'student' | 'teacher' | 'admin';

interface SessionUserSnapshot {
  full_name?: string;
  email?: string | null;
  phone_number?: string;
  academic_year?: string | null;
  gender?: string | null;
  stream?: string | null;
  institution?: string | null;
  specialization?: string | null;
  experience?: string | null;
  bio?: string | null;
  profile_picture_url?: string | null;
  is_approved?: boolean;
  is_active?: boolean;
}

interface SessionData {
  userId: string;
  userType: SessionUserType;
  sessionCreatedAt: string;
  userSnapshot?: SessionUserSnapshot;
}

function createUserSnapshot(user: any): SessionUserSnapshot | undefined {
  if (!user || typeof user !== 'object') return undefined;

  return {
    full_name: typeof user.full_name === 'string' ? user.full_name : undefined,
    email: typeof user.email === 'string' ? user.email : null,
    phone_number: typeof user.phone_number === 'string' ? user.phone_number : undefined,
    academic_year: typeof user.academic_year === 'string' ? user.academic_year : null,
    gender: typeof user.gender === 'string' ? user.gender : null,
    stream: typeof user.stream === 'string' ? user.stream : null,
    institution: typeof user.institution === 'string' ? user.institution : null,
    specialization: typeof user.specialization === 'string' ? user.specialization : null,
    experience: typeof user.experience === 'string' ? user.experience : null,
    bio: typeof user.bio === 'string' ? user.bio : null,
    profile_picture_url: typeof user.profile_picture_url === 'string' ? user.profile_picture_url : null,
    is_approved: typeof user.is_approved === 'boolean' ? user.is_approved : undefined,
    is_active: typeof user.is_active === 'boolean' ? user.is_active : undefined,
  };
}

function getOfflineUserFallback(session: SessionData) {
  return {
    id: session.userId,
    ...(session.userSnapshot || {}),
  };
}

function isConnectivityIssue(error: any) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;

  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  return /network|fetch|offline|failed|timeout|timed out|abort|connection/.test(message);
}

export async function hasLiveConnectivity(timeoutMs = 900) {
  return probeRemoteConnectivity(timeoutMs);
}

async function getHardwareId() {
  try {
    const { Device } = await import('@capacitor/device');
    const info = await Device.getId();
    return info.identifier || undefined;
  } catch {
    return undefined;
  }
}

function wasLoggedOutAfterSession(lastLogoutAt: string | null | undefined, sessionCreatedAt: string | undefined) {
  if (!lastLogoutAt || !sessionCreatedAt) return false;

  const logoutTime = new Date(lastLogoutAt).getTime();
  const sessionTime = new Date(sessionCreatedAt).getTime();

  if (!Number.isFinite(logoutTime) || !Number.isFinite(sessionTime)) {
    return false;
  }

  return logoutTime >= sessionTime;
}

// Session management via localStorage
export function saveSession(userId: string, userType: SessionUserType, user?: any) {
  const session: SessionData = {
    userId,
    userType,
    sessionCreatedAt: new Date().toISOString(),
    userSnapshot: createUserSnapshot(user),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSessionUser() {
  const session = getSession();
  if (!session) return null;
  return { id: session.userId, type: session.userType };
}

// Auth checks — return user data or null (no redirects, caller handles navigation)

export async function getStudentAuth() {
  const session = getSession();
  if (!session || session.userType !== 'student') return null;

  try {
    const { data, error } = await supabase.rpc('get_student_by_id', {
      p_student_id: session.userId,
    });

    if (error) {
      if (isConnectivityIssue(error) || !(await hasLiveConnectivity())) {
        return getOfflineUserFallback(session);
      }

      return null;
    }

    if (!data || data.length === 0) {
      if (!(await hasLiveConnectivity())) {
        return getOfflineUserFallback(session);
      }

      return null;
    }

    const student = data[0];
    const [securityResult, hardwareId] = await Promise.all([
      supabase.from('students').select('last_logout_at').eq('id', session.userId).maybeSingle(),
      getHardwareId(),
    ]);

    if (wasLoggedOutAfterSession(securityResult.data?.last_logout_at, session.sessionCreatedAt)) {
      clearDeviceToken();
      clearSession();
      return null;
    }

    const deviceStatus = await verifyDeviceToken(session.userId, 'student', hardwareId);
    if (!deviceStatus.trusted) {
      const stillOnline = await hasLiveConnectivity();
      if (!stillOnline) {
        return getOfflineUserFallback(session);
      }

      clearDeviceToken();
      clearSession();
      return null;
    }

    return student;
  } catch (error) {
    if (isConnectivityIssue(error) || !(await hasLiveConnectivity())) {
      return getOfflineUserFallback(session);
    }

    return null;
  }
}

export async function getAdminAuth() {
  const session = getSession();
  if (!session || session.userType !== 'admin') return null;

  const { data, error } = await supabase.rpc('get_admin_by_id', {
    p_admin_id: session.userId,
  });

  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function getTeacherAuth() {
  const session = getSession();
  if (!session || session.userType !== 'teacher') return null;

  try {
    const { data, error } = await supabase.rpc('get_teacher_by_id', {
      p_teacher_id: session.userId,
    });

    if (error) {
      if (isConnectivityIssue(error) || !(await hasLiveConnectivity())) {
        return getOfflineUserFallback(session);
      }

      return null;
    }

    if (!data || data.length === 0) {
      if (!(await hasLiveConnectivity())) {
        return getOfflineUserFallback(session);
      }

      return null;
    }

    const teacher = data[0];

    // Force-logout check
    if (teacher.last_logout_at && session.sessionCreatedAt) {
      const logoutTime = new Date(teacher.last_logout_at).getTime();
      const sessionTime = new Date(session.sessionCreatedAt).getTime();
      if (logoutTime > sessionTime) {
        clearSession();
        return null;
      }
    }

    return teacher;
  } catch (error) {
    if (isConnectivityIssue(error) || !(await hasLiveConnectivity())) {
      return getOfflineUserFallback(session);
    }

    return null;
  }
}

// Login functions — same RPCs, client-side

export async function loginAdmin(phoneNumber: string, pin: string) {
  const { data, error } = await supabase.rpc('verify_admin_login', {
    p_phone_number: phoneNumber,
    p_pin: pin,
  });

  if (error || !data || data.length === 0) {
    return { success: false as const, error: 'Invalid credentials' };
  }

  const admin = data[0];
  if (!admin.is_active) {
    return { success: false as const, error: 'Account is inactive' };
  }

  return { success: true as const, user: admin };
}

export async function loginStudent(phoneNumber: string, pin: string) {
  const { data, error } = await supabase.rpc('verify_student_login', {
    p_phone_number: phoneNumber,
    p_pin: pin,
  });

  if (error || !data || data.length === 0) {
    return { success: false as const, error: 'Invalid credentials' };
  }

  return { success: true as const, user: data[0] };
}

export async function loginTeacher(phoneNumber: string, pin: string) {
  const { data, error } = await supabase.rpc('verify_teacher_login', {
    p_phone_number: phoneNumber,
    p_pin: pin,
  });

  if (error || !data || data.length === 0) {
    return { success: false as const, error: 'Invalid credentials' };
  }

  const teacher = data[0];
  if (!teacher.is_approved) {
    return { success: false as const, error: 'Your account is pending approval' };
  }

  return { success: true as const, user: teacher };
}

// Signup functions

export async function signupStudent(data: {
  fullName: string;
  phoneNumber: string;
  pin: string;
  academicYear?: string;
  gender?: string;
  stream?: string;
  institution?: string;
  email?: string;
}) {
  try {
    const { data: newStudent, error } = await supabase.rpc('signup_student', {
      p_full_name: data.fullName,
      p_phone_number: data.phoneNumber,
      p_pin: data.pin,
      p_email: data.email || null,
      p_academic_year: data.academicYear || null,
      p_gender: data.gender || null,
      p_stream: data.stream || null,
      p_institution: data.institution || null,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, error: 'Phone number already registered' };
      }
      return { success: false, error: 'Failed to create account' };
    }

    return { success: true, user: newStudent[0] };
  } catch {
    return { success: false, error: 'Failed to create account' };
  }
}

export async function signupTeacher(data: {
  fullName: string;
  phoneNumber: string;
  email: string;
  pin: string;
  specialization?: string;
  experience?: string;
  bio?: string;
  credentialsUrl?: string;
  introVideoUrl?: string;
}) {
  try {
    let newTeacher: any = null;
    let error: any = null;

    ({ data: newTeacher, error } = await supabase.rpc('signup_teacher', {
      p_full_name: data.fullName,
      p_phone_number: data.phoneNumber,
      p_email: data.email,
      p_pin: data.pin,
      p_specialization: data.specialization || null,
      p_experience: data.experience || null,
      p_bio: data.bio || null,
      p_credentials_url: data.credentialsUrl || null,
      p_intro_video_url: data.introVideoUrl || null,
    }));

    if (error && error.message?.includes('Could not choose the best candidate function')) {
      ({ data: newTeacher, error } = await supabase.rpc('signup_teacher', {
        p_full_name: data.fullName,
        p_phone_number: data.phoneNumber,
        p_email: data.email,
        p_pin: data.pin,
        p_specialization: data.specialization || null,
        p_experience: data.experience || null,
        p_bio: data.bio || null,
        p_credentials_url: data.credentialsUrl || null,
      }));
    }

    if (error) {
      if (error.message.includes('Phone number already registered')) {
        return { success: false, error: 'Phone number already registered' };
      }
      if (error.message.includes('Email already registered')) {
        return { success: false, error: 'Email already registered' };
      }
      return { success: false, error: 'Failed to create account' };
    }

    return { success: true, user: newTeacher[0] };
  } catch {
    return { success: false, error: 'Failed to create account' };
  }
}
