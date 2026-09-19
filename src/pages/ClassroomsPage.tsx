import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, School, ArrowRight, Trash2, Building2 } from 'lucide-react';
import { getClassrooms, createClassroom, deleteClassroom } from '../api/classrooms.api';
import { useAuthStore } from '../store/auth.store';
import { getSchools } from '../api/schools.api';
import type { Classroom, School as SchoolType } from '../types';
import { Hapti } from '../components/Hapti';
import { swatchAt, type Swatch } from '../lib/palette';
import { Modal, ModalBody, ModalFooter, ModalError, ModalField, BtnCancel, BtnPrimary } from '../components/Modal';

const ALL_SWATCH: Swatch = { color: '#FF6B35', soft: '#FFE6DA', text: '#B93C10' };
const NO_SCHOOL_SWATCH: Swatch = { color: '#B8AED0', soft: '#EFEAF7', text: '#6B5A8E' };

const inputCls = 'w-full bg-white/[0.06] border border-white/[0.12] text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] placeholder:text-white/50 transition';

const CreateModal = ({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (c: Classroom) => void;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await createClassroom({ name, description: description || undefined });
      onCreate(data);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Error al crear salón.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Nuevo salón" subtitle="Crea un espacio de aprendizaje" icon={School} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {error && <ModalError message={error} />}

          <ModalField label="Nombre" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="Ej: Salón Braille A"
              required
            />
          </ModalField>

          <ModalField label="Descripción">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Descripción opcional del salón…"
            />
          </ModalField>
        </ModalBody>

        <ModalFooter>
          <BtnCancel onClick={onClose} />
          <BtnPrimary loading={loading} label="Crear salón" loadingLabel="Creando…" />
        </ModalFooter>
      </form>
    </Modal>
  );
};

export const ClassroomsPage = () => {
  const { user } = useAuthStore();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const canCreate = user?.role === 'lead_educator';

  useEffect(() => {
    const fetch = async () => {
      try {
        // Los colegios son opcionales: si el rol no puede listarlos, se muestra sin agrupar.
        const [{ data }, schoolList] = await Promise.all([
          getClassrooms(),
          getSchools().then((r) => r.data).catch(() => [] as SchoolType[]),
        ]);
        setClassrooms(data);
        setSchools(schoolList);
      } catch {
        setError('Error al cargar salones.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este salón? Esta acción no se puede deshacer.')) return;
    setDeleting(id);
    try {
      await deleteClassroom(id);
      setClassrooms((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // silently fail
    } finally {
      setDeleting(null);
    }
  };

  // Un grupo por colegio (con color propio) + "Sin colegio" al final
  const groups = useMemo(() => {
    const bySchool = new Map<string, Classroom[]>();
    const orphans: Classroom[] = [];
    for (const c of classrooms) {
      if (c.school_id && schools.some((sc) => sc.id === c.school_id)) {
        bySchool.set(c.school_id, [...(bySchool.get(c.school_id) ?? []), c]);
      } else {
        orphans.push(c);
      }
    }
    const list = schools
      .filter((sc) => bySchool.has(sc.id))
      .map((sc, i) => ({ key: sc.id, name: sc.name, sw: swatchAt(schools.indexOf(sc) + 2), items: bySchool.get(sc.id)!, order: i }));
    if (orphans.length) list.push({ key: 'none', name: 'Sin colegio', sw: NO_SCHOOL_SWATCH, items: orphans, order: list.length });
    return list;
  }, [classrooms, schools]);

  const visibleGroups = filter === 'all' ? groups : groups.filter((g) => g.key === filter);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="page-title text-3xl">Salones</h1>
          <p className="text-white/60 text-sm mt-0.5">
            {classrooms.length} salón{classrooms.length !== 1 ? 'es' : ''}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm btn-primary"
          >
            <Plus size={16} />
            Nuevo salón
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface rounded-3xl p-5 animate-pulse">
              <div className="h-5 bg-white/10 rounded-lg w-3/4 mb-3" />
              <div className="h-3 bg-white/5 rounded w-1/2 mb-4" />
              <div className="h-3 bg-white/5 rounded w-full" />
            </div>
          ))}
        </div>
      ) : classrooms.length === 0 ? (
        <div className="surface rounded-3xl p-12 text-center flex flex-col items-center">
          <Hapti size={96} />
          <p className="font-display text-xl font-bold text-white mt-2">Aún no hay salones</p>
          <p className="text-white/60 text-sm mt-1">Crea el primero y empieza a invitar a tus peques.</p>
          {canCreate && (
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-5 px-5 py-2.5 text-sm">
              <Plus size={16} /> Crear primer salón
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Filtro por colegio: cada colegio tiene su color y su conteo */}
          {groups.length > 1 && (
            <div className="flex flex-wrap gap-2.5 mb-5" role="group" aria-label="Filtrar por colegio">
              {[{ key: 'all', name: 'Todos', sw: ALL_SWATCH, count: classrooms.length }, ...groups.map((g) => ({ key: g.key, name: g.name, sw: g.sw, count: g.items.length }))].map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-full border-2 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 ${
                      active ? 'bg-snow -translate-y-0.5' : 'bg-snow/70 border-[#EDE3FF]'
                    }`}
                    style={active ? { borderColor: f.sw.color, boxShadow: `0 4px 0 ${f.sw.soft}` } : { boxShadow: '0 3px 0 #EDE3FF' }}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ background: f.sw.color }} />
                    <span className="text-white">{f.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: f.sw.soft, color: f.sw.text }}>{f.count}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="space-y-8">
            {visibleGroups.map((g) => (
              <section key={g.key} aria-label={g.name}>
                {groups.length > 1 && (
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="w-9 h-9 rounded-xl grid place-items-center text-snow flex-shrink-0"
                      style={{ background: g.sw.color, boxShadow: `0 2px 0 ${g.sw.color}55` }}
                    >
                      <Building2 size={18} />
                    </span>
                    <h2 className="font-display text-xl font-bold text-white">{g.name}</h2>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ background: g.sw.soft, color: g.sw.text }}>
                      {g.items.length} salón{g.items.length !== 1 ? 'es' : ''}
                    </span>
                    <span className="flex-1 h-[3px] rounded-full" style={{ background: g.sw.soft }} aria-hidden="true" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {g.items.map((c, i) => {
                    const sw = g.sw;
                    return (
                      <div
                        key={c.id}
                        className="page-in surface rounded-3xl p-5 pt-6 flex flex-col relative overflow-hidden transition-transform duration-200 hover:-translate-y-1"
                        style={{ animationDelay: `${Math.min(i, 9) * 40}ms`, borderColor: sw.soft, boxShadow: `0 5px 0 ${sw.soft}` }}
                      >
                        <span className="absolute inset-x-0 top-0 h-2" style={{ background: sw.color }} aria-hidden="true" />
                        <div className="flex items-start justify-between mb-3">
                          <span
                            className="w-11 h-11 rounded-2xl grid place-items-center text-snow flex-shrink-0"
                            style={{ background: sw.color, boxShadow: `0 2px 0 ${sw.color}55` }}
                          >
                            <School size={21} />
                          </span>
                          {user?.role === 'lead_educator' && c.lead_educator_id === user?.id && (
                            <button
                              onClick={() => handleDelete(c.id)}
                              disabled={deleting === c.id}
                              className="p-1.5 rounded-lg text-white/50 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30"
                              title="Eliminar salón"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                        <h3 className="font-display font-bold text-lg text-white leading-tight mb-1.5">{c.name}</h3>
                        {/* Etiqueta del colegio */}
                        {schools.length > 0 && (
                        <span
                          className="self-start inline-flex items-center gap-1.5 text-[0.7rem] font-extrabold px-2.5 py-1 rounded-full mb-2"
                          style={{ background: sw.soft, color: sw.text }}
                        >
                          <Building2 size={12} />
                          {g.name}
                        </span>
                        )}
                        {c.description && (
                          <p className="text-sm text-white/60 mb-3 line-clamp-2">{c.description}</p>
                        )}
                        <div className="mt-auto pt-3 flex items-center justify-between">
                          <span
                            className="text-xs font-mono font-bold px-2.5 py-1 rounded-full"
                            style={{ background: sw.soft, color: sw.text }}
                            title="Código del salón"
                          >
                            {c.code}
                          </span>
                          <Link
                            to={`/classrooms/${c.id}`}
                            className="group inline-flex items-center gap-1 text-xs font-extrabold"
                            style={{ color: sw.text }}
                          >
                            Ver detalle <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={(c) => setClassrooms((prev) => [c, ...prev])}
        />
      )}
    </div>
  );
};

