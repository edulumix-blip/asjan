import { Navigate, useLocation } from '@/utils/reactRouterCompat';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.status === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (user?.status === 'rejected' || user?.status === 'blocked') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
