import { useEffect, useState } from 'react';
import { Search, RefreshCw, Plus, Eye, EyeOff, UserPlus, ShieldCheck, Crown, GraduationCap, Backpack, Users } from 'lucide-react';
import { getUsers, createUser, updateUserStatus } from '../api/users.api';
import { useAuthStore } from '../store/auth.store';
import type { User, UserRole, UserStatus } from '../types';
import { Modal, ModalBody, ModalFooter, ModalError, ModalField, BtnCancel, BtnPrimary } from '../components/Modal';

const roleColors: Record<string, string> = {
  admin: 'bg-[#7C4DFF]/15 text-[#5B32D6]',
  lead_educator: 'bg-emerald-100 text-emerald-700',
  educator: 'bg-sky-100 text-sky-700',
  student: 'bg-[#FF6B35]/15 text-[#C43E10]',
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  lead_educator: 'Lead Educator',
  educator: 'Educator',
  student: 'Estudiante',
};

const statusColors: Record<string, string> = {
  active: 'bg-[#EDC157]/20 text-[#B7791F]',
  pending: 'bg-white/10 text-white/70',
  suspended: 'bg-red-500/20 text-red-600',
};

const statusLabels: Record<string, string> = {
  active: 'Activo',
  pending: 'Pendiente',
  suspended: 'Suspendido',
};

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'lead_educator', label: 'Lead Educator' },
  { value: 'educator', label: 'Educator' },
  { value: 'student', label: 'Estudiante' },
];

type Meta = { color: string; deep: string; soft: string; text: string; plural: string; Icon: typeof Users };

const ROLE_META: Record<UserRole, Meta> = {
  admin:         { color: '#7C4DFF', deep: '#5B32D6', soft: '#EDE5FF', text: '#5B32D6', plural: 'Admins',      Icon: ShieldCheck },
  lead_educator: { color: '#2FD6A0', deep: '#14A97B', soft: '#D9F8EC', text: '#0B7A57', plural: 'Directoras',  Icon: Crown },
  educator:      { color: '#4CC9F0', deep: '#1FA3CE', soft: '#DDF5FD', text: '#0C6E8E', plural: 'Educadoras',  Icon: GraduationCap },
  student:       { color: '#FF6B35', deep: '#D9491A', soft: '#FFE6DA', text: '#B93C10', plural: 'Estudiantes', Icon: Backpack },
};
const ALL_META: Meta = { color: '#FFB703', deep: '#D99000', soft: '#FFF0C2', text: '#7A5200', plural: 'Todos', Icon: Users };

const STATUS_META: Record<string, { dot: string; text: string }> = {
  active:    { dot: '#2FD6A0', text: '#0B7A57' },
  pending:   { dot: '#FFB703', text: '#8A5A00' },
  suspended: { dot: '#EF4444', text: '#B91C1C' },
};

const inputCls = 'w-full bg-white/[0.06] border border-white/[0.12] text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] placeholder:text-white/50 transition';

const CreateUserModal = ({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (u: User) => void;
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('educator');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await createUser({ full_name: fullName, email, password, role });
      onCreate(data);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Error al crear usuario.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Nuevo usuario" subtitle="Crea una cuenta de acceso al sistema" icon={UserPlus} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {error && <ModalError message={error} />}

          <ModalField label="Nombre completo" required>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputCls}
              placeholder="Ej: Juan Pérez"
              required
            />
          </ModalField>

          <ModalField label="Correo electrónico" required>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="juan@colegio.edu"
              required
            />
          </ModalField>

          <ModalField label="Contraseña" required>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputCls} pr-10`}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </ModalField>

          <ModalField label="Rol" required hint="La cuenta se activa inmediatamente, sin verificación de email.">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={inputCls}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-snow text-white">
                  {r.label}
                </option>
              ))}
            </select>
          </ModalField>
        </ModalBody>

        <ModalFooter>
          <BtnCancel onClick={onClose} />
          <BtnPrimary loading={loading} label="Crear usuario" loadingLabel="Creando…" />
        </ModalFooter>
      </form>
    </Modal>
  );
};

const Badge = ({ value, map, labelMap }: { value: string; map: Record<string, string>; labelMap?: Record<string, string> }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${map[value] ?? 'bg-white/10 text-white/50'}`}>
    {labelMap?.[value] ?? value}
  </span>
);

export const UsersPage = () => {
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getUsers();
      setUsers(data);
      setFiltered(data);
    } catch {
      setError('Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          (roleFilter === 'all' || u.role === roleFilter) &&
          (u.full_name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q)),
      ),
    );
  }, [query, roleFilter, users]);

  const handleStatusChange = async (user: User, status: UserStatus) => {
    setUpdating(user.id);
    try {
      const { data } = await updateUserStatus(user.id, status);
      setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)));
    } catch {
      // silently fail
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="page-title text-3xl">Usuarios</h1>
          <p className="text-white/60 text-sm mt-0.5">
            {filtered.length !== users.length
              ? `${filtered.length} de ${users.length} usuarios`
              : `${users.length} usuarios registrados`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white border border-white/[0.12] rounded-xl hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm btn-primary"
          >
            <Plus size={16} />
            Nuevo usuario
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Tiles de rol: filtran y muestran cuántos hay de cada uno */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-4">
        {(['all', ...ROLES.map((r) => r.value)] as const).map((r) => {
          const meta = r === 'all' ? ALL_META : ROLE_META[r];
          const count = r === 'all' ? users.length : users.filter((u) => u.role === r).length;
          const active = roleFilter === r;
          const Icon = meta.Icon;
          return (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              aria-pressed={active}
              className={`group text-left rounded-2xl p-3 flex items-center gap-2.5 border-2 transition-all duration-200 hover:-translate-y-1 ${
                active ? 'bg-snow -translate-y-1' : 'bg-snow/70 border-[#EDE3FF]'
              }`}
              style={active ? { borderColor: meta.color, boxShadow: `0 4px 0 ${meta.soft}` } : { boxShadow: '0 3px 0 #EDE3FF' }}
            >
              <span
                className="w-10 h-10 rounded-xl grid place-items-center text-snow shrink-0 transition-transform group-hover:rotate-6"
                style={{ background: meta.color, boxShadow: `0 2px 0 ${meta.color}55` }}
              >
                <Icon size={19} />
              </span>
              <span className="min-w-0">
                <span className="block font-display font-bold text-xl leading-none text-white">{count}</span>
                <span className="block text-xs font-bold text-white/60 mt-1 truncate">{meta.plural}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative mb-4">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
        <input
          type="text"
          placeholder="Buscar por nombre o email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 text-sm font-bold bg-snow border-[#EDE3FF] text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] placeholder:text-white/50 transition"
        />
      </div>

      {loading ? (
        <div className="surface rounded-3xl p-8 text-center text-white/60 text-sm font-bold">Cargando usuarios…</div>
      ) : filtered.length === 0 ? (
        <div className="surface rounded-3xl p-10 text-center">
          <p className="font-display text-xl font-bold text-white">Aquí no hay nadie todavía</p>
          <p className="text-white/60 text-sm mt-1">Prueba con otro nombre o cambia el filtro.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((u, i) => {
            const meta = ROLE_META[u.role as UserRole] ?? ALL_META;
            const st = STATUS_META[u.status] ?? STATUS_META.pending;
            const RoleIcon = meta.Icon;
            const isMe = u.id === me?.id;
            return (
              <li
                key={u.id}
                className="page-in surface rounded-2xl pl-4 pr-3.5 py-2.5 relative overflow-hidden grid items-center gap-x-3.5 gap-y-1.5 grid-cols-[auto_minmax(0,1fr)_auto] md:grid-cols-[auto_minmax(0,1.6fr)_9rem_8rem_6.5rem_7.5rem] transition-transform duration-200 hover:-translate-y-0.5"
                style={{ animationDelay: `${Math.min(i, 12) * 35}ms`, boxShadow: `0 4px 0 ${meta.soft}`, borderColor: meta.soft }}
              >
                {/* cinta de color del rol */}
                <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: meta.color }} aria-hidden="true" />

                <span
                  className="w-9 h-9 rounded-xl grid place-items-center font-display font-bold text-base text-snow"
                  style={{ background: meta.color, boxShadow: `0 2px 0 ${meta.color}55` }}
                  aria-hidden="true"
                >
                  {u.full_name.charAt(0).toUpperCase()}
                </span>

                <div className="min-w-0">
                  <p className="font-display font-bold text-[0.95rem] text-white leading-tight truncate">
                    {u.full_name}
                    {isMe && (
                      <span className="ml-2 align-middle text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#FFC93C] text-[#5A3E00]">Tú</span>
                    )}
                  </p>
                  <p className="text-xs font-bold text-white/60 truncate">{u.email}</p>
                </div>

                <span
                  className="hidden md:inline-flex items-center gap-1.5 justify-self-start px-2.5 py-1 rounded-full text-[0.7rem] font-extrabold"
                  style={{ background: meta.soft, color: meta.text }}
                >
                  <RoleIcon size={14} />
                  {roleLabels[u.role] ?? u.role}
                </span>

                <span className="hidden md:inline-flex items-center gap-2 text-xs font-extrabold" style={{ color: st.text }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: st.dot, boxShadow: `0 0 0 4px ${st.dot}33` }} />
                  {statusLabels[u.status] ?? u.status}
                </span>

                <span className="hidden md:block text-xs font-bold text-white/60">
                  {new Date(u.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>

                <div className="flex justify-end">
                  {u.status !== 'active' && (
                    <button
                      onClick={() => handleStatusChange(u, 'active')}
                      disabled={updating === u.id}
                      className="px-3 py-1 text-[0.7rem] font-extrabold rounded-full bg-[#2FD6A0] text-[#053D2B] shadow-[0_2px_0_0_#14A97B] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-40"
                    >
                      Activar
                    </button>
                  )}
                  {u.status === 'active' && !isMe && (
                    <button
                      onClick={() => handleStatusChange(u, 'suspended')}
                      disabled={updating === u.id}
                      className="px-3 py-1 text-[0.7rem] font-extrabold rounded-full bg-snow text-red-600 border-2 border-red-200 shadow-[0_2px_0_0_#FECACA] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-40"
                    >
                      Suspender
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreate={(u) => setUsers((prev) => [u, ...prev])}
        />
      )}
    </div>
  );
};

