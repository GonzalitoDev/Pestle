import { getOwnerId } from './pasteService';
import { API_BASE } from './platform';

export interface PublicStats {
  usuarios: number;
  porLogro: Record<string, number>;
  porCurso: Record<string, number>;
  recientes: { curso: string; cursoId: string; apodo: string; fecha: number }[];
}
export interface MyRecord {
  logros: Record<string, number>;
  cursos: Record<string, number>;
  desde: number | null;
}

async function get<T>(query = ''): Promise<T> {
  const res = await fetch(`${API_BASE}/api/stats${query}`, { headers: { 'x-owner-id': getOwnerId() } });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export const getStats = () => get<PublicStats>();
export const getMyRecord = () => get<MyRecord>('?mine=1');
