import { COURSES } from '../data/courses';

/**
 * Achievements are derived from course progress (completed lessons and projects), so they sync
 * across devices together with it and need no storage of their own.
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  /** Current value and target, for the progress bar. */
  progress: (done: Set<string>) => { value: number; target: number };
}

const lessonsDone = (done: Set<string>) =>
  COURSES.reduce((n, c) => n + c.lessons.filter((l) => done.has(`${c.id}/${l.id}`)).length, 0);
const totalLessons = COURSES.reduce((n, c) => n + c.lessons.length, 0);
const projectsDone = (done: Set<string>) => COURSES.filter((c) => done.has(`${c.id}/proyecto`)).length;
const courseDone = (done: Set<string>, id: string) => {
  const c = COURSES.find((x) => x.id === id)!;
  return c.lessons.every((l) => done.has(`${c.id}/${l.id}`)) && done.has(`${c.id}/proyecto`);
};
const coursesDone = (done: Set<string>) => COURSES.filter((c) => courseDone(done, c.id)).length;

const lessonGoal = (id: string, title: string, emoji: string, target: number): Achievement => ({
  id,
  title,
  emoji,
  description: target === 1 ? 'Completá tu primera lección.' : `Completá ${target} lecciones.`,
  progress: (d) => ({ value: Math.min(lessonsDone(d), target), target }),
});

const COURSE_EMOJI: Record<string, string> = {
  'python-desde-cero': '🐍',
  'python-practico': '🧰',
  algoritmos: '🧮',
  poo: '🏗️',
  'python-avanzado': '🚀',
};

export const ACHIEVEMENTS: Achievement[] = [
  lessonGoal('primer-paso', 'Primer paso', '👣', 1),
  lessonGoal('cinco-lecciones', 'En marcha', '🔥', 5),
  lessonGoal('diez-lecciones', 'Constancia', '💪', 10),
  lessonGoal('veinticinco-lecciones', 'Imparable', '⚡', 25),
  {
    id: 'todas-las-lecciones',
    title: 'Enciclopedia',
    emoji: '📚',
    description: `Completá las ${totalLessons} lecciones de todos los cursos.`,
    progress: (d) => ({ value: lessonsDone(d), target: totalLessons }),
  },
  {
    id: 'primer-proyecto',
    title: 'Constructor',
    emoji: '🛠️',
    description: 'Terminá tu primer proyecto final.',
    progress: (d) => ({ value: Math.min(projectsDone(d), 1), target: 1 }),
  },
  ...COURSES.map<Achievement>((c) => ({
    id: `curso-${c.id}`,
    title: c.title,
    emoji: COURSE_EMOJI[c.id] ?? '🎓',
    description: `Completá el curso "${c.title}" con su proyecto final.`,
    progress: (d) => {
      const target = c.lessons.length + 1;
      const value = c.lessons.filter((l) => d.has(`${c.id}/${l.id}`)).length + (d.has(`${c.id}/proyecto`) ? 1 : 0);
      return { value, target };
    },
  })),
  {
    id: 'tres-cursos',
    title: 'Todoterreno',
    emoji: '🏅',
    description: 'Completá 3 cursos.',
    progress: (d) => ({ value: Math.min(coursesDone(d), 3), target: 3 }),
  },
  {
    id: 'maestro',
    title: 'Maestro de Python',
    emoji: '👑',
    description: 'Completá todos los cursos.',
    progress: (d) => ({ value: coursesDone(d), target: COURSES.length }),
  },
];

export const isUnlocked = (a: Achievement, done: Set<string>) => {
  const { value, target } = a.progress(done);
  return value >= target;
};
