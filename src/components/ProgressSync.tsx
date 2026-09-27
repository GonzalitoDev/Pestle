import { useState } from 'react';
import { Check, Copy, Eye, EyeOff, Smartphone } from 'lucide-react';
import { getOwnerId, setOwnerId } from '../lib/pasteService';
import { pullProgress } from '../lib/courseProgress';
import { copyText } from '../lib/utils';
import { Button, Card } from './ui';
import SaveStatus from './SaveStatus';
import { useToast } from './Toast';

/**
 * Continue on another device: shows this browser's anonymous code and lets you enter the code
 * from another browser/phone to load the same progress (and the same "My pastes").
 */
export default function ProgressSync() {
  const toast = useToast();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const code = getOwnerId();

  const copy = async () => {
    await copyText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const apply = async () => {
    setError('');
    if (input.trim() === code) return setError('Ese es el código de este dispositivo.');
    if (!setOwnerId(input)) return setError('El código no es válido. Copialo completo desde el otro dispositivo.');
    setInput('');
    await pullProgress();
    toast('Progreso cargado desde tu otro dispositivo');
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-2">
            <Smartphone className="size-5 text-muted" aria-hidden />
          </div>
          <div>
            <h2 className="font-semibold">Seguí en otro dispositivo</h2>
            <p className="text-sm text-muted">
              Tu progreso y el código de cada ejercicio se guardan solos, aunque cierres la página. Para usarlos en otro
              navegador, celular o en la app, copiá este código y pegalo allá.
            </p>
          </div>
        </div>
        <SaveStatus />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-sm">
          {visible ? code : '•'.repeat(24)}
        </code>
        <Button size="sm" variant="ghost" icon={visible ? EyeOff : Eye} onClick={() => setVisible((v) => !v)}>
          {visible ? 'Ocultar' : 'Mostrar'}
        </Button>
        <Button size="sm" icon={copied ? Check : Copy} onClick={copy}>
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
      <p className="text-xs text-muted">
        Tratalo como una contraseña: con este código se puede ver tu progreso y borrar tus pastes. No lo compartas.
      </p>

      <form
        className="flex flex-wrap gap-2 border-t border-line pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          void apply();
        }}
      >
        <label className="sr-only" htmlFor="sync-code">
          Código de otro dispositivo
        </label>
        <input
          id="sync-code"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pegá el código de tu otro dispositivo"
          autoComplete="off"
          spellCheck={false}
          className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 font-mono text-sm outline-none focus:border-accent"
        />
        <Button type="submit" size="md" disabled={!input.trim()}>
          Cargar progreso
        </Button>
        {error && <p className="w-full text-sm text-danger">{error}</p>}
      </form>
    </Card>
  );
}
