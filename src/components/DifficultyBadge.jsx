const levels = {
  Beginner: { bars: 1, cls: 'text-cyan bg-cyan/10 border-cyan/20' },
  Intermediate: { bars: 2, cls: 'text-ink bg-lime/10 border-lime/25' },
  Advanced: { bars: 3, cls: 'text-rose-400 bg-rose-400/10 border-rose-400/25' },
}

export default function DifficultyBadge({ level }) {
  const l = levels[level] ?? levels.Beginner
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${l.cls}`}>
      <span className="flex items-end gap-[2px]" aria-hidden="true">
        {[1, 2, 3].map((b) => (
          <span
            key={b}
            className={`w-[3px] rounded-full bg-current ${b <= l.bars ? 'opacity-100' : 'opacity-25'}`}
            style={{ height: 4 + b * 3 }}
          />
        ))}
      </span>
      {level}
    </span>
  )
}
