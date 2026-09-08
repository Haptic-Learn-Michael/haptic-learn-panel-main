import { useEffect, useState } from 'react';
import { Search, RefreshCw, Plus, Eye, EyeOff, UserPlus } from 'lucide-react';
import { getUsers, createUser, updateUserStatus } from '../api/users.api';
import { useAuthStore } from '../store/auth.store';
import type { User, UserRole, UserStatus } from '../types';
import { Modal, ModalBody, ModalFooter, ModalError, ModalField, BtnCancel, BtnPrimary } from '../components/Modal';

const roleColors: Record<string, string> = {
  admin: 'bg-[#FF6B35]/20 text-[#FF6B35]',
  lead_educator: 'bg-[#FFD166]/20 text-[#FFD166]',
  educator: 'bg-white/10 text-white/70',
  student: 'bg-white/[0.07] text-white/50',
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  lead_educator: 'Lead Educator',
  educator: 'Educator',
  student: 'Estudiante',
};

const statusColors: Record<string, string> = {
  active: 'bg-[#FFD166]/20 text-[#FFD166]',
  pending: 'bg-white/10 text-white/55',
  suspended: 'bg-red-500/20 text-red-400',
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

const inputCls = 'w-full bg-white/[0.06] border border-white/[0.12] text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] placeholder:text-white/25 transition';

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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
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
                <option key={r.value} value={r.value} className="bg-[#2C0B50] text-white">
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title text-3xl">Usuarios</h1>
          <p className="text-white/45 text-sm mt-0.5">
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
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#FF6B35] hover:bg-[#e85c28] rounded-xl transition-colors shadow-[0_4px_20px_rgba(255,107,53,0.35)]"
          >
            <Plus size={16} />
            Nuevo usuario
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="surface border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Buscar por nombre o email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white/[0.06] border border-white/[0.10] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] placeholder:text-white/25 transition"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', ...ROLES.map((r) => r.value)] as const).map((r) => {
              const label = r === 'all' ? 'Todos' : roleLabels[r];
              const active = roleFilter === r;
              const color = r !== 'all' ? roleColors[r] : '';
              return (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#FF6B35] text-white shadow-[0_2px_12px_rgba(255,107,53,0.4)]'
                      : r === 'all'
                      ? 'bg-white/[0.07] text-white/50 hover:bg-white/12 hover:text-white'
                      : `${color} opacity-70 hover:opacity-100`
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-white/30 text-sm">Cargando usuarios…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-white/30 text-sm">No se encontraron usuarios.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/[0.03]">
                <tr>
                  {['Nombre', 'Email', 'Rol', 'Estado', 'Registrado', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[#FF6B35]/15 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[#FF6B35] text-xs font-semibold">
                            {u.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-white">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/50">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge value={u.role} map={roleColors} labelMap={roleLabels} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={u.status} map={statusColors} labelMap={statusLabels} />
                    </td>
                    <td className="px-4 py-3 text-sm text-white/40">
                      {new Date(u.created_at).toLocaleDateString('es', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {u.status !== 'active' && (
                          <button
                            onClick={() => handleStatusChange(u, 'active')}
                            disabled={updating === u.id}
                            className="px-2.5 py-1 text-xs font-medium bg-[#FFD166]/15 text-[#FFD166] hover:bg-[#FFD166]/25 rounded-lg transition-colors disabled:opacity-40"
                          >
                            Activar
                          </button>
                        )}
                        {u.status === 'active' && u.id !== me?.id && (
                          <button
                            onClick={() => handleStatusChange(u, 'suspended')}
                            disabled={updating === u.id}
                            className="px-2.5 py-1 text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded-lg transition-colors disabled:opacity-40"
                          >
                            Suspender
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreate={(u) => setUsers((prev) => [u, ...prev])}
        />
      )}
    </div>
  );
};

