import { json, redis, safe } from './_lib/store.js';

export const GET = safe(async () => {
  if (!redis) return json({ ok: true, storage: false });
  try {
    await redis.ping();
    return json({ ok: true, storage: true });
  } catch {
    return json({ ok: false, storage: false }, 503);
  }
});
