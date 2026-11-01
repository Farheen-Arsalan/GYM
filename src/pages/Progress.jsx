import { useState } from 'react'
import { motion } from 'framer-motion'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Award, LineChart as LineIcon, TrendingUp, Trophy } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import AnimatedCounter from '../components/AnimatedCounter'
import EmptyState from '../components/EmptyState'
import { useChartColors } from '../context/AppContext'
import { personalRecords, strengthHistory, user } from '../data/mock'

const lifts = [
  { key: 'deadlift', label: 'Deadlift', color: 'lime' },
  { key: 'squat', label: 'Squat', color: 'cyan' },
  { key: 'bench', label: 'Bench', color: 'violet' },
]

const tiers = {
  gold: { ring: 'from-amber-200 via-amber-400 to-orange-500', text: 'text-amber-400', label: 'Gold' },
  silver: { ring: 'from-slate-100 via-slate-300 to-slate-500', text: 'text-slate-300', label: 'Silver' },
  bronze: { ring: 'from-orange-200 via-orange-400 to-amber-700', text: 'text-orange-400', label: 'Bronze' },
}

function StrengthTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass min-w-[140px] !rounded-xl px-3 py-2.5 text-xs">
      <p className="mb-1.5 font-semibold">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-2 text-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {lifts.find((l) => l.key === p.dataKey)?.label}
          </span>
          <span className="font-semibold tabular-nums">{p.value} kg</span>
        </div>
      ))}
    </div>
  )
}

function EndLabel({ x, y, index, value, name }) {
  if (index !== strengthHistory.length - 1) return null
  return (
    <text x={x - 6} y={y - 12} textAnchor="end" className="recharts-text" style={{ fontSize: 11, fontWeight: 600 }}>
      {name} {value}
    </text>
  )
}

function StrengthChart() {
  const c = useChartColors()
  const [visible, setVisible] = useState(() => new Set(lifts.map((l) => l.key)))
  const toggle = (k) =>
    setVisible((prev) => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      return next
    })

  return (
    <GlassCard hover={false} delay={0.1} className="p-6 lg:col-span-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label">Strength gains · 1RM estimate (kg)</p>
          <p className="mt-2 font-display text-2xl font-bold">
            +<AnimatedCounter value={52.5} decimals={1} /> kg <span className="text-base font-medium text-muted">deadlift since May</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Toggle lifts">
          {lifts.map((l) => {
            const on = visible.has(l.key)
            return (
              <button
                key={l.key}
                onClick={() => toggle(l.key)}
                aria-pressed={on}
                className={`chip min-h-10 !py-1.5 transition ${on ? 'text-fg' : 'text-muted opacity-60'}`}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: on ? c.series[l.color] : 'transparent', border: `2px solid ${c.series[l.color]}` }} />
                {l.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6 h-72">
        {visible.size === 0 ? (
          <div className="grid h-full place-items-center text-center text-sm text-muted">
            <div>
              <LineIcon className="mx-auto mb-2 text-ink" />
              Pick a lift above to see your progress.
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={strengthHistory} margin={{ top: 20, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 6" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} width={44} domain={[50, 'auto']} tickFormatter={(v) => `${v}`} />
              <Tooltip content={<StrengthTooltip />} cursor={{ stroke: c.muted, strokeDasharray: '4 4' }} />
              {lifts
                .filter((l) => visible.has(l.key))
                .map((l) => (
                  <Line
                    key={l.key}
                    type="monotone"
                    dataKey={l.key}
                    stroke={c.series[l.color]}
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2, fill: c.tooltipBg }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: c.tooltipBg }}
                    animationDuration={1400}
                    label={<EndLabel name={l.label} />}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  )
}

function PRCard({ pr, i }) {
  const t = tiers[pr.tier]
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + i * 0.06 }}
      whileHover={{ y: -5 }}
      className="glass group flex items-center gap-4 p-5"
    >
      <div className="relative shrink-0">
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${t.ring} opacity-40 blur-lg transition group-hover:opacity-70`} />
        <div className={`relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${t.ring}`}>
          <Trophy size={26} className="text-black/70" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold">{pr.lift}</p>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${t.text}`}>{t.label}</span>
        </div>
        <p className="font-display text-2xl font-bold">
          {pr.value} <span className="text-sm font-medium text-muted">{pr.unit}</span>
        </p>
        <p className="text-xs text-muted">
          {pr.date}
          {pr.delta ? <span className="ml-2 font-semibold text-ink">▲ {pr.delta} {pr.unit}</span> : null}
        </p>
      </div>
    </motion.div>
  )
}

export default function Progress() {
  const tiles = [
    { icon: TrendingUp, label: 'Total workouts', value: user.totalWorkouts },
    { icon: Award, label: 'PRs this month', value: 4 },
    { icon: Trophy, label: 'Hours trained', value: user.totalHours },
  ]
  return (
    <div>
      <PageHeader eyebrow="Progress" title="Look how far you’ve come" subtitle="Every rep adds up. Here’s the proof." />

      <div className="mb-5 grid grid-cols-3 gap-3 md:gap-5">
        {tiles.map(({ icon: I, label, value }, i) => (
          <GlassCard key={label} delay={i * 0.05} className="p-4 md:p-6">
            <I size={18} className="text-ink" />
            <p className="mt-3 font-display text-2xl font-bold md:text-4xl">
              <AnimatedCounter value={value} />
            </p>
            <p className="text-xs text-muted md:text-sm">{label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <StrengthChart />
      </div>

      <div className="mb-4 mt-10 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Personal records</h2>
        <span className="chip"><Trophy size={13} className="text-amber-400" /> {personalRecords.length} PRs</span>
      </div>
      {personalRecords.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {personalRecords.map((pr, i) => (
            <PRCard key={pr.id} pr={pr} i={i} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Trophy} title="No PRs yet" message="Finish a workout and your first personal records will show up here." />
      )}
    </div>
  )
}
