import { getOwnerId, resolveBackend } from './pasteService';
import { API_BASE, shareUrl } from './platform';

export interface Certificate {
  id: string;
  name: string;
  courseId: string;
  courseTitle: string;
  level: string;
  lessons: number;
  projectTitle: string;
  projectCode: string;
  issuedAt: number;
  /** The server re-checked the record's seal: it hasn't been altered. */
  valid: boolean;
  isOwner: boolean;
}

export class CertificateError extends Error {
  constructor(message: string, readonly status: number, readonly missing: string[] = []) {
    super(message);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}/api/certificates${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', 'x-owner-id': getOwnerId(), ...init.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new CertificateError(body.error || `Error ${res.status}`, res.status, body.missing);
  return body as T;
}

/** Certificates need the server (they must be verifiable by anyone), not the offline mode. */
export const certificatesAvailable = async () => !(await resolveBackend()).isMock;

export const getCertificate = (id: string) => call<Certificate>(`?id=${encodeURIComponent(id)}`);

export const myCertificates = () =>
  call<{ certificates: Record<string, string> }>('').then((r) => r.certificates);

export const issueCertificate = (courseId: string, name: string) =>
  call<Certificate>('', { method: 'POST', body: JSON.stringify({ courseId, name }) });

export const verifyUrl = (id: string) => shareUrl(`/certificado/${id}`);

/** Same rule as the server, to show errors before sending. */
export function isValidName(raw: string) {
  const name = raw.normalize('NFC').replace(/\s+/g, ' ').trim();
  return (
    name.length >= 3 &&
    name.length <= 60 &&
    /^\p{L}[\p{L}\p{M}'’. -]*$/u.test(name) &&
    (name.match(/\p{L}/gu) ?? []).length >= 3
  );
}
