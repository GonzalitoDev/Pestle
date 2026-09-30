import { Fragment, ReactNode, useState } from 'react';
import { Play, X } from 'lucide-react';
import CodeBlock from './CodeBlock';
import CodeRunner from './CodeRunner';
import { Button } from './ui';

/** Renders `inline code` and **bold** inside a line of text (no HTML injection: plain React nodes). */
function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      return (
        <code key={i} className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 3) {
      return <strong key={i} className="font-semibold text-fg">{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function RunnableExample({ code, language }: { code: string; language: string }) {
  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState(0);
  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-xl border border-line bg-surface-2/50">
        <div className="overflow-x-auto">
          <CodeBlock code={code} language={language} lineNumbers={false} />
        </div>
        <Button
          size="sm"
          variant={running ? 'ghost' : 'success'}
          icon={running ? X : Play}
          className="absolute right-2 top-2"
          onClick={() => {
            setRunning((r) => !r);
            setRunId((n) => n + 1);
          }}
        >
          {running ? 'Cerrar' : 'Probar'}
        </Button>
      </div>
      {running && <CodeRunner key={runId} code={code} language={language} onClose={() => setRunning(false)} />}
    </div>
  );
}

/** Code fences marked with one of these show code that is not Python (commands, output): no "Probar". */
const PLAIN_FENCES = new Set(['texto', 'consola', 'bash', 'text']);

/**
 * Minimal markdown for course lessons and the guide: paragraphs, "## " headings, "- " lists,
 * ``` code blocks (runnable; ```consola or ```texto are shown without running), `inline code`
 * and **bold**.
 */
export default function Prose({ source, language = 'python' }: { source: string; language?: string }) {
  const blocks: ReactNode[] = [];
  const addText = (text: string, key: string) =>
    text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((paragraph, j) => {
        const lines = paragraph.split('\n');
        if (lines.length === 1 && paragraph.startsWith('## ')) {
          blocks.push(
            <h2 key={`h-${key}-${j}`} className="pt-2 text-xl font-semibold tracking-tight text-fg">
              {inline(paragraph.slice(3))}
            </h2>
          );
        } else if (lines.every((l) => l.trim().startsWith('- '))) {
          blocks.push(
            <ul key={`ul-${key}-${j}`} className="list-disc space-y-1 pl-5 marker:text-muted">
              {lines.map((l, k) => (
                <li key={k}>{inline(l.trim().slice(2))}</li>
              ))}
            </ul>
          );
        } else {
          blocks.push(<p key={`p-${key}-${j}`}>{inline(paragraph)}</p>);
        }
      });

  let last = 0;
  for (const m of source.matchAll(/```([a-z]*)\n?([\s\S]*?)```/g)) {
    addText(source.slice(last, m.index), String(last));
    const code = m[2].replace(/\n+$/, '');
    blocks.push(
      PLAIN_FENCES.has(m[1]) ? (
        <div key={`plain-${m.index}`} className="overflow-x-auto rounded-xl border border-line bg-surface-2/50">
          <CodeBlock code={code} language="text" lineNumbers={false} />
        </div>
      ) : (
        <RunnableExample key={`code-${m.index}`} code={code} language={language} />
      )
    );
    last = m.index! + m[0].length;
  }
  addText(source.slice(last), String(last));
  return <div className="space-y-4 leading-relaxed text-fg/90">{blocks}</div>;
}
