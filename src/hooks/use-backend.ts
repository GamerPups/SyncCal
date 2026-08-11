import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, type BackendState } from '@/api'
import { useAuth } from '@/hooks/use-auth'

type BackendContextValue = {
  state: BackendState | null
  isLoading: boolean
  refresh: () => Promise<void>
  patch: (partial: Partial<BackendState>) => Promise<void>
}

const BackendContext = createContext<BackendContextValue | null>(null)

export function BackendProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const [state, setState] = useState<BackendState | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const next = await api.data.getState()
      setState(next)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const patch = useCallback(async (partial: Partial<BackendState>) => {
    const next = await api.data.patchState(partial)
    setState(next)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setState(null)
      return
    }
    refresh()
  }, [isAuthenticated, user?.id, refresh])

  const value = useMemo(
    () => ({ state, isLoading, refresh, patch }),
    [state, isLoading, refresh, patch],
  )

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>
}

export function useBackend() {
  const context = useContext(BackendContext)
  if (!context) throw new Error('useBackend must be used within BackendProvider')
  return context
}
