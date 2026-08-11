import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const home =
      user.role === 'ADMIN' ? '/admin' : user.role === 'STORE_OWNER' ? '/owner' : '/stores';
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
