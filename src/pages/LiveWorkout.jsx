import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Check, CheckCircle2, ChevronDown, Clock, Dumbbell, Flag, Flame, Layers, Library, Loader2, Pause, Play, Plus, SkipForward, Trophy } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { Skeleton, SkeletonCard } from '../components/Skeleton'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { workoutSummary } from '../lib/workout'

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function celebrate() {
  const colors = ['#C6FF3D', '#22D3EE', '#ffffff', '#A78BFA']
  confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 }, colors, zIndex: 100 })
  const end = Date.now() + 1800
  ;(function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors, zIndex: 100 })
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors, zIndex: 100 })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

function RestTimer({ rest, onPause, onAdjust, onSkip, elapsed, started, nextLabel }) {
  const size = 280
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const active = rest && rest.remaining > 0
  const pct = active ? rest.remaining / rest.total : 0
  const urgent = active && rest.remaining <= 5

  return (
    <div className="glass flex flex-col items-center p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgb(var(--lime)/0.12),transparent_60%)]" />
      <div className="relative flex w-full items-center justify-between text-sm">
        <span className="chip"><Clock size={13} /> {started ? fmt(elapsed) : 'Not started'}</span>
        <span className="label">{active ? 'Rest' : 'Ready'}</span>
      </div>

      <div className="relative mt-4 w-full max-w-[280px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full -rotate-90">
          <defs>
            <linearGradient id="restGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={urgent ? '#FB7185' : '#C6FF3D'} />
              <stop offset="1" stopColor={urgent ? '#F97316' : '#22D3EE'} />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: 'rgb(var(--line) / 0.08)' }} strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#restGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 10px rgb(var(--lime) / 0.5))' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div key="rest" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <motion.p
                  key={rest.remaining}
                  initial={{ y: -6, opacity: 0.4 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`font-display text-7xl font-bold tabular-nums ${urgent ? 'text-rose-400' : ''}`}
                >
                  {fmt(rest.remaining)}
                </motion.p>
                <p className="mt-1 text-sm text-muted">{rest.paused ? 'Paused' : 'Breathe. Recover.'}</p>
              </motion.div>
            ) : (
              <motion.div key="ready" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="px-8">
                <p className="font-display text-4xl font-bold">Let’s go</p>
                <p className="mt-2 text-sm text-muted">{nextLabel}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative mt-6 flex items-center gap-3">
        <button className="btn-ghost !h-12 !w-14 !px-0 text-xs" onClick={() => onAdjust(-15)} disabled={!active}>
          −15
        </button>
        <button
          className="btn-primary !h-16 !w-16 !rounded-full !p-0"
          onClick={onPause}
          disabled={!active}
          aria-label={rest?.paused ? 'Resume timer' : 'Pause timer'}
        >
          {rest?.paused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
        </button>
        <button className="btn-ghost !h-12 !w-14 !px-0 text-xs" onClick={() => onAdjust(15)} disabled={!active}>
          +15
        </button>
        <button className="btn-ghost !h-12 !w-12 !px-0" onClick={onSkip} disabled={!active} aria-label="Skip rest">
          <SkipForward size={18} />
        </button>
      </div>
    </div>
  )
}

function ExerciseBlock({ ex, index, open, onOpen, onTick, locked }) {
  const completed = ex.sets.filter((s) => s.completed).length
  const finished = completed === ex.sets.length
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass !rounded-2xl transition ${open ? 'ring-1 ring-lime/30' : ''}`}
    >
      <button onClick={onOpen} className="flex w-full items-center gap-4 p-4 text-left" aria-expanded={open}>
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display font-bold transition ${
            finished ? 'bg-gradient-brand text-onaccent' : 'bg-fg/[0.06]'
          }`}
        >
          {finished ? <Check size={20} strokeWidth={3} /> : index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`truncate font-semibold ${finished ? 'text-muted line-through decoration-lime/60' : ''}`}>{ex.name}</p>
          <p className="text-xs text-muted">
            {ex.sets.length} sets × {ex.reps} · {ex.muscleGroup} · {ex.restSeconds}s rest
          </p>
        </div>
        <span className="text-xs font-semibold tabular-nums text-muted">
          {completed}/{ex.sets.length}
        </span>
        <ChevronDown size={18} className={`text-muted transition ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-4">
              {ex.sets.map((set) => (
                <motion.button
                  key={set.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => onTick(ex, set)}
                  disabled={locked}
                  data-set-id={set.id}
                  className={`relative flex flex-col items-center gap-1 rounded-2xl border p-3 transition ${
                    set.completed
                      ? 'border-lime/40 bg-lime/[0.12] text-ink'
                      : 'border-line/10 bg-fg/[0.03] hover:border-lime/30 hover:bg-fg/[0.06]'
                  }`}
                  aria-pressed={set.completed}
                  aria-label={`${ex.name} set ${set.setNumber}`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Set {set.setNumber}</span>
                  <span className="font-display text-lg font-bold">{ex.reps}</span>
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full border-2 transition ${
                      set.completed ? 'border-transparent bg-gradient-brand text-onaccent' : 'border-line/20'
                    }`}
                  >
                    {set.completed && <Check size={14} strokeWidth={3} />}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CompleteModal({ workout, streak, onClose }) {
  const s = workoutSummary(workout)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-bg/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-title"
    >
      <motion.div
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="glass w-full max-w-md p-8 text-center"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(var(--lime)/0.25),transparent_60%)]" />
        <motion.div
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.15 }}
          className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_20px_50px_-10px_rgba(251,191,36,0.6)]"
        >
          <Trophy size={38} className="text-white" />
        </motion.div>
        <h2 id="complete-title" className="relative mt-6 text-3xl font-bold">Workout complete!</h2>
        <p className="relative mt-2 text-muted">
          {workout.name} crushed.
          {streak > 0 && (
            <>
              {' '}Your streak is now <span className="font-semibold text-fg">{streak} day{streak === 1 ? '' : 's'}</span> 🔥
            </>
          )}
        </p>
        <div className="relative mt-6 grid grid-cols-3 gap-2">
          {[
            { icon: Clock, label: 'Minutes', value: workout.durationMinutes ?? '–' },
            { icon: Check, label: 'Sets', value: `${s.doneSets}/${s.totalSets}` },
            { icon: Dumbbell, label: 'Exercises', value: workout.exercises.length },
          ].map(({ icon: I, label, value }) => (
            <div key={label} className="rounded-2xl border border-line/[0.07] bg-fg/[0.03] p-3">
              <I size={16} className="mx-auto text-ink" />
              <p className="mt-1 font-display text-lg font-bold tabular-nums">{value}</p>
              <p className="text-[11px] text-muted">{label}</p>
            </div>
          ))}
        </div>
        <div className="relative mt-6 flex flex-col gap-2 sm:flex-row">
          <Link to="/dashboard" className="btn-primary flex-1">See your dashboard</Link>
          <button className="btn-ghost flex-1" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function CompletedCard({ workout }) {
  const s = workoutSummary(workout)
  return (
    <div className="glass relative overflow-hidden p-8 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(var(--lime)/0.18),transparent_60%)]" />
      <CheckCircle2 size={44} className="relative mx-auto text-ink" />
      <h2 className="relative mt-4 text-2xl font-bold">{workout.name} — done for today</h2>
      <p className="relative mt-2 text-muted">
        {workout.durationMinutes} min · {s.doneSets}/{s.totalSets} sets · {workout.exercises.length} exercises. Rest up, or plan another round.
      </p>
      <div className="relative mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/dashboard" className="btn-primary">See your dashboard</Link>
        <Link to="/workouts" className="btn-ghost"><Plus size={16} /> Plan another workout</Link>
      </div>
    </div>
  )
}

function LiveSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-9 w-64" />
      <SkeletonCard className="mt-6 h-16 !rounded-2xl" lines={0} />
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
        <SkeletonCard className="h-[440px]">
          <Skeleton className="mx-auto mt-6 aspect-square w-full max-w-[240px] !rounded-full" />
        </SkeletonCard>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} className="h-20 !rounded-2xl" lines={0} />)}
        </div>
      </div>
    </div>
  )
}

const allSets = (w) => w?.exercises.flatMap((e) => e.sets) ?? []
const firstOpenExercise = (w) => w?.exercises.find((e) => e.sets.some((s) => !s.completed))

export default function LiveWorkout() {
  const { toast } = useApp()
  const { refresh: refreshUser, user } = useAuth()
  const { data, error, loading, reload, setData } = useApi('/workouts')
  const workout = data?.workout ?? null
  const [openId, setOpenId] = useState(null)
  const [rest, setRest] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [finishing, setFinishing] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const inFlight = useRef(new Set())
  const endEarlyArmed = useRef(false)

  const setWorkout = useCallback((update) => setData((d) => ({ ...d, workout: update(d.workout) })), [setData])

  // open the first unfinished exercise once loaded
  useEffect(() => {
    if (workout && openId === null) setOpenId(firstOpenExercise(workout)?.workoutExerciseId ?? workout.exercises[0]?.workoutExerciseId ?? null)
  }, [workout, openId])

  const started = Boolean(workout?.startedAt) && workout?.status !== 'completed'
  useEffect(() => {
    if (!started) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [started])
  const elapsed = started ? Math.max(0, Math.floor((now - new Date(workout.startedAt).getTime()) / 1000)) : 0

  // rest countdown
  useEffect(() => {
    if (!rest || rest.paused || rest.remaining <= 0) return
    const id = setInterval(() => {
      setRest((r) => (r && !r.paused ? { ...r, remaining: Math.max(0, r.remaining - 1) } : r))
    }, 1000)
    return () => clearInterval(id)
  }, [rest?.paused, rest?.remaining > 0]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (rest && rest.remaining === 0 && !rest.notified) {
      setRest((r) => ({ ...r, notified: true }))
      navigator.vibrate?.([120, 60, 120])
      toast({ type: 'info', title: 'Rest’s over ⚡', message: 'Time for your next set.' })
    }
  }, [rest, toast])

  const finish = useCallback(async () => {
    if (!workout || finishing) return
    setFinishing(true)
    setRest(null)
    try {
      await Promise.allSettled([...inFlight.current]) // make sure every tick is saved first
      const { workout: done } = await api('/workouts', { method: 'PATCH', body: { workoutId: workout.id, action: 'finish' } })
      setData((d) => ({ ...d, workout: done }))
      setShowComplete(true)
      celebrate()
      refreshUser() // updates the streak in the navbar
    } catch (err) {
      toast({ type: 'error', title: 'Couldn’t save your workout', message: err.message })
    } finally {
      setFinishing(false)
    }
  }, [workout, finishing, setData, refreshUser, toast])

  const onTick = (ex, set) => {
    const completed = !set.completed
    const flip = (value) => (w) => ({
      ...w,
      exercises: w.exercises.map((e) => ({ ...e, sets: e.sets.map((s) => (s.id === set.id ? { ...s, completed: value } : s)) })),
    })

    // optimistic: update the UI now, save in the background, roll back on failure
    setWorkout(flip(completed))
    const req = api('/sets', { method: 'PATCH', body: { setId: set.id, completed } })
      .then(({ startedAt }) => {
        if (startedAt) setWorkout((w) => ({ ...w, status: 'in_progress', startedAt }))
      })
      .catch((err) => {
        setWorkout(flip(!completed))
        toast({ type: 'error', title: 'That set didn’t save', message: err.message })
      })
      .finally(() => inFlight.current.delete(req))
    inFlight.current.add(req)
    if (!completed) return

    // first tick starts the workout clock right away (server confirms started_at)
    if (!workout.startedAt) setWorkout((w) => ({ ...w, status: 'in_progress', startedAt: new Date().toISOString() }))

    const next = flip(true)(workout)
    if (allSets(next).every((s) => s.completed)) {
      finish()
      return
    }
    setRest({ remaining: ex.restSeconds, total: ex.restSeconds, paused: false })
    if (ex.sets.every((s) => s.id === set.id || s.completed)) {
      const nextEx = firstOpenExercise(next)
      if (nextEx) setOpenId(nextEx.workoutExerciseId)
    }
  }

  const endWorkout = () => {
    const done = allSets(workout).filter((s) => s.completed).length
    const total = allSets(workout).length
    if (done === 0) {
      toast({ type: 'error', title: 'Not so fast!', message: 'Tick off at least one set before ending your workout.' })
      return
    }
    if (done < total && !endEarlyArmed.current) {
      endEarlyArmed.current = true
      toast({
        type: 'error',
        title: `${total - done} sets still to go`,
        message: 'Tap “End workout” again to finish early. No judgement — rest is training too.',
      })
      setTimeout(() => (endEarlyArmed.current = false), 4000)
      return
    }
    finish()
  }

  const modal = createPortal(
    <AnimatePresence>
      {showComplete && workout && <CompleteModal workout={workout} streak={user?.streak ?? 0} onClose={() => setShowComplete(false)} />}
    </AnimatePresence>,
    document.body,
  )

  if (error && !data) return <ErrorState error={error} onRetry={reload} />
  if (loading && !data) return <LiveSkeleton />

  if (!workout || workout.exercises.length === 0) {
    return (
      <div className="mx-auto max-w-lg pt-6">
        <EmptyState
          icon={Dumbbell}
          title="No workout yet today"
          message="Pick one from the Library! Add a few exercises and come back here to train."
          action={
            <Link to="/workouts" className="btn-primary">
              <Library size={16} /> Open the Library
            </Link>
          }
        />
      </div>
    )
  }

  if (workout.status === 'completed') {
    return (
      <>
        <CompletedCard workout={workout} />
        {modal}
      </>
    )
  }

  const s = workoutSummary(workout)
  const progress = s.totalSets ? s.doneSets / s.totalSets : 0
  const nextEx = firstOpenExercise(workout)

  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
            Live workout
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{workout.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-muted">
            <span>{s.focus}</span>
            <span className="flex items-center gap-1"><Layers size={14} /> {workout.exercises.length} exercises</span>
            <span className="flex items-center gap-1"><Flame size={14} /> ~{s.estMinutes} min</span>
          </p>
        </div>
        <button className="btn-ghost self-start md:self-auto" onClick={endWorkout} disabled={finishing}>
          {finishing ? <Loader2 size={16} className="animate-spin" /> : <Flag size={16} />} {finishing ? 'Saving…' : 'End workout'}
        </button>
      </header>

      <div className="glass mb-5 !rounded-2xl p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold">
            {s.doneSets} of {s.totalSets} sets
          </span>
          <span className="text-muted">{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-fg/[0.07]">
          <motion.div
            className="h-full rounded-full bg-gradient-brand shadow-glow"
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="lg:sticky lg:top-10 lg:self-start">
          <RestTimer
            rest={rest}
            elapsed={elapsed}
            started={started}
            nextLabel={nextEx ? `Up next: ${nextEx.name}` : 'All sets done!'}
            onPause={() => setRest((r) => r && { ...r, paused: !r.paused })}
            onAdjust={(d) => setRest((r) => r && { ...r, remaining: Math.max(1, r.remaining + d), total: Math.max(r.total, r.remaining + d) })}
            onSkip={() => setRest(null)}
          />
          <p className="mt-3 text-center text-xs text-muted">
            Tap a set when you finish it — it saves instantly and rest starts automatically.
          </p>
        </div>

        <div className="space-y-3">
          {workout.exercises.map((ex, i) => (
            <ExerciseBlock
              key={ex.workoutExerciseId}
              ex={ex}
              index={i}
              locked={finishing}
              open={openId === ex.workoutExerciseId}
              onOpen={() => setOpenId(openId === ex.workoutExerciseId ? -1 : ex.workoutExerciseId)}
              onTick={onTick}
            />
          ))}
        </div>
      </div>
      {modal}
    </div>
  )
}
