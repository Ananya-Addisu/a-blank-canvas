// Using PostgreSQL crypt function for password hashing
import { supabase, supabaseAdmin } from './supabase.server';
import { createCookieSessionStorage, redirect } from 'react-router';

const sessionSecret = process.env.SESSION_SECRET || 'default-secret-change-in-production';

const storage = createCookieSessionStorage({
  cookie: {
    name: 'magster_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
  },
});

export async function createUserSession(userId: string, userType: 'student' | 'teacher' | 'admin', redirectTo: string) {
  const session = await storage.getSession(); // Create new session
  session.set('userId', userId);
  session.set('userType', userType);
  session.set('sessionCreatedAt', new Date().toISOString());
  
  const cookie = await storage.commitSession(session);
  
  throw redirect(redirectTo, {
    headers: {
      'Set-Cookie': cookie,
    },
  });
}

export async function createUserSessionWithHeaders(userId: string, userType: 'student' | 'teacher' | 'admin', redirectTo: string, extraHeaders: Record<string, string>) {
  const session = await storage.getSession();
  session.set('userId', userId);
  session.set('userType', userType);
  session.set('sessionCreatedAt', new Date().toISOString());
  
  const cookie = await storage.commitSession(session);
  
  const headers = new Headers();
  headers.append('Set-Cookie', cookie);
  for (const [key, value] of Object.entries(extraHeaders)) {
    headers.append(key, value);
  }
  
  throw redirect(redirectTo, { headers });
}

// getUserSession now also returns sessionCreatedAt
export async function getUserSession(request: Request) {
  const session = await storage.getSession(request.headers.get('Cookie'));
  return {
    userId: session.get('userId') as string | undefined,
    userType: session.get('userType') as 'student' | 'teacher' | 'admin' | undefined,
    sessionCreatedAt: session.get('sessionCreatedAt') as string | undefined,
  };
}


export async function getSessionUser(request: Request) {
  const { userId, userType } = await getUserSession(request);
  if (!userId || !userType) {
    return null;
  }
  return { id: userId, type: userType };
}

export async function requireAuth(request: Request, requiredType?: 'student' | 'teacher' | 'admin') {
  const { userId, userType } = await getUserSession(request);
  
  if (!userId || !userType) {
    throw redirect('/login');
  }
  
  if (requiredType && userType !== requiredType) {
    throw redirect('/login');
  }
  
  return { userId, userType };
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get('Cookie'));
  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  });
}

// Specialized session getters
export async function getStudentSession(request: Request) {
  const { userId, userType } = await getUserSession(request);
  if (!userId || userType !== 'student') {
    return null;
  }
  return { userId, userType };
}

export async function getTeacherSession(request: Request) {
  const { userId, userType } = await getUserSession(request);
  if (!userId || userType !== 'teacher') {
    return null;
  }
  return { userId, userType };
}

export async function getAdminSession(request: Request) {
  const { userId, userType } = await getUserSession(request);
  if (!userId || userType !== 'admin') {
    return null;
  }
  return { userId, userType };
}

// Verify admin session and return admin ID
export async function verifyAdminSession(request: Request): Promise<string | null> {
  const { userId, userType } = await getUserSession(request);
  if (!userId || userType !== 'admin') {
    return null;
  }
  return userId;
}

// Require student authentication (checks force-logout via last_logout_at)
export async function requireStudentAuth(request: Request) {
  const { userId, userType, sessionCreatedAt } = await getUserSession(request);
  
  if (!userId || userType !== 'student') {
    throw redirect('/login');
  }
  
  // Fetch full student data using RPC to bypass RLS
  const { data, error } = await supabase.rpc('get_student_by_id', {
    p_student_id: userId
  });
  
  if (error || !data || data.length === 0) {
    console.error('Error fetching student:', error);
    throw redirect('/login');
  }
  
  // Check force-logout: if last_logout_at is after session creation, invalidate
  const student = data[0];
  if (sessionCreatedAt) {
    const { data: rawStudent } = await supabaseAdmin
      .from('students')
      .select('last_logout_at')
      .eq('id', userId)
      .single();
    
    if (rawStudent?.last_logout_at) {
      const logoutTime = new Date(rawStudent.last_logout_at).getTime();
      const sessionTime = new Date(sessionCreatedAt).getTime();
      if (logoutTime > sessionTime) {
        // Session was created before the force logout - destroy session and redirect
        const session = await storage.getSession(request.headers.get('Cookie'));
        throw redirect('/login?force_reset=true', {
          headers: {
            'Set-Cookie': await storage.destroySession(session),
          },
        });
      }
    }
  }
  
  return student;
}

// Require admin authentication
export async function requireAdminAuth(request: Request) {
  const { userId, userType } = await getUserSession(request);
  
  if (!userId || userType !== 'admin') {
    throw redirect('/admin-login');
  }
  
  // Fetch full admin data using RPC to bypass RLS
  const { data, error } = await supabaseAdmin.rpc('get_admin_by_id', {
    p_admin_id: userId
  });
  
  if (error || !data || data.length === 0) {
    console.error('Error fetching admin:', error);
    throw redirect('/admin-login');
  }
  
  // Return the first element of the array
  return data[0];
}

// Require teacher authentication (checks force-logout via last_logout_at)
export async function requireTeacherAuth(request: Request) {
  const { userId, userType, sessionCreatedAt } = await getUserSession(request);
  
  if (!userId || userType !== 'teacher') {
    throw redirect('/teacher-login');
  }
  
  // Fetch full teacher data using RPC to bypass RLS
  const { data, error } = await supabase.rpc('get_teacher_by_id', {
    p_teacher_id: userId
  });
  
  if (error || !data || data.length === 0) {
    console.error('Error fetching teacher:', error);
    throw redirect('/teacher-login');
  }
  
  // Check force-logout
  const teacher = data[0];
  if (sessionCreatedAt) {
    const { data: rawTeacher } = await supabaseAdmin
      .from('teachers')
      .select('last_logout_at')
      .eq('id', userId)
      .single();
    
    if (rawTeacher?.last_logout_at) {
      const logoutTime = new Date(rawTeacher.last_logout_at).getTime();
      const sessionTime = new Date(sessionCreatedAt).getTime();
      if (logoutTime > sessionTime) {
        const session = await storage.getSession(request.headers.get('Cookie'));
        throw redirect('/teacher-login?force_reset=true', {
          headers: {
            'Set-Cookie': await storage.destroySession(session),
          },
        });
      }
    }
  }
  
  return teacher;
}

// PIN hashing is now handled by PostgreSQL crypt function

// Admin login
export async function loginAdmin(phoneNumber: string, pin: string) {
  // Use Postgres crypt function to verify PIN
  const { data, error } = await supabase.rpc('verify_admin_login', {
    p_phone_number: phoneNumber,
    p_pin: pin
  });

  if (error || !data || data.length === 0) {
    return { success: false, error: 'Invalid credentials' };
  }

  const admin = data[0];
  
  if (!admin.is_active) {
    return { success: false, error: 'Account is inactive' };
  }

  return { success: true, user: admin };
}

// Student login
export async function loginStudent(phoneNumber: string, pin: string) {
  // Use Postgres crypt function to verify PIN
  const { data, error } = await supabase.rpc('verify_student_login', {
    p_phone_number: phoneNumber,
    p_pin: pin
  });

  if (error || !data || data.length === 0) {
    return { success: false, error: 'Invalid credentials' };
  }

  const student = data[0];

  return { success: true, user: student };
}

// Teacher login
export async function loginTeacher(phoneNumber: string, pin: string) {
  // Use Postgres crypt function to verify PIN
  const { data, error } = await supabase.rpc('verify_teacher_login', {
    p_phone_number: phoneNumber,
    p_pin: pin
  });

  if (error || !data || data.length === 0) {
    return { success: false, error: 'Invalid credentials' };
  }

  const teacher = data[0];
  
  if (!teacher.is_approved) {
    return { success: false, error: 'Your account is pending approval' };
  }

  return { success: true, user: teacher };
}

// Student signup
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
  } catch (error) {
    return { success: false, error: 'Failed to create account' };
  }
}

// Teacher signup
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
    const { data: newTeacher, error } = await supabase.rpc('signup_teacher', {
      p_full_name: data.fullName,
      p_phone_number: data.phoneNumber,
      p_email: data.email,
      p_pin: data.pin,
      p_specialization: data.specialization || null,
      p_experience: data.experience || null,
      p_bio: data.bio || null,
      p_credentials_url: data.credentialsUrl || null,
      p_intro_video_url: data.introVideoUrl || null,
    });

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
  } catch (error) {
    return { success: false, error: 'Failed to create account' };
  }
}
