import { COURSES } from '../../src/data/courses.js';
import { db } from './db.js';
import { redis } from './store.js';

export const RANKING_KEY = 'ranking:puntos';
export const NAMES_KEY = 'ranking:apodos';

/** Points: 10 per lesson, 50 per final project, 100 bonus per finished course. */
export function scoreOf(done: string[]) {
  const d = new Set(done);
  let points = 0;
  for (const c of COURSES) {
    const lessons = c.lessons.filter((l) => d.has(`${c.id}/${l.id}`)).length;
    const project = d.has(`${c.id}/proyecto`);
    points += lessons * 10 + (project ? 50 : 0) + (project && lessons === c.lessons.length ? 100 : 0);
  }
  return points;
}

/** Updates the owner's score, only if they chose to appear in the ranking. */
export async function updateScore(ownerHash: string, done: string[]) {
  if (!redis) return;
  if ((await redis.zscore(RANKING_KEY, ownerHash)) === null) return;
  const points = scoreOf(done);
  await redis.zadd(RANKING_KEY, { score: points, member: ownerHash });
  await db.points(ownerHash, points);
}
