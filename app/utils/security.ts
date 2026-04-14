// Security utility functions for content protection

// Device fingerprinting has been replaced by server-generated device tokens.
// No client-side device identification is needed anymore.

export function preventScreenshot() {
  if (typeof window === 'undefined') return;

  const detectScreenCapture = () => {
    console.warn('Screenshot detection active');
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.style.filter = 'blur(10px)';
      } else {
        document.body.style.filter = 'none';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  };

  return detectScreenCapture();
}

export function preventRightClick(elementId?: string) {
  if (typeof window === 'undefined') return;

  const handleContextMenu = (e: Event) => {
    e.preventDefault();
    return false;
  };

  const element = elementId ? document.getElementById(elementId) : document;
  element?.addEventListener('contextmenu', handleContextMenu);

  return () => {
    element?.removeEventListener('contextmenu', handleContextMenu);
  };
}

export function preventKeyboardShortcuts() {
  if (typeof window === 'undefined') return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      e.key === 'PrintScreen' ||
      (e.key === 's' && e.shiftKey && e.metaKey) ||
      ((e.key === '3' || e.key === '4' || e.key === '5') && e.shiftKey && e.metaKey) ||
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
      return false;
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

export function addWatermark(text: string) {
  if (typeof window === 'undefined') return;

  const watermark = document.createElement('div');
  watermark.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 48px;
    color: rgba(0, 0, 0, 0.05);
    pointer-events: none;
    user-select: none;
    z-index: 9999;
    white-space: nowrap;
  `;
  watermark.textContent = text;
  document.body.appendChild(watermark);

  return () => {
    watermark.remove();
  };
}

export function detectScreenRecording() {
  if (typeof window === 'undefined') return null;
  return null;
}

// Encrypt/decrypt helpers for offline content
export function encryptContent(content: string, key: string): string {
  const encrypted = content.split('').map((char, i) => {
    const keyChar = key.charCodeAt(i % key.length);
    return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
  }).join('');
  
  return btoa(encrypted);
}

export function decryptContent(encrypted: string, key: string): string {
  const decoded = atob(encrypted);
  
  const decrypted = decoded.split('').map((char, i) => {
    const keyChar = key.charCodeAt(i % key.length);
    return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
  }).join('');
  
  return decrypted;
}

// Generate unique encryption key for user
export function generateEncryptionKey(userId: string, deviceId: string): string {
  return `${userId}_${deviceId}`;
}

// Check if content is protected
export function isProtectedContent(contentType: string): boolean {
  return ['video', 'pdf', 'document'].includes(contentType);
}

// Apply security measures to element
export function applyContentSecurity(elementId: string, userInfo?: { id: string; name: string }) {
  const cleanups: Array<() => void> = [];

  const cleanup1 = preventRightClick(elementId);
  if (cleanup1) cleanups.push(cleanup1);

  const cleanup2 = preventKeyboardShortcuts();
  if (cleanup2) cleanups.push(cleanup2);

  if (userInfo) {
    const cleanup3 = addWatermark(`${userInfo.name} - ${userInfo.id}`);
    if (cleanup3) cleanups.push(cleanup3);
  }

  return () => {
    cleanups.forEach(cleanup => cleanup());
  };
}
