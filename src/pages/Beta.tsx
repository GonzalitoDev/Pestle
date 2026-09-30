import { FormEvent, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { API_BASE } from '../lib/platform';
import { Button, Card } from '../components/ui';

/** /beta: the site is a work in progress, plus a suggestions box. */
export default function Beta() {
  const [texto, setTexto] = useState('');
  const [contacto, setContacto] = useState('');
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'enviado'>('listo');
  const [error, setError] = useState('');

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setEstado('enviando');
    try {
      const res = await fetch(`${API_BASE}/api/sugerencias`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ texto, contacto, pagina: document.referrer }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'No se pudo enviar');
      setEstado('enviado');
      setTexto('');
      setContacto('');
    } catch (err) {
      setEstado('listo');
      setError(err instanceof Error ? err.message : 'No se pudo enviar. Probá de nuevo en un rato.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-up">
      <header className="space-y-4">
        <span className="inline-block rounded-md bg-warn-soft px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-warn">
          Versión beta
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Pestle todavía está en construcción</h1>
        <div className="space-y-3 leading-relaxed">
          <p>
            Lo estamos armando de a poco. Eso quiere decir que puede haber errores, cosas que cambien de lugar de un día para
            el otro o partes que todavía no están.
          </p>
          <p>
            Por eso nos sirve mucho saber qué pensás. Aceptamos cualquier sugerencia: algo que no anda, una explicación que
            no se entiende, un error de tipeo, un tema que te gustaría que haya o una idea nueva, por más chica o grande que
            sea.
          </p>
          <p>Lo leemos todo.</p>
        </div>
      </header>

      <Card className="p-5">
        {estado === 'enviado' ? (
          <div className="space-y-3 py-4 text-center">
            <CheckCircle2 className="mx-auto size-10 text-success" aria-hidden />
            <p className="font-semibold">¡Gracias! Ya nos llegó.</p>
            <Button variant="ghost" onClick={() => setEstado('listo')}>
              Mandar otra
            </Button>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="sugerencia" className="block font-medium">
                ¿Qué nos querés contar?
              </label>
              <textarea
                id="sugerencia"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={6}
                maxLength={2000}
                required
                placeholder="Por ejemplo: en la lección de bucles no entendí la parte de range…"
                className="block w-full resize-y rounded-lg border border-line bg-surface p-3 text-sm outline-none focus:border-accent"
              />
              <p className="text-right text-xs text-muted">{texto.length}/2000</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="contacto" className="block text-sm font-medium">
                Si querés que te respondamos, dejá un mail o usuario <span className="font-normal text-muted">(opcional)</span>
              </label>
              <input
                id="contacto"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                maxLength={120}
                autoComplete="email"
                className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" icon={Send} loading={estado === 'enviando'} disabled={texto.trim().length < 5}>
              Enviar
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
