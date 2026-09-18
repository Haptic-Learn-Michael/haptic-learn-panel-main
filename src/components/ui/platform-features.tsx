import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { Vibrate, BarChart3, Volume2 } from 'lucide-react';

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

function MetricStat({ value, label }: { value: string; label: string }) {
  const reduceMotion = usePrefersReducedMotion();
  const { prefix, end, suffix, decimals } = parseMetricValue(value);

  return (
    <div className="flex flex-col gap-0.5">
      <p
        aria-label={`${label} ${value}`}
        style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.3rem', color: '#FF6B35', lineHeight: 1 }}
      >
        {prefix}
        {reduceMotion ? (
          <span>
            {end.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
          </span>
        ) : (
          <CountUp end={end} decimals={decimals} duration={1.6} separator="," enableScrollSpy scrollSpyOnce />
        )}
        {suffix}
      </p>
      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{label}</p>
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
    role: 'Vibración guiada en cada trazo',
    Icon: Vibrate,
    metrics: [
      { value: '40+', label: 'Actividades' },
      { value: '12', label: 'Patrones hápticos' },
    ],
  },
  {
    id: 2,
    heading: 'Panel educativo completo',
    quote:
      'Un educador principal gestiona salones y asigna educadores. Cada educador crea cursos, inscribe estudiantes con QR y monitorea el progreso en tiempo real.',
    role: 'Panel web para colegios inclusivos',
    Icon: BarChart3,
    metrics: [
      { value: '4', label: 'Roles de usuario' },
      { value: '3', label: 'Niveles de progreso' },
    ],
  },
  {
    id: 3,
    heading: 'Accesibilidad desde el primer trazo',
    quote:
      'Cada elemento del app habla. TalkBack anuncia cada letra mientras el niño la traza — navegación completa por voz en todo momento.',
    role: 'Compatible 100% con Android TalkBack',
    Icon: Volume2,
    metrics: [
      { value: '27', label: 'Letras del abecedario' },
      { value: '100%', label: 'Compatible TalkBack' },
    ],
  },
];

const cardSurface = { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' };

function FeatureCard({ feature }: { feature: (typeof FEATURES)[number] }) {
  const { Icon, heading, quote, role, metrics } = feature;
  return (
    <div className="rounded-2xl p-7 flex flex-col gap-5" style={cardSurface}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(255,107,53,0.14)', border: '1px solid rgba(255,107,53,0.25)' }}>
        <Icon size={16} style={{ color: '#FF6B35' }} strokeWidth={1.8} />
      </div>

      <div>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#fff', lineHeight: 1.3, marginBottom: 4 }}>
          {heading}
        </h3>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{role}</p>
      </div>

      <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.48)', flexGrow: 1 }}>
        {quote}
      </p>

      <div className="flex gap-8 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {metrics.map((m, i) => (
          <MetricStat key={i} value={m.value} label={m.label} />
        ))}
      </div>
    </div>
  );
}

/* ─── Componente principal ─── */
export function PlatformFeatures() {
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

        {/* Tres tarjetas simétricas, mismo peso visual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
