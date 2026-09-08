import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, School, ArrowRight, Trash2 } from 'lucide-react';
import { getClassrooms, createClassroom, deleteClassroom } from '../api/classrooms.api';
import { useAuthStore } from '../store/auth.store';
import type { Classroom } from '../types';
import { Modal, ModalBody, ModalFooter, ModalError, ModalField, BtnCancel, BtnPrimary } from '../components/Modal';

const inputCls = 'w-full bg-white/[0.06] border border-white/[0.12] text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] placeholder:text-white/25 transition';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const canCreate = user?.role === 'lead_educator';

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getClassrooms();
        setClassrooms(data);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title text-3xl">Salones</h1>
          <p className="text-white/45 text-sm mt-0.5">
            {classrooms.length} salón{classrooms.length !== 1 ? 'es' : ''}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#FF6B35] hover:bg-[#e85c28] rounded-xl transition-colors shadow-[0_4px_20px_rgba(255,107,53,0.35)]"
          >
            <Plus size={16} />
            Nuevo salón
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface border border-white/[0.08] rounded-2xl p-5 animate-pulse">
              <div className="h-5 bg-white/10 rounded-lg w-3/4 mb-3" />
              <div className="h-3 bg-white/5 rounded w-1/2 mb-4" />
              <div className="h-3 bg-white/5 rounded w-full" />
            </div>
          ))}
        </div>
      ) : classrooms.length === 0 ? (
        <div className="surface border border-white/[0.08] rounded-2xl p-12 text-center">
          <School size={40} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No hay salones aún.</p>
          {canCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 px-4 py-2 text-sm font-medium text-[#FF6B35] hover:text-[#e85c28] transition-colors"
            >
              Crear primer salón
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((c) => (
            <div
              key={c.id}
              className="surface border border-white/[0.08] rounded-2xl p-5 flex flex-col hover:border-white/15 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-[#FF6B35]/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <School size={20} className="text-[#FF6B35]" />
                </div>
                {(user?.role === 'lead_educator' && c.lead_educator_id === user?.id) && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deleting === c.id}
                    className="text-white/20 hover:text-red-400 transition-colors disabled:opacity-30"
                    title="Eliminar salón"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
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
                  Ver detalle <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
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

