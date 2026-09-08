import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'


function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, currentUser } = useAuth()
  if (!isAuthenticated || !currentUser?.token || currentUser?.role !== requiredRole) {
    return <Navigate to="/connexion" replace />
  }

  return children
}

export default ProtectedRoute
