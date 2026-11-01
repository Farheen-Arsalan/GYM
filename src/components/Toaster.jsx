import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const styles = {
  success: { Icon: CheckCircle2, ring: 'ring-lime/30', icon: 'text-ink bg-lime/15' },
  error: { Icon: AlertTriangle, ring: 'ring-rose-400/30', icon: 'text-rose-400 bg-rose-400/15' },
  info: { Icon: Info, ring: 'ring-cyan/30', icon: 'text-cyan bg-cyan/15' },
}

export default function Toaster() {
  const { toasts, dismissToast } = useApp()
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 md:inset-x-auto md:right-6 md:top-6 md:items-end"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const s = styles[t.type] ?? styles.info
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className={`glass pointer-events-auto flex w-full max-w-sm items-start gap-3 !rounded-2xl p-3.5 pr-2 ring-1 ${s.ring}`}
              role="status"
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${s.icon}`}>
                <s.Icon size={18} />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.message && <p className="mt-0.5 text-[13px] leading-snug text-muted">{t.message}</p>}
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="rounded-lg p-1.5 text-muted transition hover:bg-fg/5 hover:text-fg"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
