import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

// Loads a GET endpoint: { data, error, loading, reload, setData }
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true })

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, error: null, loading: true }))
    try {
      const data = await api(path)
      setState({ data, error: null, loading: false })
    } catch (error) {
      setState((s) => ({ ...s, error, loading: false }))
    }
  }, [path])

  useEffect(() => {
    reload()
  }, [reload])

  const setData = useCallback((update) => {
    setState((s) => ({ ...s, data: typeof update === 'function' ? update(s.data) : update }))
  }, [])

  return { ...state, reload, setData }
}
