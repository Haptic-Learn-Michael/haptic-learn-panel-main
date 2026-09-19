import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { login } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { supabase } from '../lib/supabase';
import { Hapti } from '../components/Hapti';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: 'Error al autenticar con Google. Intenta de nuevo.',
  access_denied: 'Acceso denegado. Este panel es exclusivo para administradores y lead educators.',
  user_not_found: 'No se encontró tu usuario. Contacta al administrador.',
};

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setAuth } = useAuthStore();


  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const errorKey = searchParams.get('error');
    if (errorKey && OAUTH_ERROR_MESSAGES[errorKey]) {
      setError(OAUTH_ERROR_MESSAGES[errorKey]);
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError('Error al conectar con Google: ' + error.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      setError('Error interno. Verifica la configuración de Supabase.');
      console.error('Google OAuth error:', err);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await login(email, password);

      if (data.user.role !== 'admin' && data.user.role !== 'lead_educator') {
        setError('Acceso denegado. Este panel es exclusivo para administradores y lead educators.');
        return;
      }

      setAuth(data.user, data.access_token, data.refresh_token);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error al iniciar sesión. Verifica tus credenciales.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const field =
    'w-full bg-snow border-2 border-[#EDE3FF] text-white placeholder:text-white/40 rounded-2xl pl-11 py-3 text-[0.95rem] font-bold outline-none transition-all focus:border-[#FF6B35] focus:shadow-[0_0_0_4px_rgba(255,107,53,0.18)]';

  const stickers = [
    { t: 'A', c: '#4CC9F0', s: 'top-[8%] left-[7%]', r: -10, d: 0 },
    { t: '1', c: '#2FD6A0', s: 'top-[14%] right-[9%]', r: 9, d: 0.8 },
    { t: 'B', c: '#7C4DFF', s: 'bottom-[12%] left-[10%]', r: 7, d: 1.4 },
    { t: '3', c: '#FF6FA8', s: 'bottom-[16%] right-[8%]', r: -8, d: 0.4 },
  ];

  return (
    <div
      className="min-h-screen w-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{
        backgroundColor: '#FFF7E8',
        backgroundImage:
          'radial-gradient(520px 380px at 92% -4%, rgba(255,201,60,.45), transparent 65%), radial-gradient(520px 420px at -4% 10%, rgba(76,201,240,.35), transparent 65%), radial-gradient(600px 420px at 60% 110%, rgba(255,111,168,.25), transparent 65%), radial-gradient(rgba(124,77,255,.10) 2px, transparent 2.5px)',
        backgroundSize: 'auto, auto, auto, 28px 28px',
      }}
    >
      {stickers.map(({ t, c, s, r, d }) => (
        <motion.div
          key={t}
          aria-hidden="true"
          className={`hidden sm:grid absolute ${s} w-14 h-14 rounded-2xl place-items-center font-display font-bold text-2xl text-snow select-none`}
          style={{ background: c, boxShadow: '0 6px 0 rgba(0,0,0,.14)', rotate: r }}
          animate={{ y: [0, -14, 0], rotate: [r, r + 5, r] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: d }}
        >
          {t}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="flex justify-center -mb-8 relative z-10">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}>
            <Hapti size={96} />
          </motion.div>
        </div>

        <div className="surface rounded-[2rem] p-7 pt-11 overflow-hidden" style={{ boxShadow: '0 8px 0 #EDE3FF, 0 30px 60px -25px rgba(124,77,255,.4)' }}>
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">¡Hola de nuevo!</h1>
            <p className="text-white/60 text-sm mt-1 font-bold">Entra al panel de HapticLearn</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                role="alert"
                className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm font-bold mb-4"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-4 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                required
                autoComplete="email"
                className={`${field} pr-3`}
              />
            </div>

            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                autoComplete="current-password"
                className={`${field} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-4 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs font-bold text-[#7C4DFF] hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full h-12 text-base mt-2">
              {loading ? (
                <div className="w-5 h-5 border-[3px] border-snow/60 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Iniciar sesión <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-[3px] rounded-full bg-[#EDE3FF]" />
            <span className="text-white/50 text-xs font-bold">o</span>
            <div className="flex-1 h-[3px] rounded-full bg-[#EDE3FF]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="btn-outlined w-full h-12 mt-4 text-[0.95rem]"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-[3px] border-[#EDE3FF] border-t-[#7C4DFF] rounded-full animate-spin" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuar con Google
              </>
            )}
          </button>

          <p className="text-center text-white/50 text-xs mt-5 font-bold">
            HapticLearn © {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
