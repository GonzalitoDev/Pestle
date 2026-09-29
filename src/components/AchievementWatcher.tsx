import { useEffect } from 'react';
import { ACHIEVEMENTS, isUnlocked } from '../lib/achievements';
import { useProgress } from '../lib/courseProgress';
import { useToast } from './Toast';

const SEEN_KEY = 'pestle_logros_vistos';

/** Shows a toast the moment a new achievement unlocks (once per achievement and browser). */
export default function AchievementWatcher() {
  const { done } = useProgress();
  const toast = useToast();

  useEffect(() => {
    const unlocked = ACHIEVEMENTS.filter((a) => isUnlocked(a, new Set(done))).map((a) => a.id);
    let seen: string[] | null = null;
    try {
      seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? 'null');
    } catch {
      // ignore
    }
    // First time in this browser: remember what's already unlocked without announcing it all.
    const fresh = seen ? unlocked.filter((id) => !seen!.includes(id)) : [];
    for (const id of fresh) {
      const a = ACHIEVEMENTS.find((x) => x.id === id)!;
      toast(`${a.emoji} ¡Logro desbloqueado: ${a.title}!`);
    }
    if (!seen || fresh.length) {
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify([...new Set([...(seen ?? []), ...unlocked])]));
      } catch {
        // ignore
      }
    }
  }, [done, toast]);

  return null;
}
