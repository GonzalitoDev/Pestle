import { getOwnerId } from './pasteService';
import { API_BASE } from './platform';
import { syncNow } from './courseProgress';

export interface RankingRow {
  position: number;
  nick: string;
  points: number;
  isMe: boolean;
}
export interface RankingData {
  top: RankingRow[];
  me: { nick: string; points: number; position: number } | null;
  total: number;
}

async function call<T>(init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}/api/ranking`, {
    ...init,
    headers: { 'content-type': 'application/json', 'x-owner-id': getOwnerId(), ...init.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Error ${res.status}`);
  return body as T;
}

export const getRanking = () => call<RankingData>();

export async function joinRanking(apodo: string) {
  // The server scores the saved progress: upload anything pending first.
  await syncNow().catch(() => {});
  return call<{ nick: string; points: number }>({ method: 'POST', body: JSON.stringify({ apodo }) });
}

export const leaveRanking = () => call<{ ok: boolean }>({ method: 'DELETE' });
