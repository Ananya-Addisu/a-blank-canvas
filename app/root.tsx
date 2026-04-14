import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, Link, useNavigation, useLocation } from "react-router";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { AdminAccessGate } from "./components/admin-access-gate";
import { VpnBlockScreen } from "./components/vpn-block-screen";
import styles from "./root-error.module.css";

import type { Route } from "./+types/root";
import { Toaster } from "./components/ui/toaster/toaster";
import { ConfirmDialogProvider } from "./hooks/use-confirm-dialog";
import { MandatoryUpdate } from "./components/mandatory-update";
import { APP_VERSION, isUpdateRequired } from "./utils/version-check";
import { supabase } from "./lib/supabase.client";

import "./styles/reset.css";
import "./styles/global.css";
import "./styles/tokens/keyframes.css";
import "./styles/tokens/animations.css";
import "./styles/tokens/colors.css";
import "./styles/tokens/decorations.css";
import "./styles/tokens/spacings.css";
import "./styles/tokens/typography.css";
import "./styles/theme.css";
import favicon from "/favicon.svg";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "icon",
    href: `${favicon}?v=2`,
    type: "image/svg+xml",
  },
  {
    rel: "apple-touch-icon",
    href: favicon,
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
var sk='color-scheme',dk='dark-theme',lk='light-theme';
function rs(){return window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';}
function lc(){try{var c=localStorage.getItem(sk);return c==='light'||c==='dark'?c:null;}catch(e){return null;}}
function sc(c){try{c==='system'?localStorage.removeItem(sk):localStorage.setItem(sk,c);}catch(e){}}
var st={listeners:new Set(),config:lc()};
function cs(){var c=st.config;return{config:c,resolved:c==='system'?rs():c};}
function ud(){var s=cs(),r=document.documentElement;r.classList.remove(dk,lk);r.classList.add(s.resolved==='dark'?dk:lk);r.style.colorScheme=s.resolved;st.listeners.forEach(function(l){l(s);});}
var r=document.documentElement;var ic=lc();var ir=ic?ic:'light';r.classList.remove(dk,lk);r.classList.add(ir==='dark'?dk:lk);r.style.colorScheme=ir;if(!ic){localStorage.setItem(sk,'light');}
window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',function(){if(st.config==='system')ud();});
window.colorSchemeApi={get config(){return st.config;},set config(c){if(c===st.config)return;st.config=c;ud();sc(c);},get currentState(){return cs();},get resolvedSystem(){return rs();},getRootCssClass:function(r){r=r||cs().resolved;return r==='dark'?dk:lk;},subscribe:function(s){st.listeners.add(s);return function(){st.listeners.delete(s);};},dispose:function(){st.listeners.clear();}};
})();`,
          }}
        />
        <Meta />
        <Links />
      </head>
      <body>
        <ConfirmDialogProvider>
          {children}
        </ConfirmDialogProvider>
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

interface AppSettings {
  settings: Record<string, string>;
  enableLibrary: boolean;
  enableCompetitions: boolean;
  appName: string;
  minAppVersion: string;
  apkDownloadUrl: string;
  adminAccessCode: string;
  enableAccessGate: boolean;
}

export async function clientLoader() {
  try {
    const { data: settings } = await supabase.from('app_settings').select('*');
    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: any) => {
      settingsMap[s.setting_key] = s.setting_value;
    });
    return {
      enableLibrary: settingsMap.enable_library !== 'false',
      enableCompetitions: settingsMap.enable_competitions !== 'false',
      appName: settingsMap.app_name || 'Magster Academy',
      minAppVersion: settingsMap.min_app_version || '',
      apkDownloadUrl: settingsMap.apk_download_url || '',
      adminAccessCode: settingsMap.admin_access_code || '123456',
      enableAccessGate: settingsMap.enable_access_gate === 'true',
      settings: settingsMap,
    };
  } catch (error) {
    console.error('Error fetching app settings:', error);
    return {
      enableLibrary: true,
      enableCompetitions: true,
      appName: 'Magster Academy',
      minAppVersion: '',
      apkDownloadUrl: '',
      adminAccessCode: '123456',
      enableAccessGate: false,
      settings: {},
    };
  }
}

export default function App({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const location = useLocation();
  const isNavigating = navigation.state === 'loading';
  const [nativeVersion, setNativeVersion] = useState(APP_VERSION);
  const [adminAccessGranted, setAdminAccessGranted] = useState(false);
  const [vpnStatus, setVpnStatus] = useState<'checking' | 'allowed' | 'blocked'>('checking');
  const [vpnReason, setVpnReason] = useState('none');
  const appSettings: AppSettings = (loaderData as any) || {
    settings: {},
    enableLibrary: true,
    enableCompetitions: true,
    appName: 'Magster Academy',
    minAppVersion: '',
    apkDownloadUrl: '',
    adminAccessCode: '123456',
    enableAccessGate: false,
  };

  const retryVpnCheck = useCallback(() => {
    setVpnStatus('checking');
    checkVpn();
  }, []);

  const checkVpn = useCallback(async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !publishableKey) {
        setVpnStatus('allowed');
        return;
      }
      const res = await fetch(`${supabaseUrl}/functions/v1/check-vpn`, {
        method: 'GET',
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const vpnData = await res.json();
        if (vpnData?.blocked === true) {
          setVpnStatus('blocked');
          setVpnReason(vpnData?.reason || 'vpn_detected');
        } else {
          setVpnStatus('allowed');
        }
      } else {
        setVpnStatus('allowed');
      }
    } catch {
      setVpnStatus('allowed');
    }
  }, []);

  useEffect(() => {
    checkVpn();
  }, [checkVpn]);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isTeacherRoute = location.pathname.startsWith('/teacher');
  const isNonStudentRoute = isAdminRoute || isTeacherRoute;

  // Force light mode on admin/teacher routes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.colorSchemeApi) {
      if (isNonStudentRoute) {
        const root = document.documentElement;
        root.classList.remove('dark-theme');
        root.classList.add('light-theme');
        root.style.colorScheme = 'light';
      } else {
        const stored = localStorage.getItem('color-scheme');
        const scheme = stored === 'dark' ? 'dark' : 'light';
        window.colorSchemeApi.config = scheme;
      }
    }
  }, [isNonStudentRoute]);

  // Check native app version and configure StatusBar
  useEffect(() => {
    async function initNative() {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          const { App } = await import('@capacitor/app');
          const info = await App.getInfo();
          setNativeVersion(info.version);
          
          App.addListener('backButton', ({ canGoBack }) => {
            if (canGoBack) {
              window.history.back();
            } else {
              App.exitApp();
            }
          });

          // Configure StatusBar
          try {
            const { StatusBar, Style } = await import('@capacitor/status-bar');
            await StatusBar.setStyle({ style: Style.Dark });
            await StatusBar.setBackgroundColor({ color: '#000000' });
          } catch {
            // StatusBar plugin not available
          }
        }
      } catch {
        // Not in native context
      }
    }
    initNative();
  }, []);

  const handleAdminAccess = useCallback(() => {
    setAdminAccessGranted(true);
  }, []);

  const isNativeApp = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
  const needsUpdate = appSettings.minAppVersion && isUpdateRequired(nativeVersion, appSettings.minAppVersion);

  const isVideoPlayerRoute = location.pathname.startsWith('/course-player');

  if (isVideoPlayerRoute && vpnStatus === 'checking') {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-neutral-1, #fff)' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isVideoPlayerRoute && vpnStatus === 'blocked') {
    return <VpnBlockScreen onRetry={retryVpnCheck} reason={vpnReason || 'vpn_detected'} />;
  }

  if (isAdminRoute && appSettings.enableAccessGate && !adminAccessGranted) {
    return <AdminAccessGate onAccessGranted={handleAdminAccess} accessCode={appSettings.adminAccessCode || '123456'} />;
  }

  if (isNativeApp && needsUpdate) {
    return (
      <MandatoryUpdate
        currentVersion={nativeVersion}
        requiredVersion={appSettings.minAppVersion}
        downloadUrl={appSettings.apkDownloadUrl}
      />
    );
  }

  return (
    <>
      {isNavigating && (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-neutral-1)',
            opacity: 0.7,
            backdropFilter: 'blur(2px)',
            pointerEvents: 'none',
          }}>
            <div style={{
              width: 32,
              height: 32,
              border: '2.5px solid var(--color-neutral-4)',
              borderTopColor: 'var(--color-accent-9)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
          </div>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.iconWrapper404}>
            <AlertTriangle size={64} />
          </div>
          <h1 className={styles.errorTitle}>404</h1>
          <h2 className={styles.errorSubtitle}>Page Not Found</h2>
          <p className={styles.errorDescription}>
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className={styles.primaryButton}>
            <Home size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
    ? error.message
    : "An unexpected error occurred";

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.iconWrapper}>
          <AlertTriangle size={64} />
        </div>
        <h1 className={styles.errorTitle}>Oops!</h1>
        <h2 className={styles.errorSubtitle}>Something went wrong</h2>
        <p className={styles.errorDescription}>{message}</p>
        <div className={styles.buttonGroup}>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.primaryButton}
          >
            <RefreshCw size={20} />
            Try Again
          </button>
          <Link to="/" className={styles.secondaryButton}>
            <Home size={20} />
            Back to Home
          </Link>
        </div>
        {import.meta.env.DEV && error instanceof Error && (
          <pre className={styles.stackTrace}>
            <code>{error.stack}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
