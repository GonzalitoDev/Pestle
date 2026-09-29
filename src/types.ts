export type Language = 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json' | 'markdown' | 'text';

export interface Paste {
  id: string;
  title?: string;
  content: string;
  language: Language;
  author?: string; // short, non-reversible fingerprint of the creator
  isOwner?: boolean; // true when the current browser created this paste
  createdAt: number; // timestamp
  expiresAt?: number;
  isPublic: boolean;
  truncated?: boolean; // feed previews only carry the first few hundred characters
}

export type Expiry = 'never' | '1h' | '1d' | '1w';

export interface NewPaste {
  title?: string;
  content: string;
  language: Language;
  isPublic: boolean;
  expiresIn: Expiry;
}

export const EXPIRIES: { value: Expiry; label: string }[] = [
  { value: 'never', label: 'Nunca' },
  { value: '1h', label: '1 hora' },
  { value: '1d', label: '1 día' },
  { value: '1w', label: '1 semana' },
];

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'text', label: 'Texto plano' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
];
