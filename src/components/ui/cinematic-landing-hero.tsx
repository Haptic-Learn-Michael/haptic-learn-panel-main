import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { Hand, Volume2, CheckCircle, BarChart3, School } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── Trace points for letter "A" (normalized 0-1) ─── */
const TRACE_A = [
  { x: 0.28, y: 0.88 }, { x: 0.32, y: 0.74 }, { x: 0.36, y: 0.60 },
  { x: 0.40, y: 0.46 }, { x: 0.44, y: 0.32 }, { x: 0.50, y: 0.14 },
  { x: 0.56, y: 0.32 }, { x: 0.60, y: 0.46 }, { x: 0.64, y: 0.60 },
  { x: 0.68, y: 0.74 }, { x: 0.72, y: 0.88 },
  { x: 0.37, y: 0.56 }, { x: 0.44, y: 0.56 }, { x: 0.50, y: 0.56 },
  { x: 0.56, y: 0.56 }, { x: 0.63, y: 0.56 },
];

function TraceCanvas({ size }: { size: number }) {
  const [lit, setLit] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const start = setTimeout(() => setRunning(true), 600);
    return () => clearTimeout(start);
  }, []);

  useEffect(() => {
    if (!running) return;
    setLit(0);
    const iv = setInterval(() => {
      setLit((p) => {
        if (p >= TRACE_A.length - 1) {
          clearInterval(iv);
          // restart after pause
          setTimeout(() => setRunning(false), 900);
          setTimeout(() => { setLit(0); setRunning(true); }, 2200);
          return p;
        }
        return p + 1;
      });
    }, 100);
    return () => clearInterval(iv);
  }, [running]);

  const finger = TRACE_A[Math.min(lit, TRACE_A.length - 1)];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Ghost letter */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span style={{
          fontFamily: "'Outfit', sans-serif", fontWeight: 900,
          fontSize: size * 0.78, color: 'rgba(255,255,255,0.04)',
          lineHeight: 1, userSelect: 'none',
        }}>A</span>
      </div>
      {/* Dots */}
      {TRACE_A.map((p, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            width: 7, height: 7,
            left: p.x * size - 3.5, top: p.y * size - 3.5,
            background: i <= lit ? 'linear-gradient(135deg,#FF6B35,#FFA438)' : 'rgba(255,255,255,0.15)',
            boxShadow: i <= lit ? '0 0 8px rgba(255,107,53,0.8)' : 'none',
            transition: 'background 0.12s, box-shadow 0.12s',
            zIndex: 2,
          }}
        />
      ))}
      {/* Finger cursor */}
      <motion.div
        animate={{ left: finger.x * size - 11, top: finger.y * size - 11 }}
        transition={{ duration: 0.1, ease: 'linear' }}
        className="absolute pointer-events-none"
        style={{ width: 22, height: 22, zIndex: 3 }}
      >
        <div className="w-full h-full rounded-full"
          style={{ background: 'rgba(255,107,53,0.2)', border: '2px solid rgba(255,107,53,0.9)' }} />
      </motion.div>
    </div>
  );
}

/* ─── HapticLearn Phone Screen ─── */
function HapticPhoneScreen({ metricValue, metricLabel }: { metricValue: number; metricLabel: string }) {
  const [screen, setScreen] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setScreen((s) => (s + 1) % 3), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full h-full pt-10 px-4 pb-6 flex flex-col bg-[#050914] text-white">
      {/* Screen glare */}
      <div className="absolute inset-0 pointer-events-none z-40"
        style={{ background: 'linear-gradient(110deg,rgba(255,255,255,0.07) 0%,transparent 45%)' }} />

      {/* Dynamic Island */}
      <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-end px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)]">
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(255,107,53,0.9)] animate-pulse" />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4 z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#FF6B35,#FFA438)' }}>
            <Hand size={12} color="white" />
          </div>
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 11 }}>HapticLearn</span>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 text-xs font-bold"
          style={{ background: 'rgba(255,107,53,0.15)', fontSize: 10 }}>EP</div>
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-1.5 mb-3 z-10">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-full transition-all duration-300"
            style={{ width: i === screen ? 14 : 6, height: 6, background: i === screen ? '#FF6B35' : 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>

      {/* Screen content */}
      <div className="flex-1 flex flex-col items-center justify-center z-10">
        <AnimatePresence mode="wait">
          {screen === 0 && (
            <motion.div key="trace"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-2 w-full"
            >
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', fontFamily: "'Outfit',sans-serif" }}>
                SIGUE EL TRAZO
              </span>
              <div className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <TraceCanvas size={140} />
              </div>
              <div className="flex items-center gap-1.5">
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF6B35' }} />
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: "'Outfit',sans-serif" }}>
                  vibración háptica activa
                </span>
              </div>
            </motion.div>
          )}

          {screen === 1 && (
            <motion.div key="progress"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                  <circle cx="72" cy="72" r="56" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <circle cx="72" cy="72" r="56" fill="none" stroke="#FF6B35" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * (1 - 7 / metricValue)}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                  />
                </svg>
                <div className="text-center z-10">
                  <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 28, color: '#fff' }}>7</span>
                  <div style={{ fontSize: 8, color: 'rgba(255,107,53,0.8)', letterSpacing: '0.06em', fontFamily: "'Outfit',sans-serif" }}>
                    / {metricValue} {metricLabel}
                  </div>
                </div>
              </div>
              <div className="w-full space-y-1.5">
                {[
                  { icon: CheckCircle, label: 'Trazo completado', sub: 'Letra A', color: '#22c55e' },
                  { icon: Volume2, label: 'TalkBack anunció', sub: '"Letra A"', color: '#A855F7' },
                ].map(({ icon: Icon, label, sub, color }, i) => (
                  <div key={i} className="rounded-xl p-2.5 flex items-center gap-2"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}20` }}>
                      <Icon size={13} color={color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, fontFamily: "'Outfit',sans-serif" }}>{label}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {screen === 2 && (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 0 28px rgba(34,197,94,0.45)' }}
              >
                <CheckCircle size={28} color="white" strokeWidth={2.5} />
              </motion.div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16 }}>¡Letra A dominada!</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit',sans-serif" }}>
                Próxima: Letra B
              </div>
              <div className="w-full px-1">
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: "'Outfit',sans-serif" }}>Curso completo</span>
                  <span style={{ fontSize: 9, color: '#FF6B35', fontFamily: "'Outfit',sans-serif" }}>26%</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div initial={{ width: '22%' }} animate={{ width: '26%' }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg,#FF6B35,#FFA438)' }}
                  />
                </div>
              </div>
              {/* Bottom nav */}
              <div className="flex justify-around w-full pt-1 mt-1"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {[Hand, BarChart3, School].map((Icon, i) => (
                  <Icon key={i} size={13} color={i === 0 ? '#FF6B35' : 'rgba(255,255,255,0.2)'} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Injected CSS ─── */
const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  .film-grain {
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 50; opacity: 0.04; mix-blend-mode: overlay;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%25" height="100%25" filter="url(%23n)"/></svg>');
  }

  .bg-grid-haptic {
    background-size: 60px 60px;
    background-image:
      linear-gradient(to right, rgba(255,107,53,0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,107,53,0.06) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .text-haptic-3d {
    color: #ffffff;
    text-shadow:
      0 10px 30px rgba(255,107,53,0.15),
      0 2px 4px rgba(0,0,0,0.5);
  }

  .text-haptic-gradient {
    background: linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.55) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter:
      drop-shadow(0px 10px 20px rgba(255,107,53,0.2))
      drop-shadow(0px 2px 4px rgba(0,0,0,0.6));
  }

  .text-haptic-orange {
    background: linear-gradient(135deg, #FF6B35 0%, #FFA438 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter: drop-shadow(0px 8px 20px rgba(255,107,53,0.35));
  }

  .text-card-white {
    background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter:
      drop-shadow(0px 12px 24px rgba(0,0,0,0.9))
      drop-shadow(0px 4px 8px rgba(0,0,0,0.7));
  }

  .premium-dark-card {
    background: linear-gradient(145deg, #120828 0%, #050010 100%);
    box-shadow:
      0 40px 100px -20px rgba(0,0,0,0.95),
      0 20px 40px -20px rgba(0,0,0,0.8),
      inset 0 1px 2px rgba(255,107,53,0.12),
      inset 0 -2px 4px rgba(0,0,0,0.9);
    border: 1px solid rgba(255,107,53,0.08);
    position: relative;
  }

  .card-sheen {
    position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
    background: radial-gradient(800px circle at var(--mouse-x,50%) var(--mouse-y,50%), rgba(255,107,53,0.05) 0%, transparent 40%);
    mix-blend-mode: screen; transition: opacity 0.3s ease;
  }

  .iphone-bezel {
    background-color: #111;
    box-shadow:
      inset 0 0 0 2px #52525B,
      inset 0 0 0 7px #000,
      0 40px 80px -15px rgba(0,0,0,0.95),
      0 15px 25px -5px rgba(0,0,0,0.8);
    transform-style: preserve-3d;
  }

  .hardware-btn {
    background: linear-gradient(90deg,#404040 0%,#171717 100%);
    box-shadow:
      -2px 0 5px rgba(0,0,0,0.8),
      inset -1px 0 1px rgba(255,255,255,0.12),
      inset 1px 0 2px rgba(0,0,0,0.8);
    border-left: 1px solid rgba(255,255,255,0.04);
  }

  .floating-ui-badge {
    background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 100%);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow:
      0 0 0 1px rgba(255,107,53,0.15),
      0 25px 50px -12px rgba(0,0,0,0.9),
      inset 0 1px 1px rgba(255,255,255,0.12),
      inset 0 -1px 1px rgba(0,0,0,0.6);
  }

  .transform-style-3d { transform-style: preserve-3d; }

  .btn-haptic-primary {
    background: linear-gradient(135deg,#FF6B35,#FFA438);
    color: #fff;
    box-shadow: 0 0 0 1px rgba(255,107,53,0.3), 0 2px 4px rgba(0,0,0,0.4), 0 12px 28px -4px rgba(255,107,53,0.4), inset 0 1px 1px rgba(255,255,255,0.25);
    transition: all 0.35s cubic-bezier(0.25,1,0.5,1);
  }
  .btn-haptic-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 0 1px rgba(255,107,53,0.4), 0 8px 16px -2px rgba(255,107,53,0.3), 0 24px 40px -6px rgba(255,107,53,0.5), inset 0 1px 1px rgba(255,255,255,0.3);
  }
  .btn-haptic-primary:active { transform: translateY(1px); }

  .btn-haptic-secondary {
    background: linear-gradient(180deg,rgba(255,255,255,0.1) 0%,rgba(255,255,255,0.04) 100%);
    color: rgba(255,255,255,0.8);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.5), 0 12px 24px -4px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1);
    transition: all 0.35s cubic-bezier(0.25,1,0.5,1);
    backdrop-filter: blur(8px);
  }
  .btn-haptic-secondary:hover {
    transform: translateY(-3px);
    background: linear-gradient(180deg,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0.07) 100%);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 8px 16px -2px rgba(0,0,0,0.5), 0 20px 32px -6px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15);
  }
  .btn-haptic-secondary:active { transform: translateY(1px); }

  .progress-ring {
    transform: rotate(-90deg);
    transform-origin: center;
    stroke-dasharray: 402;
    stroke-dashoffset: 402;
    stroke-linecap: round;
  }
`;

/* ─── Props ─── */
export interface CinematicHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  brandName?: string;
  tagline1?: string;
  tagline2?: string;
  cardHeading?: string;
  cardDescription?: React.ReactNode;
  metricValue?: number;
  metricLabel?: string;
  ctaHeading?: string;
  ctaDescription?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export function CinematicHero({
  brandName = "HapticLearn",
  tagline1 = "Aprende con el tacto,",
  tagline2 = "no con la vista.",
  cardHeading = "Aprender sin ver es posible.",
  cardDescription = (
    <>
      <span className="text-white font-semibold">HapticLearn</span> enseña a niños con
      discapacidad visual a trazar letras con el dedo — guiados por{" "}
      <span className="text-orange-400 font-semibold">vibración háptica</span> y voz en cada punto del trazo.
    </>
  ),
  metricValue = 27,
  metricLabel = "letras",
  ctaHeading = "Tu hijo puede aprender.",
  ctaDescription = "Pídele a su colegio que adopte HapticLearn. En minutos, tu hijo empieza a trazar letras con vibración y voz — sin ver la pantalla.",
  onPrimaryClick,
  onSecondaryClick,
  primaryLabel = "Ingresar al panel",
  secondaryLabel = "Soy mamá — compartir",
  className,
  ...props
}: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  /* Mouse parallax */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!mainCardRef.current || !mockupRef.current) return;
        const rect = mainCardRef.current.getBoundingClientRect();
        mainCardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        mainCardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
        const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
        gsap.to(mockupRef.current, { rotationY: xVal * 10, rotationX: -yVal * 10, ease: "power3.out", duration: 1.2 });
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafRef.current); };
  }, []);

  /* Cinematic scroll timeline */
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const ctx = gsap.context(() => {
      gsap.set(".hl-text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".hl-text-reveal", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".hl-main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".hl-card-left", ".hl-card-right", ".hl-mockup-wrap", ".hl-badge", ".hl-phone-item"], { autoAlpha: 0 });
      gsap.set(".hl-cta-wrap", { autoAlpha: 0, scale: 0.8, filter: "blur(30px)" });

      // Intro
      gsap.timeline({ delay: 0.3 })
        .to(".hl-text-track", { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
        .to(".hl-text-reveal", { duration: 1.4, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=1.0");

      // Scroll
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=7000",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      })
        .to([".hl-hero-text", ".bg-grid-haptic"], { scale: 1.15, filter: "blur(20px)", opacity: 0.15, ease: "power2.inOut", duration: 2 }, 0)
        .to(".hl-main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".hl-main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
        .fromTo(".hl-mockup-wrap",
          { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2.5 }, "-=0.8"
        )
        .fromTo(".hl-phone-item", { y: 40, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.15, ease: "back.out(1.2)", duration: 1.5 }, "-=1.5")
        .to(".progress-ring", { strokeDashoffset: 60, duration: 2, ease: "power3.inOut" }, "-=1.2")
        .fromTo(".hl-badge", { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.5, stagger: 0.2 }, "-=2.0")
        .fromTo(".hl-card-left", { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "-=1.5")
        .fromTo(".hl-card-right", { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 }, "<")
        .to({}, { duration: 2.5 })
        .set(".hl-hero-text", { autoAlpha: 0 })
        .set(".hl-cta-wrap", { autoAlpha: 1 })
        .to({}, { duration: 1.5 })
        .to([".hl-mockup-wrap", ".hl-badge", ".hl-card-left", ".hl-card-right"], {
          scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: "power3.in", duration: 1.2, stagger: 0.05,
        })
        .to(".hl-main-card", {
          width: isMobile ? "92vw" : "85vw",
          height: isMobile ? "92vh" : "85vh",
          borderRadius: isMobile ? "32px" : "40px",
          ease: "expo.inOut", duration: 1.8,
        }, "pullback")
        .to(".hl-cta-wrap", { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.8 }, "pullback")
        .to(".hl-main-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 });
    }, containerRef);

    return () => ctx.revert();
  }, [metricValue]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-screen h-screen overflow-hidden flex items-center justify-center font-sans antialiased",
        className
      )}
      style={{ background: '#03000A', color: '#ffffff', perspective: "1500px" }}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="film-grain" aria-hidden="true" />
      <div className="bg-grid-haptic absolute inset-0 z-0 pointer-events-none opacity-60" aria-hidden="true" />

      {/* ── Background: hero text ── */}
      <div className="hl-hero-text absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 will-change-transform">
        <h1 className="hl-text-track gsap-reveal text-haptic-3d text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tight mb-2"
          style={{ fontFamily: "'Outfit',sans-serif" }}>
          {tagline1}
        </h1>
        <h1 className="hl-text-reveal gsap-reveal text-haptic-orange text-5xl md:text-7xl lg:text-[6rem] font-extrabold tracking-tighter"
          style={{ fontFamily: "'Outfit',sans-serif" }}>
          {tagline2}
        </h1>
      </div>

      {/* ── Background: CTA ── */}
      <div className="hl-cta-wrap absolute z-10 flex flex-col items-center justify-center text-center w-screen px-6 gsap-reveal pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
          style={{ background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.25)' }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#FF6B35' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#FFA438', letterSpacing: '0.1em', fontFamily: "'Outfit',sans-serif" }}>
            PLATAFORMA EDUCATIVA ACCESIBLE
          </span>
        </div>
        <h2 className="text-haptic-gradient text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight"
          style={{ fontFamily: "'Outfit',sans-serif" }}>
          {ctaHeading}
        </h2>
        <p className="text-lg md:text-xl mb-12 max-w-xl mx-auto font-light leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          {ctaDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={onPrimaryClick}
            className="btn-haptic-primary flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] cursor-pointer focus:outline-none"
            style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.95rem' }}>
            <Hand size={18} />
            {primaryLabel}
          </button>
          <button onClick={onSecondaryClick}
            className="btn-haptic-secondary flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] cursor-pointer focus:outline-none"
            style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: '0.88rem' }}>
            <Volume2 size={16} />
            {secondaryLabel}
          </button>
        </div>
      </div>

      {/* ── Foreground: Deep card ── */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div
          ref={mainCardRef}
          className="hl-main-card premium-dark-card relative overflow-hidden gsap-reveal flex items-center justify-center pointer-events-auto w-[92vw] md:w-[85vw] h-[92vh] md:h-[85vh] rounded-[32px] md:rounded-[40px]"
        >
          <div className="card-sheen" aria-hidden="true" />

          {/* Decorative orange glow inside card */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(255,107,53,0.08) 0%, transparent 70%)' }} />

          <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">

            {/* Right (desktop) / Top (mobile): Brand name */}
            <div className="hl-card-right gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full">
              <h2 className="text-card-white text-5xl md:text-[5rem] lg:text-[7rem] font-black uppercase tracking-tighter"
                style={{ fontFamily: "'Outfit',sans-serif" }}>
                {brandName}
              </h2>
            </div>

            {/* Center: Phone mockup */}
            <div className="hl-mockup-wrap order-2 relative w-full h-[380px] lg:h-[600px] flex items-center justify-center z-10"
              style={{ perspective: "1000px" }}>
              <div className="relative w-full h-full flex items-center justify-center transform scale-[0.65] md:scale-[0.85] lg:scale-100">
                <div
                  ref={mockupRef}
                  className="relative w-[280px] h-[580px] rounded-[3rem] iphone-bezel flex flex-col will-change-transform transform-style-3d"
                >
                  {/* Hardware buttons */}
                  <div className="absolute top-[120px] -left-[3px] w-[3px] h-[25px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[160px] -left-[3px] w-[3px] h-[45px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[220px] -left-[3px] w-[3px] h-[45px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[170px] -right-[3px] w-[3px] h-[70px] hardware-btn rounded-r-md z-0 scale-x-[-1]" aria-hidden="true" />

                  {/* Screen */}
                  <div className="absolute inset-[7px] rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] z-10">
                    <div className="hl-phone-item w-full h-full">
                      <HapticPhoneScreen metricValue={metricValue} metricLabel={metricLabel} />
                    </div>
                  </div>
                </div>

                {/* Floating badge — top left */}
                <div className="hl-badge absolute flex top-8 lg:top-14 left-[-10px] lg:left-[-70px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 z-30">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)' }}>
                    <span aria-hidden="true" style={{ fontSize: 18 }}>✍️</span>
                  </div>
                  <div>
                    <p className="text-white text-xs lg:text-sm font-bold">Trazo completado</p>
                    <p className="text-xs" style={{ color: 'rgba(255,107,53,0.7)' }}>Letra A dominada</p>
                  </div>
                </div>

                {/* Floating badge — bottom right */}
                <div className="hl-badge absolute flex bottom-14 lg:bottom-20 right-[-10px] lg:right-[-70px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 z-30">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                    <Volume2 size={16} color="#A855F7" />
                  </div>
                  <div>
                    <p className="text-white text-xs lg:text-sm font-bold">TalkBack activo</p>
                    <p className="text-xs" style={{ color: 'rgba(168,85,247,0.7)' }}>"Letra B — tu turno"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Left (desktop) / Bottom (mobile): Description */}
            <div className="hl-card-left gsap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full px-4 lg:px-0">
              <h3 className="text-white text-2xl md:text-3xl lg:text-[2rem] font-bold mb-4 tracking-tight leading-tight"
                style={{ fontFamily: "'Outfit',sans-serif" }}>
                {cardHeading}
              </h3>
              <p className="hidden md:block text-base lg:text-lg font-light leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {cardDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
