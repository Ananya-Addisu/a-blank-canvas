import { Outlet, useRouteError } from "react-router";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { OfflineBanner } from "~/components/offline-banner";
import { NoConnectionScreen } from "~/components/no-connection-screen";
import { useForceLogoutGuard } from "~/hooks/use-force-logout-guard";

export default function TeacherLayout() {
  useForceLogoutGuard(5_000);

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
