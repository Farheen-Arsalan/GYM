import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Toaster from './components/Toaster'
import RequireAuth from './components/RequireAuth'
import Landing from './pages/Landing'
import { Login, Signup } from './pages/AuthPages'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import LiveWorkout from './pages/LiveWorkout'
import Progress from './pages/Progress'
import Classes from './pages/Classes'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

const titles = {
  '/': 'PulseFit — Train smarter. Get stronger.',
  '/login': 'Log in · PulseFit',
  '/signup': 'Sign up · PulseFit',
  '/dashboard': 'Dashboard · PulseFit',
  '/workouts': 'Workout Library · PulseFit',
  '/live': 'Live Workout · PulseFit',
  '/progress': 'Progress · PulseFit',
  '/classes': 'Classes · PulseFit',
  '/profile': 'Profile · PulseFit',
}

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = titles[pathname] ?? 'PulseFit'
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/workouts" element={<RequireAuth><Library /></RequireAuth>} />
          <Route path="/live" element={<RequireAuth><LiveWorkout /></RequireAuth>} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}
