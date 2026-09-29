import { json, ownerHashFrom, preflight, progressKey, rateLimit, redis, safe, storageUnavailable } from './_lib/store.js';

/**
 * Course progress for the anonymous owner (x-owner-id): completed lessons, the code of each
 * exercise and the last lesson visited. POST merges with what is stored (union of completed
 * lessons, newest code per exercise), so two devices never overwrite each other.
 */

interface Progress {
  done: string[];
  code: Record<string, { v: string; t: number }>;
  last?: { path: string; t: number };
}

const KEY_PATTERN = /^[a-z0-9-]{1,64}\/[a-z0-9-]{1,64}$/;
const MAX_DONE = 300;
const MAX_CODE_ENTRIES = 120;
const MAX_CODE_CHARS = 64 * 1024;
const MAX_BODY_BYTES = 1024 * 1024;
const ONE_YEAR = 60 * 60 * 24 * 365;

const empty = (): Progress => ({ done: [], code: {} });

/** Keeps only well-formed entries; anything else is dropped rather than stored. */
function sanitize(input: unknown): Progress {
  const out = empty();
  if (!input || typeof input !== 'object') return out;
  const body = input as Record<string, unknown>;
  const now = Date.now() + 60_000;

  if (Array.isArray(body.done)) {
    out.done = [...new Set(body.done.filter((d): d is string => typeof d === 'string' && KEY_PATTERN.test(d)))].slice(0, MAX_DONE);
  }
  if (body.code && typeof body.code === 'object' && !Array.isArray(body.code)) {
    for (const [k, entry] of Object.entries(body.code as Record<string, unknown>).slice(0, MAX_CODE_ENTRIES)) {
      const e = entry as { v?: unknown; t?: unknown };
      if (
        KEY_PATTERN.test(k) &&
        typeof e?.v === 'string' &&
        e.v.length <= MAX_CODE_CHARS &&
        typeof e.t === 'number' &&
        Number.isFinite(e.t) &&
        e.t > 0 &&
        e.t <= now
      ) {
        out.code[k] = { v: e.v, t: e.t };
      }
    }
  }
  const last = body.last as { path?: unknown; t?: unknown } | undefined;
  if (
    last &&
    typeof last.path === 'string' &&
    /^\/cursos\/[a-z0-9-/]{1,150}$/.test(last.path) &&
    typeof last.t === 'number' &&
    last.t > 0 &&
    last.t <= now
  ) {
    out.last = { path: last.path, t: last.t };
  }
  return out;
}

function merge(a: Progress, b: Progress): Progress {
  const code = { ...a.code };
  for (const [k, entry] of Object.entries(b.code)) {
    if (!code[k] || entry.t > code[k].t) code[k] = entry;
  }
  const last = !a.last ? b.last : !b.last ? a.last : a.last.t >= b.last.t ? a.last : b.last;
  const done = [...new Set([...a.done, ...b.done])].slice(0, MAX_DONE);
  // Keep the most recently edited entries if the combined map grew too large.
  const entries = Object.entries(code).sort((x, y) => y[1].t - x[1].t).slice(0, MAX_CODE_ENTRIES);
  return { done, code: Object.fromEntries(entries), ...(last ? { last } : {}) };
}

export const GET = safe(async (request) => {
  if (!redis) return storageUnavailable();
  const limited = await rateLimit(request, 'read', 300, 60);
  if (limited) return limited;
  const ownerHash = await ownerHashFrom(request);
  if (!ownerHash) return json({ error: 'Missing x-owner-id header' }, 400);
  const stored = await redis.get<Progress>(progressKey(ownerHash));
  return json(stored ? sanitize(stored) : empty());
});

export const POST = safe(async (request) => {
  if (!redis) return storageUnavailable();
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return json({ error: 'content-type must be application/json' }, 415);
  }
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return json({ error: 'Request body too large' }, 413);
  }
  const limited = await rateLimit(request, 'progress', 240, 600);
  if (limited) return limited;
  const ownerHash = await ownerHashFrom(request);
  if (!ownerHash) return json({ error: 'Missing x-owner-id header' }, 400);

  let incoming: Progress;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json({ error: 'Request body too large' }, 413);
    incoming = sanitize(JSON.parse(text));
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const key = progressKey(ownerHash);
  const stored = sanitize(await redis.get<Progress>(key));
  const merged = merge(stored, incoming);
  await redis.set(key, merged, { ex: ONE_YEAR });
  return json(merged);
});

export const OPTIONS = preflight;
