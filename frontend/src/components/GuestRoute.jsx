import { Navigate } from 'react-router-dom';
import { getToken, getStoredUser, getDashboardPath } from '../utils/auth';

function GuestRoute({ children }) {
  const token = getToken();
  const user = getStoredUser();

  if (token && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
}

export default GuestRoute;
