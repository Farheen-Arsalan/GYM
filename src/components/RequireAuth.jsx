import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SkeletonCard } from './Skeleton'
import ErrorState from './ErrorState'

export default function RequireAuth({ children }) {
  const { user, loading, error, refresh } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <SkeletonCard className="h-56 lg:col-span-2" />
        <SkeletonCard className="h-56" />
      </div>
    )
  }
  if (error) return <ErrorState error={error} onRetry={refresh} />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
