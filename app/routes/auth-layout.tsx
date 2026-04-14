import { Outlet, useRouteError } from "react-router";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { NoConnectionScreen } from "~/components/no-connection-screen";

export default function AuthLayout() {
  return <Outlet />;
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
