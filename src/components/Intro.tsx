import { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';
import { cn } from '../lib/utils';

const SEEN_KEY = 'pestle_intro_vista';
const NAME = 'Pestle';

function shouldShow() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  // Tests and screenshots can skip it with ?sinintro.
  if (new URLSearchParams(window.location.search).has('sinintro')) return false;
  try {
    return !sessionStorage.getItem(SEEN_KEY);
  } catch {
    return true;
  }
}

/**
 * Short opening animation, once per visit: the logo, the name typed like in a terminal and the
 * tagline. Click or any key skips it.
 */
export default function Intro() {
  const [visible] = useState(shouldShow);
  const [typed, setTyped] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(!visible);

  useEffect(() => {
    if (!visible) return;
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // ignore
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= NAME.length; i++) timers.push(setTimeout(() => setTyped(i), 350 + i * 110));
    timers.push(setTimeout(() => setLeaving(true), 2100));
    timers.push(setTimeout(() => setGone(true), 2500));
    const skip = () => {
      setLeaving(true);
      timers.push(setTimeout(() => setGone(true), 400));
    };
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('keydown', skip);
    };
  }, [visible]);

  if (gone) return null;

  return (
    <div
      role="presentation"
      aria-hidden
      onClick={() => {
        setLeaving(true);
        setTimeout(() => setGone(true), 400);
      }}
      className={cn(
        'fixed inset-0 z-[300] flex cursor-pointer flex-col items-center justify-center gap-5 bg-bg',
        leaving && 'intro-out'
      )}
    >
      <div className="intro-pop grid size-20 place-items-center rounded-2xl bg-fg text-bg shadow-card">
        <Terminal className="size-10" />
      </div>
      <p className="font-mono text-4xl font-semibold tracking-tight sm:text-5xl">
        {NAME.slice(0, typed)}
        <span className="intro-cursor ml-0.5 inline-block w-[0.55em] text-accent">_</span>
      </p>
      <p
        className={cn(
          'text-muted transition-opacity duration-500',
          typed === NAME.length ? 'opacity-100' : 'opacity-0'
        )}
      >
        Aprendé Python sin instalar nada
      </p>
    </div>
  );
}
