import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export const ProtectedRoute = () => {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin' && user.role !== 'lead_educator') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
