import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BedDouble, Check, Clock, User, Users, Filter } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { classSchedule, classTypes, weekDays } from '../data/mock'

const todayKey = weekDays[(new Date().getDay() + 6) % 7]
const typeFilters = ['All', ...Object.keys(classTypes)]

function ClassCard({ c, booked, onBook, i }) {
  const t = classTypes[c.type]
  const spotsLeft = Math.max(0, c.spots - (booked ? 1 : 0))
  const full = c.spots === 0 && !booked
  const fillPct = ((c.capacity - spotsLeft) / c.capacity) * 100
  const low = spotsLeft > 0 && spotsLeft <= 3

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: i * 0.05 }}
      whileHover={{ y: -4 }}
      className={`glass flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${booked ? 'ring-1 ring-lime/40' : ''}`}
    >
      <div className="absolute inset-y-0 left-0 w-1" style={{ background: t.color }} />
      <div className="flex items-center gap-4 sm:w-28 sm:flex-col sm:items-start sm:gap-1">
        <p className="font-display text-2xl font-bold tabular-nums">{c.time}</p>
        <p className="flex items-center gap-1 text-xs text-muted">
          <Clock size={12} /> {c.duration} min
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <span className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: t.soft, color: t.color }}>
          {c.type}
        </span>
        <h3 className="mt-1.5 text-lg font-semibold">{c.title}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <User size={13} /> {c.coach}
        </p>
      </div>

      <div className="flex items-center gap-4 sm:w-64">
        <div className="flex-1">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className={`flex items-center gap-1 font-semibold ${full ? 'text-rose-400' : low ? 'text-amber-400' : 'text-muted'}`}>
              <Users size={12} />
              {full ? 'Class full' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
            </span>
            <span className="text-muted">{c.capacity}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-fg/[0.07]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              transition={{ duration: 0.9, delay: 0.2 + i * 0.05 }}
              className="h-full rounded-full"
              style={{ background: full ? '#FB7185' : t.color }}
            />
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={onBook}
          className={`w-28 shrink-0 ${
            booked
              ? 'btn border border-lime/30 bg-lime/10 text-ink'
              : full
                ? 'btn border border-line/10 bg-fg/[0.03] text-muted'
                : 'btn-primary'
          }`}
        >
          {booked ? (
            <>
              <Check size={16} /> Booked
            </>
          ) : full ? (
            'Waitlist'
          ) : (
            'Book'
          )}
        </motion.button>
      </div>
    </motion.article>
  )
}

export default function Classes() {
  const { booked, toggleBooking, toast } = useApp()
  const [day, setDay] = useState(todayKey)
  const [type, setType] = useState('All')

  const list = useMemo(
    () => classSchedule[day].filter((c) => type === 'All' || c.type === type),
    [day, type],
  )

  const onBook = (c) => {
    if (booked.has(c.id)) {
      toggleBooking(c.id)
      toast({ type: 'info', title: 'Booking cancelled', message: `Your spot in ${c.title} has been released.` })
      return
    }
    if (c.spots === 0) {
      toast({
        type: 'error',
        title: 'This class is full',
        message: `We’ve added you to the ${c.title} waitlist and will ping you if a spot opens.`,
      })
      return
    }
    toggleBooking(c.id)
    toast({ type: 'success', title: 'You’re booked! 🎉', message: `${c.title} · ${day} ${c.time} with ${c.coach}` })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Class booking"
        title="Sweat with the squad"
        subtitle="Yoga, HIIT, Spin and Boxing — book your spot before it’s gone."
        action={<span className="chip !px-4 !py-2 text-sm"><Check size={14} className="text-ink" /> {booked.size} booked this week</span>}
      />

      {/* day picker */}
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {weekDays.map((d) => {
          const active = d === day
          const count = classSchedule[d].length
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`relative flex min-w-[64px] flex-1 flex-col items-center rounded-2xl px-3 py-3 transition ${
                active ? 'text-onaccent' : 'border border-line/10 bg-fg/[0.03] text-muted hover:text-fg'
              }`}
              aria-pressed={active}
            >
              {active && (
                <motion.span layoutId="day-pill" className="absolute inset-0 rounded-2xl bg-gradient-brand shadow-glow" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />
              )}
              <span className="relative text-xs font-semibold uppercase tracking-wider">{d}</span>
              <span className="relative mt-1 font-display text-lg font-bold">{count || '–'}</span>
              {d === todayKey && <span className={`relative mt-0.5 text-[9px] font-bold uppercase ${active ? '' : 'text-ink'}`}>Today</span>}
            </button>
          )
        })}
      </div>

      {/* type filter */}
      <div className="no-scrollbar -mx-4 mb-6 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <Filter size={15} className="shrink-0 text-muted" />
        {typeFilters.map((t) => {
          const active = t === type
          const color = classTypes[t]?.color
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`chip min-h-10 shrink-0 !py-1.5 transition ${active ? '!border-transparent text-fg ring-1 ring-fg/30' : 'text-muted hover:text-fg'}`}
              aria-pressed={active}
            >
              {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
              {t}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={day + type} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
          {list.length === 0 ? (
            classSchedule[day].length === 0 ? (
              <EmptyState
                icon={BedDouble}
                title="Rest day — no classes"
                message="Recovery is where the gains happen. Stretch, hydrate and come back tomorrow."
                action={<button className="btn-ghost" onClick={() => setDay('Mon')}>See Monday’s classes</button>}
              />
            ) : (
              <EmptyState
                icon={Filter}
                title={`No ${type} classes on ${day}`}
                message="Try another day or show all class types."
                action={<button className="btn-ghost" onClick={() => setType('All')}>Show all classes</button>}
              />
            )
          ) : (
            list.map((c, i) => <ClassCard key={c.id} c={c} i={i} booked={booked.has(c.id)} onBook={() => onBook(c)} />)
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
