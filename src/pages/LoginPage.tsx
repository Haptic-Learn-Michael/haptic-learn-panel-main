import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import { login } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { supabase } from '../lib/supabase';

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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setAuth } = useAuthStore();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const errorKey = searchParams.get('error');
    if (errorKey && OAUTH_ERROR_MESSAGES[errorKey]) {
      setError(OAUTH_ERROR_MESSAGES[errorKey]);
    }
  }, [searchParams]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

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

  return (
    <div className="min-h-screen w-screen bg-[#1A0533] relative overflow-hidden flex items-center justify-center">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FF6B35]/20 via-[#2C0B50]/60 to-[#1A0533]" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Top orange glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[50vh] rounded-b-[50%] bg-[#FF6B35]/15 blur-[80px]" />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vh] h-[45vh] rounded-b-full bg-[#FF6B35]/10 blur-[60px]"
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vh] h-[60vh] rounded-t-full bg-[#FFD166]/10 blur-[80px]"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
        transition={{ duration: 7, repeat: Infinity, repeatType: 'mirror', delay: 1 }}
      />

      {/* Ambient orbs */}
      <div className="absolute left-1/4 top-1/3 w-80 h-80 bg-[#FF6B35]/8 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute right-1/4 bottom-1/3 w-80 h-80 bg-[#FFD166]/8 rounded-full blur-[100px] animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
            {/* Card outer glow */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl"
              animate={{
                boxShadow: [
                  '0 0 12px 3px rgba(255,107,53,0.08)',
                  '0 0 20px 6px rgba(255,107,53,0.14)',
                  '0 0 12px 3px rgba(255,107,53,0.08)',
                ],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
            />

            {/* Traveling light beams */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
              <motion.div
                className="absolute top-0 left-0 h-[2px] w-[40%] bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent"
                animate={{ left: ['-40%', '100%'], opacity: [0.4, 0.9, 0.4] }}
                transition={{ left: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.5 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror' } }}
              />
              <motion.div
                className="absolute top-0 right-0 h-[40%] w-[2px] bg-gradient-to-b from-transparent via-[#FF6B35] to-transparent"
                animate={{ top: ['-40%', '100%'], opacity: [0.4, 0.9, 0.4] }}
                transition={{ top: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.5, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 0.6 } }}
              />
              <motion.div
                className="absolute bottom-0 right-0 h-[2px] w-[40%] bg-gradient-to-r from-transparent via-[#FFD166] to-transparent"
                animate={{ right: ['-40%', '100%'], opacity: [0.3, 0.7, 0.3] }}
                transition={{ right: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.5, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 1.2 } }}
              />
              <motion.div
                className="absolute bottom-0 left-0 h-[40%] w-[2px] bg-gradient-to-b from-transparent via-[#FFD166] to-transparent"
                animate={{ bottom: ['-40%', '100%'], opacity: [0.3, 0.7, 0.3] }}
                transition={{ bottom: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.5, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 1.8 } }}
              />

              {/* Corner glow dots */}
              <motion.div className="absolute top-0 left-0 h-[6px] w-[6px] rounded-full bg-[#FF6B35]/60 blur-[1px]" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }} />
              <motion.div className="absolute top-0 right-0 h-[6px] w-[6px] rounded-full bg-[#FF6B35]/60 blur-[1px]" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2.4, repeat: Infinity, repeatType: 'mirror', delay: 0.5 }} />
              <motion.div className="absolute bottom-0 right-0 h-[6px] w-[6px] rounded-full bg-[#FFD166]/60 blur-[1px]" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2.2, repeat: Infinity, repeatType: 'mirror', delay: 1 }} />
              <motion.div className="absolute bottom-0 left-0 h-[6px] w-[6px] rounded-full bg-[#FFD166]/60 blur-[1px]" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2.3, repeat: Infinity, repeatType: 'mirror', delay: 1.5 }} />
            </div>

            {/* Card border hover */}
            <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-br from-[#FF6B35]/10 via-white/5 to-[#FFD166]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Glass card */}
            <div className="relative bg-[#22063F]/70 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.07] shadow-2xl overflow-hidden">
              {/* Subtle grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,107,53,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.5) 1px, transparent 1px)`,
                  backgroundSize: '32px 32px',
                }}
              />

              {/* Logo + header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="mx-auto w-11 h-11 bg-[#FF6B35] rounded-xl flex items-center justify-center relative overflow-hidden mb-3 shadow-[0_4px_20px_rgba(255,107,53,0.45)]"
                >
                  <Zap size={22} className="text-white relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="font-display text-xl font-bold text-white tracking-tight"
                >
                  HapticLearn
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-white/45 text-xs mt-0.5 font-sans"
                >
                  Panel Administrativo
                </motion.p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl px-4 py-3 text-xs mb-4"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email */}
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div className="relative flex items-center overflow-hidden rounded-xl">
                    <Mail
                      size={15}
                      className={`absolute left-3 transition-all duration-300 ${focusedInput === 'email' ? 'text-[#FF6B35]' : 'text-white/30'}`}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Correo electrónico"
                      required
                      autoComplete="email"
                      className="w-full bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-white/25 rounded-xl pl-10 pr-3 py-2.5 text-sm font-sans outline-none transition-all duration-300 focus:border-[#FF6B35]/50 focus:bg-[#FF6B35]/[0.06] focus:shadow-[0_0_0_3px_rgba(255,107,53,0.12)]"
                    />
                    {focusedInput === 'email' && (
                      <motion.div
                        layoutId="input-highlight"
                        className="absolute inset-0 bg-[#FF6B35]/[0.04] rounded-xl -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div className="relative flex items-center overflow-hidden rounded-xl">
                    <Lock
                      size={15}
                      className={`absolute left-3 transition-all duration-300 ${focusedInput === 'password' ? 'text-[#FF6B35]' : 'text-white/30'}`}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Contraseña"
                      required
                      autoComplete="current-password"
                      className="w-full bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-white/25 rounded-xl pl-10 pr-10 py-2.5 text-sm font-sans outline-none transition-all duration-300 focus:border-[#FF6B35]/50 focus:bg-[#FF6B35]/[0.06] focus:shadow-[0_0_0_3px_rgba(255,107,53,0.12)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-white/30 hover:text-white/70 transition-colors duration-200"
                    >
                      {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    {focusedInput === 'password' && (
                      <motion.div
                        layoutId="input-highlight"
                        className="absolute inset-0 bg-[#FF6B35]/[0.04] rounded-xl -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </div>
                </motion.div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full relative group/btn mt-2"
                >
                  <div className="absolute inset-0 bg-[#FF6B35]/30 rounded-xl blur-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  <div className="relative overflow-hidden bg-[#FF6B35] hover:bg-[#e85c28] text-white font-semibold h-10 rounded-xl transition-colors duration-200 flex items-center justify-center shadow-[0_4px_20px_rgba(255,107,53,0.35)]">
                    {/* Shimmer on loading */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.5 }}
                      style={{ opacity: loading ? 1 : 0, transition: 'opacity 0.3s ease' }}
                    />
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="label"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-1.5 text-sm"
                        >
                          Iniciar sesión
                          <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span className="text-white/25 text-xs font-sans">o</span>
                <div className="flex-1 h-px bg-white/[0.08]" />
              </div>

              {/* Google button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="relative w-full mt-3 flex items-center justify-center gap-2.5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] hover:border-white/[0.20] text-white/80 hover:text-white rounded-xl h-10 text-sm font-sans font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white/80 rounded-full animate-spin" />
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continuar con Google
                  </>
                )}
              </motion.button>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-white/20 text-xs mt-5 font-sans"
              >
                HapticLearn © {new Date().getFullYear()}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
