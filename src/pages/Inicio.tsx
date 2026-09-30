import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { COURSES } from '../data/courses';
import { GUIDE } from '../data/guide';
import { SNIPPETS } from '../data/snippets';
import { buttonClass } from '../components/ui';

const SECCIONES = [
  {
    to: '/guia',
    nombre: 'Guía',
    texto: `Para leer. Explica Python desde cero, un tema por capítulo (son ${GUIDE.length}). Los ejemplos se pueden ejecutar ahí mismo.`,
  },
  {
    to: '/cursos',
    nombre: 'Cursos',
    texto: `Para practicar. Hay ${COURSES.length} cursos; cada lección tiene un ejercicio que se corrige solo y al final hay un proyecto. Si terminás uno, podés pedir el certificado.`,
  },
  {
    to: '/nuevo',
    nombre: 'Editor',
    texto: 'Escribís código, lo ejecutás y, si querés, lo publicás. Te da un enlace para mandárselo a quien quieras.',
  },
  {
    to: '/codes',
    nombre: 'Biblioteca',
    texto: `${SNIPPETS.length} programas cortos ya hechos: para mirar cómo están escritos, ejecutarlos y cambiarles cosas.`,
  },
  {
    to: '/explore',
    nombre: 'Explorar',
    texto: 'Lo último que publicó el resto de la gente.',
  },
  {
    to: '/logros',
    nombre: 'Logros y ranking',
    texto: 'Para ver cuánto avanzaste. Aparecer en el ranking es opcional y se hace con un apodo.',
  },
];

/** Home: what the site is for and where everything is. */
export default function Inicio() {
  return (
    <div className="mx-auto max-w-3xl space-y-12 animate-fade-up">
      <section className="space-y-4 pt-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Aprender Python sin instalar nada</h1>
        <p className="text-lg leading-relaxed text-muted">
          Pestle es una página para aprender a programar en Python y practicar. Todo pasa en el navegador: no hay que
          instalar programas ni crear una cuenta.
        </p>
        <p className="leading-relaxed">
          Sirve si nunca programaste y no sabés por dónde empezar, y también si ya sabés algo y querés practicar o probar una
          idea rápido. Además, si tenés un código y se lo querés mostrar a alguien, lo pegás, lo publicás y le pasás el
          enlace.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link to="/guia" className={buttonClass('primary', 'lg')}>
            Empezar por la guía
          </Link>
          <Link to="/nuevo" className={buttonClass('secondary', 'lg')}>
            Ir al editor
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Qué hay en el sitio</h2>
        <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {SECCIONES.map((s, i) => (
            <li key={s.to}>
              <Link to={s.to} className="group flex gap-4 px-5 py-4 hover:bg-surface-2">
                <span className="w-5 shrink-0 pt-0.5 text-sm tabular-nums text-muted">{i + 1}.</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium group-hover:text-accent">{s.nombre}</span>
                  <span className="block text-sm leading-relaxed text-muted">{s.texto}</span>
                </span>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Por dónde arrancar</h2>
        <p className="leading-relaxed">
          Si nunca programaste, leé los primeros capítulos de la{' '}
          <Link to="/guia" className="text-accent underline underline-offset-2">
            guía
          </Link>{' '}
          y después hacé el curso <em>Python desde cero</em>. No hace falta leer toda la guía antes: se puede ir alternando.
        </p>
        <p className="leading-relaxed">
          Si ya sabés lo básico, andá directo a los{' '}
          <Link to="/cursos" className="text-accent underline underline-offset-2">
            cursos
          </Link>{' '}
          más avanzados o abrí el editor y probá lo que quieras.
        </p>
      </section>

      <section className="space-y-3 border-t border-line pt-8 text-sm leading-relaxed text-muted">
        <p>
          El progreso se guarda solo, en este navegador y en el servidor. Para seguir en otro dispositivo hay un código en la
          página de cursos. No se pide mail ni contraseña.
        </p>
        <p>
          El código que ejecutás corre en tu navegador, aislado del resto de la página. Más detalles en{' '}
          <Link to="/privacy" className="underline underline-offset-2">
            Privacidad
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
