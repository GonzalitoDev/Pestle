/** Languages the in-browser runner can execute or preview (Python via Pyodide/WebAssembly). */
export const RUNNABLE_LANGUAGES = ['javascript', 'python', 'html', 'css'] as const;

export function isRunnable(language: string) {
  return (RUNNABLE_LANGUAGES as readonly string[]).includes(language);
}
