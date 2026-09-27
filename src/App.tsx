/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { Terminal, Plus, History, Github, Globe, Library, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getOwnerId, resolveBackend } from './lib/pasteService';
import { cn } from './lib/utils';
import Home from './pages/Home';
import PasteView from './pages/PasteView';
import Dashboard from './pages/Dashboard';
import Codes from './pages/Codes';
import Explore from './pages/Explore';
import { ApiDocs, NotFound, Privacy, Terms } from './pages/Info';

const REPO_URL = 'https://github.com/gonzalitodev/pestesting';

const NAV_ITEMS = [
  { to: '/', label: 'NEW_PASTE', icon: Plus, end: true },
  { to: '/codes', label: 'CODES', icon: Library, end: false },
  { to: '/explore', label: 'EXPLORE', icon: Globe, end: false },
  { to: '/dashboard', label: 'MY_VAULT', icon: History, end: false },
];

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
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const operator = getOwnerId().substring(0, 8).toUpperCase();

  useEffect(() => {
    resolveBackend().then((b) => {
      setIsMock(b.isMock);
      setLoading(false);
    });
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn('hover:underline flex items-center gap-1.5 underline-offset-4', isActive && 'underline decoration-2');

  return (
    <Router>
      <RouteEffects onNavigate={() => setMenuOpen(false)} />
      <div className="min-h-screen flex flex-col bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
        {/* Connection Warning */}
        {isMock && (
          <div className="bg-orange-100 border-b border-orange-200 px-4 py-1 text-[10px] uppercase tracking-widest font-mono text-orange-800 text-center">
            [ MOCK MODE ACTIVE : DATABASE OFFLINE : PASTES STAY IN THIS BROWSER ]
          </div>
        )}

        {/* Global Navigation */}
        <nav className="border-b border-[#141414] bg-[#E4E3E0] sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-[#141414] text-[#E4E3E0] p-1.5 rounded-sm group-hover:rotate-12 transition-transform">
                  <Terminal size={20} />
                </div>
                <span className="font-mono font-bold tracking-tighter text-xl">PESTLE_</span>
              </Link>

              <div className="hidden md:flex items-center gap-6 text-xs font-mono uppercase tracking-wider">
                {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                  <NavLink key={to} to={to} end={end} className={navLinkClass}>
                    <Icon size={14} /> {label}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="text-right hidden sm:block" title="Your anonymous browser identity">
                  <p className="text-[10px] font-mono leading-none opacity-50 uppercase tracking-tighter">OPERATOR</p>
                  <p className="text-xs font-bold font-mono">{operator}</p>
                </div>
              )}
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                title="Source code on GitHub"
                className="p-1.5 rounded-sm border border-transparent hover:border-[#141414] transition-colors"
              >
                <Github size={18} />
              </a>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="md:hidden p-1.5 border border-[#141414]"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden border-t border-[#141414] flex flex-col text-xs font-mono uppercase tracking-wider">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn('flex items-center gap-2 px-6 py-3 border-b border-[#141414]/10', isActive && 'bg-[#141414] text-[#E4E3E0]')
                  }
                >
                  <Icon size={14} /> {label}
                </NavLink>
              ))}
              <p className="px-6 py-3 opacity-50">OPERATOR {operator}</p>
            </div>
          )}
        </nav>

        <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/paste/:id" element={<PasteView />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/codes" element={<Codes />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="border-t border-[#141414] p-8 bg-[#E4E3E0]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em]">PROTOCOL V1.1.0 - SYSTEM ACTIVE</p>
              <p className="text-[9px] font-mono leading-relaxed max-w-xs uppercase">
                Code &amp; text sharing with a runnable snippet library. Deployed on Vercel.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-mono uppercase tracking-widest">
              <Link to="/privacy" className="hover:underline">PRIVACY.MD</Link>
              <Link to="/terms" className="hover:underline">TERMS_OF_USE</Link>
              <Link to="/api-docs" className="hover:underline">RAW_API</Link>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
