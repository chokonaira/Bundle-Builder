import { ShieldCheck, Truck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useBundle } from '../store/BundleProvider'
import { saveState } from '../store/persistence'
import { formatPrice, groupedReviewLines, totals } from '../store/selectors'
import { CheckoutModal } from './CheckoutModal'
import { GuaranteeBadge } from './GuaranteeBadge'
import { PriceBlock } from './PriceBlock'
import { ReviewLine } from './ReviewLine'

export function ReviewPanel() {
  const { catalog, state } = useBundle()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(savedTimer.current), [])

  const handleSave = () => {
    if (saveState(state)) {
      setSaved(true)
      clearTimeout(savedTimer.current)
      savedTimer.current = setTimeout(() => setSaved(false), 2000)
    }
  }

  const groups = groupedReviewLines(catalog, state)
  const { total, compareAtTotal, savings } = totals(catalog, state)
  const plan = catalog.plans.find((p) => p.id === state.planId)
  const meta = catalog.reviewMeta

  const savingsMessage = meta.savingsTemplate.replace('{amount}', formatPrice(savings))

  return (
    <div className="rounded-card bg-lavender p-[15px]">
      <p className="text-[11px] font-medium tracking-[2px] text-ink/60 uppercase">Review</p>
      <h2 className="mt-1 text-[24px] font-semibold tracking-body">Your security system</h2>
      <p className="mt-1 text-[13px] leading-[1.4] font-medium text-ink/70">
        Review your personalized protection system designed to keep what matters most safe.
      </p>

      {groups.map((group) => (
        <section key={group.category} className="mt-[15px] border-t border-divider pt-[15px]">
          <h3 className="text-[11px] font-medium tracking-[2px] text-ink/50 uppercase">
            {group.category}
          </h3>
          <div className="mt-2 flex flex-col gap-2">
            {group.category === 'Plan' && plan ? (
              <div className="flex items-center gap-2.5" data-testid="review-plan">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white">
                  <ShieldCheck className="size-5 text-brand" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-[15px] font-semibold tracking-body">
                  {plan.name.split(' ')[0]}{' '}
                  <span className="text-brand">{plan.name.split(' ').slice(1).join(' ')}</span>
                </span>
                <PriceBlock
                  variant="review"
                  price={plan.price}
                  compareAtPrice={plan.compareAtPrice}
                  suffix={`/${plan.billingPeriod}`}
                />
              </div>
            ) : (
              group.lines.map((line) => <ReviewLine key={line.key} line={line} />)
            )}
          </div>
        </section>
      ))}

      {catalog.perks.map((perk) => (
        <div
          key={perk.id}
          className="mt-[15px] flex items-center gap-2.5 border-t border-divider pt-[15px]"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white">
            <Truck className="size-6 text-success" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 text-[14px] font-medium tracking-body">{perk.name}</span>
          <PriceBlock
            variant="review"
            price={perk.price}
            compareAtPrice={perk.compareAtPrice}
            priceLabel={perk.priceLabel}
          />
        </div>
      ))}

      <div className="mt-[15px] flex items-center gap-3 border-t border-divider pt-[15px]">
        <GuaranteeBadge label={meta.guaranteeLabel} />
        <div className="flex flex-1 flex-col items-end gap-1.5">
          <span className="rounded bg-brand px-2 py-0.5 text-[11px] font-medium text-white">
            {meta.financingLabel}
          </span>
          <p className="flex items-baseline gap-2">
            <s className="text-[15px] text-price/70">{formatPrice(compareAtTotal)}</s>
            <span className="text-[24px] font-bold text-brand">{formatPrice(total)}</span>
          </p>
        </div>
      </div>

      <p className="mt-2 text-center text-[12px] font-semibold text-success">{savingsMessage}</p>

      <button
        type="button"
        onClick={() => setCheckoutOpen(true)}
        className="mt-3 w-full rounded bg-brand py-[13px] text-[16px] font-semibold text-white transition-colors hover:bg-brand/90"
      >
        Checkout
      </button>

      <button
        type="button"
        onClick={handleSave}
        className="mx-auto mt-3 block text-[14px] font-medium text-ink/70 underline transition-colors hover:text-ink"
      >
        {saved ? 'Saved — see you soon!' : 'Save my system for later'}
      </button>

      <CheckoutModal open={checkoutOpen} total={total} onClose={() => setCheckoutOpen(false)} />
    </div>
  )
}
