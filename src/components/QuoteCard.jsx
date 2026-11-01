import { Quote } from 'lucide-react'
import GlassCard from './GlassCard'
import { quoteOfTheDay } from '../data/mock'

export default function QuoteCard({ delay = 0, className = '' }) {
  const q = quoteOfTheDay()
  return (
    <GlassCard delay={delay} className={`p-6 ${className}`}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan/20 blur-3xl" />
      <div className="label flex items-center gap-2">
        <Quote size={14} className="text-ink" /> Quote of the day
      </div>
      <p className="mt-3 font-display text-xl font-medium leading-snug md:text-2xl">“{q.text}”</p>
      <p className="mt-3 text-sm text-muted">— {q.author}</p>
    </GlassCard>
  )
}
