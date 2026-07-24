import { useBundle } from '../store/BundleProvider'
import { keyFor } from '../store/bundleState'
import { activeQty, isProductSelected } from '../store/selectors'
import type { Product } from '../types/catalog'
import { PriceBlock } from './PriceBlock'
import { QuantityStepper } from './QuantityStepper'
import { VariantChips } from './VariantChips'

/**
 * One product in a builder step. Fully data-driven: badge, variants, and
 * discount pricing are all optional per product. The stepper always edits
 * the active variant's count (or the product's own count when variantless).
 */
export function ProductCard({ product }: { product: Product }) {
  const { state, dispatch } = useBundle()

  const selected = isProductSelected(state, product)
  const qty = activeQty(state, product)

  const activeVariant = product.variants?.find((v) => v.id === state.activeVariants[product.id])
  const lineKey = product.variants
    ? keyFor(product.id, state.activeVariants[product.id])
    : product.id

  const price = activeVariant?.price ?? product.price ?? 0
  const compareAt = activeVariant?.compareAtPrice ?? product.compareAtPrice
  const image = activeVariant?.image ?? product.image

  return (
    <article
      className={`relative h-full rounded-card bg-white p-[11px] transition-colors ${
        selected ? 'border-2 border-brand-border' : 'border-2 border-transparent'
      }`}
      data-testid={`card-${product.id}`}
    >
      {product.badge && (
        <span className="absolute top-2.5 left-2.5 z-10 rounded-card bg-brand px-1.5 py-0.5 text-[12px] font-medium text-white">
          {product.badge}
        </span>
      )}

      <div className="flex h-full gap-3 pt-4">
        <img
          src={image}
          alt={product.name}
          className="h-[104px] w-[92px] shrink-0 self-center object-contain"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h3 className="text-[16px] font-semibold tracking-body">{product.name}</h3>
          <p className="text-[12px] leading-[1.3] font-medium tracking-body text-ink/70">
            {product.description}{' '}
            <a href={product.learnMoreUrl} className="whitespace-nowrap text-brand underline">
              Learn More
            </a>
          </p>

          {product.variants && (
            <VariantChips
              variants={product.variants}
              activeId={state.activeVariants[product.id]}
              onSelect={(variantId) =>
                dispatch({ type: 'selectVariant', productId: product.id, variantId })
              }
              productName={product.name}
            />
          )}

          <div className="mt-auto flex items-end justify-between gap-2">
            <QuantityStepper
              qty={qty}
              onChange={(next) => dispatch({ type: 'setQuantity', key: lineKey, qty: next })}
              disabled={product.required}
              label={`${product.name}${activeVariant ? ` ${activeVariant.label}` : ''} quantity`}
            />
            <PriceBlock price={price} compareAtPrice={compareAt} priceLabel={product.priceLabel} />
          </div>
        </div>
      </div>
    </article>
  )
}
