import { json, preflight, redis, redisEnvNames, safe } from './_lib/store.js';

export const GET = safe(async () => {
  if (!redis) {
    const hint = redisEnvNames.some((k) => k === 'REDIS_URL' || k.endsWith('_REDIS_URL'))
      ? 'Found REDIS_URL only: connect "Upstash for Redis" (REST API), not a plain Redis database.'
      : redisEnvNames.length
        ? `Database variables found (${redisEnvNames.join(', ')}) but no REST URL + token pair.`
        : 'No database variables found. Connect Upstash for Redis in Vercel → Storage, then redeploy.';
    return json({ ok: true, storage: false, hint });
  }
  try {
    await redis.ping();
    return json({ ok: true, storage: true });
  } catch {
    return json({ ok: false, storage: false }, 503);
  }
});

export const OPTIONS = preflight;
