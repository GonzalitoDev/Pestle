/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { Terminal, Plus, FolderOpen, Github, Globe, Library, Menu, X, Sun, Moon, Monitor, AlertTriangle, Smartphone, GraduationCap } from 'lucide-react';
import { Suspense, lazy, useEffect, useState } from 'react';
import { resolveBackend } from './lib/pasteService';
import { ThemePreference, useTheme } from './lib/theme';
import { initNative, syncSystemBars } from './lib/native';
import ApkLink from './components/ApkLink';
import { cn } from './lib/utils';
import { ToastProvider } from './components/Toast';
import Home from './pages/Home';
import { Spinner } from './components/ui';

// Pages other than the editor load on demand, keeping the first download small.
const PasteView = lazy(() => import('./pages/PasteView'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Codes = lazy(() => import('./pages/Codes'));
const Explore = lazy(() => import('./pages/Explore'));
const Courses = lazy(() => import('./pages/Courses'));
const Lesson = lazy(() => import('./pages/Lesson'));
const Privacy = lazy(() => import('./pages/Info').then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/Info').then((m) => ({ default: m.Terms })));
const ApiDocs = lazy(() => import('./pages/Info').then((m) => ({ default: m.ApiDocs })));
const NotFound = lazy(() => import('./pages/Info').then((m) => ({ default: m.NotFound })));

const REPO_URL = 'https://github.com/gonzalitodev/pestesting';

const NAV_ITEMS = [
  { to: '/', label: 'New paste', icon: Plus, end: true },
  { to: '/codes', label: 'Library', icon: Library, end: false },
  { to: '/cursos', label: 'Cursos', icon: GraduationCap, end: false },
  { to: '/explore', label: 'Explore', icon: Globe, end: false },
  { to: '/dashboard', label: 'My pastes', icon: FolderOpen, end: false },
];

const THEME_ORDER: ThemePreference[] = ['system', 'light', 'dark'];
const THEME_META: Record<ThemePreference, { icon: typeof Sun; label: string }> = {
  system: { icon: Monitor, label: 'System' },
  light: { icon: Sun, label: 'Light' },
  dark: { icon: Moon, label: 'Dark' },
};

function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const { preference, setPreference } = useTheme();
  const next = THEME_ORDER[(THEME_ORDER.indexOf(preference) + 1) % THEME_ORDER.length];
  const { icon: Icon, label } = THEME_META[preference];
  return (
    <button
      onClick={() => setPreference(next)}
      aria-label={`Theme: ${label}. Switch to ${THEME_META[next].label}`}
      title={`Theme: ${label}`}
      className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-muted hover:bg-surface-2 hover:text-fg transition-colors"
    >
      <Icon className="size-[18px]" aria-hidden />
      {withLabel && <span className="text-sm">Theme: {label}</span>}
    </button>
  );
}

/** Scroll to top (or to a #hash) on navigation and close the mobile menu. */
function RouteEffects({ onNavigate }: { onNavigate: () => void }) {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    onNavigate();
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const [isMock, setIsMock] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { resolved } = useTheme();

  useEffect(() => {
    resolveBackend().then((b) => setIsMock(b.isMock));
    initNative();
  }, []);

  useEffect(() => {
    syncSystemBars(resolved);
  }, [resolved]);

  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm transition-colors',
      isActive ? 'bg-surface-2 text-fg font-medium' : 'text-muted hover:text-fg hover:bg-surface-2'
    );

  return (
    <Router>
      <ToastProvider>
        <RouteEffects onNavigate={() => setMenuOpen(false)} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] rounded-lg bg-surface px-4 py-2 shadow-card">
          Skip to content
        </a>
        {/* Solid backdrop behind the Android status bar (height is 0 on the web). */}
        <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[var(--safe-top)] bg-bg" />
        <div className="min-h-screen flex flex-col pt-[var(--safe-top)] pb-[var(--safe-bottom)] pl-[var(--safe-left)] pr-[var(--safe-right)]">
          {isMock && (
            <div className="flex items-center justify-center gap-2 border-b border-warn/20 bg-warn-soft px-4 py-1.5 text-xs text-warn">
              <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
              <span>Offline mode: no database connected, pastes are only saved in this browser.</span>
            </div>
          )}

          <nav className="sticky top-[var(--safe-top)] z-50 border-b border-line bg-bg/80 backdrop-blur-md" aria-label="Main">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
              <div className="flex items-center gap-6">
                <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="Pestle home">
                  <span className="grid size-8 place-items-center rounded-lg bg-fg text-bg">
                    <Terminal className="size-4" aria-hidden />
                  </span>
                  <span className="text-lg">Pestle</span>
                </Link>
                <div className="hidden lg:flex items-center gap-1">
                  {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                    <NavLink key={to} to={to} end={end} className={desktopLink}>
                      <Icon className="size-4" aria-hidden /> {label}
                    </NavLink>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <ApkLink className="hidden sm:inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium hover:border-line-strong hover:bg-surface-2 transition-colors mr-1">
                  <Smartphone className="size-4 text-success" aria-hidden /> Get the app
                </ApkLink>
                <ThemeToggle />
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Source code on GitHub"
                  className="hidden sm:inline-flex h-9 items-center rounded-lg px-2.5 text-muted hover:bg-surface-2 hover:text-fg transition-colors"
                >
                  <Github className="size-[18px]" aria-hidden />
                </a>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="lg:hidden inline-flex h-9 items-center rounded-lg px-2.5 text-fg hover:bg-surface-2"
                  aria-label="Toggle menu"
                  aria-expanded={menuOpen}
                >
                  {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
              </div>
            </div>

            {menuOpen && (
              <div className="lg:hidden border-t border-line bg-bg px-4 py-3 space-y-1 animate-fade-up">
                {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
                        isActive ? 'bg-surface-2 font-medium' : 'text-muted hover:text-fg'
                      )
                    }
                  >
                    <Icon className="size-4" aria-hidden /> {label}
                  </NavLink>
                ))}
                <ApkLink className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-success">
                  <Smartphone className="size-4" aria-hidden /> Download Android app (APK)
                </ApkLink>
                <a href={REPO_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:text-fg">
                  <Github className="size-4" aria-hidden /> Source code
                </a>
              </div>
            )}
          </nav>

          <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
            <Suspense
              fallback={
                <div className="flex h-[40vh] items-center justify-center text-muted">
                  <Spinner />
                </div>
              }
            >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/paste/:id" element={<PasteView />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/codes" element={<Codes />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/cursos" element={<Courses />} />
              <Route path="/cursos/:courseId" element={<Lesson />} />
              <Route path="/cursos/:courseId/:lessonId" element={<Lesson />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </main>

          <footer className="border-t border-line">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
              <p>
                <span className="font-medium text-fg">Pestle</span> · share and run code in your browser
              </p>
              <div className="flex flex-wrap justify-center gap-5">
                <Link to="/privacy" className="hover:text-fg">Privacy</Link>
                <Link to="/terms" className="hover:text-fg">Terms</Link>
                <Link to="/api-docs" className="hover:text-fg">API</Link>
                <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-fg">GitHub</a>
              </div>
            </div>
          </footer>
        </div>
      </ToastProvider>
    </Router>
  );
}
