import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Cierra el menú móvil al navegar y con Escape
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className="app-shell flex h-dvh overflow-hidden">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Fondo del menú móvil */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#3B2A5C]/45 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Barra superior solo en móvil */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-2.5 bg-snow/90 backdrop-blur border-b-2 border-[#EDE3FF] flex-shrink-0">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            className="w-10 h-10 rounded-xl grid place-items-center bg-[#FFF0E8] text-[#E4531D] border-2 border-[#FFB99A] shadow-[0_3px_0_0_#FFB99A] active:translate-y-0.5 active:shadow-none transition-all"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="w-8 h-8 rounded-full grid place-items-center bg-[#FF6B35] text-snow shadow-[0_2px_0_0_#D9491A]">
            <Zap size={16} fill="currentColor" />
          </span>
          <span className="font-display font-bold text-lg text-white">HapticLearn</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div key={pathname} className="page-fade px-4 sm:px-6 pb-6 pt-6 lg:pt-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
