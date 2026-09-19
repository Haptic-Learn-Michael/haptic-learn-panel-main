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
  admin: 'bg-[#FF6B35]/20 text-[#FF6B35]',
  lead_educator: 'bg-[#EDC157]/20 text-[#EDC157]',
  educator: 'bg-blue-500/20 text-blue-400',
};

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  lead_educator: 'Directora',
  educator: 'Educadora',
};

export const Sidebar = () => {
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
    <aside className="w-64 panel flex flex-col h-screen flex-shrink-0 border-r border-white/[0.06]">
      {/* Accent strip — echoes the modal/drawer accent for a consistent brand thread */}
      <div className="h-[3px] bg-gradient-to-r from-[#FF6B35] via-[#FF9A6B] to-[#EDC157] flex-shrink-0" />

      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 bg-gradient-to-br from-[#FF8552] to-[#FF6B35] rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(255,107,53,0.4)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
            <Zap size={18} className="text-white relative z-10" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">HapticLearn</p>
            <p className="text-white/35 text-xs">Panel Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {visibleItems.map(({ path, label, icon: Icon }) => (
            <div key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#FF6B35] text-white shadow-[0_4px_20px_rgba(255,107,53,0.35)]'
                      : 'text-white/45 hover:bg-white/[0.06] hover:text-white'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>

              {/* School sub-items for lead_educator */}
              {path === '/schools' && school && (
                <div className="mt-0.5 space-y-0.5">
                  <NavLink
                    to={`/schools/${school.id}`}
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 pl-9 pr-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'text-white/80'
                          : 'text-white/35 hover:text-white/65 hover:bg-white/[0.04]'
                      }`
                    }
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EDC157]/60 flex-shrink-0" />
                    <span className="truncate">{school.name}</span>
                  </NavLink>
                  <NavLink
                    to={`/schools/${school.id}/stats`}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 pl-9 pr-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-[#FF6B35]/15 text-[#FF6B35]'
                          : 'text-white/35 hover:text-white/65 hover:bg-white/[0.04]'
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
            <span className="text-[#FF6B35] text-xs font-semibold">
              {user?.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-white/35 text-xs truncate">{user?.email}</p>
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
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/35 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium transition-colors"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
