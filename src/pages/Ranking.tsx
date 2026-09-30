import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CloudOff, GraduationCap, Medal, Pencil, UserMinus } from 'lucide-react';
import { RankingData, getRanking, joinRanking, leaveRanking } from '../lib/ranking';
import { resolveBackend } from '../lib/pasteService';
import { startProgressSync, syncNow } from '../lib/courseProgress';
import { Button, Card, EmptyState, PageHeader, Spinner, buttonClass } from '../components/ui';
import { useToast } from '../components/Toast';
import { cn, timeAgo } from '../lib/utils';
import { PublicStats, getStats } from '../lib/stats';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Ranking() {
  const toast = useToast();
  const [data, setData] = useState<RankingData | null>(null);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [state, setState] = useState<'loading' | 'offline' | 'error' | 'ready'>('loading');
  const [nick, setNick] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [d, st] = await Promise.all([getRanking(), getStats().catch(() => null)]);
      setStats(st);
      setData(d);
      setNick(d.me?.nick ?? '');
      setState('ready');
    } catch {
      setState('error');
    }
  };

  useEffect(() => {
    startProgressSync();
    (async () => {
      if ((await resolveBackend()).isMock) return setState('offline');
      // Make sure the latest progress counts before showing the table.
      await syncNow().catch(() => {});
      await load();
    })();
  }, []);

  const join = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const r = await joinRanking(nick);
      toast(data?.me ? 'Apodo actualizado' : `¡Ya estás en el ranking con ${r.points} puntos!`);
      setEditing(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const leave = async () => {
    await leaveRanking().catch(() => {});
    toast('Saliste del ranking');
    await load();
  };

  const header = (
    <PageHeader
      icon={Medal}
      title="Ranking"
      description="Quiénes más avanzaron en los cursos. Solo aparecen quienes eligen participar, con el apodo que quieran."
    />
  );

  if (state === 'loading') return <div className="space-y-8">{header}<div className="flex justify-center py-16"><Spinner /></div></div>;
  if (state === 'offline')
    return (
      <div className="space-y-8">
        {header}
        <EmptyState icon={CloudOff} title="El ranking necesita conexión con el servidor" description="Conectate a internet e intentá de nuevo." />
      </div>
    );
  if (state === 'error' || !data)
    return (
      <div className="space-y-8">
        {header}
        <EmptyState icon={AlertTriangle} title="No se pudo cargar el ranking" description="Probá de nuevo en un momento." action={<Button onClick={load}>Reintentar</Button>} />
      </div>
    );

  const showForm = !data.me || editing;

  return (
    <div className="space-y-8 animate-fade-up">
      {header}

      <Card className="p-5 space-y-3">
        {data.me && !editing ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-3xl" aria-hidden>{MEDALS[data.me.position - 1] ?? '🎯'}</div>
            <div className="flex-1">
              <p className="font-semibold">
                Estás en el puesto #{data.me.position} de {data.total} como “{data.me.nick}”
              </p>
              <p className="text-sm text-muted">{data.me.points} puntos. Se actualizan solos cada vez que avanzás.</p>
            </div>
            <Button size="sm" icon={Pencil} onClick={() => setEditing(true)}>Cambiar apodo</Button>
            <Button size="sm" variant="ghost" icon={UserMinus} onClick={leave}>Salir del ranking</Button>
          </div>
        ) : null}
        {showForm && (
          <form onSubmit={join} className="space-y-3">
            <div>
              <h2 className="font-semibold">{data.me ? 'Cambiá tu apodo' : 'Sumate al ranking'}</h2>
              <p className="text-sm text-muted">
                Elegí un apodo (no uses tu nombre completo si no querés). Tu puntaje sale de tu progreso en los cursos.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <label htmlFor="apodo" className="sr-only">Apodo</label>
              <input
                id="apodo"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                maxLength={20}
                placeholder="Tu apodo"
                autoComplete="nickname"
                className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent"
              />
              <Button type="submit" variant="primary" loading={saving} disabled={nick.trim().length < 3}>
                {data.me ? 'Guardar' : 'Participar'}
              </Button>
              {editing && <Button variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>}
            </div>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          </form>
        )}
        <p className="text-xs text-muted">Puntos: 10 por lección · 50 por proyecto final · 100 extra por curso completo.</p>
      </Card>

      {data.top.length === 0 ? (
        <EmptyState
          icon={Medal}
          title="Todavía no hay nadie en el ranking"
          description="¡Sumate y sé el primero!"
          action={<Link to="/cursos" className={buttonClass('primary')}>Ir a los cursos</Link>}
        />
      ) : (
        <Card className="overflow-hidden">
          <ol className="divide-y divide-line">
            {data.top.map((r) => (
              <li
                key={`${r.position}-${r.nick}-${r.points}`}
                className={cn('flex items-center gap-4 px-4 py-3', r.isMe && 'bg-accent-soft')}
              >
                <span className="w-10 text-center text-lg font-semibold tabular-nums">
                  {MEDALS[r.position - 1] ?? `#${r.position}`}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {r.nick}
                  {r.isMe && <span className="ml-2 text-xs font-normal text-accent">(vos)</span>}
                </span>
                <span className="tabular-nums text-sm text-muted">{r.points} pts</span>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {stats && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <GraduationCap className="size-5 text-accent" aria-hidden /> Últimos que completaron un curso
            </h2>
            <p className="text-sm text-muted">{stats.usuarios} personas aprendiendo en Pestle</p>
          </div>
          {stats.recientes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted">
              Todavía nadie completó un curso. ¡Podés ser la primera persona!
            </p>
          ) : (
            <Card className="divide-y divide-line overflow-hidden">
              {stats.recientes.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <span aria-hidden>🎓</span>
                  <span className="min-w-0 flex-1 truncate">
                    <strong className="font-medium">{r.apodo}</strong> completó <span className="text-accent">{r.curso}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">{timeAgo(r.fecha)}</span>
                </div>
              ))}
            </Card>
          )}
          <p className="text-xs text-muted">Solo se muestra el apodo de quienes se sumaron al ranking; el resto aparece como Anónimo.</p>
        </section>
      )}
    </div>
  );
}
