import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react'
import { catalog as localCatalog } from '../data/catalog'
import type { Catalog } from '../types/catalog'
import { bundleReducer, initialState, type BundleAction, type BundleState } from './bundleState'

interface BundleContextValue {
  catalog: Catalog
  state: BundleState
  dispatch: Dispatch<BundleAction>
}

const BundleContext = createContext<BundleContextValue | null>(null)

/**
 * The local JSON renders instantly; when the bonus /api/products endpoint
 * exists (Vercel), its response replaces the catalog on arrival. Environments
 * without the endpoint (Docker, vite dev/preview) just keep the local copy.
 */
export function BundleProvider({
  children,
  initial,
}: {
  children: ReactNode
  /** Optional pre-hydrated state (e.g. restored from localStorage). */
  initial?: BundleState
}) {
  const [catalog, setCatalog] = useState(localCatalog)
  const [state, dispatch] = useReducer(bundleReducer, initial ?? initialState(localCatalog))

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/products', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((remote: Catalog | null) => {
        if (remote?.products?.length) setCatalog(remote)
      })
      .catch(() => {
        // endpoint not deployed here — local catalog is the source of truth
      })
    return () => controller.abort()
  }, [])

  return (
    <BundleContext.Provider value={{ catalog, state, dispatch }}>{children}</BundleContext.Provider>
  )
}

export function useBundle(): BundleContextValue {
  const ctx = useContext(BundleContext)
  if (!ctx) throw new Error('useBundle must be used inside <BundleProvider>')
  return ctx
}
