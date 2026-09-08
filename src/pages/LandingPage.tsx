import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { WavePath } from '@/components/ui/wave-path';
import { PlatformFeatures } from '@/components/ui/platform-features';
import { HoverButton } from '@/components/ui/hover-button';
import {
  Hand,
  Volume2,
  BarChart3,
  School,
  Heart,
  CheckCircle,
  ArrowRight,
  Play,
  ChevronDown,
  Vibrate,
  Type,
  Smartphone,
  Users,
  GraduationCap,
  QrCode,
} from 'lucide-react';

/* ─── animation variants ─── */
const stagger = {
  visible: { transition: { staggerChildren: 0.09 } },
  hidden: {},
};
const rise = {
  hidden: { opacity: 0, y: 28, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const popIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Phone Mockup ─── */

// Puntos del point_map para la letra "A" — coordenadas normalizadas 0-1
// representan el trazo real de escritura: diagonal izq → ápice → diagonal der → barra
const TRACE_A: Array<{ x: number; y: number }> = [
  // trazo izquierdo (base → ápice)
  { x: 0.28, y: 0.88 }, { x: 0.32, y: 0.74 }, { x: 0.36, y: 0.60 },
  { x: 0.40, y: 0.46 }, { x: 0.44, y: 0.32 }, { x: 0.50, y: 0.14 },
  // trazo derecho (ápice → base)
  { x: 0.56, y: 0.32 }, { x: 0.60, y: 0.46 }, { x: 0.64, y: 0.60 },
  { x: 0.68, y: 0.74 }, { x: 0.72, y: 0.88 },
  // barra central
  { x: 0.37, y: 0.56 }, { x: 0.44, y: 0.56 }, { x: 0.50, y: 0.56 },
  { x: 0.56, y: 0.56 }, { x: 0.63, y: 0.56 },
];

function TraceCanvas({ width, height }: { width: number; height: number }) {
  const [lit, setLit] = useState(0);

  useEffect(() => {
    setLit(0);
    const interval = setInterval(() => {
      setLit((prev) => {
        if (prev >= TRACE_A.length - 1) { clearInterval(interval); return prev; }
        return prev + 1;
      });
    }, 110);
    return () => clearInterval(interval);
  }, []);

  // finger position tracks the current lit point
  const finger = lit < TRACE_A.length ? TRACE_A[lit] : TRACE_A[TRACE_A.length - 1];

  return (
    <div className="relative" style={{ width, height }}>
      {/* Guide dots (dim) */}
      {TRACE_A.map((p, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            width: 7, height: 7,
            left: p.x * width - 3.5,
            top: p.y * height - 3.5,
            background: i <= lit
              ? '#FF6B35'
              : 'rgba(255,255,255,0.12)',
            boxShadow: i <= lit ? '0 0 8px rgba(255,107,53,0.7)' : 'none',
            transition: 'background 0.15s, box-shadow 0.15s',
          }}
        />
      ))}
      {/* Animated finger cursor */}
      <motion.div
        animate={{ left: finger.x * width - 10, top: finger.y * height - 10 }}
        transition={{ duration: 0.1, ease: 'linear' }}
        className="absolute pointer-events-none"
        style={{ width: 20, height: 20 }}
      >
        <div className="w-full h-full rounded-full"
          style={{ background: 'rgba(255,107,53,0.25)', border: '1.5px solid rgba(255,107,53,0.8)' }} />
      </motion.div>
    </div>
  );
}

function PhoneMockup() {
  const [activeStep, setActiveStep] = useState(0);
  const [traceKey, setTraceKey] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveStep((s) => (s + 1) % 3);
      setTraceKey((k) => k + 1);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative select-none" style={{ width: 260, height: 520 }}>
      {/* Phone frame */}
      <div className="relative w-full h-full rounded-[44px] overflow-hidden"
        style={{
          background: '#0C0520',
          border: '1.5px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-7 rounded-b-2xl z-10"
          style={{ background: '#0A0518' }} />

        <div className="absolute inset-0 p-4 pt-10 flex flex-col">
          {/* Top bar */}
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: '#FF6B35' }}>
                <Hand size={12} color="white" />
              </div>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.9)' }}>
                HapticLearn
              </span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                  style={{ background: i === activeStep ? '#FF6B35' : 'rgba(255,255,255,0.18)' }} />
              ))}
            </div>
          </div>

          {/* Pill */}
          <div className="text-center mb-2">
            <span className="px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,107,53,0.15)', color: '#FFA438', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fontWeight: 600 }}>
              Lección · Letra A
            </span>
          </div>

          <AnimatePresence mode="wait">
            {/* ── Pantalla 1: TRAZO ── */}
            {activeStep === 0 && (
              <motion.div key={`trace-${traceKey}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col items-center justify-center gap-3"
              >
                <div className="text-xs text-center"
                  style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.07em', fontSize: 9 }}>
                  SIGUE EL TRAZO CON TU DEDO
                </div>
                <div className="rounded-2xl overflow-hidden relative"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', width: 168, height: 168 }}>
                  <TraceCanvas key={traceKey} width={168} height={168} />
                  {/* Letter ghost behind */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ zIndex: 0 }}>
                    <span style={{
                      fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '7rem',
                      color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none',
                    }}>A</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF6B35' }} />
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    vibración háptica activa
                  </span>
                </div>
              </motion.div>
            )}

            {/* ── Pantalla 2: VOZ ── */}
            {activeStep === 1 && (
              <motion.div key="voice"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col items-center justify-center gap-4"
              >
                <div className="w-28 h-28 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,107,53,0.2)' }}>
                  <span style={{
                    fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '4.5rem',
                    color: '#FF6B35', lineHeight: 1,
                  }}>A</span>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  TalkBack anuncia:
                </div>
                <div className="px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(255,255,255,0.75)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    "Letra A"
                  </span>
                </div>
                {/* Waveform */}
                <div className="flex items-center gap-1">
                  {[3, 5, 8, 10, 7, 4, 9, 6, 3].map((h, i) => (
                    <motion.div key={i}
                      animate={{ scaleY: [1, 1.6, 0.6, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.09 }}
                      style={{ width: 3, height: h * 2, borderRadius: 2, background: '#FF6B35', transformOrigin: 'center' }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Pantalla 3: ÉXITO ── */}
            {activeStep === 2 && (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col items-center justify-center gap-3"
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: '#34D399', boxShadow: '0 0 30px rgba(52,211,153,0.4)' }}
                >
                  <CheckCircle size={32} color="white" strokeWidth={2.5} />
                </motion.div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: '#fff' }}>
                  ¡Excelente!
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Trazo completado
                </div>
                <div className="w-full px-3 mt-2">
                  <div className="flex justify-between mb-1.5">
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Progreso del curso</span>
                    <span style={{ fontSize: 9, color: '#FF6B35', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>7/27</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <motion.div initial={{ width: '22%' }} animate={{ width: '26%' }}
                      transition={{ duration: 0.9, delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ background: '#FF6B35' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom nav */}
          <div className="flex justify-around py-3 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[Hand, BarChart3, School].map((Icon, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Icon size={14} color={i === 0 ? '#FF6B35' : 'rgba(255,255,255,0.25)'} />
                <div className="w-1 h-1 rounded-full" style={{ background: i === 0 ? '#FF6B35' : 'transparent' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes pulse-ring { 0%,100% { opacity:0.4; transform:scale(1) } 50% { opacity:0.1; transform:scale(1.3) } }
        .float { animation: float 5s ease-in-out infinite; }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          // `fixed` keeps the glow pinned to the viewport instead of the very
          // top of a tall document, so the ambient light stays present as you
          // scroll through stats/features/audiences instead of hitting flat
          // black past the hero.
          background: `
            radial-gradient(55rem 42rem at 88% 0%, rgba(255,107,53,0.11), transparent 62%),
            radial-gradient(46rem 38rem at 4% 18%, rgba(255,209,102,0.06), transparent 58%),
            radial-gradient(50rem 44rem at 50% 100%, rgba(151,71,255,0.09), transparent 60%),
            #140A26
          `,
          backgroundAttachment: 'fixed',
          color: '#fff',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          overflowX: 'hidden',
        }}
      >
        {/* ── NAV ── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-4 inset-x-0 z-50 mx-auto flex w-[calc(100%_-_3rem)] max-w-6xl items-center justify-between px-5 py-3 rounded-2xl"
          style={{
            background: 'rgba(20,10,38,0.75)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#FF6B35' }}
            >
              <Hand size={15} color="white" />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>
              HapticLearn
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {[['#features', 'Plataforma'], ['#audiences', 'Para quién'], ['#how', 'Cómo funciona']].map(([href, label]) => (
              <a key={href} href={href}
                className="transition-colors duration-150 hover:text-white"
                style={{ fontSize: '0.82rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
              >
                {label}
              </a>
            ))}
          </nav>

          <HoverButton
            variant="primary"
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 text-sm"
          >
            Ingresar
            <ArrowRight size={14} />
          </HoverButton>
        </motion.header>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center px-6 pt-28 pb-16">

          <div className="relative z-10 w-full max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">

              {/* Left: copy */}
              <motion.div initial="hidden" animate="visible" variants={stagger}>
                {/* Headline */}
                <motion.h1 variants={rise}
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 900,
                    fontSize: 'clamp(2.8rem, 5.5vw, 4.2rem)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.035em',
                    marginBottom: '1.25rem',
                  }}
                >
                  Para niños que{' '}
                  <span style={{ color: '#FF6B35' }}>
                    aprenden
                  </span>
                  {' '}diferente.
                </motion.h1>

                {/* Subtitle */}
                <motion.p variants={rise}
                  className="mb-8 max-w-md"
                  style={{ fontSize: '1rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.58)', fontWeight: 400 }}
                >
                  HapticLearn enseña a niños con discapacidad visual a{' '}
                  <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>trazar letras y números con el dedo</strong>,
                  guiados por vibración y voz en cada trazo. Diseñado para colegios inclusivos del Perú.
                </motion.p>

                {/* CTAs */}
                <motion.div variants={rise} className="flex flex-wrap gap-3 mb-10">
                  <HoverButton
                    variant="primary"
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2.5 px-6 py-3.5 text-sm"
                  >
                    Ingresar al panel
                    <ArrowRight size={16} />
                  </HoverButton>
                  <HoverButton
                    variant="secondary"
                    onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 px-6 py-3.5 text-sm"
                  >
                    <Play size={14} />
                    Ver cómo funciona
                  </HoverButton>
                </motion.div>

                {/* Trust row */}
                <motion.div variants={rise} className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {['#FF6B35', '#FF8F5E', '#FFA438', '#FFD166'].map((c, i) => (
                      <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                        style={{ background: c, borderColor: '#140A26', fontSize: 10, fontWeight: 700, color: i === 3 ? '#3A2400' : '#fff' }}>
                        {['A', 'EP', 'E', 'E'][i]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                      Admin · Ed. Principal · Educador · Estudiante
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                      4 roles, un solo ecosistema
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: phone */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className="flex justify-center items-center float"
              >
                <div className="relative">
                  {/* Concentric rings */}
                  {[1, 2, 3].map((r) => (
                    <div key={r} className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        border: '1px solid rgba(255,107,53,0.08)',
                        transform: `scale(${1 + r * 0.15})`,
                        animation: `pulse-ring ${2 + r * 0.5}s ease-in-out infinite`,
                        animationDelay: `${r * 0.3}s`,
                      }}
                    />
                  ))}
                  <PhoneMockup />
                </div>
              </motion.div>
            </div>

            {/* Scroll hint */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
                <ChevronDown size={18} style={{ color: 'rgba(255,255,255,0.2)' }} />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-3 gap-6">
            {[
              { val: '40+', label: 'Actividades educativas', sub: 'letras, números y braille', Icon: Type, color: '#FF6B35' },
              { val: '12', label: 'Patrones hápticos', sub: 'únicos por contenido', Icon: Vibrate, color: '#E8A33D' },
              { val: '4', label: 'Roles de usuario', sub: 'admin · educador · alumno', Icon: Users, color: '#FFD166' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative text-center py-7 px-4 rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full pointer-events-none"
                  style={{ background: s.color, opacity: 0.1, filter: 'blur(28px)' }}
                />
                <div
                  className="relative mx-auto mb-3 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}
                >
                  <s.Icon size={17} style={{ color: s.color }} strokeWidth={2} />
                </div>
                <div style={{
                  fontFamily: "'Outfit', sans-serif", fontWeight: 900,
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  color: '#fff',
                  lineHeight: 1, marginBottom: 6,
                }}>
                  {s.val}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <PlatformFeatures />

        {/* ── PARA QUIÉN ── */}
        <section id="audiences" className="py-20 px-6" style={{ background: 'rgba(255,255,255,0.018)' }}>
          <div className="max-w-6xl mx-auto">
            <Section>
              <motion.div variants={rise} className="grid md:grid-cols-[1.3fr_1fr] gap-x-10 gap-y-3 items-end mb-10">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="h-px w-8" style={{ background: '#FF6B35' }} />
                    <p className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: '#FF6B35', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em' }}>
                      Para quién es
                    </p>
                  </div>
                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif", fontWeight: 900,
                    fontSize: 'clamp(1.5rem, 2.6vw, 2.05rem)', letterSpacing: '-0.03em', lineHeight: 1.2,
                  }}>
                    Si tu hijo o hija tiene discapacidad visual, esto es para tu familia.
                  </h2>
                </div>

                <div className="flex flex-col gap-4">
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.65 }}>
                    Pídele a su colegio que adopte HapticLearn. El panel es para los educadores — la app es para tu hijo o hija.
                  </p>
                  <div className="flex items-center gap-4">
                    {[
                      { Icon: Heart, label: 'Familias', color: '#FF6B35' },
                      { Icon: School, label: 'Colegios', color: '#C7861F' },
                    ].map(({ Icon, label, color }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                          <Icon size={11} style={{ color }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Padres y madres */}
                <motion.div variants={rise}
                  className="p-7 rounded-2xl relative overflow-hidden"
                  style={{
                    background: 'rgba(255,107,53,0.05)',
                    border: '1px solid rgba(255,107,53,0.15)',
                  }}
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: '#FF6B35' }}>
                      <Heart size={20} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.2rem', marginBottom: 3 }}>
                        Para padres y madres
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                        Lo que vivirá tu hijo o hija en la app
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { Icon: Vibrate, title: 'Vibración guiada', desc: 'La pantalla vibra en el camino correcto de cada letra' },
                      { Icon: Volume2, title: 'Voz en cada trazo', desc: 'Anuncia cada letra mientras la traza' },
                      { Icon: Type, title: 'Letras, números y braille', desc: 'Cada uno con trazo y vibración única' },
                      { Icon: Smartphone, title: 'Sin hardware especial', desc: 'Funciona en cualquier celular Android' },
                    ].map(({ Icon, title, desc }, i) => (
                      <div key={i} className="p-3.5 rounded-xl flex flex-col gap-2"
                        style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(255,107,53,0.16)' }}>
                          <Icon size={13} style={{ color: '#FF6B35' }} strokeWidth={1.8} />
                        </div>
                        <div>
                          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.78rem', color: '#fff', marginBottom: 2 }}>{title}</p>
                          <p style={{ fontSize: '0.72rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Colegios */}
                <motion.div variants={rise}
                  className="p-7 rounded-2xl relative overflow-hidden"
                  style={{
                    background: 'rgba(255,209,102,0.045)',
                    border: '1px solid rgba(255,209,102,0.16)',
                  }}
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: '#C7861F' }}>
                      <School size={20} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.2rem', marginBottom: 3 }}>
                        Para colegios
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                        Gestión educativa inclusiva desde el primer día
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { Icon: Users, title: 'Gestión de salones', desc: 'El educador principal asigna educadores' },
                      { Icon: GraduationCap, title: 'Cursos personalizados', desc: 'Cada educador crea el suyo para su aula' },
                      { Icon: QrCode, title: 'Inscripción por QR', desc: 'Alumnos inscritos en segundos' },
                      { Icon: BarChart3, title: 'Estadísticas completas', desc: 'Por salón, curso y alumno' },
                    ].map(({ Icon, title, desc }, i) => (
                      <div key={i} className="p-3.5 rounded-xl flex flex-col gap-2"
                        style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(255,209,102,0.16)' }}>
                          <Icon size={13} style={{ color: '#FFD166' }} strokeWidth={1.8} />
                        </div>
                        <div>
                          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.78rem', color: '#fff', marginBottom: 2 }}>{title}</p>
                          <p style={{ fontSize: '0.72rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* CTA compartido — aplica tanto a familias como a colegios */}
              <motion.div variants={rise}
                className="mt-5 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                  ¿Tu colegio aún no usa HapticLearn? Comparte el enlace, sea con la dirección o con otras familias.
                </p>
                <HoverButton
                  variant="secondary"
                  onClick={() => {
                    const url = window.location.href;
                    if (navigator.clipboard) navigator.clipboard.writeText(url);
                    alert('¡Enlace copiado! Compártelo con tu colegio o con otras familias.');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs shrink-0"
                  style={{ color: '#FFA438' } as React.CSSProperties}
                >
                  <ArrowRight size={13} />
                  Copiar enlace para compartir
                </HoverButton>
              </motion.div>
            </Section>
          </div>
        </section>

        {/* ── CÓMO FUNCIONA ── */}
        <section id="how" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <Section>
              <motion.div variants={rise} className="text-center mb-16">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: '#FF6B35', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em' }}>
                  Flujo educativo
                </p>
                <h2 style={{
                  fontFamily: "'Outfit', sans-serif", fontWeight: 900,
                  fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', letterSpacing: '-0.03em',
                }}>
                  Tres pasos. Aula inclusiva.
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-0 relative">
                {/* Connecting line */}
                <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-px"
                  style={{ background: 'rgba(255,107,53,0.2)' }} />

                {[
                  {
                    n: '01', color: '#FF6B35',
                    title: 'El colegio se organiza',
                    desc: 'Un educador principal crea el salón y asigna educadores. Todo queda configurado en minutos desde el panel web.',
                  },
                  {
                    n: '02', color: '#E8A33D',
                    title: 'El educador enseña',
                    desc: 'Inscribe estudiantes con su código QR, crea cursos con trazos de letras, números y braille, y los publica para el aula.',
                  },
                  {
                    n: '03', color: '#34D399',
                    title: 'El niño aprende',
                    desc: 'Traza letras con el dedo, siente la vibración en cada punto del trazo y escucha la voz que confirma. Sin ver la pantalla.',
                  },
                ].map((s, i) => (
                  <motion.div key={i} variants={rise}
                    className="relative p-7 md:p-8"
                    style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                      style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}
                    >
                      <span style={{
                        fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '1.1rem',
                        color: s.color,
                      }}>{s.n}</span>
                    </div>
                    <h3 style={{
                      fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                      fontSize: '1rem', marginBottom: 10, color: '#fff',
                    }}>{s.title}</h3>
                    <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.48)' }}>{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative py-24 overflow-hidden"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="relative z-10 max-w-6xl mx-auto px-6">
            <div className="flex flex-col items-end">

              {/* Wave separator — orange */}
              <WavePath className="mb-12" style={{ color: '#FF6B35' }} />

              {/* Content row */}
              <Section className="w-full">
                <div className="flex w-full items-start justify-end">
                  {/* Left: small label */}
                  <motion.p variants={rise}
                    className="mt-3 shrink-0 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: '#FF6B35', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em' }}
                  >
                    Únete ahora
                  </motion.p>

                  {/* Right: heading */}
                  <motion.h2 variants={rise}
                    className="ml-10 w-3/4"
                    style={{
                      fontFamily: "'Outfit', sans-serif", fontWeight: 900,
                      fontSize: 'clamp(2rem, 4vw, 3.4rem)', letterSpacing: '-0.035em',
                      lineHeight: 1.08, color: '#fff',
                    }}
                  >
                    ¿Eres educador o director de colegio?
                  </motion.h2>
                </div>

                {/* Description + buttons — aligned under the heading */}
                <div className="flex w-full justify-end mt-8">
                  <div className="w-3/4 ml-10">
                    <motion.p variants={rise}
                      className="mb-8"
                      style={{ fontSize: '1rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.48)' }}
                    >
                      Ingresa al panel, registra tu institución y empieza a enseñar a tus alumnos con
                      vibración háptica y TalkBack — hoy mismo.
                    </motion.p>

                    <motion.div variants={rise} className="flex flex-wrap gap-3">
                      <HoverButton
                        variant="primary"
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2.5 px-8 py-3.5"
                      >
                        Ingresar al panel
                        <ArrowRight size={16} />
                      </HoverButton>
                      <HoverButton
                        variant="secondary"
                        onClick={() => {
                          const url = window.location.href;
                          if (navigator.clipboard) navigator.clipboard.writeText(url);
                          alert('¡Enlace copiado! Compártelo con el director de tu colegio.');
                        }}
                        className="flex items-center gap-2 px-6 py-3.5 text-sm"
                      >
                        Soy padre o madre — compartir con el colegio
                      </HoverButton>
                    </motion.div>
                  </div>
                </div>
              </Section>

            </div>
          </div>
        </section>

        {/* ── TOGGLE PROTOTIPO ── */}
        <div className="fixed bottom-6 right-6 z-[100]">
          <HoverButton
            variant="secondary"
            onClick={() => navigate('/v2')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs"
          >
            Ver Prototipo 2 →
          </HoverButton>
        </div>

        {/* ── FOOTER ── */}
        <footer className="py-10 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#0D0620' }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: '#FF6B35' }}>
                <Hand size={13} color="white" />
              </div>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '0.9rem' }}>HapticLearn</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.22)', textAlign: 'center' }}>
              App Educativa Accesible · Universidad Peruana de Ciencias Aplicadas (UPC) · 2026
            </p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.15)' }}>
              React Native · NestJS · Supabase
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
