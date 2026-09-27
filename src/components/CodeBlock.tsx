import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../lib/theme';

// Only the languages Pestle supports, instead of Prism's full ~300-language bundle.
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('html', markup);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markdown', markdown);

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
