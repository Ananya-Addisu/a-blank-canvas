# Native-Only Access Restriction

This document explains how to re-enable the native app requirement for student portal routes.

## Overview

The student portal can be restricted so that only users accessing via the official Capacitor native app (Android/iOS) can view student routes. Browser users see an "App Only Access" screen instead.

## How to Re-enable

### 1. Client-Side Gate (Student Layout)

Replace the contents of `app/routes/student-layout.tsx` with:

```tsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router";
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

  if (platform === 'checking') return null;
  if (platform === 'browser') return <AppOnlyScreen />;

  return <Outlet />;
}
```

This checks at runtime whether the app is running inside a Capacitor native shell. If not, it renders the `<AppOnlyScreen />` component.

### 2. Server-Side Request Verification (Optional, Stronger)

For server-side enforcement, use the `verifyAppSignature` utility in `app/lib/request-signing.server.ts`.

#### How it works

The native app sends a custom header `X-App-Environment: native` with every request. The server checks for this header and rejects requests without it (403 Forbidden).

#### Usage in loaders/actions

```tsx
import { verifyAppSignature } from '~/lib/request-signing.server';

export async function loader({ request }: LoaderArgs) {
  await verifyAppSignature(request);
  // ... rest of loader
}
```

Or wrap an entire handler:

```tsx
import { withAppSignature } from '~/lib/request-signing.server';

export const loader = withAppSignature(async ({ request }) => {
  // ... only runs if native header is present
});
```

#### Setting up the native app to send the header

In your Capacitor app's HTTP interceptor or fetch wrapper, add:

```ts
headers['X-App-Environment'] = 'native';
```

This ensures all requests from the native app include the verification header.

### 3. The App Only Screen Component

The `<AppOnlyScreen />` component (`app/components/app-only-screen.tsx`) displays a light-themed page telling users to download the app from the official Magster Academy Telegram channel (`https://t.me/magsteracademy`).

## Files Involved

| File | Purpose |
|------|---------|
| `app/routes/student-layout.tsx` | Layout wrapper — gate logic goes here |
| `app/lib/request-signing.server.ts` | Server-side header verification |
| `app/components/app-only-screen.tsx` | UI shown to browser users |
| `app/components/app-only-screen.module.css` | Styles for the App Only screen |
