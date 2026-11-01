import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useApp()
  const dark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-line/10 bg-fg/[0.04] text-fg transition hover:bg-fg/[0.08] ${className}`}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, opacity: 0, rotate: -60 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 60 }}
          transition={{ duration: 0.22 }}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
