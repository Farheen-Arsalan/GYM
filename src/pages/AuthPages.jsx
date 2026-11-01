import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Flame, Loader2, Timer, TriangleAlert } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="noise relative grid min-h-[100dvh] place-items-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute left-1/2 top-[-240px] h-[560px] w-[760px] -translate-x-1/2 rounded-full bg-lime/[0.12] blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-160px] h-[460px] w-[460px] rounded-full bg-cyan/[0.12] blur-[140px]" />
      </div>
      <div className="absolute left-4 right-4 top-4 flex items-center justify-between sm:left-6 sm:right-6">
        <Logo size="sm" />
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mt-12 w-full max-w-md"
      >
        <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-brand opacity-[0.12] blur-3xl" />
        <div className="glass relative p-7 sm:p-9">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
        <p className="relative mt-6 text-center text-sm text-muted">{footer}</p>
      </motion.div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-sm font-semibold">
        {label}
        {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

function PasswordInput({ value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        className="input pr-12"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
        minLength={8}
        maxLength={72}
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted transition hover:text-fg"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}

function FormError({ message }) {
  if (!message) return null
  return (
    <motion.p
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-400"
      role="alert"
    >
      <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {message}
    </motion.p>
  )
}

function SubmitButton({ busy, children }) {
  return (
    <button type="submit" className="btn-primary w-full !py-3.5 text-base" disabled={busy}>
      {busy ? <Loader2 size={18} className="animate-spin" /> : null}
      {children}
      {!busy && <ArrowRight size={18} />}
    </button>
  )
}

function useAuthForm() {
  const { user, loading } = useAuth()
  const { toast } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const dest = location.state?.from || '/dashboard'

  const run = async (action, successToast) => {
    setBusy(true)
    setError('')
    try {
      const u = await action()
      toast(successToast(u))
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.message)
      if (err.isOffline) toast({ type: 'error', title: 'Database unreachable', message: err.message })
    } finally {
      setBusy(false)
    }
  }
  return { alreadyIn: !loading && user, dest, busy, error, run }
}

export function Login() {
  const { login } = useAuth()
  const { alreadyIn, dest, busy, error, run } = useAuthForm()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  if (alreadyIn) return <Navigate to={dest} replace />

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to pick up right where you left off."
      footer={
        <>
          New to PulseFit?{' '}
          <Link to="/signup" className="font-semibold text-ink hover:underline">Create an account</Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          run(() => login(email, password), (u) => ({ type: 'success', title: `Welcome back, ${u.fullName.split(' ')[0]}! 💪` }))
        }}
      >
        <Field label="Email">
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>
        <FormError message={error} />
        <SubmitButton busy={busy}>{busy ? 'Logging in…' : 'Log in'}</SubmitButton>
      </form>
    </AuthShell>
  )
}

const MINUTE_STEPS = [60, 90, 120, 150, 180, 240, 300, 420]

export function Signup() {
  const { signup } = useAuth()
  const { alreadyIn, dest, busy, error, run } = useAuthForm()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', weeklyGoalWorkouts: 4, weeklyGoalMinutes: 150 })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  if (alreadyIn) return <Navigate to={dest} replace />

  const perWorkout = Math.round(form.weeklyGoalMinutes / form.weeklyGoalWorkouts)

  return (
    <AuthShell
      title="Start your streak"
      subtitle="Create your free PulseFit account and set your weekly goals."
      footer={
        <>
          Already a member?{' '}
          <Link to="/login" className="font-semibold text-ink hover:underline">Log in</Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          run(() => signup(form), (u) => ({ type: 'success', title: `You’re in, ${u.fullName.split(' ')[0]}! 🎉`, message: 'Pick a few exercises to build today’s workout.' }))
        }}
      >
        <Field label="Your name">
          <input className="input" value={form.fullName} onChange={set('fullName')} autoComplete="name" required minLength={2} maxLength={80} placeholder="Alex Rivera" />
        </Field>
        <Field label="Email">
          <input type="email" className="input" value={form.email} onChange={set('email')} autoComplete="email" required placeholder="you@example.com" />
        </Field>
        <Field label="Password" hint="at least 8 characters">
          <PasswordInput value={form.password} onChange={set('password')} autoComplete="new-password" />
        </Field>

        <div className="rounded-2xl border border-line/[0.07] bg-fg/[0.02] p-4">
          <p className="label">Weekly goals</p>

          <div className="mt-3 flex items-center justify-between text-sm font-semibold">
            <span className="flex items-center gap-2"><Flame size={15} className="text-orange-400" /> Workouts per week</span>
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1.5" role="radiogroup" aria-label="Workouts per week">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => {
              const on = form.weeklyGoalWorkouts === n
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setForm((f) => ({ ...f, weeklyGoalWorkouts: n }))}
                  className={`relative h-10 rounded-xl font-display font-bold transition ${on ? 'text-onaccent' : 'border border-line/10 bg-fg/[0.04] text-muted hover:text-fg'}`}
                >
                  {on && <motion.span layoutId="goal-workouts" className="absolute inset-0 rounded-xl bg-gradient-brand shadow-glow" />}
                  <span className="relative">{n}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-5 flex items-center justify-between text-sm font-semibold">
            <span className="flex items-center gap-2"><Timer size={15} className="text-cyan" /> Active minutes per week</span>
            <span className="font-display text-ink">{form.weeklyGoalMinutes} min</span>
          </div>
          <input
            type="range"
            min={0}
            max={MINUTE_STEPS.length - 1}
            value={Math.max(0, MINUTE_STEPS.indexOf(form.weeklyGoalMinutes))}
            onChange={(e) => setForm((f) => ({ ...f, weeklyGoalMinutes: MINUTE_STEPS[Number(e.target.value)] }))}
            className="mt-3 w-full accent-[rgb(var(--lime))]"
            aria-label="Active minutes per week"
          />
          <p className="mt-1 text-xs text-muted">≈ {perWorkout} min per workout</p>
        </div>

        <FormError message={error} />
        <SubmitButton busy={busy}>{busy ? 'Creating your account…' : 'Create account'}</SubmitButton>
      </form>
    </AuthShell>
  )
}
