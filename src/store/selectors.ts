import type { Catalog, Product, StepId, Variant } from '../types/catalog'
import { keyFor, type BundleState } from './bundleState'

export interface ReviewLine {
  key: string
  productId: string
  variantId?: string
  name: string
  image: string
  qty: number
  unitPrice: number
  unitCompareAt?: number
  priceLabel?: string
  required?: boolean
  category: string
}

const categoryOf = (catalog: Catalog, step: StepId): string =>
  catalog.steps.find((s) => s.id === step)?.category ?? step

/** One review line per product/variant with qty > 0, grouped later by category. */
export function reviewLines(catalog: Catalog, state: BundleState): ReviewLine[] {
  const lines: ReviewLine[] = []
  for (const product of catalog.products) {
    const category = categoryOf(catalog, product.step)
    if (product.variants) {
      const inBundle = product.variants.filter(
        (v) => (state.quantities[keyFor(product.id, v.id)] ?? 0) > 0,
      )
      for (const variant of inBundle) {
        const key = keyFor(product.id, variant.id)
        lines.push({
          key,
          productId: product.id,
          variantId: variant.id,
          name: displayName(product, variant, inBundle.length),
          image: variant.image,
          qty: state.quantities[key] ?? 0,
          unitPrice: variant.price,
          unitCompareAt: variant.compareAtPrice,
          category,
        })
      }
    } else {
      const qty = state.quantities[product.id] ?? 0
      if (qty > 0) {
        lines.push({
          key: product.id,
          productId: product.id,
          name: product.name,
          image: product.image,
          qty,
          unitPrice: product.price ?? 0,
          unitCompareAt: product.compareAtPrice,
          priceLabel: product.priceLabel,
          required: product.required,
          category,
        })
      }
    }
  }
  return lines
}

/**
 * The design shows plain product names in the review panel for the seeded
 * single-variant selections. Variant labels only disambiguate once needed —
 * i.e. when two or more variants of the same product are in the bundle.
 */
function displayName(product: Product, variant: Variant, variantsInBundle: number): string {
  return variantsInBundle > 1 ? `${product.name} (${variant.label})` : product.name
}

export function groupedReviewLines(
  catalog: Catalog,
  state: BundleState,
): { category: string; lines: ReviewLine[] }[] {
  const lines = reviewLines(catalog, state)
  return catalog.reviewMeta.categoryOrder
    .map((category) => ({ category, lines: lines.filter((l) => l.category === category) }))
    .filter((group) => group.lines.length > 0 || group.category === 'Plan')
}

/** Distinct products with any unit selected in a step (variants collapse to their product). */
export function stepSelectedCount(catalog: Catalog, state: BundleState, step: StepId): number {
  if (step === 'plan') return state.planId ? 1 : 0
  const products = catalog.products.filter((p) => p.step === step)
  let count = 0
  for (const product of products) {
    const keys = product.variants
      ? product.variants.map((v) => keyFor(product.id, v.id))
      : [product.id]
    if (keys.some((k) => (state.quantities[k] ?? 0) > 0)) count += 1
  }
  return count
}

export interface Totals {
  total: number
  compareAtTotal: number
  savings: number
}

export function totals(catalog: Catalog, state: BundleState): Totals {
  let total = 0
  let compareAtTotal = 0

  for (const line of reviewLines(catalog, state)) {
    total += line.qty * line.unitPrice
    compareAtTotal += line.qty * (line.unitCompareAt ?? line.unitPrice)
  }

  const plan = catalog.plans.find((p) => p.id === state.planId)
  if (plan) {
    total += plan.price
    compareAtTotal += plan.compareAtPrice ?? plan.price
  }

  return {
    total: round2(total),
    compareAtTotal: round2(compareAtTotal),
    savings: round2(compareAtTotal - total),
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100

export const formatPrice = (n: number): string =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

/** Quantity of the active variant (what the card's stepper shows). */
export function activeQty(state: BundleState, product: Product): number {
  if (!product.variants) return state.quantities[product.id] ?? 0
  const active = state.activeVariants[product.id]
  return state.quantities[keyFor(product.id, active)] ?? 0
}

/** A card renders selected when any of its variants (or itself) has units. */
export function isProductSelected(state: BundleState, product: Product): boolean {
  const keys = product.variants
    ? product.variants.map((v) => keyFor(product.id, v.id))
    : [product.id]
  return keys.some((k) => (state.quantities[k] ?? 0) > 0)
}
