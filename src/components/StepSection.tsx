import { ChevronDown, ChevronUp } from 'lucide-react'
import { useBundle } from '../store/BundleProvider'
import { stepSelectedCount } from '../store/selectors'
import type { Step } from '../types/catalog'
import { PlanCard } from './PlanCard'
import { ProductCard } from './ProductCard'
import { StepIcon } from './StepIcon'

interface Props {
  step: Step
  index: number
  nextStep?: Step
}

export function StepSection({ step, index, nextStep }: Props) {
  const { catalog, state, dispatch } = useBundle()
  const expanded = state.openStep === step.id
  const count = stepSelectedCount(catalog, state, step.id)

  const products = catalog.products.filter((p) => p.step === step.id)
  const plans = catalog.plans.filter((p) => p.step === step.id)
  const panelId = `step-panel-${step.id}`

  const header = (
    <button
      type="button"
      className="flex w-full items-center gap-2.5 py-3"
      onClick={() => dispatch({ type: 'toggleStep', step: step.id })}
      aria-expanded={expanded}
      aria-controls={expanded ? panelId : undefined}
    >
      <StepIcon icon={step.icon} className="size-6 shrink-0 text-ink" />
      <span className="text-left text-[20px] font-semibold tracking-body max-md:text-[17px]">
        {step.title}
      </span>
      <span className="ml-auto flex items-center gap-1.5">
        <span
          className={`text-[14px] font-medium text-brand ${expanded ? '' : 'hidden max-lg:inline'}`}
        >
          {count} selected
        </span>
        {expanded ? (
          <ChevronUp className="size-4 text-brand" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-4 text-ink/50" aria-hidden="true" />
        )}
      </span>
    </button>
  )

  // The design keeps the hairline + eyebrow inside the step surface: the
  // expanded step's lavender box starts flush with the review panel's top
  // and the "STEP X OF 4" label sits within it.
  const eyebrow = (
    <p className="border-t border-ink/80 pt-2 text-[11px] font-medium tracking-[1.5px] text-ink/60 uppercase">
      Step {index + 1} of {catalog.steps.length}
    </p>
  )

  return (
    <section aria-label={`Step ${index + 1} of ${catalog.steps.length}: ${step.title}`}>
      {expanded ? (
        <div className="rounded-card bg-lavender px-[15px] pt-3 pb-5">
          {eyebrow}
          {header}
          <div id={panelId} className="flex flex-col gap-[15px]">
            {products.length > 0 && (
              <div className="grid grid-cols-2 gap-[15px] max-md:grid-cols-1">
                {products.map((product, i) => {
                  const centerLastOdd = products.length % 2 === 1 && i === products.length - 1
                  return (
                    <div
                      key={product.id}
                      className={
                        centerLastOdd ? 'md:col-span-2 md:mx-auto md:w-[calc(50%-7.5px)]' : 'h-full'
                      }
                    >
                      <ProductCard product={product} />
                    </div>
                  )
                })}
              </div>
            )}
            {plans.length > 0 && (
              <div className="flex flex-col gap-[15px]" role="group" aria-label="Plans">
                {plans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            )}
            {nextStep && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'openStep', step: nextStep.id })}
                className="mx-auto mt-1 rounded-lg border border-brand px-5 py-2.5 text-[14px] font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
              >
                Next: {nextStep.title}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {eyebrow}
          {header}
        </div>
      )}
    </section>
  )
}
