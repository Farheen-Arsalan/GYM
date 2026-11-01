import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarDays, CheckCircle2, ChevronRight, Clock, Dumbbell, Flame, Layers, Library, Play, Plus, Timer } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import ProgressRing from '../components/ProgressRing'
import AnimatedCounter from '../components/AnimatedCounter'
import QuoteCard from '../components/QuoteCard'
import DifficultyBadge from '../components/DifficultyBadge'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { Skeleton, SkeletonCard } from '../components/Skeleton'
import { useApp, useChartColors } from '../context/AppContext'
import { useApi } from '../lib/useApi'
import { workoutSummary } from '../lib/workout'
import { classSchedule, classTypes, weekDays } from '../data/mock'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="glass !rounded-xl px-3 py-2 text-xs">
      <p className="font-semibold">{label}</p>
      {d.minutes ? (
        <p className="text-muted">
          {d.minutes} min · {d.workouts} workout{d.workouts === 1 ? '' : 's'}
        </p>
      ) : (
        <p className="text-muted">Rest day</p>
      )}
    </div>
  )
}

function TodaysWorkout({ workout }) {
  if (!workout || workout.exercises.length === 0) {
    return (
      <GlassCard delay={0.05} hover={false} className="p-0 lg:col-span-2">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime/15 blur-3xl" />
        <div className="relative flex flex-col items-start gap-5 p-6 md:flex-row md:items-center md:p-7">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-line/10 bg-fg/[0.04]">
            <Dumbbell className="text-ink" size={28} />
          </span>
          <div className="flex-1">
            <span className="chip !border-lime/25 !bg-lime/10 text-ink">Today’s workout</span>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">No workout yet today.</h2>
            <p className="mt-1 text-muted">Pick one from the Library! Add a few exercises and they’ll show up here.</p>
          </div>
          <Link to="/workouts" className="btn-primary !px-6 !py-3.5">
            <Library size={17} /> Open Library
          </Link>
        </div>
      </GlassCard>
    )
  }

  const s = workoutSummary(workout)
  const completed = workout.status === 'completed'
  return (
    <GlassCard delay={0.05} hover={false} className="p-0 lg:col-span-2">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime/15 blur-3xl" />
      <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-7">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip !border-lime/25 !bg-lime/10 text-ink">
              {completed ? <CheckCircle2 size={13} /> : <Dumbbell size={13} />}
              {completed ? 'Completed today' : workout.status === 'in_progress' ? 'In progress' : 'Today’s workout'}
            </span>
            <DifficultyBadge level={s.difficulty} />
          </div>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">{workout.name}</h2>
          <p className="mt-1 text-muted">{s.focus}</p>

          <div className="mt-5 flex flex-wrap gap-5 text-sm">
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-ink" />
              {completed ? `${workout.durationMinutes} min` : `~${s.estMinutes} min`}
            </span>
            <span className="flex items-center gap-2"><Layers size={16} className="text-orange-400" /> {s.doneSets}/{s.totalSets} sets</span>
            <span className="flex items-center gap-2"><Timer size={16} className="text-cyan" /> {workout.exercises.length} exercises</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {completed ? (
              <Link to="/workouts" className="btn-primary !px-7 !py-3.5">
                <Plus size={17} /> Plan another
              </Link>
            ) : (
              <Link to="/live" className="btn-primary !px-7 !py-3.5">
                <Play size={17} fill="currentColor" /> {workout.status === 'in_progress' ? 'Continue' : 'Start'}
              </Link>
            )}
            {!completed && (
              <Link to="/workouts" className="btn-ghost !py-3.5">
                <Plus size={16} /> Add exercises
              </Link>
            )}
          </div>
        </div>

        <ol className="w-full space-y-2 md:max-w-xs">
          {workout.exercises.map((e, i) => {
            const done = e.sets.filter((x) => x.completed).length
            return (
              <motion.li
                key={e.workoutExerciseId}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="flex items-center gap-3 rounded-2xl border border-line/[0.06] bg-fg/[0.03] px-3 py-2.5"
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-display text-xs font-bold ${
                    done === e.sets.length ? 'bg-gradient-brand text-onaccent' : 'bg-fg/[0.06]'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{e.name}</span>
                <span className="text-xs tabular-nums text-muted">
                  {e.sets.length}×{e.reps}
                </span>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </GlassCard>
  )
}

function StreakCard({ streak, activity }) {
  return (
    <GlassCard delay={0.1} className="p-6">
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl" />
      <p className="label">Current streak</p>
      <div className="mt-3 flex items-center gap-4">
        <motion.span
          animate={streak ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : {}}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className={`grid h-16 w-16 place-items-center rounded-2xl ${
            streak
              ? 'bg-gradient-to-br from-amber-300 via-orange-500 to-rose-500 shadow-[0_10px_40px_-8px_rgba(249,115,22,0.7)]'
              : 'border border-dashed border-line/20 bg-fg/[0.04]'
          }`}
        >
          <Flame size={32} className={streak ? 'text-white' : 'text-muted'} fill={streak ? 'currentColor' : 'none'} />
        </motion.span>
        <div>
          <p className="font-display text-5xl font-bold leading-none">
            <AnimatedCounter value={streak} duration={1.4} />
          </p>
          <p className="mt-1 text-sm text-muted">
            {streak === 1 ? 'day' : 'days'} in a row{streak ? '' : ' — finish a workout to start'}
          </p>
        </div>
      </div>
      <div className="mt-6 flex justify-between gap-1.5">
        {activity.map((d, i) => {
          const done = d.workouts > 0
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5" title={`${d.day}: ${d.minutes} min`}>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05, type: 'spring', stiffness: 400 }}
                className={`grid h-8 w-full max-w-[34px] place-items-center rounded-lg text-[10px] ${
                  done ? 'bg-gradient-to-br from-amber-300 to-orange-500 text-white' : 'border border-dashed border-line/15 text-muted'
                }`}
              >
                {done ? <Flame size={13} fill="currentColor" /> : ''}
              </motion.span>
              <span className="text-[10px] text-muted">{d.day[0]}</span>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

function RingsCard({ week }) {
  const c = useChartColors()
  const rings = [
    { key: 'workouts', label: 'Workouts', done: week.workouts, target: week.goalWorkouts, unit: '', colors: [c.lime, c.cyan] },
    { key: 'minutes', label: 'Active min', done: week.minutes, target: week.goalMinutes, unit: 'm', colors: [c.cyan, c.violet] },
    { key: 'goals', label: 'Goals hit', done: week.goalDays, target: week.goalWorkouts, unit: '', colors: ['#FBBF24', '#F97316'], note: `days with ${week.dailyTarget}+ min` },
  ]
  return (
    <GlassCard delay={0.15} className="p-6 lg:col-span-2">
      <div className="flex items-center justify-between">
        <p className="label">This week</p>
        <Link to="/workouts" className="-my-3 flex items-center gap-1 py-3 text-xs font-semibold text-ink hover:underline">
          Plan a workout <ChevronRight size={14} />
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-6">
        {rings.map((g, i) => (
          <div key={g.key} className="flex flex-col items-center text-center">
            <div className="hidden sm:block">
              <ProgressRing value={g.done} max={g.target} size={128} stroke={11} colors={g.colors} delay={0.3 + i * 0.15}>
                <RingLabel g={g} />
              </ProgressRing>
            </div>
            <div className="sm:hidden">
              <ProgressRing value={g.done} max={g.target} size={92} stroke={9} colors={g.colors} delay={0.3 + i * 0.15}>
                <RingLabel g={g} small />
              </ProgressRing>
            </div>
            <p className="mt-3 text-sm font-semibold">{g.label}</p>
            <p className="text-xs text-muted">{g.note ?? `${Math.min(100, Math.round((g.done / g.target) * 100))}% of goal`}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

function RingLabel({ g, small }) {
  return (
    <div>
      <p className={`font-display font-bold leading-none ${small ? 'text-xl' : 'text-3xl'}`}>
        <AnimatedCounter value={g.done} duration={1.4} />
        <span className="text-muted">{g.unit}</span>
      </p>
      <p className="mt-1 text-[10px] text-muted">/ {g.target}{g.unit}</p>
    </div>
  )
}

function ActivityChart({ activity, previousWeekMinutes }) {
  const c = useChartColors()
  const total = activity.reduce((s, d) => s + d.minutes, 0)
  const change = previousWeekMinutes > 0 ? Math.round(((total - previousWeekMinutes) / previousWeekMinutes) * 100) : null
  return (
    <GlassCard delay={0.2} hover={false} className="p-6 lg:col-span-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="label">Last 7 days</p>
          <p className="mt-2 font-display text-3xl font-bold">
            <AnimatedCounter value={total} /> <span className="text-base font-medium text-muted">active minutes</span>
          </p>
        </div>
        {change !== null && (
          <span className={`chip ${change >= 0 ? 'text-ink' : 'text-muted'}`}>
            {change >= 0 ? '+' : ''}{change}% vs previous 7 days
          </span>
        )}
      </div>
      <div className="relative mt-6 h-56">
        {total === 0 && (
          <p className="absolute inset-x-0 top-1/3 z-10 text-center text-sm text-muted">
            Finish a workout and your minutes will show up here.
          </p>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activity} margin={{ top: 8, right: 0, left: -8, bottom: 0 }} barCategoryGap="28%">
            <defs>
              <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.lime} />
                <stop offset="100%" stopColor={c.cyan} stopOpacity={0.55} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 6" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} tickLine={false} width={44} allowDecimals={false} domain={[0, (max) => Math.max(30, max)]} tickFormatter={(v) => `${v}m`} />
            <Tooltip cursor={{ fill: c.grid }} content={<ChartTooltip />} />
            <Bar dataKey="minutes" radius={[4, 4, 0, 0]} animationDuration={1200} animationEasing="ease-out">
              {activity.map((d) => (
                <Cell key={d.date} fill={d.minutes ? 'url(#barFill)' : c.grid} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}

function NextClassCard() {
  const { booked } = useApp()
  const next = weekDays
    .flatMap((day) => classSchedule[day].map((c) => ({ ...c, day })))
    .find((c) => booked.has(c.id))

  if (!next) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No classes booked"
        message="Grab a spot in a Yoga, HIIT, Spin or Boxing session."
        action={<Link to="/classes" className="btn-primary">Browse classes</Link>}
      />
    )
  }

  const t = classTypes[next.type]
  return (
    <GlassCard delay={0.25} className="p-6">
      <p className="label">Your next class</p>
      <div className="mt-4 flex items-center gap-4">
        <span
          className="grid h-14 w-14 place-items-center rounded-2xl font-display text-sm font-bold"
          style={{ background: t.soft, color: t.color }}
        >
          {next.type}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">{next.title}</p>
          <p className="text-sm text-muted">
            {next.day} · {next.time} · {next.duration} min
          </p>
          <p className="text-xs text-muted">with {next.coach}</p>
        </div>
      </div>
      <Link to="/classes" className="btn-ghost mt-5 w-full">
        View schedule <ChevronRight size={16} />
      </Link>
    </GlassCard>
  )
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
      <SkeletonCard className="h-72 lg:col-span-2" lines={4} />
      <SkeletonCard className="h-72" />
      <SkeletonCard className="h-64 lg:col-span-2">
        <Skeleton className="h-3 w-24" />
        <div className="mt-6 grid grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="mx-auto aspect-square w-full max-w-[128px] !rounded-full" />
          ))}
        </div>
      </SkeletonCard>
      <SkeletonCard className="h-64" />
    </div>
  )
}

function subtitleFor(d) {
  const left = d.week.goalWorkouts - d.week.workouts
  if (d.todaysWorkout?.status === 'completed') return 'Workout done for today — great job. Recovery counts too.'
  if (left <= 0) return 'Weekly workout goal smashed. Anything extra is a bonus 🔥'
  return `You’re ${left} workout${left === 1 ? '' : 's'} away from hitting your weekly goal. Let’s go.`
}

export default function Dashboard() {
  const { data, error, loading, reload } = useApi('/dashboard')
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div>
      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
        <p className="label">{date}</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
          {greeting()}
          {data && (
            <>
              , <span className="text-gradient">{data.firstName}</span>
            </>
          )}
        </h1>
        <p className="mt-1 min-h-[1.5rem] text-muted">{data ? subtitleFor(data) : ''}</p>
      </motion.header>

      {error && !data ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading && !data ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
          <TodaysWorkout workout={data.todaysWorkout} />
          <StreakCard streak={data.streak} activity={data.activity} />
          <RingsCard week={data.week} />
          <NextClassCard />
          <ActivityChart activity={data.activity} previousWeekMinutes={data.previousWeekMinutes} />
          <QuoteCard delay={0.3} />
        </div>
      )}
    </div>
  )
}
