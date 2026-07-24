import type { Catalog, StepId } from '../types/catalog'

/**
 * A line is one purchasable unit-count: either a variantless product
 * (key = productId) or a single variant (key = `productId:variantId`).
 * Variants track quantity independently — switching the active color
 * never touches another color's count.
 */
export type LineKey = string

export const keyFor = (productId: string, variantId?: string): LineKey =>
  variantId ? `${productId}:${variantId}` : productId

export interface BundleState {
  /** Quantity per line (product or product:variant). */
  quantities: Record<LineKey, number>
  /** Currently active (visible) variant per variant-product. */
  activeVariants: Record<string, string>
  /** Selected plan (single-select). */
  planId: string | null
  /** Which accordion step is expanded (single-open). */
  openStep: StepId | null
}

export type BundleAction =
  | { type: 'setQuantity'; key: LineKey; qty: number }
  | { type: 'selectVariant'; productId: string; variantId: string }
  | { type: 'selectPlan'; planId: string }
  | { type: 'toggleStep'; step: StepId }
  | { type: 'openStep'; step: StepId }
  | { type: 'hydrate'; state: BundleState }

export function initialState(catalog: Catalog): BundleState {
  const quantities: Record<LineKey, number> = {}
  const activeVariants: Record<string, string> = {}

  for (const product of catalog.products) {
    if (product.variants) {
      activeVariants[product.id] = product.defaultActiveVariant ?? product.variants[0].id
      for (const variant of product.variants) {
        quantities[keyFor(product.id, variant.id)] = variant.defaultQty
      }
    } else {
      quantities[product.id] = product.defaultQty ?? 0
    }
  }

  return {
    quantities,
    activeVariants,
    planId: catalog.plans.find((p) => p.default)?.id ?? null,
    openStep: catalog.steps[0]?.id ?? null,
  }
}

export function bundleReducer(state: BundleState, action: BundleAction): BundleState {
  switch (action.type) {
    case 'setQuantity': {
      const qty = Math.max(0, action.qty)
      if (state.quantities[action.key] === qty) return state
      return { ...state, quantities: { ...state.quantities, [action.key]: qty } }
    }
    case 'selectVariant': {
      if (state.activeVariants[action.productId] === action.variantId) return state
      return {
        ...state,
        activeVariants: { ...state.activeVariants, [action.productId]: action.variantId },
      }
    }
    case 'selectPlan':
      if (state.planId === action.planId) return state
      return { ...state, planId: action.planId }
    case 'toggleStep':
      return { ...state, openStep: state.openStep === action.step ? null : action.step }
    case 'openStep':
      return { ...state, openStep: action.step }
    case 'hydrate':
      return action.state
    default:
      return state
  }
}
