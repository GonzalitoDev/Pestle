import { COURSES } from '../src/data/courses.js';
import { ACHIEVEMENTS } from '../src/lib/achievements.js';
import { json, ownerHashFrom, preflight, progressKey, rateLimit, redis, safe, storageUnavailable } from './_lib/store.js';
import {
  ACHIEVEMENT_COUNTS_KEY,
  COURSE_COUNTS_KEY,
  RECENT_KEY,
  USERS_KEY,
  UserRecord,
  publicName,
  recordProgress,
  userKey,
} from './_lib/records.js';

/**
 * GET /api/stats          → public totals: users, people per achievement, completions per
 *                           course and the latest completions (nickname only if they joined the ranking).
 * GET /api/stats?mine=1   → the caller's own record: achievements and courses with dates.
 */
export const GET = safe(async (request) => {
  if (!redis) return storageUnavailable();
  const limited = await rateLimit(request, 'read', 300, 60);
  if (limited) return limited;
  const url = new URL(request.url);

  if (url.searchParams.get('mine')) {
    const ownerHash = await ownerHashFrom(request);
    if (!ownerHash) return json({ error: 'Falta el encabezado x-owner-id' }, 400);
    let record = await redis.get<UserRecord>(userKey(ownerHash));
    if (!record) {
      // Users who made progress before the records existed get registered on first look.
      const progress = await redis.get<{ done?: string[] }>(progressKey(ownerHash));
      if (progress?.done?.length) record = await recordProgress(ownerHash, progress.done);
    }
    return json(record ?? { logros: {}, cursos: {}, desde: null });
  }

  const [usuarios, porLogro, porCurso, recientesRaw] = await Promise.all([
    redis.scard(USERS_KEY),
    redis.hmget<Record<string, number>>(ACHIEVEMENT_COUNTS_KEY, ...ACHIEVEMENTS.map((a) => a.id)),
    redis.hmget<Record<string, number>>(COURSE_COUNTS_KEY, ...COURSES.map((c) => c.id)),
    redis.lrange(RECENT_KEY, 0, 19),
  ]);
  const recientes = await Promise.all(
    recientesRaw.map(async (raw) => {
      const r = (typeof raw === 'string' ? JSON.parse(raw) : raw) as { curso: string; usuario: string; fecha: number };
      return {
        curso: COURSES.find((c) => c.id === r.curso)?.title ?? r.curso,
        cursoId: r.curso,
        apodo: (await publicName(r.usuario)) ?? 'Anónimo',
        fecha: r.fecha,
      };
    })
  );
  const num = (o: Record<string, unknown> | null) =>
    Object.fromEntries(Object.entries(o ?? {}).filter(([, v]) => v != null).map(([k, v]) => [k, Number(v)]));
  return json({ usuarios, porLogro: num(porLogro), porCurso: num(porCurso), recientes });
});

export const OPTIONS = preflight;
