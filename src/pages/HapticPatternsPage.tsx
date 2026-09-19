import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Zap } from 'lucide-react';
import { getPatterns, createPattern, updatePattern, deletePattern } from '../api/haptic-patterns.api';
import type { HapticPattern, HapticPulse } from '../types';
import { Hapti } from '../components/Hapti';
import { categorySwatch, type Swatch } from '../lib/palette';

const ALL_SWATCH: Swatch = { color: '#FF6B35', soft: '#FFE6DA', text: '#B93C10' };
import { Modal, ModalBody, ModalFooter, ModalError, ModalField, BtnCancel, BtnPrimary } from '../components/Modal';

const CATEGORIES = ['braille', 'letter', 'number', 'feedback', 'navigation', 'system'];
const STYLES = ['Light', 'Medium', 'Heavy', 'Error'];

const DEFAULT_PULSES = [{ style: 'Medium', durationMs: 40, gapMs: 0 }];

// total_ms = sum of every durationMs + gapMs
const totalMs = (pulses: { durationMs: number; gapMs: number }[]) =>
  pulses.reduce((sum, p) => sum + p.durationMs + p.gapMs, 0);

// Returns an error string, or null when pulses is a valid array
const validatePulses = (v: unknown): string | null => {
  if (!Array.isArray(v) || v.length === 0) return 'Los pulsos deben ser un arreglo con al menos un elemento.';
  for (const [i, p] of v.entries()) {
    if (!p || typeof p !== 'object') return `Pulso ${i + 1}: formato inválido.`;
    const { style, durationMs, gapMs } = p as Record<string, unknown>;
    if (typeof style !== 'string' || !STYLES.includes(style)) return `Pulso ${i + 1}: "style" debe ser ${STYLES.join(', ')}.`;
    if (typeof durationMs !== 'number' || durationMs < 0) return `Pulso ${i + 1}: "durationMs" debe ser un número ≥ 0.`;
    if (typeof gapMs !== 'number' || gapMs < 0) return `Pulso ${i + 1}: "gapMs" debe ser un número ≥ 0.`;
  }
  return null;
};

const categoryColors: Record<string, string> = {
  braille: 'bg-[#FF6B35]/20 text-[#E4531D]',
  learning: 'bg-[#EDC157]/20 text-[#B7791F]',
  feedback: 'bg-emerald-500/20 text-emerald-600',
  navigation: 'bg-blue-500/20 text-blue-600',
  system: 'bg-white/10 text-white/55',
};

const inputCls = 'w-full bg-white/[0.06] border border-white/[0.12] text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] placeholder:text-white/50 transition';

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
    category: pattern?.category ?? 'feedback',
    intensity_type: pattern?.intensity_type ?? 'Medium',
    use_case: pattern?.use_case ?? '',
    pulses: JSON.stringify(pattern?.pulses ?? DEFAULT_PULSES, null, 2),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let parsed: unknown;
    try {
      parsed = JSON.parse(form.pulses);
    } catch {
      setError('El campo "Pulsos" no es JSON válido.');
      return;
    }
    const pulsesError = validatePulses(parsed);
    if (pulsesError) {
      setError(pulsesError);
      return;
    }
    const pulses = parsed as HapticPulse[];

    setLoading(true);
    try {
      const payload = {
        pattern_key: form.pattern_key,
        name: form.name,
        category: form.category,
        pulses,
        total_ms: Math.max(totalMs(pulses), 1),
        intensity_type: form.intensity_type,
        use_case: form.use_case,
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
                  <option key={c} value={c} className="bg-snow text-white">{c}</option>
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

          <div className="grid grid-cols-2 gap-4">
            <ModalField label="Tipo de intensidad" required>
              <select
                value={form.intensity_type}
                onChange={(e) => set('intensity_type', e.target.value)}
                className={inputCls}
                required
              >
                {STYLES.map((s) => (
                  <option key={s} value={s} className="bg-snow text-white">{s}</option>
                ))}
              </select>
            </ModalField>
            <ModalField label="Duración total">
              <input
                value={`${(() => { try { const v = JSON.parse(form.pulses); return Array.isArray(v) ? totalMs(v) : 0; } catch { return 0; } })()} ms`}
                className={`${inputCls} font-mono`}
                disabled
              />
            </ModalField>
          </div>

          <ModalField label="Caso de uso" required>
            <input
              value={form.use_case}
              onChange={(e) => set('use_case', e.target.value)}
              className={inputCls}
              placeholder="Cuándo se dispara este patrón"
              required
            />
          </ModalField>

          <ModalField label="Pulsos (JSON: style, durationMs, gapMs)" required>
            <textarea
              value={form.pulses}
              onChange={(e) => set('pulses', e.target.value)}
              className={`${inputCls} font-mono resize-none`}
              rows={9}
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
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="page-title text-3xl">Patrones Hápticos</h1>
          <p className="text-white/60 text-sm mt-0.5">
            {patterns.length} patrón{patterns.length !== 1 ? 'es' : ''} en catálogo
          </p>
        </div>
        <button
          onClick={() => setModalState('new')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm btn-primary"
        >
          <Plus size={16} /> Nuevo patrón
        </button>
      </div>

      {/* Tiles de categoría: filtran y cuentan */}
      <div className="flex gap-2.5 flex-wrap mb-4">
        {(['all', ...allCategories] as string[]).map((cat, i) => {
          const sw = cat === 'all' ? ALL_SWATCH : categorySwatch(cat, i);
          const count = cat === 'all' ? patterns.length : patterns.filter((p) => p.category === cat).length;
          const active = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-full border-2 text-sm font-extrabold capitalize transition-all duration-200 hover:-translate-y-0.5 ${
                active ? 'bg-snow -translate-y-0.5' : 'bg-snow/70 border-[#EDE3FF]'
              }`}
              style={active ? { borderColor: sw.color, boxShadow: `0 4px 0 ${sw.soft}` } : { boxShadow: '0 3px 0 #EDE3FF' }}
            >
              <span className="w-3 h-3 rounded-full" style={{ background: sw.color }} />
              <span className="text-white">{cat === 'all' ? 'Todos' : cat}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: sw.soft, color: sw.text }}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="surface rounded-3xl p-8 text-center text-white/60 text-sm font-bold">Cargando patrones…</div>
      ) : filtered.length === 0 ? (
        <div className="surface rounded-3xl p-12 text-center flex flex-col items-center">
          <Hapti size={88} />
          <p className="font-display text-lg font-bold text-white mt-2">No hay patrones en esta categoría</p>
          <p className="text-white/60 text-sm mt-1">Prueba otra categoría o crea un patrón nuevo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filtered.map((p, i) => {
            const sw = categorySwatch(p.category, i);
            return (
              <div
                key={p.id}
                className="page-in surface rounded-3xl p-4 pt-5 relative overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1"
                style={{ animationDelay: `${Math.min(i, 12) * 30}ms`, borderColor: sw.soft, boxShadow: `0 5px 0 ${sw.soft}` }}
              >
                <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: sw.color }} aria-hidden="true" />
                <div className="flex items-start gap-3">
                  <span
                    className="w-10 h-10 rounded-xl grid place-items-center text-snow shrink-0"
                    style={{ background: sw.color, boxShadow: `0 2px 0 ${sw.color}55` }}
                  >
                    <Zap size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-bold text-[1rem] text-white leading-tight truncate">{p.name}</h3>
                    <span className="inline-block mt-1 text-[0.7rem] font-mono font-bold px-2 py-0.5 rounded-lg bg-white/[0.07] text-white/70">
                      {p.pattern_key}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 -mr-1">
                    <button
                      onClick={() => setModalState(p)}
                      className="p-1.5 text-white/50 hover:text-[#E4531D] hover:bg-[#FF6B35]/10 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="p-1.5 text-white/50 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-white/60 mt-3 line-clamp-2 min-h-[2.5rem]">{p.use_case || 'Sin descripción'}</p>
                <span
                  className="self-start mt-3 text-xs px-2.5 py-1 rounded-full font-extrabold capitalize"
                  style={{ background: sw.soft, color: sw.text }}
                >
                  {p.category}
                </span>
                <span className="mt-2 text-xs font-mono text-white/50">
                  {p.pulses?.length ?? 0} pulso{p.pulses?.length === 1 ? '' : 's'} · {p.total_ms} ms
                </span>
              </div>
            );
          })}
        </div>
      )}

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

