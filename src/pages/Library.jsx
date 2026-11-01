import { forwardRef, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Layers, Loader2, Play, Plus, Repeat, Search, SearchX, Timer } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DifficultyBadge from '../components/DifficultyBadge'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { Skeleton, SkeletonCard } from '../components/Skeleton'
import { useApp } from '../context/AppContext'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { muscleGroups } from '../data/mock'

const muscleAccent = {
  Chest: 'from-lime/30',
  Back: 'from-cyan/30',
  Legs: 'from-violet-400/30',
  Arms: 'from-amber-400/30',
  Core: 'from-rose-400/30',
  Cardio: 'from-sky-400/30',
}

const fmtRest = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`)

function FilterChips({ value, onChange }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {muscleGroups.map((g) => {
        const active = value === g
        return (
          <button
            key={g}
            onClick={() => onChange(g)}
            className={`relative min-h-10 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active ? 'text-onaccent' : 'border border-line/10 bg-fg/[0.04] text-muted hover:text-fg'
            }`}
            aria-pressed={active}
          >
            {active && (
              <motion.span
                layoutId="muscle-filter"
                className="absolute inset-0 rounded-full bg-gradient-brand shadow-glow"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative">{g}</span>
          </button>
        )
      })}
    </div>
  )
}

const ExerciseCard = forwardRef(function ExerciseCard({ ex, added, busy, onToggle }, ref) {
  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className="glass group flex flex-col p-5"
    >
      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${muscleAccent[ex.muscleGroup]} to-transparent blur-2xl opacity-70 transition group-hover:opacity-100`} />
      <div className="relative flex items-start justify-between gap-3">
        <span className="chip">{ex.muscleGroup}</span>
        <DifficultyBadge level={ex.difficulty} />
      </div>
      <h3 className="relative mt-4 text-lg font-semibold leading-tight">{ex.name}</h3>
      <p className="relative mt-1.5 flex-1 text-sm text-muted">{ex.description}</p>

      <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
        {[
          { icon: Layers, label: 'Sets', value: ex.sets },
          { icon: Repeat, label: 'Reps', value: ex.reps },
          { icon: Timer, label: 'Rest', value: fmtRest(ex.restSeconds) },
        ].map(({ icon: I, label, value }) => (
          <div key={label} className="rounded-2xl border border-line/[0.06] bg-fg/[0.03] px-2 py-2.5">
            <I size={14} className="mx-auto text-muted" />
            <p className="mt-1 truncate font-display text-sm font-bold">{value}</p>
            <p className="text-[10px] text-muted">{label}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onToggle}
        disabled={busy}
        className={`relative mt-4 w-full ${added ? 'btn border border-lime/30 bg-lime/10 text-ink' : 'btn-ghost'}`}
        aria-pressed={added}
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : added ? <Check size={16} /> : <Plus size={16} />}
        {added ? 'In today’s workout' : 'Add to today’s workout'}
      </button>
    </motion.article>
  )
})

function LibrarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <SkeletonCard key={i} className="h-[300px]">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-16 !rounded-full" />
            <Skeleton className="h-6 w-24 !rounded-full" />
          </div>
          <Skeleton className="mt-5 h-6 w-3/4" />
          <Skeleton className="mt-3 h-4" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((j) => <Skeleton key={j} className="h-16 !rounded-2xl" />)}
          </div>
          <Skeleton className="mt-4 h-11 !rounded-2xl" />
        </SkeletonCard>
      ))}
    </div>
  )
}

export default function Library() {
  const { toast } = useApp()
  const exercisesReq = useApi('/exercises')
  const workoutReq = useApi('/workouts')
  const [muscle, setMuscle] = useState('All')
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState(() => new Set())

  const exercises = exercisesReq.data?.exercises ?? []
  const workout = workoutReq.data?.workout
  // a finished workout is locked; adding starts a fresh one for today
  const openWorkout = workout && workout.status !== 'completed' ? workout : null
  const inToday = useMemo(() => new Set(openWorkout?.exercises.map((e) => e.exerciseId) ?? []), [openWorkout])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return exercises.filter(
      (e) => (muscle === 'All' || e.muscleGroup === muscle) && (!q || e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)),
    )
  }, [exercises, muscle, query])

  const toggle = async (ex) => {
    if (pending.has(ex.id)) return
    const removing = inToday.has(ex.id)
    setPending((p) => new Set(p).add(ex.id))
    try {
      const { workout } = removing
        ? await api(`/workouts?exerciseId=${ex.id}`, { method: 'DELETE' })
        : await api('/workouts', { method: 'POST', body: { exerciseId: ex.id } })
      workoutReq.setData({ workout })
      toast(
        removing
          ? { type: 'info', title: 'Removed from today’s workout', message: ex.name }
          : { type: 'success', title: 'Added to today’s workout 💪', message: `${ex.name} · ${ex.sets} sets × ${ex.reps}` },
      )
    } catch (err) {
      toast({ type: 'error', title: removing ? 'Couldn’t remove that' : 'Couldn’t add that', message: err.message })
    } finally {
      setPending((p) => {
        const next = new Set(p)
        next.delete(ex.id)
        return next
      })
    }
  }

  const error = exercisesReq.error || workoutReq.error
  const loading = exercisesReq.loading || workoutReq.loading

  return (
    <div>
      <PageHeader
        eyebrow="Workout library"
        title="Find your next move"
        subtitle={`${exercises.length || 30} coach-approved exercises. Filter by muscle group and build today’s workout.`}
        action={
          openWorkout?.exercises.length > 0 && (
            <Link to="/live" className="btn-primary self-start !px-5">
              <Play size={15} fill="currentColor" /> Start · {openWorkout.exercises.length} exercise{openWorkout.exercises.length === 1 ? '' : 's'}
            </Link>
          )
        }
      />

      <div className="mb-6 space-y-4">
        <label className="glass flex items-center gap-3 !rounded-2xl px-4 focus-within:ring-2 focus-within:ring-lime/40">
          <Search size={18} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>
        <FilterChips value={muscle} onChange={setMuscle} />
      </div>

      {error && !exercisesReq.data ? (
        <ErrorState
          error={error}
          onRetry={() => {
            exercisesReq.reload()
            workoutReq.reload()
          }}
        />
      ) : loading && !exercisesReq.data ? (
        <LibrarySkeleton />
      ) : exercises.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="The library is empty"
          message="No exercises in the database yet. Run “npm run db:setup” to load the sample exercises."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No exercises match that"
          message={`Nothing for “${query}” in ${muscle === 'All' ? 'any muscle group' : muscle}. Try a different word or filter.`}
          action={
            <button className="btn-ghost" onClick={() => { setQuery(''); setMuscle('All') }}>
              Clear filters
            </button>
          }
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((ex) => (
              <ExerciseCard key={ex.id} ex={ex} added={inToday.has(ex.id)} busy={pending.has(ex.id)} onToggle={() => toggle(ex)} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
