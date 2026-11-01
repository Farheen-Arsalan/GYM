import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, ChevronRight, Crown, Lock, LogOut, MapPin, Moon, Ruler, Scale, Sparkles, Target } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import AnimatedCounter from '../components/AnimatedCounter'
import Icon from '../components/Icon'
import { useApp } from '../context/AppContext'
import { useAuth, initialsOf } from '../context/AuthContext'
import { achievements, user } from '../data/mock'

function Switch({ on, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className="grid h-11 w-14 shrink-0 place-items-center"
    >
      {/* 44px tap area around a 28px track */}
      <span className={`relative h-7 w-12 rounded-full transition ${on ? 'bg-gradient-brand' : 'bg-fg/15'}`}>
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${on ? 'right-1' : 'left-1'}`}
        />
      </span>
    </button>
  )
}

export default function Profile() {
  const { theme, toggleTheme, toast } = useApp()
  const { user: account, logout } = useAuth()
  const navigate = useNavigate()
  // real account details when logged in; the rest of this page is still sample data
  const name = account?.fullName ?? user.name
  const initials = account ? initialsOf(account.fullName) : user.initials
  const handle = account?.email ?? user.handle
  const [notify, setNotify] = useState(true)
  const unlocked = achievements.filter((a) => a.unlocked).length
  const xpPct = (user.xp / user.nextLevelXp) * 100

  return (
    <div>
      {/* hero */}
      <GlassCard hover={false} className="p-0">
        <div className="relative h-28 overflow-hidden md:h-36">
          <div className="absolute inset-0 bg-gradient-brand opacity-80" />
          <div className="grid-bg absolute inset-0 opacity-60" />
          <svg className="absolute inset-x-0 bottom-3 h-12 w-full opacity-40" viewBox="0 0 600 48" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 H200 L215 30 L225 8 L240 44 L255 4 L270 36 L280 30 H600" fill="none" stroke="#05070a" strokeWidth="2.5" />
          </svg>
        </div>
        <div className="relative px-6 pb-6 md:px-8">
          <div className="-mt-12 flex flex-col gap-4 md:-mt-14 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="relative rounded-full bg-bg p-1.5"
              >
                <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-brand p-[3px] md:h-28 md:w-28">
                  <div className="grid h-full w-full place-items-center rounded-full bg-bg2 font-display text-3xl font-bold">
                    {initials}
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full border-4 border-bg bg-amber-400 font-display text-[11px] font-bold text-black">
                  {user.level}
                </span>
              </motion.div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold md:text-3xl">{name}</h1>
                <p className="text-sm text-muted">{handle} · Member since {user.memberSince}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 self-start rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-400/15 to-orange-500/10 px-4 py-2.5 text-sm font-semibold text-amber-400 md:self-auto">
              <Crown size={17} /> {user.membership}
            </span>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs">
              <span className="font-semibold">Level {user.level}</span>
              <span className="text-muted">
                {user.xp.toLocaleString()} / {user.nextLevelXp.toLocaleString()} XP
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-fg/[0.07]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-brand shadow-glow"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: MapPin, label: 'Home gym', value: user.homeGym },
              { icon: Target, label: 'Goal', value: user.goal },
              { icon: Scale, label: 'Weight', value: user.weight },
              { icon: Ruler, label: 'Height', value: user.height },
            ].map(({ icon: I, label, value }) => (
              <div key={label} className="rounded-2xl border border-line/[0.06] bg-fg/[0.03] p-3">
                <p className="flex items-center gap-1.5 text-[11px] text-muted"><I size={12} /> {label}</p>
                <p className="mt-1 text-sm font-semibold leading-snug">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* stats */}
      <div className="mt-5 grid grid-cols-3 gap-3 md:gap-5">
        {[
          { label: 'Workouts', value: user.totalWorkouts },
          { label: 'Best streak', value: user.bestStreak },
          { label: 'Badges', value: unlocked },
        ].map((s, i) => (
          <GlassCard key={s.label} delay={0.1 + i * 0.05} className="p-4 text-center md:p-6">
            <p className="font-display text-3xl font-bold md:text-4xl">
              <AnimatedCounter value={s.value} />
            </p>
            <p className="text-xs text-muted md:text-sm">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* achievements */}
      <div className="mb-4 mt-10 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <span className="chip"><Sparkles size={13} className="text-ink" /> {unlocked}/{achievements.length} unlocked</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 md:gap-4">
        {achievements.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ y: -5, rotate: a.unlocked ? -1 : 0 }}
            className={`glass group flex flex-col items-center p-5 text-center ${a.unlocked ? '' : 'opacity-70'}`}
          >
            <div className="relative">
              {a.unlocked && <div className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-40 blur-xl transition group-hover:opacity-70" />}
              <div
                className={`relative grid h-16 w-16 place-items-center rounded-2xl ${
                  a.unlocked ? 'bg-gradient-brand text-onaccent' : 'border border-dashed border-line/20 bg-fg/[0.03] text-muted'
                }`}
              >
                <Icon name={a.icon} size={28} />
                {!a.unlocked && (
                  <span className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full border border-line/10 bg-bg2">
                    <Lock size={11} />
                  </span>
                )}
              </div>
            </div>
            <p className="mt-4 font-semibold">{a.name}</p>
            <p className="mt-0.5 text-xs text-muted">{a.desc}</p>
            {!a.unlocked && (
              <div className="mt-3 w-full">
                <div className="h-1.5 overflow-hidden rounded-full bg-fg/[0.07]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${a.progress}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full rounded-full bg-gradient-brand"
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted">{a.progress}%</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* settings */}
      <h2 className="mb-4 mt-10 text-2xl font-bold">Settings</h2>
      <GlassCard hover={false} className="divide-y divide-line/[0.06] !p-0">
        <div className="flex items-center gap-4 p-4 md:px-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-fg/[0.05]"><Moon size={18} /></span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Dark mode</p>
            <p className="text-xs text-muted">Easy on the eyes at 6am.</p>
          </div>
          <Switch on={theme === 'dark'} onChange={toggleTheme} label="Dark mode" />
        </div>
        <div className="flex items-center gap-4 p-4 md:px-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-fg/[0.05]"><Bell size={18} /></span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Workout reminders</p>
            <p className="text-xs text-muted">A nudge when it’s time to train.</p>
          </div>
          <Switch
            on={notify}
            label="Workout reminders"
            onChange={() => {
              setNotify(!notify)
              toast({ type: 'info', title: notify ? 'Reminders paused' : 'Reminders on', message: notify ? 'We’ll stay quiet for now.' : 'We’ll nudge you before each session.' })
            }}
          />
        </div>
        <button
          onClick={async () => {
            if (!account) return navigate('/login')
            await logout()
            toast({ type: 'info', title: 'Logged out', message: 'See you at your next session 👋' })
            navigate('/')
          }}
          className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-fg/[0.03] md:px-6"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-400/10 text-rose-400"><LogOut size={18} /></span>
          <span className="flex-1 text-sm font-semibold">{account ? 'Sign out' : 'Log in'}</span>
          <ChevronRight size={18} className="text-muted" />
        </button>
      </GlassCard>
    </div>
  )
}
