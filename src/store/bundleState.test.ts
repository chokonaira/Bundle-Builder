import { describe, expect, it } from 'vitest'
import { catalog } from '../data/catalog'
import { bundleReducer, initialState, keyFor, type BundleState } from './bundleState'
import { activeQty, isProductSelected, stepSelectedCount, totals } from './selectors'

const seed = () => initialState(catalog)
const camV4 = catalog.products.find((p) => p.id === 'wyze-cam-v4')!
const panV3 = catalog.products.find((p) => p.id === 'wyze-cam-pan-v3')!

describe('initialState', () => {
  it('seeds quantities from the catalog defaults', () => {
    const state = seed()
    expect(state.quantities[keyFor('wyze-cam-v4', 'white')]).toBe(1)
    expect(state.quantities[keyFor('wyze-cam-pan-v3', 'white')]).toBe(2)
    expect(state.quantities['wyze-sense-motion-sensor']).toBe(2)
    expect(state.quantities['wyze-sense-hub']).toBe(1)
    expect(state.quantities['wyze-microsd-256']).toBe(2)
  })

  it('opens step 1 and selects the default plan', () => {
    const state = seed()
    expect(state.openStep).toBe('cameras')
    expect(state.planId).toBe('cam-unlimited')
  })

  it('reproduces the design totals', () => {
    const t = totals(catalog, seed())
    expect(t.total).toBe(187.89)
    expect(t.compareAtTotal).toBe(238.81)
    expect(t.savings).toBe(50.92)
  })
})

describe('variant quantities are independent', () => {
  it('keeps White count when switching to Black (the brief example)', () => {
    let state = seed()
    // add 2 White (already 1 → set to 2)
    state = bundleReducer(state, {
      type: 'setQuantity',
      key: keyFor('wyze-cam-v4', 'white'),
      qty: 2,
    })
    state = bundleReducer(state, {
      type: 'selectVariant',
      productId: 'wyze-cam-v4',
      variantId: 'black',
    })

    // stepper now shows Black's count: 0. White untouched at 2.
    expect(activeQty(state, camV4)).toBe(0)
    expect(state.quantities[keyFor('wyze-cam-v4', 'white')]).toBe(2)
  })

  it('shows one review line per variant with qty > 0', () => {
    let state = seed()
    state = bundleReducer(state, {
      type: 'selectVariant',
      productId: 'wyze-cam-v4',
      variantId: 'black',
    })
    state = bundleReducer(state, {
      type: 'setQuantity',
      key: keyFor('wyze-cam-v4', 'black'),
      qty: 3,
    })

    const t = totals(catalog, state)
    // 1 White + 3 Black at 27.98 each on top of the seed total minus the original single White line
    expect(t.total).toBeCloseTo(187.89 + 3 * 27.98, 2)
  })
})

describe('stepSelectedCount', () => {
  it('counts distinct products, not units or variants (design shows 2/1/2/1)', () => {
    const state = seed()
    expect(stepSelectedCount(catalog, state, 'cameras')).toBe(2)
    expect(stepSelectedCount(catalog, state, 'plan')).toBe(1)
    expect(stepSelectedCount(catalog, state, 'sensors')).toBe(2)
    expect(stepSelectedCount(catalog, state, 'protection')).toBe(1)
  })

  it('two variants of one product still count as one product', () => {
    let state = seed()
    state = bundleReducer(state, {
      type: 'setQuantity',
      key: keyFor('wyze-cam-v4', 'black'),
      qty: 1,
    })
    expect(stepSelectedCount(catalog, state, 'cameras')).toBe(2)
  })
})

describe('quantity floor and card selection state', () => {
  it('never goes below zero', () => {
    let state = seed()
    state = bundleReducer(state, {
      type: 'setQuantity',
      key: keyFor('wyze-cam-v4', 'white'),
      qty: -1,
    })
    expect(state.quantities[keyFor('wyze-cam-v4', 'white')]).toBe(0)
  })

  it('card is selected while any variant holds units', () => {
    let state = seed()
    expect(isProductSelected(state, panV3)).toBe(true)
    state = bundleReducer(state, {
      type: 'setQuantity',
      key: keyFor('wyze-cam-pan-v3', 'white'),
      qty: 0,
    })
    expect(isProductSelected(state, panV3)).toBe(false)
  })
})

describe('accordion', () => {
  it('toggles a step closed and opens another exclusively', () => {
    let state = seed()
    state = bundleReducer(state, { type: 'toggleStep', step: 'cameras' })
    expect(state.openStep).toBeNull()
    state = bundleReducer(state, { type: 'openStep', step: 'plan' })
    expect(state.openStep).toBe('plan')
  })
})

describe('hydrate', () => {
  it('replaces state wholesale (persistence restore)', () => {
    const saved: BundleState = {
      ...seed(),
      quantities: { ...seed().quantities, [keyFor('wyze-cam-v4', 'grey')]: 5 },
      openStep: 'sensors',
    }
    const state = bundleReducer(seed(), { type: 'hydrate', state: saved })
    expect(state.quantities[keyFor('wyze-cam-v4', 'grey')]).toBe(5)
    expect(state.openStep).toBe('sensors')
  })
})
