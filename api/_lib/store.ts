import { Redis } from '@upstash/redis';

export const LANGUAGES = ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'markdown', 'text'] as const;
export const MAX_CONTENT_BYTES = 512 * 1024;
export const MAX_TITLE_LENGTH = 200;
export const EXPIRY_OPTIONS: Record<string, number | null> = {
  never: null,
  '1h': 60 * 60,
  '1d': 60 * 60 * 24,
  '1w': 60 * 60 * 24 * 7,
};

export interface StoredPaste {
  id: string;
  title?: string;
  content: string;
  language: (typeof LANGUAGES)[number];
  ownerHash?: string;
  createdAt: number;
  expiresAt?: number;
  isPublic: boolean;
}

// Vercel's Upstash integration injects KV_REST_API_*; a direct Upstash setup uses UPSTASH_REDIS_REST_*.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;

export const pasteKey = (id: string) => `paste:${id}`;
export const ownerKey = (ownerHash: string) => `owner:${ownerHash}`;
export const PUBLIC_FEED_KEY = 'feed:public';
export const PUBLIC_FEED_SIZE = 100;

const ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Unbiased random id (rejection sampling). 12 base62 chars ≈ 71 bits, so unlisted links can't be guessed. */
export function generateId(length = 12) {
  const maxByte = 256 - (256 % ID_ALPHABET.length);
  let id = '';
  while (id.length < length) {
    for (const b of crypto.getRandomValues(new Uint8Array(length * 2))) {
      if (b < maxByte && id.length < length) id += ID_ALPHABET[b % ID_ALPHABET.length];
    }
  }
  return id;
}

const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');

/** HMAC-SHA256 keyed with OWNER_HASH_SECRET (optional env var) so stored hashes can't be brute-forced offline. */
export async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(process.env.OWNER_HASH_SECRET || 'pestle'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

export const hashOwner = (ownerId: string) => hmac(`owner:${ownerId}`);

const OWNER_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

export async function ownerHashFrom(request: Request) {
  const ownerId = request.headers.get('x-owner-id');
  return ownerId && OWNER_ID_PATTERN.test(ownerId) ? hashOwner(ownerId) : null;
}

/** Headers added to every API response on top of the site-wide ones in vercel.json. */
export const API_HEADERS = {
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  // API responses are data, never documents: forbid scripts/frames even if a browser renders one.
  'content-security-policy': "default-src 'none'; frame-ancestors 'none'; sandbox",
};

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { ...API_HEADERS, ...headers } });
}

/** Client IP as reported by Vercel's edge (clients cannot spoof x-vercel-forwarded-for). */
function clientIp(request: Request) {
  const h = request.headers;
  const forwarded = h.get('x-vercel-forwarded-for') || h.get('x-real-ip') || h.get('x-forwarded-for') || 'unknown';
  return forwarded.split(',')[0].trim();
}

/**
 * Fixed-window rate limit per client IP. Returns a 429 response when exceeded, otherwise null.
 * IPs are stored only as a keyed hash, and each counter expires with its window.
 */
export async function rateLimit(request: Request, bucket: string, limit: number, windowSeconds: number) {
  if (!redis) return null;
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `rl:${bucket}:${(await hmac(`ip:${clientIp(request)}`)).slice(0, 32)}:${window}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSeconds);
  if (count <= limit) return null;
  const retryAfter = (window + 1) * windowSeconds - Math.floor(Date.now() / 1000);
  return json({ error: 'Too many requests. Try again later.' }, 429, { 'retry-after': String(retryAfter) });
}

/** Wraps a handler so unexpected errors return a generic 500 instead of internal details. */
export function safe(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (err) {
      console.error(err);
      return json({ error: 'Internal error' }, 500);
    }
  };
}

export function storageUnavailable() {
  return json({ error: 'Storage not configured. Connect an Upstash Redis database to this Vercel project.' }, 503);
}

/** Public shape of a paste: never leaks the owner hash, only whether the caller owns it. */
export function toPublic(paste: StoredPaste, callerHash: string | null) {
  const { ownerHash, ...rest } = paste;
  return {
    ...rest,
    author: ownerHash ? ownerHash.substring(0, 8) : undefined,
    isOwner: Boolean(ownerHash && callerHash && ownerHash === callerHash),
  };
}
