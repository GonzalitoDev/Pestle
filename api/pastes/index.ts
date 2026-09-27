import {
  EXPIRY_OPTIONS,
  LANGUAGES,
  MAX_CONTENT_BYTES,
  MAX_TITLE_LENGTH,
  PUBLIC_FEED_KEY,
  PUBLIC_FEED_SIZE,
  StoredPaste,
  generateId,
  json,
  ownerHashFrom,
  ownerKey,
  pasteKey,
  rateLimit,
  redis,
  safe,
  storageUnavailable,
  toPublic,
} from '../_lib/store.js';

const PREVIEW_CHARS = 600;

/**
 * List pastes.
 * - `?scope=public`: the most recent public pastes (content truncated to a preview).
 * - default: the caller's own pastes (identified by the x-owner-id header).
 */
export const GET = safe(async (request) => {
  if (!redis) return storageUnavailable();
  const limited = await rateLimit(request, 'read', 300, 60);
  if (limited) return limited;
  const ownerHash = await ownerHashFrom(request);
  const isPublicFeed = new URL(request.url).searchParams.get('scope') === 'public';
  if (!isPublicFeed && !ownerHash) return json({ error: 'Missing x-owner-id header' }, 400);

  const listKey = isPublicFeed ? PUBLIC_FEED_KEY : ownerKey(ownerHash!);
  const ids = await redis.zrange<string[]>(listKey, 0, 49, { rev: true });
  if (ids.length === 0) return json({ pastes: [] });

  const pastes = await redis.mget<(StoredPaste | null)[]>(...ids.map(pasteKey));
  const expired = ids.filter((_, i) => !pastes[i]);
  if (expired.length) await redis.zrem(listKey, ...expired);

  return json({
    pastes: pastes
      .filter((p): p is StoredPaste => Boolean(p))
      .map((p) => toPublic(p, ownerHash))
      .map((p) =>
        isPublicFeed && p.content.length > PREVIEW_CHARS
          ? { ...p, content: p.content.slice(0, PREVIEW_CHARS), truncated: true }
          : p
      ),
  });
});

// Room for the JSON envelope around a max-size paste (content can be escaped up to ~6x).
const MAX_BODY_BYTES = MAX_CONTENT_BYTES * 6 + 4096;

/** Create a paste. */
export const POST = safe(async (request) => {
  if (!redis) return storageUnavailable();
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return json({ error: 'content-type must be application/json' }, 415);
  }
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return json({ error: 'Request body too large' }, 413);
  }
  const limited = await rateLimit(request, 'create', 20, 600);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json({ error: 'Request body too large' }, 413);
    body = JSON.parse(text);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('not an object');
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { content, title, language, isPublic, expiresIn = 'never' } = body;
  if (typeof content !== 'string' || !content.trim()) return json({ error: 'content is required' }, 400);
  if (new TextEncoder().encode(content).length > MAX_CONTENT_BYTES) return json({ error: 'content exceeds 512KB' }, 413);
  if (title !== undefined && (typeof title !== 'string' || title.length > MAX_TITLE_LENGTH)) {
    return json({ error: `title must be a string of at most ${MAX_TITLE_LENGTH} characters` }, 400);
  }
  if (!LANGUAGES.includes(language as StoredPaste['language'])) return json({ error: 'unsupported language' }, 400);
  if (typeof expiresIn !== 'string' || !Object.hasOwn(EXPIRY_OPTIONS, expiresIn)) {
    return json({ error: 'invalid expiresIn' }, 400);
  }
  if (isPublic !== undefined && typeof isPublic !== 'boolean') return json({ error: 'isPublic must be a boolean' }, 400);

  const ttl = EXPIRY_OPTIONS[expiresIn];
  const ownerHash = await ownerHashFrom(request);
  const now = Date.now();
  const paste: StoredPaste = {
    id: generateId(),
    title: typeof title === 'string' && title.trim() ? title.trim() : undefined,
    content,
    language: language as StoredPaste['language'],
    ownerHash: ownerHash ?? undefined,
    createdAt: now,
    expiresAt: ttl ? now + ttl * 1000 : undefined,
    isPublic: isPublic !== false,
  };

  const tx = redis.multi();
  tx.set(pasteKey(paste.id), paste, ttl ? { ex: ttl } : undefined);
  if (ownerHash) tx.zadd(ownerKey(ownerHash), { score: now, member: paste.id });
  if (paste.isPublic) {
    tx.zadd(PUBLIC_FEED_KEY, { score: now, member: paste.id });
    tx.zremrangebyrank(PUBLIC_FEED_KEY, 0, -(PUBLIC_FEED_SIZE + 1));
  }
  await tx.exec();

  return json(toPublic(paste, ownerHash), 201);
});
