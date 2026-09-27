import { isNative } from './platform';
import type { ResolvedTheme } from './theme';

/** Android-only setup: hardware back button navigates the app history instead of closing it. */
export async function initNative() {
  if (!isNative) return;
  const { App } = await import('@capacitor/app');
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) window.history.back();
    else App.exitApp();
  });
}

/** Keeps the Android status/navigation bar icons readable for the current theme. */
export async function syncSystemBars(theme: ResolvedTheme) {
  if (!isNative) return;
  const { SystemBars, SystemBarsStyle } = await import('@capacitor/core');
  // Style.Dark = light icons for dark backgrounds, and vice versa.
  await SystemBars.setStyle({ style: theme === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => {});
}
