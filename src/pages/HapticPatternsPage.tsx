import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Zap } from 'lucide-react';
import { getPatterns, createPattern, updatePattern, deletePattern } from '../api/haptic-patterns.api';
import type { HapticPattern } from '../types';
import { Modal, ModalBody, ModalFooter, ModalError, ModalField, BtnCancel, BtnPrimary } from '../components/Modal';

const CATEGORIES = ['braille', 'learning', 'feedback', 'navigation', 'system'];

const categoryColors: Record<string, string> = {
  braille: 'bg-[#FF6B35]/20 text-[#FF6B35]',
  learning: 'bg-[#FFD166]/20 text-[#FFD166]',
  feedback: 'bg-emerald-500/20 text-emerald-400',
  navigation: 'bg-blue-500/20 text-blue-400',
  system: 'bg-white/10 text-white/55',
};

const inputCls = 'w-full bg-white/[0.06] border border-white/[0.12] text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] placeholder:text-white/25 transition';

const PatternModal = ({
  pattern,
  onClose,
  onSave,
}: {
  pattern: HapticPattern | null;
  onClose: () => void;
  onSave: (p: HapticPattern) => void;
}) => {
  const isEdit = !!pattern;
  const [form, setForm] = useState({
    pattern_key: pattern?.pattern_key ?? '',
    name: pattern?.name ?? '',
    description: pattern?.description ?? '',
    category: pattern?.category ?? 'feedback',
    pattern_data: pattern?.pattern_data
      ? JSON.stringify(pattern.pattern_data, null, 2)
      : '{\n  "type": "vibration",\n  "duration": 200\n}',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(form.pattern_data);
    } catch {
      setError('El campo "Datos del patrón" no es JSON válido.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        pattern_key: form.pattern_key,
        name: form.name,
        description: form.description || undefined,
        category: form.category,
        pattern_data: parsedData,
      };

      let saved: HapticPattern;
      if (isEdit && pattern) {
        const { data } = await updatePattern(pattern.id, payload);
        saved = data;
      } else {
        const { data } = await createPattern(payload as Omit<HapticPattern, 'id' | 'created_at'>);
        saved = data;
      }
      onSave(saved);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Error al guardar el patrón.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Editar patrón' : 'Nuevo patrón háptico'}
      subtitle={isEdit ? `Clave: ${pattern?.pattern_key}` : 'Define la vibración y sus metadatos'}
      icon={Zap}
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh]">
        <ModalBody className="overflow-y-auto">
          {error && <ModalError message={error} />}

          <div className="grid grid-cols-2 gap-4">
            <ModalField label="Clave" required>
              <input
                value={form.pattern_key}
                onChange={(e) => set('pattern_key', e.target.value)}
                className={`${inputCls} font-mono`}
                placeholder="mi_patron"
                required
                disabled={isEdit}
              />
            </ModalField>
            <ModalField label="Categoría" required>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className={inputCls}
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#2C0B50] text-white">{c}</option>
                ))}
              </select>
            </ModalField>
          </div>

          <ModalField label="Nombre" required>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={inputCls}
              placeholder="Nombre legible del patrón"
              required
            />
          </ModalField>

          <ModalField label="Descripción">
            <input
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={inputCls}
              placeholder="Descripción opcional"
            />
          </ModalField>

          <ModalField label="Datos del patrón (JSON)" required>
            <textarea
              value={form.pattern_data}
              onChange={(e) => set('pattern_data', e.target.value)}
              className={`${inputCls} font-mono resize-none`}
              rows={6}
              required
              spellCheck={false}
            />
          </ModalField>
        </ModalBody>

        <ModalFooter>
          <BtnCancel onClick={onClose} />
          <BtnPrimary
            loading={loading}
            label={isEdit ? 'Guardar cambios' : 'Crear patrón'}
            loadingLabel="Guardando…"
          />
        </ModalFooter>
      </form>
    </Modal>
  );
};

export const HapticPatternsPage = () => {
  const [patterns, setPatterns] = useState<HapticPattern[]>([]);
  const [filtered, setFiltered] = useState<HapticPattern[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<'new' | HapticPattern | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getPatterns();
        setPatterns(data);
        setFiltered(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    setFiltered(categoryFilter === 'all' ? patterns : patterns.filter((p) => p.category === categoryFilter));
  }, [categoryFilter, patterns]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este patrón háptico?')) return;
    setDeleting(id);
    try {
      await deletePattern(id);
      setPatterns((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // silently fail
    } finally {
      setDeleting(null);
    }
  };

  const handleSave = (saved: HapticPattern) => {
    setPatterns((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
    });
  };

  const allCategories = Array.from(new Set(patterns.map((p) => p.category)));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title text-3xl">Patrones Hápticos</h1>
          <p className="text-white/45 text-sm mt-0.5">
            {patterns.length} patrón{patterns.length !== 1 ? 'es' : ''} en catálogo
          </p>
        </div>
        <button
          onClick={() => setModalState('new')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#FF6B35] hover:bg-[#e85c28] rounded-xl transition-colors shadow-[0_4px_20px_rgba(255,107,53,0.35)]"
        >
          <Plus size={16} /> Nuevo patrón
        </button>
      </div>

      <div className="bg-[#22063F] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-white/35">Categoría:</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-[#FF6B35] text-white shadow-[0_2px_12px_rgba(255,107,53,0.4)]'
                  : 'bg-white/[0.07] text-white/50 hover:bg-white/12 hover:text-white'
              }`}
            >
              Todos
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#FF6B35] text-white shadow-[0_2px_12px_rgba(255,107,53,0.4)]'
                    : `${categoryColors[cat] ?? 'bg-white/[0.07] text-white/50'} hover:opacity-80`
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-white/30 text-sm">Cargando patrones…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Zap size={36} className="text-white/15 mx-auto mb-3" />
            <p className="text-white/35 text-sm">No hay patrones en esta categoría.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/[0.03]">
                <tr>
                  {['Nombre', 'Clave', 'Categoría', 'Descripción', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-white">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-white/50 bg-white/[0.07] px-2 py-0.5 rounded-lg">
                        {p.pattern_key}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[p.category] ?? 'bg-white/10 text-white/50'}`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/45 max-w-xs truncate">
                      {p.description ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setModalState(p)}
                          className="p-1.5 text-white/30 hover:text-[#FF6B35] hover:bg-[#FF6B35]/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalState !== null && (
        <PatternModal
          pattern={modalState === 'new' ? null : modalState}
          onClose={() => setModalState(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

