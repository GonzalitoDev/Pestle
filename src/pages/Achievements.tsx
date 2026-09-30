import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Trophy } from 'lucide-react';
import { ACHIEVEMENTS } from '../lib/achievements';
import { startProgressSync, useProgress } from '../lib/courseProgress';
import { PageHeader, buttonClass } from '../components/ui';
import { cn } from '../lib/utils';

export default function Achievements() {
  const done = new Set(useProgress().done);
  useEffect(() => startProgressSync(), []);

  const items = ACHIEVEMENTS.map((a) => ({ a, ...a.progress(done) }));
  const unlocked = items.filter((i) => i.value >= i.target).length;
  const pct = Math.round((unlocked / items.length) * 100);

  return (
    <div className="space-y-8 animate-fade-up">
      <PageHeader
        icon={Trophy}
        title="Logros"
        description="Se desbloquean a medida que leés la guía y avanzás en los cursos. Se guardan junto con tu progreso."
        actions={
          <Link to="/cursos" className={buttonClass('primary')}>
            Seguir aprendiendo
          </Link>
        }
      />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            {unlocked} de {items.length} logros
          </span>
          <span className="text-muted">{pct}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Logros desbloqueados">
          <div className="h-full rounded-full bg-warn transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ a, value, target }) => {
          const got = value >= target;
          return (
            <li
              key={a.id}
              className={cn(
                'flex gap-4 rounded-xl border p-4 transition-colors',
                got ? 'border-warn/40 bg-warn-soft' : 'border-line bg-surface'
              )}
            >
              <div
                className={cn(
                  'grid size-14 shrink-0 place-items-center rounded-full text-3xl',
                  got ? 'bg-surface shadow-card' : 'bg-surface-2 grayscale opacity-50'
                )}
                aria-hidden
              >
                {a.emoji}
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="flex items-center gap-1.5 font-semibold">
                  {!got && <Lock className="size-3.5 text-muted" aria-label="Bloqueado" />}
                  {a.title}
                </p>
                <p className="text-sm text-muted">{a.description}</p>
                {got ? (
                  <p className="text-xs font-medium text-warn">¡Desbloqueado!</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-warn/70" style={{ width: `${(value / target) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted">
                      {value}/{target}
                    </span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
