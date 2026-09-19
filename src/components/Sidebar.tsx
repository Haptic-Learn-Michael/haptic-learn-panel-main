import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  School,
  Building2,
  Zap,
  LogOut,
  BarChart2,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { logout } from '../api/auth.api';
import { getSchools } from '../api/schools.api';

const navItems = [
  {
    path: '/dashboard',
    label: 'Inicio',
    icon: LayoutDashboard,
    roles: ['admin', 'lead_educator', 'educator'],
  },
  {
    path: '/users',
    label: 'Usuarios',
    icon: Users,
    roles: ['admin'],
  },
  {
    path: '/schools',
    label: 'Colegios',
    icon: Building2,
    roles: ['admin', 'lead_educator'],
  },
  {
    path: '/classrooms',
    label: 'Salones',
    icon: School,
    roles: ['admin', 'lead_educator', 'educator'],
  },
  {
    path: '/haptic-patterns',
    label: 'Patrones Hápticos',
    icon: Zap,
    roles: ['admin'],
  },
];

const roleBadge: Record<string, string> = {
  admin: 'bg-[#7C4DFF]/15 text-[#5B32D6]',
  lead_educator: 'bg-emerald-100 text-emerald-700',
  educator: 'bg-sky-100 text-sky-700',
};

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  lead_educator: 'Directora',
  educator: 'Educadora',
};

export const Sidebar = ({ open = false, onClose }: { open?: boolean; onClose?: () => void }) => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [school, setSchool] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (user?.role === 'lead_educator') {
      getSchools()
        .then(({ data }) => {
          if (data.length > 0) setSchool({ id: data[0].id, name: data[0].name });
        })
        .catch(() => {});
    } else {
      setSchool(null);
    }
  }, [user?.role]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore logout errors
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <aside
      className={`panel flex flex-col w-64 max-w-[85vw] h-dvh flex-shrink-0 border-r border-white/[0.06] fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-[cubic-bezier(0.32,1.2,0.4,1)] lg:static lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Accent strip — echoes the modal/drawer accent for a consistent brand thread */}
      <div className="h-[6px] bg-gradient-to-r from-[#FF6B35] via-[#FFC93C] via-[#2FD6A0] to-[#4CC9F0] flex-shrink-0" />

      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 bg-gradient-to-br from-[#FF8552] to-[#FF6B35] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_3px_0_0_#D9491A] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
            <Zap size={18} className="text-snow relative z-10" fill="currentColor" />
          </div>
          <div>
            <p className="text-white font-display font-bold text-lg leading-tight">HapticLearn</p>
            <p className="text-white/50 text-xs">Panel Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-2">
          {visibleItems.map(({ path, label, icon: Icon }) => (
            <div key={path}>
              <NavLink
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[0.95rem] font-bold transition-all duration-150 hover:-translate-y-0.5 ${
                    isActive
                      ? 'bg-[#FF6B35] text-snow shadow-[0_4px_0_0_#D9491A]'
                      : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
                  }`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>

              {/* School sub-items for lead_educator */}
              {path === '/schools' && school && (
                <div className="mt-2 space-y-1.5">
                  <NavLink
                    to={`/schools/${school.id}`}
                    onClick={onClose}
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 pl-9 pr-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'text-white/80'
                          : 'text-white/50 hover:text-white/65 hover:bg-white/[0.04]'
                      }`
                    }
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EDC157]/60 flex-shrink-0" />
                    <span className="truncate">{school.name}</span>
                  </NavLink>
                  <NavLink
                    to={`/schools/${school.id}/stats`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 pl-9 pr-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-[#FF6B35]/15 text-[#E4531D]'
                          : 'text-white/50 hover:text-white/65 hover:bg-white/[0.04]'
                      }`
                    }
                  >
                    <BarChart2 size={12} className="flex-shrink-0" />
                    <span>Estadísticas</span>
                  </NavLink>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 bg-[#FF6B35]/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[#E4531D] text-xs font-semibold">
              {user?.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-white/50 text-xs truncate">{user?.email}</p>
            {user?.role && (
              <span
                className={`inline-block mt-1 px-1.5 py-0.5 rounded-md text-xs font-medium ${roleBadge[user.role] ?? 'bg-white/10 text-white/50'}`}
              >
                {roleLabel[user.role] ?? user.role}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/50 hover:bg-red-500/10 hover:text-red-600 text-sm font-medium transition-colors"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
