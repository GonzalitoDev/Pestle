import { json, preflight, rateLimit, redis, safe, storageUnavailable } from './_lib/store.js';
import { db } from './_lib/db.js';

/**
 * Suggestions box. POST { texto, contacto? } stores the message in Redis (list "sugerencias",
 * newest first, last 1000 kept). There is no public way to read them: check them in the Upstash
 * console (Data Browser → key "sugerencias").
 */
export const SUGGESTIONS_KEY = 'sugerencias';

export const POST = safe(async (request) => {
  if (!redis) return storageUnavailable();
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return json({ error: 'El content-type tiene que ser application/json' }, 415);
  }
  const limited = await rateLimit(request, 'sugerencias', 5, 3600);
  if (limited) return limited;
  let body: { texto?: unknown; contacto?: unknown; pagina?: unknown };
  try {
    const text = await request.text();
    if (text.length > 8192) return json({ error: 'El mensaje es demasiado largo' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'El cuerpo no es un JSON válido' }, 400);
  }
  const texto = typeof body.texto === 'string' ? body.texto.trim() : '';
  if (texto.length < 5) return json({ error: 'Escribí un poco más para que se entienda.' }, 400);
  if (texto.length > 2000) return json({ error: 'El mensaje puede tener hasta 2000 caracteres.' }, 400);
  const contacto = typeof body.contacto === 'string' ? body.contacto.trim().slice(0, 120) : '';
  const pagina = typeof body.pagina === 'string' ? body.pagina.slice(0, 200) : '';
  await redis.lpush(SUGGESTIONS_KEY, JSON.stringify({ texto, contacto, pagina, fecha: new Date().toISOString() }));
  await redis.ltrim(SUGGESTIONS_KEY, 0, 999);
  await db.suggestion({ texto, contacto, pagina });
  return json({ ok: true }, 201);
});

export const OPTIONS = preflight;
