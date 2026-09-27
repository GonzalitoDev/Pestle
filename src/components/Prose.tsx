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

/**
 * Minimal markdown for course lessons: paragraphs, "- " lists, ``` code blocks (runnable),
 * `inline code` and **bold**.
 */
export default function Prose({ source, language = 'python' }: { source: string; language?: string }) {
  const blocks: ReactNode[] = [];
  const parts = source.split(/```[a-z]*\n?/);
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      blocks.push(<RunnableExample key={`code-${i}`} code={part.replace(/\n+$/, '')} language={language} />);
      return;
    }
    part
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((paragraph, j) => {
        const lines = paragraph.split('\n');
        if (lines.every((l) => l.trim().startsWith('- '))) {
          blocks.push(
            <ul key={`ul-${i}-${j}`} className="list-disc space-y-1 pl-5 marker:text-muted">
              {lines.map((l, k) => (
                <li key={k}>{inline(l.trim().slice(2))}</li>
              ))}
            </ul>
          );
        } else {
          blocks.push(<p key={`p-${i}-${j}`}>{inline(paragraph)}</p>);
        }
      });
  });
  return <div className="space-y-4 leading-relaxed text-fg/90">{blocks}</div>;
}
