import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'

export default function AnimatedCounter({ value, duration = 1.8, suffix = '', decimals = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [inView, value, duration])

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {formatted}
      {suffix}
    </span>
  )
}
