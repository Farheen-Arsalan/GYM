import { CloudOff, RefreshCw, TriangleAlert } from 'lucide-react'
import EmptyState from './EmptyState'

// Friendly full-card error with a retry button. Database outages get their own wording.
export default function ErrorState({ error, onRetry }) {
  const offline = error?.isOffline
  return (
    <EmptyState
      icon={offline ? CloudOff : TriangleAlert}
      title={offline ? 'We can’t reach the database' : 'That didn’t load'}
      message={error?.message ?? 'Something went wrong. Please try again.'}
      action={
        onRetry && (
          <button className="btn-primary" onClick={onRetry}>
            <RefreshCw size={16} /> Try again
          </button>
        )
      }
    />
  )
}
