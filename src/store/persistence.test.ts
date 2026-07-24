import { beforeEach, describe, expect, it } from 'vitest'
import { catalog } from '../data/catalog'
import { initialState, keyFor } from './bundleState'
import { clearSavedState, loadSavedState, saveState, STORAGE_KEY } from './persistence'

describe('persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips the full state', () => {
    const state = initialState(catalog)
    state.quantities[keyFor('wyze-cam-v4', 'black')] = 4
    state.openStep = 'sensors'

    expect(saveState(state)).toBe(true)
    const restored = loadSavedState(catalog)

    expect(restored).not.toBeNull()
    expect(restored!.quantities[keyFor('wyze-cam-v4', 'black')]).toBe(4)
    expect(restored!.openStep).toBe('sensors')
  })

  it('returns null when nothing was saved', () => {
    expect(loadSavedState(catalog)).toBeNull()
  })

  it('survives corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadSavedState(catalog)).toBeNull()
  })

  it('drops lines the catalog no longer knows about', () => {
    const state = initialState(catalog)
    saveState({
      ...state,
      quantities: { ...state.quantities, 'discontinued-product': 9 },
    })
    const restored = loadSavedState(catalog)!
    expect(restored.quantities['discontinued-product']).toBeUndefined()
  })

  it('sanitizes negative and fractional quantities', () => {
    const state = initialState(catalog)
    saveState({
      ...state,
      quantities: { ...state.quantities, [keyFor('wyze-cam-v4', 'white')]: -3 },
    })
    expect(loadSavedState(catalog)!.quantities[keyFor('wyze-cam-v4', 'white')]).toBe(0)
  })

  it('never lets a required item drop below its default', () => {
    const state = initialState(catalog)
    saveState({ ...state, quantities: { ...state.quantities, 'wyze-sense-hub': 0 } })
    expect(loadSavedState(catalog)!.quantities['wyze-sense-hub']).toBe(1)
  })

  it('falls back to defaults for unknown variant or plan ids', () => {
    const state = initialState(catalog)
    saveState({
      ...state,
      activeVariants: { ...state.activeVariants, 'wyze-cam-v4': 'neon' },
      planId: 'gone-plan',
    })
    const restored = loadSavedState(catalog)!
    expect(restored.activeVariants['wyze-cam-v4']).toBe('white')
    expect(restored.planId).toBe('cam-unlimited')
  })

  it('clearSavedState removes the snapshot', () => {
    saveState(initialState(catalog))
    clearSavedState()
    expect(loadSavedState(catalog)).toBeNull()
  })
})
