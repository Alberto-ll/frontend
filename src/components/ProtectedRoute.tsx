import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useLocation, useOutletContext } from 'react-router';
import { useAuth } from './Auth';
import LoginRequired from './LoginRequired';
import AccessDenied from './AccessDenied';
import '../static/css/authMessages.css';

interface OutletContext {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  setHeaderMode: (mode: 'full' | 'simple') => void;
}

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();
  const { setHeaderMode } = useOutletContext<OutletContext>();

  useEffect(() => {
    if (!isAuthenticated || (requiredRoles && !hasRole(requiredRoles))) {
      setHeaderMode('simple');
      return () => setHeaderMode('full');
    }
  }, [isAuthenticated, requiredRoles, hasRole, setHeaderMode]);

  if (isLoading) {
    return (
      <div className="auth-loading-page">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginRequired redirectUrl={location.pathname} />;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
