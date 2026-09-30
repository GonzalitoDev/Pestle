import { json, ownerHashFrom, preflight, progressKey, rateLimit, redis, safe, storageUnavailable } from './_lib/store.js';
import { db } from './_lib/db.js';
import { NAMES_KEY, RANKING_KEY, scoreOf } from './_lib/ranking.js';

/**
 * Opt-in leaderboard. Only people who choose a nickname appear; their score is always computed
 * by the server from their stored course progress. Owner hashes never leave the server.
 */

const TOP = 50;

export function cleanNick(raw: unknown) {
  if (typeof raw !== 'string') return null;
  const nick = raw.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (nick.length < 3 || nick.length > 20) return null;
  if (!/^[\p{L}\p{N}][\p{L}\p{N} _.-]*$/u.test(nick)) return null;
  return nick;
}

export const GET = safe(async (request) => {
  if (!redis) return storageUnavailable();
  const limited = await rateLimit(request, 'read', 300, 60);
  if (limited) return limited;
  const ownerHash = await ownerHashFrom(request);

  // Upstash answers [member, score, member, score…]; some Redis servers answer [[member, score]…].
  const raw = (await redis.zrange(RANKING_KEY, 0, TOP - 1, { rev: true, withScores: true })) as unknown[];
  const flat = raw.flatMap((x) => (Array.isArray(x) ? x : [x]));
  const members: { hash: string; points: number }[] = [];
  for (let i = 0; i < flat.length; i += 2) members.push({ hash: String(flat[i]), points: Number(flat[i + 1]) });
  const names = members.length ? ((await redis.hmget<Record<string, string>>(NAMES_KEY, ...members.map((m) => m.hash))) ?? {}) : {};

  // Same points, same position (1, 2, 2, 4…).
  let position = 0;
  const top = members.map((m, i) => {
    if (i === 0 || m.points !== members[i - 1].points) position = i + 1;
    return { position, nick: names[m.hash] ?? 'Anónimo', points: m.points, isMe: m.hash === ownerHash };
  });

  let me = null;
  if (ownerHash) {
    const points = await redis.zscore(RANKING_KEY, ownerHash);
    if (points !== null) {
      const above = await redis.zcount(RANKING_KEY, `(${points}`, '+inf');
      me = { nick: (await redis.hget<string>(NAMES_KEY, ownerHash)) ?? '', points: Number(points), position: above + 1 };
    }
  }
  return json({ top, me, total: await redis.zcard(RANKING_KEY) });
});

/** Join the ranking or change the nickname. Body: { apodo }. */
export const POST = safe(async (request) => {
  if (!redis) return storageUnavailable();
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return json({ error: 'El content-type tiene que ser application/json' }, 415);
  }
  const limited = await rateLimit(request, 'ranking', 20, 3600);
  if (limited) return limited;
  const ownerHash = await ownerHashFrom(request);
  if (!ownerHash) return json({ error: 'Falta el encabezado x-owner-id' }, 400);
  let body: { apodo?: unknown };
  try {
    const text = await request.text();
    if (text.length > 1024) return json({ error: 'El pedido es demasiado grande' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'El cuerpo no es un JSON válido' }, 400);
  }
  const nick = cleanNick(body.apodo);
  if (!nick) return json({ error: 'El apodo tiene que tener entre 3 y 20 letras, números, espacios, puntos, guiones o guiones bajos.' }, 400);

  const progress = await redis.get<{ done?: string[] }>(progressKey(ownerHash));
  const points = scoreOf(Array.isArray(progress?.done) ? progress.done : []);
  await redis.hset(NAMES_KEY, { [ownerHash]: nick });
  await redis.zadd(RANKING_KEY, { score: points, member: ownerHash });
  await db.ranking(ownerHash, nick, points);
  return json({ nick, points });
});

/** Leave the ranking. */
export const DELETE = safe(async (request) => {
  if (!redis) return storageUnavailable();
  const limited = await rateLimit(request, 'ranking', 20, 3600);
  if (limited) return limited;
  const ownerHash = await ownerHashFrom(request);
  if (!ownerHash) return json({ error: 'Falta el encabezado x-owner-id' }, 400);
  await redis.zrem(RANKING_KEY, ownerHash);
  await db.ranking(ownerHash, null);
  await redis.hdel(NAMES_KEY, ownerHash);
  return json({ ok: true });
});

export const OPTIONS = preflight;
