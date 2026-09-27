import { NewPaste, Paste } from '../types';

const LOCAL_STORAGE_KEY = 'pestle_mock_pastes';
const OWNER_ID_KEY = 'pestle_owner_id';

const OWNER_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;
let memoryOwnerId: string | null = null;

/**
 * Anonymous, per-browser identity used to list and delete your own pastes. It works like a
 * password: only its hash is sent to storage, and it never leaves this browser except in
 * same-origin API requests. Falls back to an in-memory id when storage is blocked.
 */
export function getOwnerId() {
  try {
    const stored = localStorage.getItem(OWNER_ID_KEY);
    if (stored && OWNER_ID_PATTERN.test(stored)) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem(OWNER_ID_KEY, id);
    return id;
  } catch {
    memoryOwnerId ??= crypto.randomUUID();
    return memoryOwnerId;
  }
}

const EXPIRY_MS: Record<NewPaste['expiresIn'], number | null> = {
  never: null,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
};

interface PasteBackend {
  addPaste(paste: NewPaste): Promise<string>;
  getPaste(id: string): Promise<Paste | null>;
  getMyPastes(): Promise<Paste[]>;
  getPublicPastes(): Promise<Paste[]>;
  deletePaste(id: string): Promise<void>;
}

/**
 * Fallback implementation using LocalStorage, used when the /api functions are
 * unavailable (plain `vite` dev server) or no Redis database is connected.
 */
const localDb: PasteBackend = {
  async addPaste({ expiresIn, ...paste }) {
    const pastes: Paste[] = readLocal();
    const id = Math.random().toString(36).substring(2, 11);
    const createdAt = Date.now();
    const ttl = EXPIRY_MS[expiresIn];
    pastes.push({ ...paste, id, createdAt, expiresAt: ttl ? createdAt + ttl : undefined, isOwner: true });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pastes));
    return id;
  },
  async getPaste(id) {
    return readLocal().find((p) => p.id === id) || null;
  },
  async getMyPastes() {
    return readLocal().sort((a, b) => b.createdAt - a.createdAt);
  },
  async getPublicPastes() {
    return readLocal()
      .filter((p) => p.isPublic)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
  async deletePaste(id) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(readLocal().filter((p) => p.id !== id)));
  },
};

function readLocal(): Paste[] {
  const now = Date.now();
  try {
    const pastes: unknown = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    if (!Array.isArray(pastes)) return [];
    return pastes.filter(
      (p): p is Paste =>
        p && typeof p.id === 'string' && typeof p.content === 'string' && (!p.expiresAt || p.expiresAt > now)
    );
  } catch {
    return [];
  }
}

/** Vercel Functions backed by Upstash Redis (see /api). */
async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', 'x-owner-id': getOwnerId(), ...init.headers },
  });
  if (!res.ok && res.status !== 404) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error);
  }
  return res;
}

const remoteDb: PasteBackend = {
  async addPaste(paste) {
    const res = await api('/pastes', { method: 'POST', body: JSON.stringify(paste) });
    return (await res.json()).id;
  },
  async getPaste(id) {
    const res = await api(`/pastes/${encodeURIComponent(id)}`);
    return res.status === 404 ? null : res.json();
  },
  async getMyPastes() {
    const res = await api('/pastes');
    return (await res.json()).pastes;
  },
  async getPublicPastes() {
    const res = await api('/pastes?scope=public');
    return (await res.json()).pastes;
  },
  async deletePaste(id) {
    await api(`/pastes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

let backendPromise: Promise<{ backend: PasteBackend; isMock: boolean }> | null = null;

/** Probe /api/health once to decide between the real backend and the LocalStorage fallback. */
export function resolveBackend() {
  backendPromise ??= fetch('/api/health')
    .then((res) => res.json())
    .then((health) => (health.storage ? { backend: remoteDb, isMock: false } : { backend: localDb, isMock: true }))
    .catch(() => ({ backend: localDb, isMock: true }));
  return backendPromise;
}

export const pasteService: PasteBackend = {
  addPaste: async (paste) => (await resolveBackend()).backend.addPaste(paste),
  getPaste: async (id) => (await resolveBackend()).backend.getPaste(id),
  getMyPastes: async () => (await resolveBackend()).backend.getMyPastes(),
  getPublicPastes: async () => (await resolveBackend()).backend.getPublicPastes(),
  deletePaste: async (id) => (await resolveBackend()).backend.deletePaste(id),
};
