import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../lib/theme';

/** Syntax-highlighted, read-only code that follows the light/dark theme. */
export default function CodeBlock({ code, language, lineNumbers = true }: { code: string; language: string; lineNumbers?: boolean }) {
  const { resolved } = useTheme();
  return (
    <SyntaxHighlighter
      language={language}
      style={resolved === 'dark' ? oneDark : oneLight}
      customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent', fontSize: '13px', lineHeight: '1.65' }}
      codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
      showLineNumbers={lineNumbers}
      lineNumberStyle={{ color: 'var(--muted)', opacity: 0.6, minWidth: '2.75em', paddingRight: '1em' }}
    >
      {code}
    </SyntaxHighlighter>
  );
}
