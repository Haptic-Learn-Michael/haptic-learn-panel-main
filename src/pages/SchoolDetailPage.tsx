import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  School,
  Users,
  Plus,
  Eye,
  EyeOff,
  UserMinus,
  UserPlus,
  Pencil,
  Check,
  X,
  Trash2,
} from 'lucide-react';
import { Modal, ModalBody, ModalFooter, ModalError, ModalField, BtnCancel, BtnPrimary } from '../components/Modal';
import {
  getSchool,
  getSchoolClassrooms,
  getSchoolEducators,
  createSchoolEducator,
  updateSchool,
  deleteSchool,
  addSchoolLead,
  removeSchoolLead,
} from '../api/schools.api';
import { getUsers } from '../api/users.api';
import { useAuthStore } from '../store/auth.store';
import type { School as SchoolType, Classroom, SchoolEducator, User } from '../types';

type Tab = 'salones' | 'educadoras';

const inputCls = 'w-full bg-white/[0.06] border border-white/[0.12] text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] placeholder:text-white/25 transition';

// ─── Modal: agregar lead ──────────────────────────────────────────────────────
const AddLeadModal = ({
  schoolId,
  currentLeadIds,
  onClose,
  onAdded,
}: {
  schoolId: string;
  currentLeadIds: string[];
  onClose: () => void;
  onAdded: (school: SchoolType) => void;
}) => {
  const [leads, setLeads] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getUsers()
      .then(({ data }) =>
        setLeads(
          data.filter(
            (u) =>
              u.role === 'lead_educator' &&
              u.status === 'active' &&
              !currentLeadIds.includes(u.id),
          ),
        ),
      )
      .finally(() => setLoadingLeads(false));
  }, [currentLeadIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await addSchoolLead(schoolId, { user_id: selectedId });
      onAdded(data);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Error al agregar lead.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Agregar lead educator" subtitle="Asigna una educadora líder al colegio" icon={UserPlus} onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {error && <ModalError message={error} />}
          {loadingLeads ? (
            <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
          ) : leads.length === 0 ? (
            <p className="text-sm text-white/45">
              No hay lead educators activas disponibles para agregar.
            </p>
          ) : (
            <ModalField label="Seleccionar lead educator" required>
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required className={inputCls}>
                <option value="" className="bg-[#2C0B50] text-white">— Seleccionar —</option>
                {leads.map((u) => (
                  <option key={u.id} value={u.id} className="bg-[#2C0B50] text-white">
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </ModalField>
          )}
        </ModalBody>
        <ModalFooter>
          <BtnCancel onClick={onClose} />
          <BtnPrimary loading={loading} label="Agregar" loadingLabel="Agregando…" disabled={leads.length === 0} />
        </ModalFooter>
      </form>
    </Modal>
  );
};

// ─── Modal: crear educadora ───────────────────────────────────────────────────
const CreateEducatorModal = ({
  schoolId,
  onClose,
  onCreated,
}: {
  schoolId: string;
  onClose: () => void;
  onCreated: (e: SchoolEducator) => void;
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
      const { data } = await createSchoolEducator(schoolId, { full_name: fullName, email, password });
      onCreated(data);
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
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Ej: María González" required />
          </ModalField>
          <ModalField label="Correo electrónico" required>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="maria@colegio.edu" required />
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
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export const SchoolDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [school, setSchool] = useState<SchoolType | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [educators, setEducators] = useState<SchoolEducator[]>([]);
  const [tab, setTab] = useState<Tab>('salones');
  const [loading, setLoading] = useState(true);
  const [showCreateEducator, setShowCreateEducator] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [removingLead, setRemovingLead] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  // Edit name
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Delete
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([getSchool(id), getSchoolClassrooms(id), getSchoolEducators(id)])
      .then(([s, c, e]) => {
        setSchool(s.data);
        setClassrooms(c.data);
        setEducators(e.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleActive = async () => {
    if (!school || !id) return;
    setToggling(true);
    try {
      const { data } = await updateSchool(id, { is_active: !school.is_active });
      setSchool(data);
    } finally {
      setToggling(false);
    }
  };

  const handleRemoveLead = async (userId: string) => {
    if (!id || !confirm('¿Remover esta lead del colegio?')) return;
    setRemovingLead(userId);
    try {
      await removeSchoolLead(id, userId);
      setSchool((prev) =>
        prev
          ? { ...prev, school_leads: (prev.school_leads ?? []).filter((l) => l.user_id !== userId) }
          : prev,
      );
    } finally {
      setRemovingLead(null);
    }
  };

  const startEditName = () => {
    setEditName(school?.name ?? '');
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const handleSaveName = async () => {
    if (!id || !editName.trim() || editName.trim() === school?.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const { data } = await updateSchool(id, { name: editName.trim() });
      setSchool(data);
      setEditingName(false);
    } finally {
      setSavingName(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleteError('');
    if (classrooms.length > 0) {
      setDeleteError(`No se puede eliminar: tiene ${classrooms.length} salón${classrooms.length !== 1 ? 'es' : ''} creado${classrooms.length !== 1 ? 's' : ''}. Elimina los salones primero.`);
      return;
    }
    if (!confirm(`¿Eliminar "${school?.name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    try {
      await deleteSchool(id);
      navigate('/schools');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-white/8 rounded-xl w-1/3" />
        <div className="h-4 bg-white/5 rounded w-1/4" />
        <div className="h-48 bg-[#22063F] border border-white/[0.08] rounded-2xl" />
      </div>
    );
  }

  if (!school) return <p className="text-white/40 text-sm">Colegio no encontrado.</p>;

  const leads = school.school_leads ?? [];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/schools"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={15} /> Colegios
        </Link>

        <div className="bg-[#22063F] border border-white/[0.08] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  school.is_active ? 'bg-[#FF6B35]/20' : 'bg-white/8'
                }`}
              >
                <Building2
                  size={24}
                  className={school.is_active ? 'text-[#FF6B35]' : 'text-white/30'}
                />
              </div>
              <div className="min-w-0 flex-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={nameInputRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                      className="bg-white/[0.06] border border-[#FF6B35]/40 text-white rounded-xl px-3 py-1.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 min-w-0 flex-1"
                    />
                    <button onClick={handleSaveName} disabled={savingName} className="text-[#FF6B35] hover:text-[#e85c28] disabled:opacity-40 flex-shrink-0">
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditingName(false)} className="text-white/35 hover:text-white/60 flex-shrink-0">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="page-title text-xl truncate">{school.name}</h1>
                    {isAdmin && (
                      <button onClick={startEditName} className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0" title="Editar nombre">
                        <Pencil size={15} />
                      </button>
                    )}
                  </div>
                )}
                {!school.is_active && (
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs bg-white/8 text-white/35">
                    Inactivo
                  </span>
                )}
              </div>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleToggleActive}
                  disabled={toggling}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors disabled:opacity-40 ${
                    school.is_active
                      ? 'bg-white/8 text-white/50 hover:bg-white/12'
                      : 'bg-[#FFD166]/15 text-[#FFD166] hover:bg-[#FFD166]/25'
                  }`}
                >
                  {school.is_active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 text-white/20 hover:text-red-400 transition-colors disabled:opacity-30 rounded-lg hover:bg-red-500/10"
                  title="Eliminar colegio"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
          {deleteError && (
            <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400">
              {deleteError}
            </div>
          )}

          {/* Leads section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-white/35 uppercase tracking-wider">
                Lead Educators
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowAddLead(true)}
                  className="flex items-center gap-1 text-xs text-[#FF6B35] hover:text-[#e85c28] font-medium transition-colors"
                >
                  <UserPlus size={13} /> Agregar
                </button>
              )}
            </div>

            {leads.length === 0 ? (
              <p className="text-sm text-[#FFD166]/50">Sin leads asignadas.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {leads.map((l) => (
                  <div
                    key={l.user_id}
                    className="flex items-center gap-2 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-full px-3 py-1.5"
                  >
                    <div className="w-5 h-5 bg-[#FF6B35]/25 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[#FF6B35] text-xs font-bold">
                        {l.users?.full_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-white/85">
                      {l.users?.full_name}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleRemoveLead(l.user_id)}
                        disabled={removingLead === l.user_id}
                        className="text-white/25 hover:text-red-400 transition-colors ml-1 disabled:opacity-30"
                        title="Remover lead"
                      >
                        <UserMinus size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#22063F] border border-white/[0.08] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#FF6B35]/15 rounded-xl flex items-center justify-center">
            <School size={18} className="text-[#FF6B35]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{classrooms.length}</p>
            <p className="text-xs text-white/40">Salones</p>
          </div>
        </div>
        <div className="bg-[#22063F] border border-white/[0.08] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#FFD166]/15 rounded-xl flex items-center justify-center">
            <Users size={18} className="text-[#FFD166]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{educators.length}</p>
            <p className="text-xs text-white/40">Educadoras</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white/5 p-1 rounded-xl w-fit">
        {(['salones', 'educadoras'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
              tab === t
                ? 'bg-[#FF6B35] text-white shadow-[0_4px_20px_rgba(255,107,53,0.35)]'
                : 'text-white/40 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Salones tab */}
      {tab === 'salones' && (
        classrooms.length === 0 ? (
          <div className="bg-[#22063F] border border-white/[0.08] rounded-2xl p-10 text-center">
            <School size={36} className="text-white/15 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No hay salones en este colegio.</p>
            <p className="text-xs text-white/25 mt-1">
              Las lead educators pueden crear salones desde su panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((c) => (
              <div
                key={c.id}
                className="bg-[#22063F] border border-white/[0.08] rounded-2xl p-5 flex flex-col hover:border-white/15 transition-colors"
              >
                <div className="w-10 h-10 bg-[#FF6B35]/15 rounded-xl flex items-center justify-center mb-3">
                  <School size={20} className="text-[#FF6B35]" />
                </div>
                <h3 className="font-semibold text-white mb-1">{c.name}</h3>
                {c.description && (
                  <p className="text-sm text-white/45 mb-3 line-clamp-2">{c.description}</p>
                )}
                <div className="mt-auto pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-mono text-white/30 bg-white/5 px-2 py-1 rounded-lg">
                    {c.code}
                  </span>
                  <Link
                    to={`/classrooms/${c.id}`}
                    className="flex items-center gap-1 text-xs font-medium text-[#FF6B35] hover:text-[#e85c28] transition-colors"
                  >
                    Ver <ArrowLeft size={13} className="rotate-180" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Educadoras tab */}
      {tab === 'educadoras' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowCreateEducator(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#FF6B35] hover:bg-[#e85c28] rounded-xl transition-colors shadow-[0_4px_20px_rgba(255,107,53,0.35)]"
            >
              <Plus size={16} />
              Nueva educadora
            </button>
          </div>

          {educators.length === 0 ? (
            <div className="bg-[#22063F] border border-white/[0.08] rounded-2xl p-10 text-center">
              <Users size={36} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No hay educadoras en este colegio.</p>
            </div>
          ) : (
            <div className="bg-[#22063F] border border-white/[0.08] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/[0.03]">
                  <tr>
                    {['Nombre', 'Email', 'Estado', 'Agregada'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {educators.map((se) => {
                    const u = se.users;
                    return (
                      <tr key={se.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-[#FFD166]/15 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-[#FFD166] text-xs font-semibold">
                                {u?.full_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-white">{u?.full_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-white/50">{u?.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              u?.status === 'active'
                                ? 'bg-[#FFD166]/20 text-[#FFD166]'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {u?.status === 'active' ? 'Activa' : u?.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white/40">
                          {new Date(se.added_at).toLocaleDateString('es', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showAddLead && id && (
        <AddLeadModal
          schoolId={id}
          currentLeadIds={leads.map((l) => l.user_id)}
          onClose={() => setShowAddLead(false)}
          onAdded={(s) => setSchool(s)}
        />
      )}

      {showCreateEducator && id && (
        <CreateEducatorModal
          schoolId={id}
          onClose={() => setShowCreateEducator(false)}
          onCreated={(e) => setEducators((prev) => [e, ...prev])}
        />
      )}
    </div>
  );
};

