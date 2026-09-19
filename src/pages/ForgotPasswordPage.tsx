import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { forgotPassword } from '../api/auth.api';
import { Hapti } from '../components/Hapti';

const field =
  'w-full bg-snow border-2 border-[#EDE3FF] text-white placeholder:text-white/40 rounded-2xl pl-11 pr-3 py-3 text-[0.95rem] font-bold outline-none transition-all focus:border-[#FF6B35] focus:shadow-[0_0_0_4px_rgba(255,107,53,0.18)]';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email.trim(), `${window.location.origin}/reset-password`);
      setSent(true);
    } catch {
      setError('No se pudo enviar el correo. Intenta de nuevo.');
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
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">Recuperar contraseña</h1>
            <p className="text-white/60 text-sm mt-1 font-bold">Te enviaremos un enlace para restablecerla.</p>
          </div>

          {sent ? (
            <div role="status" className="bg-green-50 border-2 border-green-200 text-green-700 rounded-2xl px-4 py-3 text-sm font-bold">
              Si el correo existe, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div role="alert" className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm font-bold">
                  {error}
                </div>
              )}
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  required
                  autoComplete="email"
                  className={field}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full h-12 text-base mt-2">
                {loading ? (
                  <div className="w-5 h-5 border-[3px] border-snow/60 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Enviar enlace <ArrowRight size={18} />
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
