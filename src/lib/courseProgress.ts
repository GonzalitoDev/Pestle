import { useEffect, useState } from 'react';

// Course progress lives in this browser only (no account needed).
const DONE_KEY = 'pestle_course_done';
const CODE_KEY = (courseId: string, lessonId: string) => `pestle_course_code:${courseId}/${lessonId}`;
const listeners = new Set<() => void>();

function readDone(): Set<string> {
  try {
    const value = JSON.parse(localStorage.getItem(DONE_KEY) || '[]');
    return new Set(Array.isArray(value) ? value.filter((v) => typeof v === 'string') : []);
  } catch {
    return new Set();
  }
}

export function markDone(courseId: string, lessonId: string) {
  const done = readDone();
  done.add(`${courseId}/${lessonId}`);
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify([...done]));
  } catch {
    // storage blocked: progress lasts for this visit only
  }
  listeners.forEach((fn) => fn());
}

/** Completed lesson keys ("course/lesson"), kept in sync across components. */
export function useCompleted() {
  const [done, setDone] = useState(readDone);
  useEffect(() => {
    const sync = () => setDone(readDone());
    listeners.add(sync);
    window.addEventListener('storage', sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return done;
}

export function loadCode(courseId: string, lessonId: string): string | null {
  try {
    return localStorage.getItem(CODE_KEY(courseId, lessonId));
  } catch {
    return null;
  }
}

export function saveCode(courseId: string, lessonId: string, code: string) {
  try {
    localStorage.setItem(CODE_KEY(courseId, lessonId), code);
  } catch {
    // ignore
  }
}
