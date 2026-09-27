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

export function generateId(length = 10) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join('');
}

export async function hashOwner(ownerId: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`pestle:${ownerId}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function ownerHashFrom(request: Request) {
  const ownerId = request.headers.get('x-owner-id');
  return ownerId && ownerId.length >= 16 && ownerId.length <= 128 ? hashOwner(ownerId) : null;
}

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
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
