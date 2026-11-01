import { useId } from 'react'
import { motion } from 'framer-motion'

export default function ProgressRing({
  value,
  max = 100,
  size = 120,
  stroke = 10,
  colors = ['#C6FF3D', '#22D3EE'],
  delay = 0.2,
  duration = 1.4,
  children,
}) {
  const id = useId().replace(/:/g, '')
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, max ? value / max : 0))

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={colors[0]} />
            <stop offset="1" stopColor={colors[1]} />
          </linearGradient>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: 'rgb(var(--line) / 0.08)' }} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#ring-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
          filter={`url(#glow-${id})`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}
