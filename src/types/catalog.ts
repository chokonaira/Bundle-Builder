export type StepId = 'cameras' | 'plan' | 'sensors' | 'protection'

export interface Step {
  id: StepId
  title: string
  icon: 'camera' | 'shield' | 'sensor' | 'grid'
  category: string
}

export interface Variant {
  id: string
  label: string
  image: string
  price: number
  compareAtPrice?: number
  defaultQty: number
}

export interface Product {
  id: string
  step: StepId
  name: string
  description: string
  learnMoreUrl: string
  image: string
  badge?: string
  /** Products without variants price at the top level. */
  price?: number
  compareAtPrice?: number
  priceLabel?: string
  defaultQty?: number
  /** Cannot be changed or removed (e.g. the Sense Hub). */
  required?: boolean
  variants?: Variant[]
  defaultActiveVariant?: string
}

export interface Plan {
  id: string
  step: StepId
  name: string
  description: string
  price: number
  compareAtPrice?: number
  billingPeriod: string
  default?: boolean
}

export interface Perk {
  id: string
  name: string
  price: number
  compareAtPrice?: number
  priceLabel?: string
}

export interface ReviewMeta {
  /** Order of category groups in the review panel. */
  categoryOrder: string[]
  financingLabel: string
  savingsTemplate: string
  guaranteeLabel: string
}

export interface Catalog {
  steps: Step[]
  products: Product[]
  plans: Plan[]
  perks: Perk[]
  reviewMeta: ReviewMeta
}
