import type { Variant } from '../types/catalog'

interface Props {
  variants: Variant[]
  activeId: string
  onSelect: (variantId: string) => void
  productName: string
}

/**
 * Color/variant selector chips. Each variant tracks its own quantity in the
 * store; selecting a chip only changes which variant the card's stepper edits.
 */
export function VariantChips({ variants, activeId, onSelect, productName }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`${productName} color`}>
      {variants.map((variant) => {
        const active = variant.id === activeId
        return (
          <button
            key={variant.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(variant.id)}
            className={`flex items-center gap-1 rounded-md border px-1.5 py-1 text-[12px] font-medium tracking-body transition-colors ${
              active
                ? 'border-success bg-success/5 text-ink'
                : 'border-ink/15 bg-white text-ink hover:border-ink/35'
            }`}
          >
            <img src={variant.image} alt="" className="size-[18px] object-contain" />
            {variant.label}
          </button>
        )
      })}
    </div>
  )
}
