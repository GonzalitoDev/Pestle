import { json, redis } from './_lib/store.js';

export async function GET() {
  if (!redis) return json({ ok: true, storage: false });
  try {
    await redis.ping();
    return json({ ok: true, storage: true });
  } catch {
    return json({ ok: false, storage: false }, 503);
  }
}
