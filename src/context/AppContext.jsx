import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const AppContext = createContext(null)

function readTheme() {
  try {
    return localStorage.getItem('pulsefit-theme') === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(readTheme)
  const [toasts, setToasts] = useState([])
  const [booked, setBooked] = useState(() => new Set(['m3']))
  const idRef = useRef(0)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#06080b' : '#f3f6f0')
    try {
      localStorage.setItem('pulsefit-theme', theme)
    } catch {
      /* storage unavailable — theme just won't persist */
    }
  }, [theme])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const dismissToast = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const toast = useCallback(
    ({ type = 'success', title, message, duration = 3800 }) => {
      const id = ++idRef.current
      setToasts((list) => [...list.slice(-2), { id, type, title, message }])
      setTimeout(() => dismissToast(id), duration)
    },
    [dismissToast],
  )

  const toggleBooking = useCallback((classId) => {
    setBooked((prev) => {
      const next = new Set(prev)
      next.has(classId) ? next.delete(classId) : next.add(classId)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ theme, toggleTheme, toasts, toast, dismissToast, booked, toggleBooking }),
    [theme, toggleTheme, toasts, toast, dismissToast, booked, toggleBooking],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

export function useChartColors() {
  const { theme } = useApp()
  // `series` = categorical steps validated for CVD/lightness on each surface (multi-line charts)
  return theme === 'dark'
    ? {
        lime: '#C6FF3D', cyan: '#22D3EE', violet: '#A78BFA', grid: 'rgba(255,255,255,0.07)', tooltipBg: 'rgba(13,16,21,0.92)', muted: '#8C97A3',
        series: { lime: '#68A912', cyan: '#0FA5C4', violet: '#8F6CF2' },
      }
    : {
        lime: '#65A30D', cyan: '#0891B2', violet: '#7C3AED', grid: 'rgba(11,15,20,0.07)', tooltipBg: 'rgba(255,255,255,0.96)', muted: '#58626E',
        series: { lime: '#65A30D', cyan: '#0891B2', violet: '#7C3AED' },
      }
}
