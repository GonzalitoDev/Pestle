import { COURSES } from '../../src/data/courses.js';
import { ACHIEVEMENTS, isUnlocked } from '../../src/lib/achievements.js';
import { NAMES_KEY } from './ranking.js';
import { redis } from './store.js';

/**
 * Permanent records of what each (anonymous) user achieved, computed by the server from their
 * stored progress: unlocked achievements and completed courses, with the date they happened.
 * Also keeps public totals and a list of the latest course completions.
 */
export interface UserRecord {
  /** achievementId → first time it was unlocked (ms) */
  logros: Record<string, number>;
  /** courseId → first time it was completed (ms) */
  cursos: Record<string, number>;
  desde: number;
}

export const userKey = (ownerHash: string) => `usuario:${ownerHash}`;
export const USERS_KEY = 'usuarios';
export const ACHIEVEMENT_COUNTS_KEY = 'logros:conteo';
export const COURSE_COUNTS_KEY = 'cursos:completados';
export const RECENT_KEY = 'cursos:recientes';
const RECENT_SIZE = 50;

export const courseCompleted = (done: Set<string>, courseId: string) => {
  const c = COURSES.find((x) => x.id === courseId)!;
  return c.lessons.every((l) => done.has(`${c.id}/${l.id}`)) && done.has(`${c.id}/proyecto`);
};

/** Called after every progress save: records anything new. Returns the (possibly updated) record. */
export async function recordProgress(ownerHash: string, doneList: string[]) {
  if (!redis) return null;
  const done = new Set(doneList);
  const now = Date.now();
  const stored = await redis.get<UserRecord>(userKey(ownerHash));
  const isNewUser = !stored;
  const record = stored ?? { logros: {}, cursos: {}, desde: now };
  const newAchievements = ACHIEVEMENTS.filter((a) => !record.logros[a.id] && isUnlocked(a, done)).map((a) => a.id);
  const newCourses = COURSES.filter((c) => !record.cursos[c.id] && courseCompleted(done, c.id)).map((c) => c.id);
  if (!newAchievements.length && !newCourses.length && !isNewUser) return record;

  for (const id of newAchievements) record.logros[id] = now;
  for (const id of newCourses) record.cursos[id] = now;
  await redis.set(userKey(ownerHash), record);
  if (isNewUser) await redis.sadd(USERS_KEY, ownerHash);
  for (const id of newAchievements) await redis.hincrby(ACHIEVEMENT_COUNTS_KEY, id, 1);
  for (const id of newCourses) {
    await redis.hincrby(COURSE_COUNTS_KEY, id, 1);
    await redis.lpush(RECENT_KEY, JSON.stringify({ curso: id, usuario: ownerHash, fecha: now }));
  }
  if (newCourses.length) await redis.ltrim(RECENT_KEY, 0, RECENT_SIZE - 1);
  return record;
}

/** Nickname shown publicly: only if the user chose one for the ranking. */
export async function publicName(ownerHash: string) {
  return (await redis?.hget<string>(NAMES_KEY, ownerHash)) ?? null;
}
