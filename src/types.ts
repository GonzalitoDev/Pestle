export type Language = 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json' | 'markdown' | 'text';

export interface Paste {
  id: string;
  title?: string;
  content: string;
  language: Language;
  userId?: string;
  createdAt: number; // timestamp
  expiresAt?: number;
  isPublic: boolean;
}

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
