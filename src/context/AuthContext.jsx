import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) // set when /me failed for a reason other than "not logged in"

  const refresh = useCallback(async () => {
    try {
      const { user } = await api('/auth/me')
      setUser(user)
      setError(null)
    } catch (err) {
      setUser(null)
      setError(err.status === 401 ? null : err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (email, password) => {
    const { user } = await api('/auth/login', { method: 'POST', body: { email, password } })
    setUser(user)
    setError(null)
    return user
  }, [])

  const signup = useCallback(async (fields) => {
    const { user } = await api('/auth/signup', { method: 'POST', body: fields })
    setUser(user)
    setError(null)
    return user
  }, [])

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, error, login, signup, logout, refresh }),
    [user, loading, error, login, signup, logout, refresh],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts.at(-1)[0] : '')).toUpperCase() || '?'
}
