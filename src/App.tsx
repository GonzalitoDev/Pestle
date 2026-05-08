/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Terminal, Plus, History, Github, LogIn, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, IS_MOCK_MODE } from './lib/firebase';
import Home from './pages/Home';
import PasteView from './pages/PasteView';
import Dashboard from './pages/Dashboard';
import { cn } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
        {/* Connection Warning */}
        {IS_MOCK_MODE && (
          <div className="bg-orange-100 border-b border-orange-200 px-4 py-1 text-[10px] uppercase tracking-widest font-mono text-orange-800 text-center">
            [ MOCK MODE ACTIVE : DATABASE OFFLINE ]
          </div>
        )}

        {/* Global Navigation */}
        <nav className="border-b border-[#141414] flex items-center justify-between px-6 py-4 bg-[#E4E3E0] sticky top-0 z-50">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-[#141414] text-[#E4E3E0] p-1.5 rounded-sm group-hover:rotate-12 transition-transform">
                <Terminal size={20} />
              </div>
              <span className="font-mono font-bold tracking-tighter text-xl">PESTLE_</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-xs font-mono uppercase tracking-wider">
              <Link to="/" className="hover:underline flex items-center gap-1.5 underline-offset-4">
                <Plus size={14} /> NEW_PASTE
              </Link>
              <Link to="/dashboard" className="hover:underline flex items-center gap-1.5 underline-offset-4">
                <History size={14} /> MY_VAULT
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-mono leading-none opacity-50 uppercase tracking-tighter">OPERATOR</p>
                  <p className="text-xs font-bold font-mono">{user.displayName?.split(' ')[0]}</p>
                </div>
                <button 
                  onClick={() => signOut(auth)}
                  className="w-8 h-8 rounded-full border border-[#141414] overflow-hidden hover:scale-110 transition-transform"
                >
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="Avatar" />
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-4 py-1.5 rounded-sm text-xs font-mono uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
              >
                <LogIn size={14} /> AUTHENTICATE
              </button>
            )}
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-1.5 rounded-sm border border-transparent hover:border-[#141414] transition-colors">
              <Github size={18} />
            </a>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/paste/:id" element={<PasteView />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
          </Routes>
        </main>

        <footer className="mt-auto border-t border-[#141414] p-8 bg-[#E4E3E0]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em]">PROTOCOL V1.0.4 - SYSTEM ACTIVE</p>
              <p className="text-[9px] font-mono leading-relaxed max-w-xs uppercase">
                Secure transient storage for volatile data assets. No persistence guaranteed under mock protocol.
              </p>
            </div>
            <div className="flex gap-8 text-[10px] font-mono uppercase tracking-widest">
              <a href="#" className="hover:underline">PRIVACY.MD</a>
              <a href="#" className="hover:underline">TERMS_OF_USE</a>
              <a href="#" className="hover:underline">RAW_API</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

