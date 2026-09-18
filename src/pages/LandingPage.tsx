import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
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

/* ─── tokens compartidos: un solo acento, una sola superficie ─── */
const ACCENT = '#FF6B35';
const SURFACE = { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' };

/* ─── animation variants ─── */
const stagger = {
  visible: { transition: { staggerChildren: 0.09 } },
  hidden: {},
};
const rise = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT, fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em' }}>
      {children}
    </p>
  );
}

/* ─── Phone Mockup ─── */

// Puntos del point_map para la letra "A" — coordenadas normalizadas 0-1
// representan el trazo real de escritura: diagonal izq → ápice → diagonal der → barra
const TRACE_A: Array<{ x: number; y: number }> = [
  { x: 0.28, y: 0.88 }, { x: 0.32, y: 0.74 }, { x: 0.36, y: 0.60 },
  { x: 0.40, y: 0.46 }, { x: 0.44, y: 0.32 }, { x: 0.50, y: 0.14 },
  { x: 0.56, y: 0.32 }, { x: 0.60, y: 0.46 }, { x: 0.64, y: 0.60 },
  { x: 0.68, y: 0.74 }, { x: 0.72, y: 0.88 },
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

  const finger = lit < TRACE_A.length ? TRACE_A[lit] : TRACE_A[TRACE_A.length - 1];

  return (
    <div className="relative" style={{ width, height }}>
      {TRACE_A.map((p, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            width: 7, height: 7,
            left: p.x * width - 3.5,
            top: p.y * height - 3.5,
            background: i <= lit ? ACCENT : 'rgba(255,255,255,0.12)',
            transition: 'background 0.15s',
          }}
        />
      ))}
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
      <div className="relative w-full h-full rounded-[44px] overflow-hidden"
        style={{
          background: '#0C0520',
          border: '1.5px solid rgba(255,255,255,0.12)',
          boxShadow: '0 20px 60px -20px rgba(0,0,0,0.6)',
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-7 rounded-b-2xl z-10"
          style={{ background: '#0A0518' }} />

        <div className="absolute inset-0 p-4 pt-10 flex flex-col">
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
                <Hand size={12} color="white" />
              </div>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.9)' }}>
                HapticLearn
              </span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                  style={{ background: i === activeStep ? ACCENT : 'rgba(255,255,255,0.18)' }} />
              ))}
            </div>
          </div>

          <div className="text-center mb-2">
            <span className="px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,107,53,0.15)', color: '#FFA438', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fontWeight: 600 }}>
              Lección · Letra A
            </span>
          </div>

          <AnimatePresence mode="wait">
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
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '7rem', color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none' }}>A</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    vibración háptica activa
                  </span>
                </div>
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div key="voice"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col items-center justify-center gap-4"
              >
                <div className="w-28 h-28 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,107,53,0.2)' }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '4.5rem', color: ACCENT, lineHeight: 1 }}>A</span>
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
                <div className="flex items-center gap-1">
                  {[3, 5, 8, 10, 7, 4, 9, 6, 3].map((h, i) => (
                    <motion.div key={i}
                      animate={{ scaleY: [1, 1.6, 0.6, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.09 }}
                      style={{ width: 3, height: h * 2, borderRadius: 2, background: ACCENT, transformOrigin: 'center' }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

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
                  style={{ background: '#34D399' }}
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
                    <span style={{ fontSize: 9, color: ACCENT, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>7/27</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <motion.div initial={{ width: '22%' }} animate={{ width: '26%' }}
                      transition={{ duration: 0.9, delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ background: ACCENT }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-around py-3 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[Hand, BarChart3, School].map((Icon, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Icon size={14} color={i === 0 ? ACCENT : 'rgba(255,255,255,0.25)'} />
                <div className="w-1 h-1 rounded-full" style={{ background: i === 0 ? ACCENT : 'transparent' }} />
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
        .float { animation: float 6s ease-in-out infinite; }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: `radial-gradient(60rem 44rem at 50% -8%, rgba(255,107,53,0.09), transparent 62%), #140A26`,
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
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
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

          <HoverButton variant="primary" onClick={() => navigate('/login')} className="flex items-center gap-2 px-4 py-2 text-sm">
            Ingresar
            <ArrowRight size={14} />
          </HoverButton>
        </motion.header>

        {/* ── HERO — columna única, centrada y simétrica ── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-16">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 w-full max-w-2xl mx-auto text-center">
            <motion.h1 variants={rise}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(2.6rem, 6vw, 4rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.035em',
                marginBottom: '1.25rem',
              }}
            >
              Para niños que <span style={{ color: ACCENT }}>aprenden</span> diferente.
            </motion.h1>

            <motion.p variants={rise}
              className="mx-auto mb-9 max-w-lg"
              style={{ fontSize: '1rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}
            >
              HapticLearn enseña a niños con discapacidad visual a{' '}
              <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>trazar letras y números con el dedo</strong>,
              guiados por vibración y voz en cada trazo. Diseñado para colegios inclusivos del Perú.
            </motion.p>

            <motion.div variants={rise} className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <HoverButton variant="primary" onClick={() => navigate('/login')} className="flex items-center gap-2.5 px-6 py-3.5 text-sm">
                Ingresar al panel
                <ArrowRight size={16} />
              </HoverButton>
              <HoverButton variant="secondary" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-6 py-3.5 text-sm">
                <Play size={14} />
                Ver cómo funciona
              </HoverButton>
            </motion.div>

            <motion.div variants={rise} className="flex items-center justify-center gap-4">
              <div className="flex -space-x-2">
                {['#FF6B35', '#FF8F5E', '#FFA438', '#FFD166'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                    style={{ background: c, borderColor: '#140A26', fontSize: 10, fontWeight: 700, color: i === 3 ? '#3A2400' : '#fff' }}>
                    {['A', 'EP', 'E', 'E'][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                  Admin · Ed. Principal · Educador · Estudiante
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                  4 roles, un solo ecosistema
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Phone mockup — visual único, sin anillos que compitan con el copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="relative flex justify-center items-center mt-14 float"
          >
            <div
              className="absolute rounded-full pointer-events-none"
              style={{ width: 340, height: 340, background: ACCENT, opacity: 0.08, filter: 'blur(60px)' }}
            />
            <PhoneMockup />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="mt-14 flex flex-col items-center gap-2"
          >
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
              <ChevronDown size={18} style={{ color: 'rgba(255,255,255,0.2)' }} />
            </motion.div>
          </motion.div>
        </section>

        {/* ── STATS BAR ── */}
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { val: '40+', label: 'Actividades educativas', sub: 'letras, números y braille', Icon: Type },
              { val: '12', label: 'Patrones hápticos', sub: 'únicos por contenido', Icon: Vibrate },
              { val: '4', label: 'Roles de usuario', sub: 'admin · educador · alumno', Icon: Users },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center py-8 px-4 rounded-2xl"
                style={SURFACE}
              >
                <div className="mx-auto mb-3 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,107,53,0.14)', border: '1px solid rgba(255,107,53,0.25)' }}>
                  <s.Icon size={17} style={{ color: ACCENT }} strokeWidth={2} />
                </div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', lineHeight: 1, marginBottom: 6 }}>
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
        <section id="audiences" className="py-24 px-6" style={{ background: 'rgba(255,255,255,0.015)' }}>
          <div className="max-w-6xl mx-auto">
            <Section>
              <motion.div variants={rise} className="flex flex-col items-center gap-3 text-center max-w-xl mx-auto mb-16">
                <Eyebrow>Para quién es</Eyebrow>
                <h2 style={{
                  fontFamily: "'Outfit', sans-serif", fontWeight: 900,
                  fontSize: 'clamp(1.7rem, 3vw, 2.4rem)', letterSpacing: '-0.03em', lineHeight: 1.2,
                }}>
                  Si tu hijo o hija tiene discapacidad visual, esto es para tu familia.
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.7 }}>
                  Pídele a su colegio que adopte HapticLearn. El panel es para los educadores — la app es para tu hijo o hija.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Padres y madres */}
                <motion.div variants={rise} className="p-7 rounded-2xl" style={SURFACE}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT }}>
                      <Heart size={20} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.15rem', marginBottom: 3 }}>
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
                      <div key={i} className="p-3.5 rounded-xl flex flex-col gap-2" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,107,53,0.16)' }}>
                          <Icon size={13} style={{ color: ACCENT }} strokeWidth={1.8} />
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
                <motion.div variants={rise} className="p-7 rounded-2xl" style={SURFACE}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT }}>
                      <School size={20} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.15rem', marginBottom: 3 }}>
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
                      <div key={i} className="p-3.5 rounded-xl flex flex-col gap-2" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,107,53,0.16)' }}>
                          <Icon size={13} style={{ color: ACCENT }} strokeWidth={1.8} />
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

              <motion.div variants={rise}
                className="mt-6 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                style={SURFACE}
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
                <Eyebrow>Flujo educativo</Eyebrow>
                <h2 className="mt-3" style={{
                  fontFamily: "'Outfit', sans-serif", fontWeight: 900,
                  fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', letterSpacing: '-0.03em',
                }}>
                  Tres pasos. Aula inclusiva.
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6 relative">
                {[
                  {
                    n: '01',
                    title: 'El colegio se organiza',
                    desc: 'Un educador principal crea el salón y asigna educadores. Todo queda configurado en minutos desde el panel web.',
                  },
                  {
                    n: '02',
                    title: 'El educador enseña',
                    desc: 'Inscribe estudiantes con su código QR, crea cursos con trazos de letras, números y braille, y los publica para el aula.',
                  },
                  {
                    n: '03',
                    title: 'El niño aprende',
                    desc: 'Traza letras con el dedo, siente la vibración en cada punto del trazo y escucha la voz que confirma. Sin ver la pantalla.',
                  },
                ].map((s, i) => (
                  <motion.div key={i} variants={rise} className="rounded-2xl p-7" style={SURFACE}>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: 'rgba(255,107,53,0.14)', border: '1px solid rgba(255,107,53,0.25)' }}
                    >
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '1rem', color: ACCENT }}>{s.n}</span>
                    </div>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: 10, color: '#fff' }}>{s.title}</h3>
                    <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.48)' }}>{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ── CTA — centrado y simétrico ── */}
        <section className="py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-2xl mx-auto px-6 text-center">
            <Section>
              <motion.div variants={rise}>
                <Eyebrow>Únete ahora</Eyebrow>
              </motion.div>
              <motion.h2 variants={rise}
                className="mt-3 mb-6"
                style={{
                  fontFamily: "'Outfit', sans-serif", fontWeight: 900,
                  fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', letterSpacing: '-0.035em',
                  lineHeight: 1.15, color: '#fff',
                }}
              >
                ¿Eres educador o director de colegio?
              </motion.h2>

              <motion.p variants={rise}
                className="mb-9"
                style={{ fontSize: '1rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.48)' }}
              >
                Ingresa al panel, registra tu institución y empieza a enseñar a tus alumnos con
                vibración háptica y TalkBack — hoy mismo.
              </motion.p>

              <motion.div variants={rise} className="flex flex-wrap items-center justify-center gap-3">
                <HoverButton variant="primary" onClick={() => navigate('/login')} className="flex items-center gap-2.5 px-8 py-3.5">
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
            </Section>
          </div>
        </section>

        {/* ── TOGGLE PROTOTIPO ── */}
        <div className="fixed bottom-6 right-6 z-[100]">
          <HoverButton variant="secondary" onClick={() => navigate('/v2')} className="flex items-center gap-2 px-4 py-2.5 text-xs">
            Ver Prototipo 2 →
          </HoverButton>
        </div>

        {/* ── FOOTER ── */}
        <footer className="py-10 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#0D0620' }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
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
