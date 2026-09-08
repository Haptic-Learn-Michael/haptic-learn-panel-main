import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { Vibrate, BarChart3, Volume2 } from 'lucide-react';

/* ─── Trazo de la "A" reutilizado del mockup del teléfono, en proporción
   panorámica — visual propio de marca en vez de foto de stock genérica. ─── */
const HERO_TRACE: Array<{ x: number; y: number }> = [
  { x: 0.40, y: 0.86 }, { x: 0.42, y: 0.72 }, { x: 0.44, y: 0.58 },
  { x: 0.46, y: 0.44 }, { x: 0.48, y: 0.30 }, { x: 0.50, y: 0.16 },
  { x: 0.52, y: 0.30 }, { x: 0.54, y: 0.44 }, { x: 0.56, y: 0.58 },
  { x: 0.58, y: 0.72 }, { x: 0.60, y: 0.86 },
  { x: 0.45, y: 0.54 }, { x: 0.48, y: 0.54 }, { x: 0.50, y: 0.54 }, { x: 0.52, y: 0.54 }, { x: 0.55, y: 0.54 },
];

function HeroTraceVisual() {
  const [lit, setLit] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setLit((prev) => (prev >= HERO_TRACE.length - 1 ? 0 : prev + 1));
    }, 140);
    return () => clearInterval(interval);
  }, []);
  const finger = HERO_TRACE[lit];

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        background: `
          radial-gradient(60% 90% at 50% 10%, rgba(255,107,53,0.16), transparent 65%),
          linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 50%),
          #1c0f34`,
      }}
    >
      {/* Ghost letter behind the trace */}
      <span
        aria-hidden
        style={{
          position: 'absolute', fontFamily: "'Outfit', sans-serif", fontWeight: 900,
          fontSize: 'min(60%, 13rem)', lineHeight: 1, color: 'rgba(255,255,255,0.05)', userSelect: 'none',
        }}
      >
        A
      </span>

      {/* Dot trail */}
      <div className="relative" style={{ width: '46%', aspectRatio: '1 / 1' }}>
        {HERO_TRACE.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 9, height: 9,
              left: `${p.x * 100}%`, top: `${p.y * 100}%`, transform: 'translate(-50%, -50%)',
              background: i <= lit ? '#FF6B35' : 'rgba(255,255,255,0.14)',
              boxShadow: i <= lit ? '0 0 12px rgba(255,107,53,0.75)' : 'none',
              transition: 'background 0.15s, box-shadow 0.15s',
            }}
          />
        ))}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 26, height: 26,
            left: `${finger.x * 100}%`, top: `${finger.y * 100}%`, transform: 'translate(-50%, -50%)',
            background: 'rgba(255,107,53,0.22)', border: '1.5px solid rgba(255,107,53,0.85)',
            transition: 'left 0.14s linear, top 0.14s linear',
          }}
        />
      </div>

      {/* Vibration bars, bottom-left — echoes the "vibración háptica" copy */}
      <div className="absolute bottom-5 left-6 flex items-end gap-1">
        {[6, 11, 8, 14, 9, 5].map((h, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: 3, height: h * 2, background: '#FF6B35', opacity: 0.7,
              animation: `heroBar 1s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`@keyframes heroBar { 0%,100% { transform: scaleY(0.5) } 50% { transform: scaleY(1) } }`}</style>
    </div>
  );
}

/* ─── Respeta preferencias de movimiento del usuario ─── */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

/* ─── Parsea métricas como "40+", "3.8x", "100%" ─── */
function parseMetricValue(raw: string) {
  const value = (raw ?? '').toString().trim();
  const m = value.match(
    /^([^\d\-+]*?)\s*([\-+]?\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*([^\d\s]*)$/
  );
  if (!m) return { prefix: '', end: 0, suffix: value, decimals: 0 };
  const [, prefix, num, suffix] = m;
  const normalized = num.replace(/,/g, '');
  const end = parseFloat(normalized);
  const decimals = normalized.split('.')[1]?.length ?? 0;
  return { prefix: prefix ?? '', end: isNaN(end) ? 0 : end, suffix: suffix ?? '', decimals };
}

/* ─── Métrica animada ───
   size="lg": número grande sin caja, usado en la tarjeta protagonista.
   size="sm": número compacto, usado en las tarjetas de apoyo. */
function MetricStat({
  value,
  label,
  sub,
  accent = '#FF6B35',
  duration = 1.6,
  size = 'lg',
}: {
  value: string;
  label: string;
  sub?: string;
  accent?: string;
  duration?: number;
  size?: 'lg' | 'sm';
}) {
  const reduceMotion = usePrefersReducedMotion();
  const { prefix, end, suffix, decimals } = parseMetricValue(value);
  const isLg = size === 'lg';

  return (
    <div className="flex flex-col gap-1">
      <p
        aria-label={`${label} ${value}`}
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 900,
          fontSize: isLg ? 'clamp(1.8rem, 2.4vw, 2.3rem)' : '1.3rem',
          color: accent,
          lineHeight: 1,
        }}
      >
        {prefix}
        {reduceMotion ? (
          <span>
            {end.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })}
          </span>
        ) : (
          <CountUp
            end={end}
            decimals={decimals}
            duration={duration}
            separator=","
            enableScrollSpy
            scrollSpyOnce
          />
        )}
        {suffix}
      </p>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: isLg ? '0.85rem' : '0.75rem', color: '#fff' }}>
        {label}
      </p>
      {sub && isLg && (
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>{sub}</p>
      )}
    </div>
  );
}

/* ─── Datos de cada feature ─── */
const FEATURES = [
  {
    id: 1,
    heading: 'Trazos hápticos de letras',
    quote:
      'El niño arrastra el dedo siguiendo el trazo exacto de cada letra. La pantalla vibra en cada punto del camino correcto — aprende la forma sin necesitar ver la pantalla.',
    name: 'Aprendizaje táctil',
    role: 'Vibración guiada en cada trazo',
    Icon: Vibrate,
    accent: '#FF6B35',
    metrics: [
      { value: '40+', label: 'Actividades educativas', sub: 'Letras, números y braille' },
      { value: '12', label: 'Patrones hápticos', sub: 'Únicos por contenido' },
    ],
  },
  {
    id: 2,
    heading: 'Panel educativo completo',
    quote:
      'Un educador principal gestiona salones y asigna educadores. Cada educador crea cursos, inscribe estudiantes con QR y monitorea el progreso en tiempo real.',
    name: 'Gestión sin fricción',
    role: 'Panel web para colegios inclusivos',
    Icon: BarChart3,
    accent: '#E8A33D',
    metrics: [
      { value: '4', label: 'Roles de usuario', sub: '' },
      { value: '3', label: 'Niveles de progreso', sub: '' },
    ],
  },
  {
    id: 3,
    heading: 'Accesibilidad desde el primer trazo',
    quote:
      'Cada elemento del app habla. TalkBack anuncia cada letra mientras el niño la traza — navegación completa por voz en todo momento.',
    name: 'Inclusión real',
    role: 'Compatible 100% con Android TalkBack',
    Icon: Volume2,
    accent: '#34D399',
    metrics: [
      { value: '27', label: 'Letras del abecedario', sub: '' },
      { value: '100%', label: 'Compatible TalkBack', sub: '' },
    ],
  },
];

const cardSurface = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' };

/* ─── Tarjeta protagonista (con imagen) ─── */
function FeatureHero({ feature }: { feature: (typeof FEATURES)[number] }) {
  const { Icon, accent } = feature;
  return (
    <div className="lg:col-span-3 rounded-3xl overflow-hidden flex flex-col" style={cardSurface}>
      <div className="relative h-64 sm:h-80 overflow-hidden group">
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
          <HeroTraceVisual />
        </div>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(20,10,38,0) 35%, rgba(20,10,38,0.94) 100%)' }}
        />
        <div
          className="absolute top-5 left-5 w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: accent }}
        >
          <Icon size={18} color="#140A26" strokeWidth={2.2} />
        </div>
        <div className="absolute bottom-5 left-6 right-6">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1.5"
            style={{ color: accent, fontFamily: "'Outfit', sans-serif", letterSpacing: '0.08em' }}
          >
            {feature.name}
          </p>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.45rem', color: '#fff', lineHeight: 1.2 }}>
            {feature.heading}
          </h3>
        </div>
      </div>

      <div className="p-7 flex flex-col gap-6 flex-1">
        <p style={{ fontSize: '0.92rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.5)' }}>
          {feature.quote}
        </p>
        <div className="flex gap-10 mt-auto pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {feature.metrics.map((m, i) => (
            <MetricStat key={i} value={m.value} label={m.label} sub={m.sub} accent={accent} size="lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Tarjeta de apoyo (compacta, sin imagen) ─── */
function FeatureCompact({ feature }: { feature: (typeof FEATURES)[number] }) {
  const { Icon, accent } = feature;
  return (
    <div className="flex-1 rounded-3xl p-6 flex flex-col gap-4" style={cardSurface}>
      <div className="flex items-start gap-3.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          <Icon size={16} style={{ color: accent }} strokeWidth={1.8} />
        </div>
        <div>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#fff', lineHeight: 1.3, marginBottom: 2 }}>
            {feature.heading}
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{feature.role}</p>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.48)' }}>
        {feature.quote}
      </p>

      <div className="flex gap-8 mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {feature.metrics.map((m, i) => (
          <MetricStat key={i} value={m.value} label={m.label} accent={accent} size="sm" />
        ))}
      </div>
    </div>
  );
}

/* ─── Componente principal ─── */
export function PlatformFeatures() {
  const [hero, ...support] = FEATURES;

  return (
    <section id="features" className="py-24 px-6" aria-labelledby="features-heading">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col gap-3 text-center max-w-xl mx-auto mb-16">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#FF6B35', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em' }}
          >
            La plataforma
          </p>
          <h2
            id="features-heading"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#fff',
            }}
          >
            Todo lo que necesita un colegio inclusivo.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Desde el trazo háptico hasta el panel de gestión — HapticLearn cubre todo el ecosistema educativo.
          </p>
        </div>

        {/* Bento: una tarjeta protagonista + dos de apoyo apiladas */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <FeatureHero feature={hero} />
          <div className="lg:col-span-2 flex flex-col gap-6">
            {support.map((feature) => (
              <FeatureCompact key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
