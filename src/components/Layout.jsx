import { NavLink, Link, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Dumbbell, Flame, LayoutGrid, LineChart, LogIn, LogOut, Play, User } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import ErrorBoundary from './ErrorBoundary'
import { useAuth, initialsOf } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/live', label: 'Live Workout', icon: Play },
  { to: '/progress', label: 'Progress', icon: LineChart },
  { to: '/classes', label: 'Classes', icon: CalendarDays },
  { to: '/profile', label: 'Profile', icon: User },
]

function Avatar({ initials, size = 'h-10 w-10', text = 'text-sm' }) {
  return (
    <span className={`relative grid shrink-0 place-items-center rounded-full bg-gradient-brand p-[2px] ${size}`}>
      <span className={`grid h-full w-full place-items-center rounded-full bg-bg2 font-display font-bold ${text}`}>
        {initials}
      </span>
    </span>
  )
}

function useLogout() {
  const { logout } = useAuth()
  const { toast } = useApp()
  const navigate = useNavigate()
  return async () => {
    await logout()
    toast({ type: 'info', title: 'Logged out', message: 'See you at your next session 👋' })
    navigate('/')
  }
}

function LogoutButton({ className = '' }) {
  const onLogout = useLogout()
  return (
    <button
      onClick={onLogout}
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line/10 bg-fg/[0.04] text-muted transition hover:bg-rose-400/10 hover:text-rose-400 ${className}`}
      aria-label="Log out"
      title="Log out"
    >
      <LogOut size={17} />
    </button>
  )
}

function Sidebar() {
  const { user } = useAuth()
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line/[0.07] bg-bg/70 p-5 backdrop-blur-xl lg:flex">
      <div className="flex items-center justify-between px-2 pb-8 pt-2">
        <Logo to="/" />
        <ThemeToggle />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: I }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive ? 'text-fg' : 'text-muted hover:bg-fg/[0.04] hover:text-fg'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl border border-lime/20 bg-lime/[0.08]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <I size={19} className={`relative ${isActive ? 'text-ink' : ''}`} />
                <span className="relative">{label}</span>
                {to === '/live' && (
                  <span className="relative ml-auto h-2 w-2 rounded-full bg-lime shadow-[0_0_12px_rgb(var(--lime))]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {user ? (
        <>
          <div className="glass mb-4 !rounded-2xl p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Flame size={18} className="text-orange-400" /> {user.streak}-day streak
            </div>
            <p className="mt-1 text-xs text-muted">
              {user.streak ? 'Train today to keep it alive.' : 'Finish a workout to start one.'}
            </p>
          </div>

          <div className="flex items-center gap-2 px-1">
            <Link to="/profile" className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1 transition hover:bg-fg/[0.04]">
              <Avatar initials={initialsOf(user.fullName)} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.fullName}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </Link>
            <LogoutButton />
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="glass !rounded-2xl p-4">
            <p className="text-sm font-semibold">Track every rep</p>
            <p className="mt-1 text-xs text-muted">Log in to save workouts and build your streak.</p>
            <Link to="/login" className="btn-primary mt-3 w-full !py-2.5">
              <LogIn size={16} /> Log in
            </Link>
          </div>
        </div>
      )}
    </aside>
  )
}

function MobileTopBar() {
  const { user } = useAuth()
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line/[0.06] bg-bg/75 px-4 py-3 backdrop-blur-xl lg:hidden">
      <Logo to="/" size="sm" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <>
            <LogoutButton />
            <Link to="/profile" aria-label={`Profile of ${user.fullName}`} title={user.fullName}>
              <Avatar initials={initialsOf(user.fullName)} size="h-10 w-10" text="text-xs" />
            </Link>
          </>
        ) : (
          <Link to="/login" className="btn-primary !px-4 !py-2.5">
            Log in
          </Link>
        )}
      </div>
    </header>
  )
}

const mobileItems = navItems.filter((n) => n.to !== '/profile')

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/[0.07] bg-bg/80 backdrop-blur-xl pb-safe lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 px-2">
        {mobileItems.map(({ to, label, icon: I }) =>
          to === '/live' ? (
            <NavLink key={to} to={to} className="relative -mt-6 flex flex-col items-center" aria-label={label}>
              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-onaccent shadow-glow transition ${
                      isActive ? 'scale-105' : ''
                    }`}
                  >
                    <Play size={22} fill="currentColor" />
                  </span>
                  <span className="mt-1 text-[10px] font-semibold text-muted">Live</span>
                </>
              )}
            </NavLink>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition ${
                  isActive ? 'text-ink' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="bottom-active"
                      className="absolute top-0 h-[3px] w-8 rounded-full bg-gradient-brand"
                    />
                  )}
                  <I size={21} />
                  {label}
                </>
              )}
            </NavLink>
          ),
        )}
      </div>
    </nav>
  )
}

export default function Layout() {
  const location = useLocation()
  const outlet = useOutlet()
  return (
    <div className="noise relative min-h-[100dvh]">
      {/* ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-lime/[0.07] blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[520px] w-[520px] rounded-full bg-cyan/[0.07] blur-[120px]" />
      </div>

      <Sidebar />
      <MobileTopBar />

      <main className="relative z-10 pb-28 lg:pb-12 lg:pl-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-10 lg:pt-10"
          >
            <ErrorBoundary>{outlet}</ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  )
}

export { Avatar }
