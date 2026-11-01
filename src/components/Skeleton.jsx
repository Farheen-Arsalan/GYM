export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} aria-hidden="true" />
}

// A glass card filled with shimmering placeholder lines.
export function SkeletonCard({ className = '', lines = 3, children }) {
  return (
    <div className={`glass p-6 ${className}`} aria-busy="true" aria-label="Loading">
      {children ?? (
        <>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-8 w-2/3" />
          {Array.from({ length: lines }, (_, i) => (
            <Skeleton key={i} className="mt-3 h-4" />
          ))}
        </>
      )}
    </div>
  )
}
