import { useCallback, useEffect, useRef, useState } from 'react';
import { getOwnerId, resolveBackend } from './pasteService';
import { API_BASE } from './platform';

/**
 * Course progress: completed lessons, the code written in each exercise/project, and the last
 * lesson visited. Saved instantly in this browser and synced to the server (under the anonymous
 * owner id), so it survives closing the tab, cleared storage, other URLs and other devices.
 */
export interface ProgressState {
  done: string[];
  code: Record<string, { v: string; t: number }>;
  last?: { path: string; t: number };
}

const STATE_KEY = 'pestle_course_state';
const LEGACY_DONE_KEY = 'pestle_course_done';
const LEGACY_CODE_PREFIX = 'pestle_course_code:';
const listeners = new Set<() => void>();

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'error';
let syncStatus: SyncStatus = 'local';
const statusListeners = new Set<() => void>();
const setStatus = (s: SyncStatus) => {
  syncStatus = s;
  statusListeners.forEach((fn) => fn());
};

const empty = (): ProgressState => ({ done: [], code: {} });

function readLegacy(): ProgressState {
  const state = empty();
  try {
    const done = JSON.parse(localStorage.getItem(LEGACY_DONE_KEY) || '[]');
    if (Array.isArray(done)) state.done = done.filter((d) => typeof d === 'string');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(LEGACY_CODE_PREFIX)) {
        state.code[key.slice(LEGACY_CODE_PREFIX.length)] = { v: localStorage.getItem(key) ?? '', t: 1 };
      }
    }
  } catch {
    // ignore
  }
  return state;
}

let memoryState: ProgressState | null = null;

function read(): ProgressState {
  if (memoryState) return memoryState;
  try {
    const raw = localStorage.getItem(STATE_KEY);
    const parsed = raw ? JSON.parse(raw) : readLegacy();
    memoryState = {
      done: Array.isArray(parsed.done) ? parsed.done.filter((d: unknown) => typeof d === 'string') : [],
      code: parsed.code && typeof parsed.code === 'object' ? parsed.code : {},
      last: parsed.last,
    };
  } catch {
    memoryState = empty();
  }
  return memoryState;
}

function write(next: ProgressState, { push = true } = {}) {
  memoryState = next;
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(next));
  } catch {
    // storage blocked or full: the server copy still keeps it
  }
  listeners.forEach((fn) => fn());
  if (push) schedulePush();
}

/** Union of completed lessons; newest wins for each code entry and for "last". */
export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const code = { ...a.code };
  for (const [k, entry] of Object.entries(b.code ?? {})) {
    if (!code[k] || entry.t > code[k].t) code[k] = entry;
  }
  const last = !a.last ? b.last : !b.last ? a.last : a.last.t >= b.last.t ? a.last : b.last;
  return { done: [...new Set([...(a.done ?? []), ...(b.done ?? [])])], code, last };
}

const same = (a: ProgressState, b: ProgressState) => JSON.stringify(a) === JSON.stringify(b);

// ---- Server sync ------------------------------------------------------------------------------

async function canSync() {
  return !(await resolveBackend()).isMock;
}

const request = (init: RequestInit = {}) =>
  fetch(`${API_BASE}/api/progress`, {
    ...init,
    headers: { 'content-type': 'application/json', 'x-owner-id': getOwnerId(), ...init.headers },
  });

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let dirty = false;

function schedulePush() {
  dirty = true;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void pushNow(), 1500);
}

async function pushNow() {
  pushTimer = null;
  if (!dirty || !(await canSync())) return;
  dirty = false;
  setStatus('syncing');
  try {
    const res = await request({ method: 'POST', body: JSON.stringify(read()) });
    if (!res.ok) throw new Error(String(res.status));
    const merged = mergeProgress(read(), await res.json());
    if (!same(merged, read())) write(merged, { push: false });
    setStatus('synced');
  } catch {
    dirty = true;
    setStatus('error');
  }
}

/** Downloads the server copy and merges it with this browser's (call on startup / after a code change). */
export async function pullProgress() {
  if (!(await canSync())) {
    setStatus('local');
    return;
  }
  setStatus('syncing');
  try {
    const res = await request();
    if (!res.ok) throw new Error(String(res.status));
    const server = (await res.json()) as ProgressState;
    const merged = mergeProgress(read(), server);
    if (!same(merged, read())) write(merged, { push: false });
    // Local changes the server doesn't have yet (e.g. made offline) go up now.
    if (!same(merged, server)) schedulePush();
    setStatus('synced');
  } catch {
    setStatus('error');
  }
}

let started = false;
/** Starts syncing once per page load: initial pull, and a final save when the page is hidden/closed. */
export function startProgressSync() {
  if (started || typeof window === 'undefined') return;
  started = true;
  // Ask the browser not to evict this site's storage when space runs low.
  navigator.storage?.persist?.().catch(() => {});
  void pullProgress();
  const flush = () => {
    if (!dirty) return;
    const body = JSON.stringify(read());
    // keepalive lets the request finish after the tab closes (limited to ~64 KB).
    if (body.length < 60_000) {
      dirty = false;
      fetch(`${API_BASE}/api/progress`, {
        method: 'POST',
        keepalive: true,
        headers: { 'content-type': 'application/json', 'x-owner-id': getOwnerId() },
        body,
      }).catch(() => {
        dirty = true;
      });
    } else {
      void pushNow();
    }
  };
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush());
  window.addEventListener('online', () => void pullProgress());
}

// ---- Public API used by the pages ---------------------------------------------------------------

export function markDone(courseId: string, lessonId: string) {
  const state = read();
  const key = `${courseId}/${lessonId}`;
  if (state.done.includes(key)) return;
  write({ ...state, done: [...state.done, key] });
}

export function setLastVisited(path: string) {
  write({ ...read(), last: { path, t: Date.now() } });
}

export function useProgress() {
  const [state, setState] = useState(read);
  useEffect(() => {
    const sync = () => setState(read());
    listeners.add(sync);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STATE_KEY) {
        memoryState = null;
        sync();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return state;
}

/** Completed lesson keys ("course/lesson"), kept in sync across components and devices. */
export function useCompleted() {
  const { done } = useProgress();
  return new Set(done);
}

export function useSyncStatus() {
  const [status, set] = useState(syncStatus);
  useEffect(() => {
    const fn = () => set(syncStatus);
    statusListeners.add(fn);
    return () => void statusListeners.delete(fn);
  }, []);
  return status;
}

/**
 * The code of one exercise: starts from what was saved (here or on another device), saves every
 * change, and picks up a newer version synced from elsewhere unless you're typing.
 */
export function useLessonCode(courseId: string, lessonId: string, starter: string) {
  const key = `${courseId}/${lessonId}`;
  const [code, setCodeState] = useState(() => read().code[key]?.v ?? starter);
  const lastLocalEdit = useRef(read().code[key]?.t ?? 0);

  useEffect(() => {
    const onChange = () => {
      const entry = read().code[key];
      if (entry && entry.t > lastLocalEdit.current) {
        lastLocalEdit.current = entry.t;
        setCodeState(entry.v);
      }
    };
    listeners.add(onChange);
    return () => void listeners.delete(onChange);
  }, [key]);

  const setCode = useCallback(
    (value: string) => {
      setCodeState(value);
      const t = Date.now();
      lastLocalEdit.current = t;
      const state = read();
      write({ ...state, code: { ...state.code, [key]: { v: value, t } } });
    },
    [key]
  );

  return [code, setCode] as const;
}
