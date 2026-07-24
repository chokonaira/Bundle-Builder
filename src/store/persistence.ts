import type { Catalog } from '../types/catalog'
import { initialState, keyFor, type BundleState } from './bundleState'

const STORAGE_KEY = 'bundle-builder:v1'

/**
 * "Save my system for later" — the saved snapshot is validated against the
 * current catalog on load, so a stale or hand-edited snapshot can never
 * crash the app: unknown lines are dropped, missing ones fall back to 0,
 * and anything unreadable falls back to the seed state entirely.
 */
export function saveState(state: BundleState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    // storage full or blocked (private mode) — nothing sensible to do
    return false
  }
}

export function loadSavedState(catalog: Catalog): BundleState | null {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null

  const candidate = parsed as Partial<BundleState>
  const base = initialState(catalog)

  // Only accept quantities for lines the catalog actually knows about.
  const quantities: BundleState['quantities'] = {}
  for (const key of Object.keys(base.quantities)) {
    const value = candidate.quantities?.[key]
    quantities[key] = typeof value === 'number' && value >= 0 ? Math.floor(value) : 0
  }
  // Required items can't have been removed.
  for (const product of catalog.products) {
    if (product.required) {
      quantities[product.id] = Math.max(quantities[product.id], product.defaultQty ?? 1)
    }
  }

  const activeVariants: BundleState['activeVariants'] = {}
  for (const product of catalog.products) {
    if (!product.variants) continue
    const saved = candidate.activeVariants?.[product.id]
    activeVariants[product.id] = product.variants.some((v) => v.id === saved)
      ? saved!
      : base.activeVariants[product.id]
  }

  const planId = catalog.plans.some((p) => p.id === candidate.planId)
    ? (candidate.planId as string)
    : base.planId

  const openStep = catalog.steps.some((s) => s.id === candidate.openStep)
    ? (candidate.openStep as BundleState['openStep'])
    : base.openStep

  return { quantities, activeVariants, planId, openStep }
}

export function clearSavedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export { STORAGE_KEY, keyFor }
