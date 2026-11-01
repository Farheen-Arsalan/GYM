import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Flame, LogOut, Play, Sparkles, Star, Trophy, Zap } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import AnimatedCounter from '../components/AnimatedCounter'
import ProgressRing from '../components/ProgressRing'
import QuoteCard from '../components/QuoteCard'
import Icon from '../components/Icon'
import { Skeleton } from '../components/Skeleton'
import { useAuth, initialsOf } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { api } from '../lib/api'
// the phone mockup is a marketing illustration, so it keeps its sample data
import { features, todaysWorkout, user, weeklyActivity } from '../data/mock'

const statLabels = [
  { key: 'members', label: 'Members' },
  { key: 'workoutsCompleted', label: 'Workouts completed' },
  { key: 'classesThisWeek', label: 'Classes this week' },
]

function useLandingStats() {
  const [stats, setStats] = useState(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let alive = true
    api('/stats')
      .then((s) => alive && setStats(s))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])
  return { stats, failed }
}

function NavAuth() {
  const { user, loading, logout } = useAuth()
  const { toast } = useApp()
  const navigate = useNavigate()
  if (loading) return <Skeleton className="h-10 w-32" />
  if (!user) {
    return (
      <>
        <Link to="/login" className="btn-ghost !px-4 !py-2.5">Log in</Link>
        <Link to="/signup" className="btn-primary hidden !px-4 !py-2.5 sm:inline-flex">Sign up</Link>
      </>
    )
  }
  return (
    <>
      <Link to="/dashboard" className="btn-ghost !py-2 !pl-2 !pr-4" title="Open your dashboard">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-brand font-display text-[11px] font-bold text-onaccent">
          {initialsOf(user.fullName)}
        </span>
        <span className="hidden max-w-[10rem] truncate sm:inline">{user.fullName}</span>
      </Link>
      <button
        onClick={async () => {
          await logout()
          toast({ type: 'info', title: 'Logged out', message: 'See you at your next session 👋' })
          navigate('/')
        }}
        className="grid h-10 w-10 place-items-center rounded-xl border border-line/10 bg-fg/[0.04] text-muted transition hover:bg-rose-400/10 hover:text-rose-400"
        aria-label="Log out"
        title="Log out"
      >
        <LogOut size={17} />
      </button>
    </>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}

function HeartbeatLine() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-[38%] h-40 w-full opacity-60"
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hb" x1="0" x2="1">
          <stop offset="0" style={{ stopColor: 'rgb(var(--lime))', stopOpacity: 0 }} />
          <stop offset="0.4" style={{ stopColor: 'rgb(var(--lime))', stopOpacity: 0.7 }} />
          <stop offset="0.7" style={{ stopColor: 'rgb(var(--cyan))', stopOpacity: 0.7 }} />
          <stop offset="1" style={{ stopColor: 'rgb(var(--cyan))', stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <motion.path
        d="M0 90 H380 L410 90 L430 40 L460 140 L490 20 L520 120 L540 90 H760 L780 90 L795 60 L815 115 L835 90 H1200"
        fill="none"
        stroke="url(#hb)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
      />
    </svg>
  )
}

function PhoneMockup() {
  const max = Math.max(...weeklyActivity.map((d) => d.minutes))
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 4 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[340px]"
    >
      <div className="absolute -inset-10 rounded-full bg-gradient-brand opacity-20 blur-3xl animate-pulse-glow" />

      <div className="glass relative !rounded-[2.5rem] p-3">
        <div className="rounded-[2rem] border border-line/[0.06] bg-bg2/80 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">Good morning,</p>
              <p className="font-display text-lg font-bold">{user.firstName} 👋</p>
            </div>
            <span className="chip !border-orange-400/30 !bg-orange-400/10 text-orange-400">
              <Flame size={13} /> {user.streak}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ProgressRing value={78} size={108} stroke={10} delay={0.8}>
              <div>
                <p className="font-display text-2xl font-bold">78%</p>
                <p className="text-[10px] text-muted">weekly goal</p>
              </div>
            </ProgressRing>
            <div className="flex-1 space-y-2.5">
              {[
                ['Workouts', '4 / 5'],
                ['Minutes', '214'],
                ['Calories', '1,990'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-xs">
                  <span className="text-muted">{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-gradient-brand p-[1px]">
            <div className="rounded-2xl bg-bg2 p-4">
              <p className="label !text-[10px]">Today’s workout</p>
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <p className="font-display font-bold">{todaysWorkout.name}</p>
                  <p className="text-xs text-muted">{todaysWorkout.duration} min · {todaysWorkout.exercises.length} exercises</p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-onaccent">
                  <Play size={16} fill="currentColor" />
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex h-20 items-end justify-between gap-2">
            {weeklyActivity.map((d, i) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                <motion.div
                  initial={{ height: 4 }}
                  animate={{ height: Math.max(4, (d.minutes / max) * 60) }}
                  transition={{ delay: 1 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={`w-full rounded-md ${d.minutes ? 'bg-gradient-to-t from-lime/40 to-lime' : 'bg-fg/10'}`}
                />
                <span className="text-[9px] text-muted">{d.day[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3 }}
        className="glass absolute -right-10 -top-6 hidden items-center gap-2 !rounded-2xl px-3 py-2 text-xs font-semibold sm:flex animate-float"
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-400/15 text-amber-400">
          <Trophy size={14} />
        </span>
        New PR · Deadlift 180 kg
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        className="glass absolute -bottom-6 -left-10 hidden items-center gap-2 !rounded-2xl px-3 py-2 text-xs font-semibold sm:flex animate-float [animation-delay:1.5s]"
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan/15 text-cyan">
          <Zap size={14} />
        </span>
        HIIT · 2 spots left
      </motion.div>
    </motion.div>
  )
}

function Marquee() {
  const words = ['Strength', 'HIIT', 'Yoga', 'Spin', 'Boxing', 'Mobility', 'Cardio', 'Recovery']
  const row = [...words, ...words]
  return (
    <div aria-hidden="true" className="relative overflow-hidden border-y border-line/[0.07] py-5 [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
      <motion.div
        className="flex w-max gap-10"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
      >
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-2xl font-bold uppercase tracking-tight text-fg/25 md:text-4xl">
            {w}
            <Sparkles className="text-ink/60" size={20} />
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default function Landing() {
  const { user: authUser } = useAuth()
  const { stats, failed } = useLandingStats()
  const startTo = authUser ? '/dashboard' : '/signup'
  return (
    <div className="noise relative min-h-[100dvh] overflow-x-hidden">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute left-1/2 top-[-260px] h-[640px] w-[900px] -translate-x-1/2 rounded-full bg-lime/[0.12] blur-[140px]" />
        <div className="absolute right-[-200px] top-[300px] h-[500px] w-[500px] rounded-full bg-cyan/[0.12] blur-[140px]" />
      </div>

      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-line/[0.06] bg-bg/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#features" className="transition hover:text-fg">Features</a>
            <Link to="/classes" className="transition hover:text-fg">Classes</Link>
            <Link to="/workouts" className="transition hover:text-fg">Workouts</Link>
            <Link to="/progress" className="transition hover:text-fg">Progress</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NavAuth />
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative z-10">
        <HeartbeatLine />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 md:pt-20 lg:grid-cols-[1.15fr_1fr] lg:pb-28">
          <div>
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
              <span className="chip">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
                </span>
                <span className="font-display font-bold">PulseFit</span>
                <span className="text-muted">· Fall classes now booking</span>
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="mt-6 text-[clamp(2.9rem,9vw,6.2rem)] font-bold leading-[0.95] tracking-[-0.04em]"
            >
              Train smarter.
              <br />
              <span className="text-gradient">Get stronger.</span>
            </motion.h1>

            <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2} className="mt-6 max-w-lg text-lg text-muted">
              PulseFit plans your workouts, tracks every rep, books your favorite classes and keeps you showing up —
              all from your pocket.
            </motion.p>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="mt-8 flex flex-wrap gap-3">
              <Link to={startTo} className="btn-primary group !px-7 !py-4 text-base">
                <Play size={18} fill="currentColor" />
                Start Your Workout
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <Link to="/dashboard" className="btn-ghost !px-7 !py-4 text-base">
                Explore dashboard
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="mt-6 flex items-center gap-3 text-sm text-muted">
              <div className="flex -space-x-2">
                {['#C6FF3D', '#22D3EE', '#A78BFA', '#FB7185'].map((c, i) => (
                  <span key={c} className="grid h-8 w-8 place-items-center rounded-full border-2 border-bg text-[11px] font-bold text-onaccent" style={{ background: c }}>
                    {['JM', 'SK', 'LP', 'DO'][i]}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </span>
              <span>4.9 from 12k reviews</span>
            </motion.div>

            <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4">
              {statLabels.map((s, i) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  custom={5 + i}
                  className="glass !rounded-2xl p-3.5 sm:p-5"
                >
                  <div className="font-display text-xl font-bold sm:text-3xl">
                    {stats ? (
                      <AnimatedCounter value={stats[s.key]} duration={2.2} />
                    ) : failed ? (
                      <span className="text-muted" title="Live stats are unavailable right now">–</span>
                    ) : (
                      <Skeleton className="h-7 w-20 sm:h-9" />
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-muted sm:text-sm">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <PhoneMockup />
        </div>
      </section>

      <Marquee />

      {/* features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl">
          <p className="label">Everything in one place</p>
          <h2 className="mt-3 text-4xl font-bold md:text-5xl">
            Built for the way you <span className="text-gradient">actually train.</span>
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ y: -6 }}
              className="glass group p-6"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-lime/0 blur-2xl transition duration-500 group-hover:bg-lime/20" />
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime/10 text-ink ring-1 ring-lime/20">
                <Icon name={f.icon} size={22} />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <QuoteCard />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-brand p-[1px]"
          >
            <div className="relative h-full overflow-hidden rounded-3xl bg-bg2 p-8">
              <div className="absolute -bottom-20 -right-10 h-60 w-60 rounded-full bg-lime/25 blur-3xl" />
              <h3 className="relative max-w-md text-3xl font-bold">Your next PR is one workout away.</h3>
              <p className="relative mt-2 max-w-md text-muted">
                Jump into today’s session — rest timers, set tracking and confetti included.
              </p>
              <Link to={startTo} className="btn-primary relative mt-6">
                <Play size={16} fill="currentColor" /> Start Your Workout
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* footer */}
      <footer className="relative z-10 border-t border-line/[0.07]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted sm:flex-row sm:px-6">
          <Logo size="sm" />
          <p>© {new Date().getFullYear()} PulseFit. Train smarter. Get stronger.</p>
          <div className="flex gap-5">
            <Link to="/dashboard" className="inline-flex min-h-11 min-w-11 items-center justify-center px-1 hover:text-fg">App</Link>
            <Link to="/classes" className="inline-flex min-h-11 min-w-11 items-center justify-center px-1 hover:text-fg">Classes</Link>
            <Link to="/profile" className="inline-flex min-h-11 min-w-11 items-center justify-center px-1 hover:text-fg">Profile</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
