import { useNavigate } from 'react-router-dom';
import { CinematicHero } from '@/components/ui/cinematic-landing-hero';

export function LandingPage2() {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-hidden w-full min-h-screen" style={{ background: '#03000A' }}>
      <CinematicHero
        brandName="HapticLearn"
        tagline1="Aprende con el tacto,"
        tagline2="no con la vista."
        cardHeading="Aprender sin ver es posible."
        cardDescription={
          <>
            <span style={{ color: '#fff', fontWeight: 600 }}>HapticLearn</span> enseña a niños con
            discapacidad visual a trazar letras con el dedo — guiados por{' '}
            <span style={{ color: '#FFA438', fontWeight: 600 }}>vibración háptica</span> y voz en
            cada punto del trazo. Sin hardware especial. Solo un celular Android.
          </>
        }
        metricValue={27}
        metricLabel="letras"
        ctaHeading="Tu hijo puede aprender."
        ctaDescription="Pídele a su colegio que adopte HapticLearn. En minutos, tu hijo empieza a trazar letras con vibración y voz — sin ver la pantalla."
        primaryLabel="Ingresar al panel"
        secondaryLabel="Soy mamá — compartir"
        onPrimaryClick={() => navigate('/login')}
        onSecondaryClick={() => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.origin + '/');
          }
          alert('¡Enlace copiado! Compártelo con el director de tu colegio.');
        }}
      />

      {/* Toggle to prototype 1 */}
      <div
        className="fixed bottom-6 right-6 z-[100]"
        style={{ pointerEvents: 'auto' }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            color: 'rgba(255,255,255,0.55)',
            fontFamily: "'Outfit',sans-serif",
            fontWeight: 600,
            fontSize: '0.78rem',
          }}
        >
          ← Ver Prototipo 1
        </button>
      </div>
    </div>
  );
}
