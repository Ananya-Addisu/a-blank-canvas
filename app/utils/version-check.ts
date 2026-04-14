/**
 * Compare two semantic version strings (e.g., "1.0.0" vs "1.1.0")
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  const maxLen = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < maxLen; i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA < numB) return -1;
    if (numA > numB) return 1;
  }
  return 0;
}

/**
 * Check if the current app version is below the minimum required version
 */
export function isUpdateRequired(currentVersion: string, minVersion: string): boolean {
  if (!currentVersion || !minVersion) return false;
  return compareVersions(currentVersion, minVersion) < 0;
}

// The app version embedded in the current build
// This should be updated each time a new APK is built
export const APP_VERSION = '1.0.0';
