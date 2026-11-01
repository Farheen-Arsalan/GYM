import { useId } from 'react'
import { Link } from 'react-router-dom'

export function PulseMark({ className = 'h-9 w-9' }) {
  // unique per instance: a shared id would resolve to the hidden sidebar copy on mobile
  const gid = `pf-mark-${useId().replace(/:/g, '')}`
  return (
    <span className={`relative grid place-items-center rounded-xl bg-[#06080b] ring-1 ring-white/10 ${className}`}>
      <span className="absolute inset-0 rounded-xl bg-gradient-brand opacity-25 blur-md" />
      <svg viewBox="0 0 64 64" className="relative h-[70%] w-[70%]" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#C6FF3D" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <path
          d="M4 34h13l5-12 9 24 7-18 4 6h18"
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export default function Logo({ to = '/', size = 'md' }) {
  const text = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl'
  return (
    <Link to={to} className="group inline-flex min-h-11 items-center gap-2.5" aria-label="PulseFit home">
      <PulseMark className={size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'} />
      <span className={`font-display font-bold tracking-tight ${text}`}>
        <span className="text-fg">Pulse</span>
        <span className="text-gradient">Fit</span>
      </span>
    </Link>
  )
}
