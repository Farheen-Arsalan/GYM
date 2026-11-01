import { motion } from 'framer-motion'

export default function EmptyState({ icon: IconCmp, title, message, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass flex flex-col items-center px-6 py-12 text-center"
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-gradient-brand opacity-30 blur-2xl" />
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-line/10 bg-fg/[0.04]">
          {IconCmp && <IconCmp className="text-ink" size={28} />}
        </div>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {message && <p className="mt-1.5 max-w-xs text-sm text-muted">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
