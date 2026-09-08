import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth.store';
import { api } from '../api/client';
import type { User } from '../types';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const exchange = async () => {
      let session = null;

      // PKCE flow: code in query params
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session) session = data.session;
      }

      // Implicit flow: tokens in URL hash — Supabase client picks them up automatically
      if (!session) {
        const { data } = await supabase.auth.getSession();
        session = data.session;
      }

      if (!session) {
        navigate('/login?error=oauth_failed', { replace: true });
        return;
      }

      try {
        const res = await api.get<User>('/auth/me', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const user = res.data;

        if (user.role !== 'admin' && user.role !== 'lead_educator') {
          await supabase.auth.signOut();
          navigate('/login?error=access_denied', { replace: true });
          return;
        }

        setAuth(user, session.access_token, session.refresh_token);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Error fetching user:', err);
        navigate('/login?error=user_not_found', { replace: true });
      }
    };

    exchange();
  }, [navigate, setAuth]);

  return (
    <div className="app-shell min-h-screen w-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#FF6B35]/60 border-t-[#FF6B35] rounded-full animate-spin" />
        <p className="text-white/40 text-sm font-sans">Verificando cuenta...</p>
      </div>
    </div>
  );
};
