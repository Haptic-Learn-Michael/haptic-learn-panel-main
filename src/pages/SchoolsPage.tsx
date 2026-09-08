import { useEffect, useState } from 'react';
import { Plus, Building2, Users, School, Eye, EyeOff, RefreshCw, Trash2 } from 'lucide-react';
import {
  getSchools,
  createSchool,
  deleteSchool,
  getSchoolEducators,
  getSchoolClassrooms,
  createSchoolEducator,
} from '../api/schools.api';
import { getUsers } from '../api/users.api';
import { useAuthStore } from '../store/auth.store';
import type { School as SchoolType, SchoolEducator, Classroom, User } from '../types';
import {
  Modal,
  Drawer,
  ModalBody,
  ModalFooter,
  ModalError,
  ModalField,
  BtnCancel,
  BtnPrimary,
} from '../components/Modal';

const inputCls =
  'w-full bg-white/[0.06] border border-white/[0.12] text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] placeholder:text-white/25 transition';

// ─── Create School Modal (admin) ──────────────────────────────────────────────
const CreateModal = ({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (s: SchoolType) => void;
}) => {
  const [name, setName] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [leads, setLeads] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getUsers()
      .then(({ data }) =>
        setLeads(data.filter((u) => u.role === 'lead_educator' && u.status === 'active')),
      )
      .finally(() => setLoadingLeads(false));
  }, []);

  const toggleLead = (id: string) =>
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await createSchool({
        name,
        lead_educator_ids: selectedLeads.length ? selectedLeads : undefined,
      });
      onCreate(data);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Error al crear colegio.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Nuevo colegio" subtitle="Registra una institución educativa" icon={Building2} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {error && <ModalError message={error} />}
          <ModalField label="Nombre del colegio" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="Ej: Colegio San Martín"
              required
            />
          </ModalField>
          <ModalField
            label="Lead educators"
            hint={leads.length === 0 && !loadingLeads ? undefined : 'Puedes asignar más desde el detalle del colegio.'}
          >
            {loadingLeads ? (
              <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
            ) : leads.length === 0 ? (
              <div className="flex items-center gap-2 bg-[#FFD166]/10 border border-[#FFD166]/20 rounded-xl px-3 py-2.5">
                <span className="text-xs text-[#FFD166]/80">
                  No hay lead educators activas. Asigna una después.
                </span>
              </div>
            ) : (
              <div className="border border-white/[0.10] rounded-xl divide-y divide-white/[0.06] max-h-44 overflow-y-auto">
                {leads.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(u.id)}
                      onChange={() => toggleLead(u.id)}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 accent-[#FF6B35]"
                    />
                    <div className="w-7 h-7 bg-[#FF6B35]/15 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[#FF6B35] text-xs font-semibold">
                        {u.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{u.full_name}</p>
                      <p className="text-xs text-white/40 truncate">{u.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </ModalField>
        </ModalBody>
        <ModalFooter>
          <BtnCancel onClick={onClose} />
          <BtnPrimary loading={loading} label="Crear colegio" loadingLabel="Creando…" />
        </ModalFooter>
      </form>
    </Modal>
  );
};

// ─── Create Educator Modal (from drawer) ──────────────────────────────────────
const CreateEducatorModal = ({
  schoolId,
  onClose,
  onCreated,
}: {
  schoolId: string;
  onClose: () => void;
  onCreated: () => void;
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createSchoolEducator(schoolId, { full_name: fullName, email, password });
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Error al crear educadora.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Nueva educadora" subtitle="Crea una cuenta educadora para este colegio" icon={Users} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {error && <ModalError message={error} />}
          <ModalField label="Nombre completo" required>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputCls}
              placeholder="Ej: María González"
              required
            />
          </ModalField>
          <ModalField label="Correo electrónico" required>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="maria@colegio.edu"
              required
            />
          </ModalField>
          <ModalField label="Contraseña" required hint="La cuenta se activa inmediatamente, sin verificación de email.">
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
        </ModalBody>
        <ModalFooter>
          <BtnCancel onClick={onClose} />
          <BtnPrimary loading={loading} label="Crear educadora" loadingLabel="Creando…" />
        </ModalFooter>
      </form>
    </Modal>
  );
};

// ─── School Drawer ─────────────────────────────────────────────────────────────
type DrawerTab = 'educadoras' | 'salones';

const SchoolDrawer = ({
  school,
  onClose,
}: {
  school: SchoolType;
  onClose: () => void;
}) => {
  const { user } = useAuthStore();
  const canManage = user?.role === 'admin' || user?.role === 'lead_educator';

  const [tab, setTab] = useState<DrawerTab>('educadoras');
  const [educators, setEducators] = useState<SchoolEducator[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getSchoolEducators(school.id), getSchoolClassrooms(school.id)])
      .then(([e, c]) => {
        setEducators(e.data);
        setClassrooms(c.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [school.id]);

  const leads = school.school_leads ?? [];

  return (
    <>
      <Drawer title={school.name} icon={Building2} onClose={onClose}>
        {/* Status */}
        {!school.is_active && (
          <div className="mx-5 mt-4 px-3 py-2 bg-white/5 rounded-xl">
            <span className="text-xs text-white/35">Colegio inactivo</span>
          </div>
        )}

        {/* Leads */}
        {leads.length > 0 && (
          <div className="px-5 pt-4 pb-3 border-b border-white/[0.06]">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">
              Lead Educators
            </p>
            <div className="flex flex-wrap gap-1.5">
              {leads.map((l) => (
                <span
                  key={l.user_id}
                  className="text-xs bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-white/65 px-2.5 py-1 rounded-full"
                >
                  {l.users?.full_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 px-5 py-4 border-b border-white/[0.06]">
          <div className="bg-[#22063F] rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FFD166]/15 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users size={15} className="text-[#FFD166]" />
            </div>
            <div>
              <p className="text-lg font-bold text-white leading-none">{loading ? '—' : educators.length}</p>
              <p className="text-xs text-white/35 mt-0.5">Educadoras</p>
            </div>
          </div>
          <div className="bg-[#22063F] rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FF6B35]/15 rounded-lg flex items-center justify-center flex-shrink-0">
              <School size={15} className="text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-lg font-bold text-white leading-none">{loading ? '—' : classrooms.length}</p>
              <p className="text-xs text-white/35 mt-0.5">Salones</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 py-3 border-b border-white/[0.06]">
          {(['educadoras', 'salones'] as DrawerTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                tab === t
                  ? 'bg-[#FF6B35] text-white shadow-[0_2px_12px_rgba(255,107,53,0.4)]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-white/[0.04] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : tab === 'educadoras' ? (
            <div>
              {canManage && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 text-sm font-semibold text-white bg-[#FF6B35] hover:bg-[#e85c28] rounded-xl transition-colors shadow-[0_4px_20px_rgba(255,107,53,0.35)]"
                >
                  <Plus size={15} />
                  Nueva educadora
                </button>
              )}
              {educators.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={28} className="text-white/10 mx-auto mb-2" />
                  <p className="text-sm text-white/30">No hay educadoras aún.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {educators.map((se) => {
                    const u = se.users;
                    return (
                      <div
                        key={se.id}
                        className="flex items-center gap-3 bg-[#22063F] rounded-xl px-4 py-3"
                      >
                        <div className="w-8 h-8 bg-[#FFD166]/15 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[#FFD166] text-xs font-semibold">
                            {u?.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{u?.full_name}</p>
                          <p className="text-xs text-white/40 truncate">{u?.email}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                            u?.status === 'active'
                              ? 'bg-[#FFD166]/15 text-[#FFD166]'
                              : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          {u?.status === 'active' ? 'Activa' : u?.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              {classrooms.length === 0 ? (
                <div className="text-center py-8">
                  <School size={28} className="text-white/10 mx-auto mb-2" />
                  <p className="text-sm text-white/30">No hay salones aún.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {classrooms.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 bg-[#22063F] rounded-xl px-4 py-3"
                    >
                      <div className="w-8 h-8 bg-[#FF6B35]/15 rounded-lg flex items-center justify-center flex-shrink-0">
                        <School size={14} className="text-[#FF6B35]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{c.name}</p>
                        <p className="text-xs text-white/35 font-mono">{c.code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Drawer>

      {showCreate && (
        <CreateEducatorModal
          schoolId={school.id}
          onClose={() => setShowCreate(false)}
          onCreated={fetchData}
        />
      )}
    </>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export const SchoolsPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null);

  const fetchSchools = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getSchools();
      setSchools(data);
    } catch {
      setError('Error al cargar colegios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchools(); }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { data: classrooms } = await getSchoolClassrooms(id);
      if (classrooms.length > 0) {
        alert(`No se puede eliminar: el colegio tiene ${classrooms.length} salón${classrooms.length !== 1 ? 'es' : ''} creado${classrooms.length !== 1 ? 's' : ''}. Elimina los salones primero.`);
        return;
      }
      if (!confirm('¿Eliminar este colegio? Esta acción no se puede deshacer.')) return;
      await deleteSchool(id);
      setSchools((prev) => prev.filter((s) => s.id !== id));
      if (selectedSchool?.id === id) setSelectedSchool(null);
    } catch {
      // silently fail
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title text-3xl">Colegios</h1>
          <p className="text-white/45 text-sm mt-0.5">
            {schools.length} colegio{schools.length !== 1 ? 's' : ''} registrado{schools.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSchools}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white border border-white/[0.12] rounded-xl hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#FF6B35] hover:bg-[#e85c28] rounded-xl transition-colors shadow-[0_4px_20px_rgba(255,107,53,0.35)]"
            >
              <Plus size={16} />
              Nuevo colegio
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#22063F] border border-white/[0.08] rounded-2xl p-5 animate-pulse">
              <div className="h-5 bg-white/10 rounded-lg w-3/4 mb-3" />
              <div className="h-3 bg-white/5 rounded w-1/2 mb-2" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : schools.length === 0 ? (
        <div className="bg-[#22063F] border border-white/[0.08] rounded-2xl p-12 text-center">
          <Building2 size={40} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No hay colegios registrados aún.</p>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 px-4 py-2 text-sm font-medium text-[#FF6B35] hover:text-[#e85c28] transition-colors"
            >
              Crear primer colegio
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((s) => {
            const leads = s.school_leads ?? [];
            const isSelected = selectedSchool?.id === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setSelectedSchool(isSelected ? null : s)}
                className={`bg-[#22063F] border rounded-2xl p-5 flex flex-col cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#FF6B35]/50 shadow-[0_0_0_1px_rgba(255,107,53,0.25)]'
                    : 'border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      s.is_active ? 'bg-[#FF6B35]/20' : 'bg-white/[0.07]'
                    }`}
                  >
                    <Building2 size={20} className={s.is_active ? 'text-[#FF6B35]' : 'text-white/30'} />
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                      disabled={deleting === s.id}
                      className="text-white/20 hover:text-red-400 transition-colors disabled:opacity-30"
                      title="Eliminar colegio"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <h3 className="font-semibold text-white mb-2">{s.name}</h3>

                {leads.length === 0 ? (
                  <p className="text-xs text-[#FFD166]/50 mb-2">Sin lead educators</p>
                ) : (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Users size={12} className="text-white/30 flex-shrink-0" />
                    <p className="text-xs text-white/40 truncate">
                      {leads.map((l) => l.users?.full_name).join(', ')}
                    </p>
                  </div>
                )}

                {!s.is_active && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-white/[0.07] text-white/35 self-start mb-2">
                    Inactivo
                  </span>
                )}

                <div className="mt-auto pt-3 border-t border-white/[0.06]">
                  <p className="text-xs text-white/25">
                    {isSelected ? 'Clic para cerrar' : 'Clic para ver detalle'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedSchool && (
        <SchoolDrawer
          school={selectedSchool}
          onClose={() => setSelectedSchool(null)}
        />
      )}

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={(s) => setSchools((prev) => [s, ...prev])}
        />
      )}
    </div>
  );
};
