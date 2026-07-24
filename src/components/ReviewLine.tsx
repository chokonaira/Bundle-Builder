import { useBundle } from '../store/BundleProvider'
import type { ReviewLine as Line } from '../store/selectors'
import { PriceBlock } from './PriceBlock'
import { QuantityStepper } from './QuantityStepper'

/**
 * One selected item in the review panel. The stepper edits the same store
 * key as the product card's stepper, so the two stay in sync by definition.
 * Prices show the line total (unit × qty), matching the design.
 */
export function ReviewLine({ line }: { line: Line }) {
  const { dispatch } = useBundle()

  return (
    <div className="flex items-center gap-2.5" data-testid={`review-${line.key}`}>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white">
        <img src={line.image} alt="" className="size-10 object-contain" />
      </span>
      <span className="min-w-0 flex-1 text-[14px] leading-tight font-medium tracking-body">
        {line.name}
      </span>
      <QuantityStepper
        size="sm"
        qty={line.qty}
        disabled={line.required}
        onChange={(next) => dispatch({ type: 'setQuantity', key: line.key, qty: next })}
        label={`${line.name} quantity`}
      />
      <div className="w-[72px]">
        <PriceBlock
          variant="review"
          price={line.qty * line.unitPrice}
          compareAtPrice={line.unitCompareAt != null ? line.qty * line.unitCompareAt : undefined}
          priceLabel={line.priceLabel}
        />
      </div>
    </div>
  )
}
