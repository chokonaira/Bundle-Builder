import { describe, expect, it } from 'vitest'
import { catalog } from './catalog'

/**
 * The Figma design pre-seeds the review panel with an exact configuration.
 * These tests pin the catalog data to the design's ground-truth totals:
 * $238.81 compare-at → $187.89 active → $50.92 savings.
 */
describe('catalog seed data', () => {
  const seededLines = () => {
    const lines: { qty: number; price: number; compareAt: number }[] = []
    for (const product of catalog.products) {
      if (product.variants) {
        for (const v of product.variants) {
          if (v.defaultQty > 0) {
            lines.push({
              qty: v.defaultQty,
              price: v.price,
              compareAt: v.compareAtPrice ?? v.price,
            })
          }
        }
      } else if ((product.defaultQty ?? 0) > 0) {
        lines.push({
          qty: product.defaultQty!,
          price: product.price!,
          compareAt: product.compareAtPrice ?? product.price!,
        })
      }
    }
    return lines
  }

  it('matches the design total of $187.89 (incl. default plan)', () => {
    const productTotal = seededLines().reduce((sum, l) => sum + l.qty * l.price, 0)
    const plan = catalog.plans.find((p) => p.default)!
    expect(productTotal + plan.price).toBeCloseTo(187.89, 2)
  })

  it('matches the design compare-at total of $238.81', () => {
    const compareTotal = seededLines().reduce((sum, l) => sum + l.qty * l.compareAt, 0)
    const plan = catalog.plans.find((p) => p.default)!
    expect(compareTotal + (plan.compareAtPrice ?? plan.price)).toBeCloseTo(238.81, 2)
  })

  it('yields the design savings of $50.92', () => {
    const lines = seededLines()
    const active = lines.reduce((s, l) => s + l.qty * l.price, 0)
    const compare = lines.reduce((s, l) => s + l.qty * l.compareAt, 0)
    const plan = catalog.plans.find((p) => p.default)!
    const savings = compare + (plan.compareAtPrice ?? plan.price) - (active + plan.price)
    expect(savings).toBeCloseTo(50.92, 2)
  })

  it('every step has at least one product or plan', () => {
    for (const step of catalog.steps) {
      const hasProduct = catalog.products.some((p) => p.step === step.id)
      const hasPlan = catalog.plans.some((p) => p.step === step.id)
      expect(hasProduct || hasPlan, `step ${step.id} is empty`).toBe(true)
    }
  })

  it('variant products always declare a default active variant that exists', () => {
    for (const product of catalog.products.filter((p) => p.variants)) {
      const ids = product.variants!.map((v) => v.id)
      expect(ids, product.id).toContain(product.defaultActiveVariant)
    }
  })
})
