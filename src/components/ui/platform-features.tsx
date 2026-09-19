import { Vibrate, BarChart3, Volume2 } from 'lucide-react';

const ACCENT = '#FF6B35';

/* ─── Datos de cada feature ─── */
const FEATURES = [
  {
    id: 1,
    heading: 'Trazos hápticos de letras',
    quote:
      'El niño arrastra el dedo siguiendo el trazo exacto de cada letra. La pantalla vibra en cada punto del camino correcto — aprende la forma sin necesitar ver la pantalla.',
    role: 'Vibración guiada en cada trazo',
    Icon: Vibrate,
    meta: ['40+ actividades', '12 patrones hápticos'],
  },
  {
    id: 2,
    heading: 'Panel educativo completo',
    quote:
      'Un educador principal gestiona salones y asigna educadores. Cada educador crea cursos, inscribe estudiantes con QR y monitorea el progreso en tiempo real.',
    role: 'Panel web para colegios inclusivos',
    Icon: BarChart3,
    meta: ['4 roles de usuario', '3 niveles de progreso'],
  },
  {
    id: 3,
    heading: 'Accesibilidad desde el primer trazo',
    quote:
      'Cada elemento del app habla. TalkBack anuncia cada letra mientras el niño la traza — navegación completa por voz en todo momento.',
    role: 'Compatible 100% con Android TalkBack',
    Icon: Volume2,
    meta: ['27 letras del abecedario', '100% compatible TalkBack'],
  },
];

function FeatureRow({ feature, isLast }: { feature: (typeof FEATURES)[number]; isLast: boolean }) {
  const { Icon, heading, quote, role, meta } = feature;
  return (
    <div
      className="grid md:grid-cols-[15rem_1fr] gap-4 md:gap-12 py-9"
      style={!isLast ? { borderBottom: '1px solid rgba(255,255,255,0.07)' } : undefined}
    >
      <div className="flex items-center gap-3.5 md:pt-0.5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,107,53,0.14)', border: '1px solid rgba(255,107,53,0.25)' }}
        >
          <Icon size={16} style={{ color: ACCENT }} strokeWidth={1.8} />
        </div>
        <h3
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize: '1.05rem',
            color: '#fff',
            lineHeight: 1.3,
          }}
        >
          {heading}
        </h3>
      </div>

      <div>
        <p style={{ fontSize: '0.78rem', fontWeight: 600, color: ACCENT, marginBottom: 8 }}>{role}</p>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.7)', maxWidth: '46rem' }}>
          {quote}
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4">
          {meta.map((m, i) => (
            <span key={i} className="inline-flex items-center gap-1.5" style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.55)' }}>
              <span className="w-1 h-1 rounded-full" style={{ background: ACCENT }} />
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Componente principal ─── */
export function PlatformFeatures() {
  return (
    <section id="features" className="py-24 px-6" aria-labelledby="features-heading">
      <div className="max-w-4xl mx-auto">
        <div className="mb-14">
          <h2
            id="features-heading"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#fff',
              maxWidth: '30rem',
            }}
          >
            Todo lo que necesita un colegio inclusivo.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '32rem', marginTop: 14 }}>
            Desde el trazo háptico hasta el panel de gestión — HapticLearn cubre todo el ecosistema educativo.
          </p>
        </div>

        <div>
          {FEATURES.map((feature, i) => (
            <FeatureRow key={feature.id} feature={feature} isLast={i === FEATURES.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
