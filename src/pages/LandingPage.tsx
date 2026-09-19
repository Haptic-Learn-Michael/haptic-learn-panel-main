import { useEffect, useRef, useState, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Check,
  GraduationCap,
  Heart,
  Link2,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Type,
  Users,
  Vibrate,
  Volume2,
} from 'lucide-react';

/* Landing autocontenida: todos los estilos viven bajo `.lp` para no afectar
   al panel (dashboard, login, etc.), que conserva su propio tema. */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@500;600;700;800;900&display=swap');

.lp {
  --ink: #3B2A5C;
  --ink-soft: #6B5A8E;
  --cream: #FFF7E8;
  --orange: #FF6B35;
  --orange-deep: #D9491A;
  --yellow: #FFC93C;
  --yellow-deep: #E0A400;
  --sky: #4CC9F0;
  --sky-deep: #1FA3CE;
  --mint: #2FD6A0;
  --mint-deep: #14A97B;
  --pink: #FF6FA8;
  --pink-deep: #D94A85;
  --purple: #7C4DFF;
  --purple-deep: #5B32D6;
  --line: #EDE3FF;
  min-height: 100vh;
  color: var(--ink);
  background-color: var(--cream);
  background-image: radial-gradient(rgba(124,77,255,0.10) 2px, transparent 2.5px);
  background-size: 30px 30px;
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
.lp *, .lp *::before, .lp *::after { box-sizing: border-box; }
.lp h1, .lp h2, .lp h3, .lp .lp-display { font-family: 'Fredoka', 'Nunito', sans-serif; font-weight: 700; margin: 0; }
.lp p { margin: 0; }
.lp a { color: inherit; text-decoration: none; }

/* ── botones tipo juguete ── */
.lp-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .55rem;
  font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 1.05rem;
  padding: .9rem 1.6rem; border-radius: 999px; border: 0; cursor: pointer;
  transition: transform .15s, box-shadow .15s;
}
.lp-btn:focus-visible { outline: 4px solid var(--purple); outline-offset: 3px; }
.lp-btn--orange { background: var(--orange); color: #fff; box-shadow: 0 6px 0 var(--orange-deep); }
.lp-btn--orange:hover { transform: translateY(-2px); box-shadow: 0 8px 0 var(--orange-deep); }
.lp-btn--orange:active { transform: translateY(5px); box-shadow: 0 1px 0 var(--orange-deep); }
.lp-btn--white { background: #fff; color: var(--ink); box-shadow: 0 6px 0 var(--line); border: 2px solid var(--line); }
.lp-btn--white:hover { transform: translateY(-2px); box-shadow: 0 8px 0 var(--line); }
.lp-btn--white:active { transform: translateY(5px); box-shadow: 0 1px 0 var(--line); }
.lp-btn--sm { font-size: .95rem; padding: .6rem 1.2rem; }

/* ── secciones ── */
.lp-wrap { max-width: 1120px; margin: 0 auto; padding: 0 1.5rem; }
.lp-sec { padding: 5.5rem 0; position: relative; scroll-margin-top: 4.5rem; }
@keyframes lp-arrive {
  0%   { transform: translateY(46px) scale(.94); opacity: .35; }
  55%  { transform: translateY(-14px) scale(1.015); opacity: 1; }
  78%  { transform: translateY(5px) scale(.998); }
  100% { transform: none; }
}
.lp-arrive { animation: lp-arrive .85s cubic-bezier(.3,.9,.4,1) both; }
@keyframes lp-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(255,107,53,.55); } 100% { box-shadow: 0 0 0 26px rgba(255,107,53,0); } }
.lp-arrive .lp-pill { animation: lp-pulse-ring .9s ease-out .35s both; }
.lp-pill {
  display: inline-flex; align-items: center; gap: .4rem;
  font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: .9rem;
  padding: .4rem 1rem; border-radius: 999px; border: 2px solid; background: #fff;
}
.lp-h2 { font-size: clamp(2rem, 4.6vw, 3.1rem); line-height: 1.1; color: var(--ink); }
.lp-lead { font-size: 1.15rem; line-height: 1.65; color: var(--ink-soft); font-weight: 600; }
.lp-hl { position: relative; white-space: nowrap; z-index: 0; }
.lp-hl::after {
  content: ''; position: absolute; left: -.1em; right: -.1em; bottom: .04em; height: .42em;
  background: var(--yellow); border-radius: 999px; z-index: -1; transform: rotate(-1.2deg);
}

/* ── nav ── */
.lp-nav {
  position: fixed; top: .9rem; left: 0; right: 0; z-index: 50; margin: 0 auto;
  width: calc(100% - 2rem); max-width: 1120px;
  display: flex; align-items: center; justify-content: space-between;
  padding: .55rem .7rem .55rem 1.1rem; border-radius: 999px;
  background: rgba(255,255,255,.92); backdrop-filter: blur(14px);
  border: 2px solid var(--line); box-shadow: 0 5px 0 var(--line);
}
.lp-logo { display: flex; align-items: center; gap: .6rem; font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 1.3rem; }
.lp-logo-mark {
  width: 2.2rem; height: 2.2rem; border-radius: 50%; background: var(--orange);
  display: grid; place-items: center; color: #fff; font-size: 1.15rem; box-shadow: 0 3px 0 var(--orange-deep);
}
.lp-nav-links { display: none; gap: 1.6rem; font-family: 'Fredoka', sans-serif; font-weight: 500; }
.lp-nav-links a { color: var(--ink-soft); transition: color .15s, transform .15s; position: relative; padding: .2rem .1rem; }
.lp-nav-links a::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.2rem; height: 4px; border-radius: 999px; background: var(--orange); transform: scaleX(0); transform-origin: left; transition: transform .25s cubic-bezier(.3,1.4,.5,1); }
.lp-nav-links a:hover, .lp-nav-links a.active { color: var(--orange); transform: translateY(-2px); }
.lp-nav-links a:hover::after, .lp-nav-links a.active::after { transform: scaleX(1); }
@media (min-width: 820px) { .lp-nav-links { display: flex; } }

/* ── hero ── */
.lp-hero { padding: 8.5rem 0 4rem; position: relative; }
.lp-hero-grid { display: grid; gap: 3rem; align-items: center; }
@media (min-width: 900px) { .lp-hero-grid { grid-template-columns: 1.1fr .9fr; } }
.lp-hero h1 { font-size: clamp(2.6rem, 6.4vw, 4.6rem); line-height: 1.04; margin: 1.1rem 0 1.2rem; }
.lp-cta-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 2rem; }
.lp-trust { display: flex; flex-wrap: wrap; gap: .6rem 1.4rem; margin-top: 1.8rem; font-weight: 700; font-size: .95rem; color: var(--ink-soft); }
.lp-trust span { display: inline-flex; align-items: center; gap: .4rem; }
.lp-trust svg { color: var(--mint-deep); }

/* stickers flotantes */
.lp-float { position: absolute; display: grid; place-items: center; font-family: 'Fredoka', sans-serif; font-weight: 700; color: #fff; border-radius: 1.2rem; box-shadow: 0 6px 0 rgba(0,0,0,.14); animation: lp-bob 4.5s ease-in-out infinite; user-select: none; }
@keyframes lp-bob { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-14px) rotate(calc(var(--r,0deg) + 5deg)); } }
@keyframes lp-wiggle { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes lp-buzz { 0%,100% { transform: translate(0,0); } 25% { transform: translate(-2px,1px); } 50% { transform: translate(2px,-1px); } 75% { transform: translate(-1px,-1px); } }
@keyframes lp-ripple { from { transform: scale(.7); opacity: .65; } to { transform: scale(2.1); opacity: 0; } }
@keyframes lp-draw { from { stroke-dashoffset: 400; } 60%,100% { stroke-dashoffset: 0; } }
@keyframes lp-pop { 0% { transform: scale(.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

/* hero visual */
.lp-stage { position: relative; min-height: 460px; display: grid; place-items: center; }
.lp-blob { position: absolute; inset: 6% 4%; background: var(--yellow); border-radius: 58% 42% 55% 45% / 50% 55% 45% 50%; box-shadow: 0 10px 0 var(--yellow-deep); }
.lp-phone {
  position: relative; width: 250px; padding: 12px; border-radius: 2.6rem; background: var(--ink);
  box-shadow: 0 10px 0 #24173F; transform: rotate(-3deg); animation: lp-wiggle 6s ease-in-out infinite;
}
.lp-screen { background: #fff; border-radius: 2rem; padding: 1.1rem 1rem 1.3rem; text-align: center; overflow: hidden; }
.lp-screen small { display: block; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: .78rem; color: var(--purple); letter-spacing: .04em; }
.lp-canvas { position: relative; margin: .8rem auto 0; width: 190px; height: 190px; border-radius: 1.6rem; background: #F3ECFF; display: grid; place-items: center; }
.lp-canvas svg { width: 150px; height: 150px; overflow: visible; }
.lp-trace { stroke-dasharray: 400; animation: lp-draw 4s ease-in-out infinite; }
.lp-ripple { position: absolute; width: 46px; height: 46px; border-radius: 50%; border: 3px solid var(--orange); animation: lp-ripple 2s ease-out infinite; }
.lp-badge { display: inline-flex; align-items: center; gap: .4rem; margin-top: .9rem; padding: .4rem .8rem; border-radius: 999px; background: #E6FBF3; color: var(--mint-deep); font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: .82rem; }
.lp-stars { margin-top: .7rem; display: flex; justify-content: center; gap: .3rem; color: var(--yellow); }

/* mascota */
.lp-mascot { position: absolute; left: -4%; bottom: 2%; width: 130px; animation: lp-bob 3.6s ease-in-out infinite; --r: -4deg; }
.lp-bubble { position: absolute; right: -2%; top: 2%; background: #fff; border: 2px solid var(--line); box-shadow: 0 5px 0 var(--line); padding: .55rem .9rem; border-radius: 1.2rem 1.2rem 1.2rem .3rem; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: .95rem; animation: lp-bob 5s ease-in-out infinite; --r: 3deg; }

/* ── cinta de letras ── */
.lp-strip { background: var(--purple); color: #fff; padding: 1rem 0; overflow: hidden; transform: rotate(-1.2deg); margin: 1rem -2rem; box-shadow: 0 6px 0 var(--purple-deep); }
.lp-strip-track { display: flex; gap: 2.4rem; width: max-content; animation: lp-marquee 28s linear infinite; font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 1.7rem; white-space: nowrap; }
@keyframes lp-marquee { to { transform: translateX(-50%); } }

/* ── tarjetas ── */
.lp-grid { display: grid; gap: 1.4rem; margin-top: 3rem; }
@media (min-width: 640px) { .lp-grid--2 { grid-template-columns: repeat(2, 1fr); } .lp-grid--4 { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 980px) { .lp-grid--4 { grid-template-columns: repeat(4, 1fr); } .lp-grid--3 { grid-template-columns: repeat(3, 1fr); } }
.lp-card {
  background: #fff; border: 2px solid var(--line); border-radius: 2rem; padding: 1.7rem;
  box-shadow: 0 7px 0 var(--line); transition: transform .2s, box-shadow .2s;
}
.lp-card:hover { transform: translateY(-6px) rotate(-.6deg); box-shadow: 0 13px 0 var(--line); }
.lp-icon { width: 3.6rem; height: 3.6rem; border-radius: 1.2rem; display: grid; place-items: center; color: #fff; margin-bottom: 1.1rem; }
.lp-card h3 { font-size: 1.3rem; margin-bottom: .4rem; }
.lp-card p { color: var(--ink-soft); line-height: 1.55; font-size: 1rem; }

/* Padres: banda de color */
.lp-parents { background: var(--sky); border-radius: 3rem; padding: 3.5rem 1.6rem; box-shadow: 0 10px 0 var(--sky-deep); position: relative; overflow: hidden; }
@media (min-width: 720px) { .lp-parents { padding: 4rem 3.5rem; } }
.lp-parents .lp-card { border-color: transparent; box-shadow: 0 7px 0 rgba(0,0,0,.12); }
.lp-parents .lp-card:hover { box-shadow: 0 13px 0 rgba(0,0,0,.12); }

/* pasos */
.lp-steps { display: grid; gap: 2.2rem; margin-top: 3.4rem; }
@media (min-width: 900px) { .lp-steps { grid-template-columns: repeat(3, 1fr); } }
.lp-step { text-align: center; position: relative; }
.lp-step-num { width: 5rem; height: 5rem; border-radius: 50%; margin: 0 auto 1.2rem; display: grid; place-items: center; font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 2.2rem; color: #fff; box-shadow: 0 6px 0 rgba(0,0,0,.16); }
.lp-step h3 { font-size: 1.4rem; margin-bottom: .5rem; }
.lp-step p { color: var(--ink-soft); line-height: 1.6; max-width: 20rem; margin: 0 auto; }
@media (min-width: 900px) { .lp-step:not(:last-child)::after { content: ''; position: absolute; top: 2.4rem; left: calc(50% + 3.4rem); width: calc(100% - 6.8rem); border-top: 4px dotted #C9B5FF; } }

/* braille */
.lp-braille { display: inline-grid; grid-template-columns: repeat(2, 1fr); gap: .35rem; padding: .7rem; background: #fff; border-radius: 1rem; box-shadow: 0 4px 0 var(--line); }
.lp-braille i { width: .8rem; height: .8rem; border-radius: 50%; background: #E6DDF7; display: block; }
.lp-braille i.on { background: var(--purple); }

/* CTA final */
.lp-cta { background: var(--orange); color: #fff; border-radius: 3rem; padding: 3.8rem 1.6rem; text-align: center; position: relative; overflow: hidden; box-shadow: 0 10px 0 var(--orange-deep); }
.lp-cta h2 { color: #fff; font-size: clamp(2rem, 4.6vw, 3.2rem); line-height: 1.1; }
.lp-cta p { color: rgba(255,255,255,.95); font-size: 1.15rem; line-height: 1.6; max-width: 34rem; margin: 1rem auto 2rem; }

.lp-foot { padding: 2.6rem 0 3rem; text-align: center; color: var(--ink-soft); font-size: .92rem; }

/* reveal */
.lp-reveal { opacity: 0; transform: translateY(24px) scale(.98); transition: opacity .6s cubic-bezier(.2,.9,.3,1.2), transform .6s cubic-bezier(.2,.9,.3,1.2); }
.lp-reveal.in { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  .lp *, .lp *::before, .lp *::after { animation: none !important; transition: none !important; }
  .lp-reveal { opacity: 1; transform: none; }
}
`;

/* ─── utilidades ─── */

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`lp-reveal ${seen ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* Mascota "Hapti": una gotita sonriente con manitas */
function Hapti({ size = 130 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Hapti, la mascota de HapticLearn">
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="rgba(59,42,92,.15)" />
      <path d="M60 12c20 0 40 18 40 46 0 26-16 44-40 44S20 84 20 58C20 30 40 12 60 12z" fill="#FF6FA8" />
      <path d="M60 12c20 0 40 18 40 46 0 26-16 44-40 44S20 84 20 58C20 30 40 12 60 12z" fill="none" stroke="#D94A85" strokeWidth="4" />
      <ellipse cx="42" cy="34" rx="9" ry="5" fill="#fff" opacity=".45" transform="rotate(-30 42 34)" />
      <circle cx="46" cy="58" r="9" fill="#fff" />
      <circle cx="74" cy="58" r="9" fill="#fff" />
      <circle cx="48" cy="60" r="4.5" fill="#3B2A5C" />
      <circle cx="72" cy="60" r="4.5" fill="#3B2A5C" />
      <circle cx="50" cy="58" r="1.6" fill="#fff" />
      <circle cx="74" cy="58" r="1.6" fill="#fff" />
      <path d="M46 78c4 8 24 8 28 0" fill="none" stroke="#3B2A5C" strokeWidth="4" strokeLinecap="round" />
      <circle cx="36" cy="74" r="5" fill="#FFB3D1" />
      <circle cx="84" cy="74" r="5" fill="#FFB3D1" />
      <path d="M24 72c-8-2-12-10-8-16" fill="none" stroke="#D94A85" strokeWidth="6" strokeLinecap="round" />
      <path d="M96 72c8-2 12-10 8-16" fill="none" stroke="#D94A85" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function Braille({ dots }: { dots: number[] }) {
  return (
    <span className="lp-braille" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={dots.includes(i) ? 'on' : ''} />
      ))}
    </span>
  );
}

const STRIP = ['A', 'B', 'C', '1', '2', '3', 'M', 'O', '★', 'Ñ', '5', 'S', '7', 'L', '♥', 'E', '9', 'U'];

const LEARN = [
  { Icon: Vibrate, bg: '#FF6B35', title: 'Vibración que guía', desc: 'El celular vibra suavecito por el camino correcto de cada letra.' },
  { Icon: Volume2, bg: '#2FD6A0', title: 'Una voz amiga', desc: 'Una voz celebra y dice cada letra mientras la dibuja.' },
  { Icon: Type, bg: '#7C4DFF', title: 'Letras, números y braille', desc: 'Todo con trazos y vibraciones únicas para reconocerlos.' },
  { Icon: Smartphone, bg: '#FF6FA8', title: 'Sin aparatos especiales', desc: 'Funciona en cualquier celular Android que ya tengan en casa.' },
];

const PARENTS = [
  { Icon: Heart, bg: '#FF6FA8', title: 'Pensada con cariño', desc: 'Cada actividad es corta, tranquila y sin presión, para que aprender sea un juego.' },
  { Icon: ShieldCheck, bg: '#2FD6A0', title: 'Un espacio seguro', desc: 'Sin anuncios ni chats con extraños. Solo su colegio, su educador y sus actividades.' },
  { Icon: BarChart3, bg: '#FF6B35', title: 'Ves sus avances', desc: 'Su educador sigue su progreso para celebrar cada logro y apoyarle donde lo necesite.' },
  { Icon: Sparkles, bg: '#7C4DFF', title: 'Aprende a su ritmo', desc: 'Sin apuros ni comparaciones. Cada paso pequeño cuenta y se celebra.' },
];

const SCHOOL = [
  { Icon: Users, bg: '#4CC9F0', title: 'Salones ordenados', desc: 'La directora crea el salón y asigna educadoras en minutos.' },
  { Icon: GraduationCap, bg: '#FFC93C', title: 'Cursos a medida', desc: 'Cada educadora crea el suyo para su aula.' },
  { Icon: QrCode, bg: '#FF6FA8', title: 'Inscripción con QR', desc: 'Los alumnos se unen en segundos escaneando un código.' },
];

const STEPS = [
  { color: '#4CC9F0', title: 'El colegio se organiza', desc: 'Una directora crea el salón y asigna a las educadoras. Todo queda listo en minutos desde el panel web.' },
  { color: '#FF6B35', title: 'La educadora enseña', desc: 'Inscribe a los niños con su código QR, crea cursos con letras, números y braille, y los publica para el aula.' },
  { color: '#2FD6A0', title: 'Tu peque aprende', desc: 'Traza letras con el dedo, siente la vibración en cada punto y escucha una voz que lo celebra. ¡Sin necesidad de ver la pantalla!' },
];

/* ─── página ─── */

export function LandingPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState('');

  // Scroll suave hacia la sección + animación de "llegada" al aterrizar.
  const goTo = (id: string) => (e: ReactMouseEvent) => {
    e.preventDefault();
    const sec = document.getElementById(id);
    if (!sec) return;
    setActive(id);
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const wrap = sec.querySelector<HTMLElement>('.lp-wrap');
    if (!wrap) return;
    window.setTimeout(() => {
      wrap.classList.remove('lp-arrive');
      void wrap.offsetWidth; // reinicia la animación si se pulsa dos veces
      wrap.classList.add('lp-arrive');
      window.setTimeout(() => wrap.classList.remove('lp-arrive'), 1100);
    }, 450);
  };

  const copyLink = () => {
    try {
      void navigator.clipboard?.writeText(window.location.href);
    } catch {
      /* sin permiso de portapapeles: mostramos el aviso igual */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* NAV */}
      <header className="lp-nav">
        <a href="#top" className="lp-logo" aria-label="HapticLearn inicio">
          <span className="lp-logo-mark" aria-hidden="true">✋</span>
          HapticLearn
        </a>
        <nav className="lp-nav-links" aria-label="Secciones">
          {[['familias', 'Para familias'], ['aprende', 'Qué vivirá tu peque'], ['como', 'Cómo funciona']].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={goTo(id)} className={active === id ? 'active' : ''}>{label}</a>
          ))}
        </nav>
        <button className="lp-btn lp-btn--orange lp-btn--sm" onClick={() => navigate('/login')}>
          Ingresar <ArrowRight size={16} />
        </button>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="lp-hero">
          <div className="lp-wrap lp-hero-grid">
            <div>
              <span className="lp-pill" style={{ borderColor: '#FFD9C7', color: '#D9491A' }}>
                <Sparkles size={15} /> Aprender jugando con el tacto
              </span>
              <h1>
                Escribir se siente <span className="lp-hl">mágico</span>
              </h1>
              <p className="lp-lead" style={{ maxWidth: '34rem' }}>
                HapticLearn ayuda a niñas y niños con discapacidad visual a <strong style={{ color: 'var(--ink)' }}>trazar letras y números con el dedito</strong>,
                guiados por vibraciones y una voz amiga. Pensada para colegios inclusivos del Perú.
              </p>
              <div className="lp-cta-row">
                <button className="lp-btn lp-btn--orange" onClick={() => navigate('/login')}>
                  Ingresar al panel <ArrowRight size={18} />
                </button>
                <button
                  className="lp-btn lp-btn--white"
                  onClick={goTo('familias')}
                >
                  <Heart size={18} color="#FF6FA8" fill="#FF6FA8" /> Soy papá o mamá
                </button>
              </div>
              <div className="lp-trust">
                <span><Check size={18} strokeWidth={3} /> Sin anuncios</span>
                <span><Check size={18} strokeWidth={3} /> Compatible con TalkBack</span>
                <span><Check size={18} strokeWidth={3} /> 40+ actividades</span>
              </div>
            </div>

            {/* visual */}
            <div className="lp-stage" aria-hidden="true">
              <div className="lp-blob" />

              <div className="lp-float" style={{ top: '2%', left: '6%', width: 64, height: 64, background: '#4CC9F0', fontSize: '2rem', ['--r' as string]: '-10deg' }}>A</div>
              <div className="lp-float" style={{ top: '12%', right: '2%', width: 58, height: 58, background: '#2FD6A0', fontSize: '1.9rem', animationDelay: '.8s', ['--r' as string]: '9deg' }}>1</div>
              <div className="lp-float" style={{ bottom: '18%', right: '0%', width: 60, height: 60, background: '#7C4DFF', fontSize: '1.9rem', animationDelay: '1.4s', ['--r' as string]: '-6deg' }}>B</div>
              <div className="lp-float" style={{ top: '46%', left: '-2%', width: 52, height: 52, background: '#FF6B35', fontSize: '1.7rem', animationDelay: '.4s', ['--r' as string]: '7deg' }}>3</div>

              <div className="lp-phone">
                <div className="lp-screen">
                  <small>¡SIGUE EL TRAZO!</small>
                  <div className="lp-canvas">
                    <svg viewBox="0 0 100 100">
                      <path d="M18 88 L50 14 L82 88 M30 62 H70" fill="none" stroke="#D9C9FF" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 14" />
                      <path className="lp-trace" d="M18 88 L50 14 L82 88 M30 62 H70" fill="none" stroke="#FF6B35" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="lp-ripple" style={{ left: '30%', top: '18%' }} />
                    <span className="lp-ripple" style={{ left: '30%', top: '18%', animationDelay: '.7s' }} />
                  </div>
                  <div className="lp-badge"><Vibrate size={14} /> ¡Vibra bien! Sigue así</div>
                  <div className="lp-stars">
                    {[0, 1, 2].map((i) => <Sparkles key={i} size={20} fill="#FFC93C" />)}
                  </div>
                </div>
              </div>

              <div className="lp-bubble">¡Tú puedes! 💪</div>
              <div className="lp-mascot"><Hapti /></div>
            </div>
          </div>
        </section>

        {/* CINTA */}
        <div aria-hidden="true">
          <div className="lp-strip">
            <div className="lp-strip-track">
              {[...STRIP, ...STRIP].map((c, i) => <span key={i}>{c}</span>)}
            </div>
          </div>
        </div>

        {/* PARA FAMILIAS */}
        <section id="familias" className="lp-sec">
          <div className="lp-wrap">
            <Reveal>
              <div className="lp-parents">
                <div style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto' }}>
                  <span className="lp-pill" style={{ borderColor: '#fff', color: 'var(--ink)' }}>
                    <Heart size={15} color="#FF6FA8" fill="#FF6FA8" /> Para mamás y papás
                  </span>
                  <h2 className="lp-h2" style={{ color: '#fff', marginTop: '1rem' }}>
                    Un lugar donde tu hijo o hija se siente capaz
                  </h2>
                  <p className="lp-lead" style={{ color: '#fff', marginTop: '1rem' }}>
                    Sabemos lo importante que es. Por eso cada detalle de HapticLearn está hecho para que aprender sea seguro, divertido y lleno de logros.
                  </p>
                </div>
                <div className="lp-grid lp-grid--4">
                  {PARENTS.map(({ Icon, bg, title, desc }, i) => (
                    <Reveal key={title} delay={i * 80}>
                      <div className="lp-card" style={{ height: '100%' }}>
                        <div className="lp-icon" style={{ background: bg }}><Icon size={26} /></div>
                        <h3>{title}</h3>
                        <p>{desc}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
                <Reveal delay={200}>
                  <div style={{ textAlign: 'center', marginTop: '2.4rem' }}>
                    <p style={{ color: '#fff', fontWeight: 800, marginBottom: '1rem', fontSize: '1.05rem' }}>
                      El panel es para los educadores. La app es para tu peque. ¿Tu colegio aún no la usa?
                    </p>
                    <button className="lp-btn lp-btn--white" onClick={copyLink}>
                      {copied ? <Check size={18} color="#14A97B" strokeWidth={3} /> : <Link2 size={18} />}
                      {copied ? '¡Enlace copiado!' : 'Compartir con el colegio'}
                    </button>
                  </div>
                </Reveal>
              </div>
            </Reveal>
          </div>
        </section>

        {/* LO QUE VIVIRÁ */}
        <section id="aprende" className="lp-sec" style={{ paddingTop: '1rem' }}>
          <div className="lp-wrap">
            <Reveal>
              <div style={{ textAlign: 'center', maxWidth: '40rem', margin: '0 auto' }}>
                <span className="lp-pill" style={{ borderColor: '#E1D5FF', color: '#5B32D6' }}>
                  <Sparkles size={15} /> En la app
                </span>
                <h2 className="lp-h2" style={{ marginTop: '1rem' }}>
                  Lo que <span className="lp-hl">vivirá</span> tu peque
                </h2>
                <div style={{ marginTop: '1.4rem', display: 'flex', justifyContent: 'center', gap: '.7rem' }} aria-hidden="true">
                  <Braille dots={[0]} />
                  <Braille dots={[0, 1]} />
                  <Braille dots={[0, 3]} />
                </div>
              </div>
            </Reveal>
            <div className="lp-grid lp-grid--4">
              {LEARN.map(({ Icon, bg, title, desc }, i) => (
                <Reveal key={title} delay={i * 80}>
                  <div className="lp-card" style={{ height: '100%' }}>
                    <div className="lp-icon" style={{ background: bg }}><Icon size={26} /></div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section id="como" className="lp-sec" style={{ paddingTop: '1rem' }}>
          <div className="lp-wrap">
            <Reveal>
              <div style={{ textAlign: 'center' }}>
                <span className="lp-pill" style={{ borderColor: '#C9F3E4', color: '#14A97B' }}>
                  <Check size={15} strokeWidth={3} /> Muy fácil
                </span>
                <h2 className="lp-h2" style={{ marginTop: '1rem' }}>
                  Tres pasos y <span className="lp-hl">a jugar</span>
                </h2>
              </div>
            </Reveal>
            <div className="lp-steps">
              {STEPS.map(({ color, title, desc }, i) => (
                <Reveal key={title} delay={i * 120}>
                  <div className="lp-step">
                    <div className="lp-step-num" style={{ background: color }}>{i + 1}</div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="lp-grid lp-grid--3" style={{ marginTop: '3.8rem' }}>
              {SCHOOL.map(({ Icon, bg, title, desc }, i) => (
                <Reveal key={title} delay={i * 80}>
                  <div className="lp-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', height: '100%' }}>
                    <div className="lp-icon" style={{ background: bg, flexShrink: 0, marginBottom: 0 }}><Icon size={26} /></div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem' }}>{title}</h3>
                      <p style={{ fontSize: '.95rem' }}>{desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="lp-sec" style={{ paddingTop: '1rem' }}>
          <div className="lp-wrap">
            <Reveal>
              <div className="lp-cta">
                <div className="lp-float" aria-hidden="true" style={{ top: '10%', left: '5%', width: 54, height: 54, background: '#FFC93C', color: '#3B2A5C', fontSize: '1.7rem', ['--r' as string]: '-8deg' }}>A</div>
                <div className="lp-float" aria-hidden="true" style={{ bottom: '12%', right: '6%', width: 54, height: 54, background: '#4CC9F0', fontSize: '1.7rem', animationDelay: '1s', ['--r' as string]: '8deg' }}>2</div>
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '.6rem' }}><Hapti size={110} /></div>
                  <h2>¿Eres educador o director de colegio?</h2>
                  <p>Ingresa al panel, registra tu institución y empieza hoy a enseñar con vibración háptica y TalkBack.</p>
                  <button className="lp-btn lp-btn--white" onClick={() => navigate('/login')}>
                    Ingresar al panel <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap">
          <div className="lp-logo" style={{ justifyContent: 'center', marginBottom: '.6rem', color: 'var(--ink)' }}>
            <span className="lp-logo-mark" aria-hidden="true">✋</span> HapticLearn
          </div>
          <p>App Educativa Accesible · Universidad Peruana de Ciencias Aplicadas (UPC) · 2026</p>
          <p style={{ marginTop: '.3rem', fontSize: '.82rem', opacity: 0.8 }}>Hecha con ♥ para que todos los niños puedan aprender</p>
        </div>
      </footer>
    </div>
  );
}
