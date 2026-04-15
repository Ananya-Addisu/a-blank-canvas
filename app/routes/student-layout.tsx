import { useState, useEffect } from "react";
import { Outlet, useRouteError } from "react-router";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { useForceLogoutGuard } from "~/hooks/use-force-logout-guard";
import { NoConnectionScreen } from "~/components/no-connection-screen";
import { OfflineBanner } from "~/components/offline-banner";
import { AppOnlyScreen } from "~/components/app-only-screen";

export default function StudentLayout() {
  const [platform, setPlatform] = useState<'checking' | 'native' | 'browser'>('checking');

  useEffect(() => {
    async function check() {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          setPlatform('native');
          return;
        }
      } catch {}
      setPlatform('browser');
    }
    check();
  }, []);

  useForceLogoutGuard(5_000);

  if (platform === 'checking') return null;
  if (platform === 'browser') return <AppOnlyScreen />;

  return (
    <div style={{ minHeight: "100dvh", paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <OfflineBanner />
      <Outlet />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const isOnline = useOnlineStatus();

  const isNetworkError =
    !isOnline ||
    (error instanceof Error &&
      /network|fetch|failed to fetch|networkerror|load failed|internet/i.test(
        error.message
      )) ||
    (error instanceof TypeError && /fetch/i.test(error.message));

  if (isNetworkError) {
    return <NoConnectionScreen />;
  }

  throw error;
}
