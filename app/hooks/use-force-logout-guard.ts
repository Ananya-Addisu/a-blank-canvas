import { useEffect } from 'react';
import { useOnlineStatus } from '~/hooks/use-online-status';
import { clearSession, getSession, getStudentAuth, getTeacherAuth, hasLiveConnectivity } from '~/lib/auth.client';

/**
 * Periodically checks if the current student/teacher has been force-logged-out.
 * If so, clears local session and redirects to login.
 */
export function useForceLogoutGuard(interval = 30_000) {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!isOnline) return;

    let cancelled = false;

    async function check() {
      // Double-check connectivity right before the call
      if (!navigator.onLine) return;

      const session = getSession();
      if (!session || (session.userType !== 'student' && session.userType !== 'teacher')) {
        // Session was already cleared (e.g. by getStudentAuth detecting force-logout)
        // but we might still be on a student/teacher page — check URL and redirect
        const path = window.location.pathname;
        const isStudentPage = path.startsWith('/home') || path.startsWith('/my-') || path.startsWith('/course') || path.startsWith('/about') || path.startsWith('/enroll') || path.startsWith('/payment') || path.startsWith('/browse') || path.startsWith('/bundle') || path.startsWith('/competition') || path.startsWith('/library') || path.startsWith('/downloads') || path.startsWith('/settings');
        const isTeacherPage = path.startsWith('/teacher');
        
        if (isStudentPage) {
          window.location.replace('/login?force_reset=true');
        } else if (isTeacherPage) {
          window.location.replace('/teacher-login?force_reset=true');
        }
        return;
      }

      // Save session info before the auth call, since getStudentAuth/getTeacherAuth
      // may clear the session internally when force-logout is detected
      const savedUserType = session.userType;

      try {
        const user = savedUserType === 'student'
          ? await getStudentAuth()
          : await getTeacherAuth();

        if (cancelled) return;
        // If we're now offline, don't act on stale results
        if (!navigator.onLine) return;

        if (user) return;

        const stillOnline = await hasLiveConnectivity();
        if (cancelled || !stillOnline) return;

        if (!user) {
          clearSession();
          window.location.replace(
            savedUserType === 'teacher'
              ? '/teacher-login?force_reset=true'
              : '/login?force_reset=true'
          );
        }
      } catch {
        // Swallow errors — likely transient network issues
      }
    }

    const handleCheck = () => {
      void check();
    };

    handleCheck();
    const timer = window.setInterval(handleCheck, interval);
    window.addEventListener('focus', handleCheck);
    window.addEventListener('online', handleCheck);
    document.addEventListener('visibilitychange', handleCheck);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener('focus', handleCheck);
      window.removeEventListener('online', handleCheck);
      document.removeEventListener('visibilitychange', handleCheck);
    };
  }, [interval, isOnline]);
}
