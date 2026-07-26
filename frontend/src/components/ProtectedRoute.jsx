import { Navigate } from 'react-router-dom';
import { getToken, getStoredUser, getDashboardPath } from '../utils/auth';

function ProtectedRoute({ children, allowedRoles }) {
  const token = getToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
