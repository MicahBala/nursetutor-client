import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const RequireAuth = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  return children;
};

export const RequireAdmin = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  
  // Replace this with your exact admin email
  if (currentUser.email !== 'micahkulien@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};