import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FullPageSkeleton } from '@/components/shared/Skeletons';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSkeleton />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
