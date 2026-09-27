import { useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'pestle_theme';
const media = () => window.matchMedia('(prefers-color-scheme: dark)');
const listeners = new Set<() => void>();

export function getPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // storage blocked: fall back to the OS setting
  }
  return 'system';
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== 'system') return preference;
  return media().matches ? 'dark' : 'light';
}

/** Applies a preference to <html>. "system" removes the attribute so CSS follows the OS. */
export function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  if (preference === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', preference);
}

export function setPreference(preference: ThemePreference) {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // not persisted, still applied for this visit
  }
  applyTheme(preference);
  listeners.forEach((fn) => fn());
}

/** Current preference and the theme actually shown, kept in sync with the OS and other components. */
export function useTheme() {
  const [preference, setPref] = useState<ThemePreference>(getPreference);
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(getPreference()));

  useEffect(() => {
    const sync = () => {
      const pref = getPreference();
      setPref(pref);
      setResolved(resolveTheme(pref));
    };
    listeners.add(sync);
    const mq = media();
    mq.addEventListener('change', sync);
    return () => {
      listeners.delete(sync);
      mq.removeEventListener('change', sync);
    };
  }, []);

  return { preference, resolved, setPreference };
}
