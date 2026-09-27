import { PUBLIC_FEED_KEY, StoredPaste, json, ownerHashFrom, ownerKey, pasteKey, redis, storageUnavailable, toPublic } from '../_lib/store.js';

function idFrom(request: Request) {
  const id = new URL(request.url).pathname.split('/').pop() ?? '';
  return /^[A-Za-z0-9]{1,32}$/.test(id) ? id : null;
}

/** Fetch a paste. Append ?raw=1 to get the content as plain text. */
export async function GET(request: Request) {
  if (!redis) return storageUnavailable();
  const id = idFrom(request);
  const paste = id ? await redis.get<StoredPaste>(pasteKey(id)) : null;
  if (!paste) return json({ error: 'Not found' }, 404);

  if (new URL(request.url).searchParams.has('raw')) {
    return new Response(paste.content, {
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
  return json(toPublic(paste, await ownerHashFrom(request)));
}

/** Delete a paste. Only its creator (matching x-owner-id) may do this. */
export async function DELETE(request: Request) {
  if (!redis) return storageUnavailable();
  const id = idFrom(request);
  const paste = id ? await redis.get<StoredPaste>(pasteKey(id)) : null;
  if (!id || !paste) return json({ error: 'Not found' }, 404);

  const ownerHash = await ownerHashFrom(request);
  if (!ownerHash || paste.ownerHash !== ownerHash) return json({ error: 'Forbidden' }, 403);

  const tx = redis.multi();
  tx.del(pasteKey(id));
  tx.zrem(ownerKey(ownerHash), id);
  tx.zrem(PUBLIC_FEED_KEY, id);
  await tx.exec();
  return new Response(null, { status: 204 });
}
