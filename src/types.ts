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
  { value: 'never', label: 'Never' },
  { value: '1h', label: '1 Hour' },
  { value: '1d', label: '1 Day' },
  { value: '1w', label: '1 Week' },
];

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'text', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
];
