import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { resetPassword } from '../api/auth.api';
import { supabase } from '../lib/supabase';
import { Hapti } from '../components/Hapti';

const field =
  'w-full bg-snow border-2 border-[#EDE3FF] text-white placeholder:text-white/40 rounded-2xl pl-11 pr-3 py-3 text-[0.95rem] font-bold outline-none transition-all focus:border-[#FF6B35] focus:shadow-[0_0_0_4px_rgba(255,107,53,0.18)]';

// El enlace del correo llega como /reset-password#access_token=...&type=recovery.
// El cliente de Supabase consume y limpia ese hash al iniciar, así que se lee al cargar el
// módulo y además se escucha PASSWORD_RECOVERY como respaldo.
const initialToken = new URLSearchParams(window.location.hash.slice(1)).get('access_token');

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(initialToken);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) setToken(session.access_token);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    if (password !== confirm) return setError('Las contraseñas no coinciden.');
    if (!token) return setError('El enlace es inválido o ha expirado. Solicita uno nuevo.');

    setLoading(true);
    setError('');
    try {
      await resetPassword(token, password);
      setDone(true);
      await supabase.auth.signOut();
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError((Array.isArray(msg) ? msg[0] : msg) ?? 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FFF7E8' }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center -mb-8 relative z-10">
          <Hapti size={96} />
        </div>
        <div className="surface rounded-[2rem] p-7 pt-11" style={{ boxShadow: '0 8px 0 #EDE3FF, 0 30px 60px -25px rgba(124,77,255,.4)' }}>
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">Nueva contraseña</h1>
            <p className="text-white/60 text-sm mt-1 font-bold">Elige una de al menos 6 caracteres.</p>
          </div>

          {done ? (
            <div role="status" className="bg-green-50 border-2 border-green-200 text-green-700 rounded-2xl px-4 py-3 text-sm font-bold">
              Contraseña actualizada. Redirigiendo al inicio de sesión…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div role="alert" className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm font-bold">
                  {error}
                </div>
              )}
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  required
                  autoComplete="new-password"
                  className={field}
                />
              </div>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-white/40" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirmar contraseña"
                  required
                  autoComplete="new-password"
                  className={field}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full h-12 text-base mt-2">
                {loading ? (
                  <div className="w-5 h-5 border-[3px] border-snow/60 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Guardar contraseña <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-center mt-5">
            <Link to="/login" className="text-xs font-bold text-[#7C4DFF] hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
