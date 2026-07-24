import type { Catalog } from '../types/catalog'
import { initialState, MAX_QTY, type BundleState } from './bundleState'

const STORAGE_KEY = 'bundle-builder:v1'

/**
 * "Save my system for later". The saved snapshot is validated against the
 * current catalog on load, so a stale or hand-edited snapshot can never
 * crash the app: unknown lines are dropped, missing ones fall back to 0,
 * and anything unreadable falls back to the seed state entirely.
 */
export function saveState(state: BundleState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    // storage full or blocked (private mode), nothing sensible to do
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

  // Only accept quantities for lines the catalog actually knows about, and
  // only sane ones: integers between 0 and MAX_QTY. Anything else (negative,
  // fractional, Infinity, 1e999…) falls back to 0.
  const quantities: BundleState['quantities'] = {}
  for (const key of Object.keys(base.quantities)) {
    const value = candidate.quantities?.[key]
    quantities[key] =
      typeof value === 'number' && Number.isInteger(value) && value >= 0
        ? Math.min(value, MAX_QTY)
        : 0
  }
  // Required items are pinned to their catalog quantity: a snapshot can
  // neither remove them nor inflate them (their steppers are disabled, so
  // an inflated count would be uncorrectable in the UI).
  for (const product of catalog.products) {
    if (product.required && !product.variants) {
      quantities[product.id] = product.defaultQty ?? 1
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

  // null is a valid saved state: every step collapsed.
  const openStep =
    candidate.openStep === null || catalog.steps.some((s) => s.id === candidate.openStep)
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

export { STORAGE_KEY }
