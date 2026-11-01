import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', hover = true, delay = 0, as = 'div', ...props }) {
  const Cmp = motion[as] ?? motion.div
  return (
    <Cmp
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`glass relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </Cmp>
  )
}
