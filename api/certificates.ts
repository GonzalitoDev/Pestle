import { COURSES } from '../src/data/courses.js';
import { hmac, json, ownerHashFrom, preflight, progressKey, rateLimit, redis, safe, storageUnavailable } from './_lib/store.js';
import { db } from './_lib/db.js';

/**
 * Course certificates. The server issues one only after checking the owner's stored progress
 * (every lesson and the final project completed), keeps it forever, and anyone can verify it at
 * /certificado/<id>. The certificate includes a copy of the final project, so a verifier can see
 * the student's actual work.
 */

interface StoredCertificate {
  id: string;
  name: string;
  courseId: string;
  courseTitle: string;
  level: string;
  lessons: number;
  projectTitle: string;
  projectCode: string;
  issuedAt: number;
  ownerHash: string;
  /** HMAC of the fields above, so a record altered directly in the database stops verifying. */
  seal: string;
}

// Crockford base32 (no I, L, O, U): easy to read aloud or type from a printed certificate.
const ID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ID_PATTERN = /^PY-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/;
const MAX_PROJECT_CHARS = 64 * 1024;

const certKey = (id: string) => `cert:${id}`;
const ownerCertsKey = (ownerHash: string) => `certs:${ownerHash}`;

/** PY-XXXX-XXXX-XXXX: 60 random bits, so ids can't be guessed or enumerated. */
function generateCertId() {
  const chars = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => ID_ALPHABET[b & 31]).join('');
  return `PY-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}

/** Normalizes the student's name; null if it doesn't look like a person's name. */
export function cleanName(raw: unknown) {
  if (typeof raw !== 'string') return null;
  const name = raw.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (name.length < 3 || name.length > 60) return null;
  if (!/^\p{L}[\p{L}\p{M}'’. -]*$/u.test(name)) return null;
  if ((name.match(/\p{L}/gu) ?? []).length < 3) return null;
  return name;
}

const sealOf = (c: Omit<StoredCertificate, 'seal'>) =>
  hmac(`cert:${JSON.stringify([c.id, c.name, c.courseId, c.issuedAt, c.ownerHash, c.projectCode])}`);

async function toPublic(c: StoredCertificate, callerHash: string | null) {
  const { ownerHash, seal, ...rest } = c;
  return {
    ...rest,
    valid: seal === (await sealOf(c)),
    isOwner: Boolean(callerHash && callerHash === ownerHash),
  };
}

export const GET = safe(async (request) => {
  if (!redis) return storageUnavailable();
  const limited = await rateLimit(request, 'read', 300, 60);
  if (limited) return limited;
  const url = new URL(request.url);
  const ownerHash = await ownerHashFrom(request);

  const id = url.searchParams.get('id');
  if (id !== null) {
    // Crockford: letters that look like digits are read as those digits (O → 0, I/L → 1).
    const normalized = id.trim().toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1');
    if (!ID_PATTERN.test(normalized)) return json({ error: 'No existe un certificado con ese código' }, 404);
    const cert = await redis.get<StoredCertificate>(certKey(normalized));
    if (!cert) return json({ error: 'No existe un certificado con ese código' }, 404);
    return json(await toPublic(cert, ownerHash));
  }

  // Without an id: the caller's own certificates, as { courseId: certificateId }.
  if (!ownerHash) return json({ error: 'Falta el encabezado x-owner-id' }, 400);
  const ids = await Promise.all(COURSES.map((c) => redis!.hget<string>(ownerCertsKey(ownerHash), c.id)));
  return json({ certificates: Object.fromEntries(COURSES.flatMap((c, i) => (ids[i] ? [[c.id, ids[i]]] : []))) });
});

export const POST = safe(async (request) => {
  if (!redis) return storageUnavailable();
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return json({ error: 'El content-type tiene que ser application/json' }, 415);
  }
  const limited = await rateLimit(request, 'certificate', 20, 3600);
  if (limited) return limited;
  const ownerHash = await ownerHashFrom(request);
  if (!ownerHash) return json({ error: 'Falta el encabezado x-owner-id' }, 400);

  let body: { courseId?: unknown; name?: unknown };
  try {
    const text = await request.text();
    if (text.length > 4096) return json({ error: 'El pedido es demasiado grande' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'El cuerpo no es un JSON válido' }, 400);
  }
  const course = COURSES.find((c) => c.id === body.courseId);
  if (!course) return json({ error: 'Ese curso no existe' }, 400);
  const name = cleanName(body.name);
  if (!name) return json({ error: 'Escribí tu nombre y apellido (solo letras, de 3 a 60 caracteres).' }, 400);

  // One certificate per course and person: asking again returns the one already issued.
  const index = ownerCertsKey(ownerHash);
  const existing = await redis.hget<string>(index, course.id);
  if (existing) {
    const cert = await redis.get<StoredCertificate>(certKey(existing));
    if (cert) return json(await toPublic(cert, ownerHash));
  }

  // The server's copy of the progress decides, not what the browser says.
  const progress = await redis.get<{ done?: string[]; code?: Record<string, { v: string }> }>(progressKey(ownerHash));
  const done = new Set(Array.isArray(progress?.done) ? progress.done : []);
  const missing = course.lessons.filter((l) => !done.has(`${course.id}/${l.id}`)).map((l) => l.title);
  const projectCode = progress?.code?.[`${course.id}/proyecto`]?.v;
  if (!done.has(`${course.id}/proyecto`) || typeof projectCode !== 'string' || !projectCode.trim()) {
    missing.push(`Proyecto final: ${course.project.title}`);
  }
  if (missing.length) {
    return json({ error: 'Todavía no completaste todo el curso.', missing }, 409);
  }

  const base = {
    id: generateCertId(),
    name,
    courseId: course.id,
    courseTitle: course.title,
    level: course.level,
    lessons: course.lessons.length,
    projectTitle: course.project.title,
    projectCode: projectCode!.slice(0, MAX_PROJECT_CHARS),
    issuedAt: Date.now(),
    ownerHash,
  };
  const cert: StoredCertificate = { ...base, seal: await sealOf(base) };

  // hsetnx makes two simultaneous requests end up with a single certificate.
  const claimed = await redis.hsetnx(index, course.id, cert.id);
  if (!claimed) {
    const winner = await redis.get<StoredCertificate>(certKey((await redis.hget<string>(index, course.id))!));
    return winner ? json(await toPublic(winner, ownerHash)) : json({ error: 'Probá de nuevo en un momento' }, 409);
  }
  await redis.set(certKey(cert.id), cert, { nx: true });
  await db.certificate(cert);
  return json(await toPublic(cert, ownerHash), 201);
});

export const OPTIONS = preflight;
