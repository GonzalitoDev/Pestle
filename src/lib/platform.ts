import { Capacitor } from '@capacitor/core';

/** True inside the Android app (Capacitor), false on the website. */
export const isNative = Capacitor.isNativePlatform();

/**
 * Where the API lives. On the website it is same-origin ("/api"); the Android app bundles the UI,
 * so it calls the deployed site configured at build time with VITE_API_BASE. If that is unset or
 * unreachable, the app falls back to offline mode (pastes saved on the device).
 */
export const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '');

/** Public address used for share links (the app's own origin is https://localhost). */
export const PUBLIC_URL = (import.meta.env.VITE_PUBLIC_URL || API_BASE || '').replace(/\/+$/, '');

export function shareUrl(path: string) {
  return isNative && PUBLIC_URL ? PUBLIC_URL + path : window.location.origin + path;
}

/**
 * Latest Android build, published by .github/workflows/android.yml as a GitHub Release asset.
 * Override with VITE_APK_URL (e.g. to host the APK elsewhere).
 */
export const APK_URL =
  import.meta.env.VITE_APK_URL || 'https://github.com/GonzalitoDev/pestesting/releases/latest/download/Pestle.apk';
