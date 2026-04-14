/**
 * Native App Environment Verification
 * 
 * Ensures requests come from the official Capacitor native app
 * by checking for the X-App-Environment: native header.
 * 
 * Browser requests without this header are rejected with 403.
 */

import { data } from 'react-router';

/**
 * Verify the request comes from the native app.
 * Throws a 403 Response if the header is missing or invalid.
 */
export async function verifyAppSignature(request: Request): Promise<void> {
  const appEnv = request.headers.get('X-App-Environment');

  if (appEnv !== 'native') {
    throw data({ error: 'Forbidden: Native app required' }, { status: 403 });
  }
}

/**
 * Helper: wrap a loader or action function with native environment verification.
 */
export function withAppSignature<T extends (...args: any[]) => any>(handler: T): T {
  return (async (...args: any[]) => {
    const { request } = args[0];
    await verifyAppSignature(request);
    return handler(...args);
  }) as unknown as T;
}
