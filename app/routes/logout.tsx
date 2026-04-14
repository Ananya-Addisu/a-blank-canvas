import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getSession, clearSession } from '~/lib/auth.client';
import { supabase } from '~/lib/supabase.client';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      const session = getSession();
      if (session) {
        const table = session.userType === 'student' ? 'students' : session.userType === 'teacher' ? 'teachers' : null;
        if (table) {
          await supabase.from(table).update({ last_logout_at: new Date().toISOString() }).eq('id', session.userId);
        }
      }
      clearSession();
      navigate('/login', { replace: true });
    };
    doLogout();
  }, [navigate]);

  return null;
}