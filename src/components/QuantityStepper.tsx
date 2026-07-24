import { Minus, Plus } from 'lucide-react'
import { MAX_QTY } from '../store/bundleState'

interface Props {
  qty: number
  onChange: (qty: number) => void
  disabled?: boolean
  /** Accessible name of the thing being counted, e.g. "Wyze Cam v4 quantity". */
  label: string
  size?: 'md' | 'sm'
}

/**
 * Shared − N + control. Both the product cards and the review-panel lines
 * render this against the same store key, which is what keeps them in sync.
 */
export function QuantityStepper({ qty, onChange, disabled = false, label, size = 'md' }: Props) {
  const btn = size === 'md' ? 'size-6 rounded-md text-[14px]' : 'size-5 rounded text-[12px]'
  const btnBase = `${btn} flex items-center justify-center bg-lavender text-ink/70 transition-colors
     hover:bg-brand/10 disabled:cursor-not-allowed disabled:bg-lavender/60 disabled:text-ink/25`

  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button
        type="button"
        className={btnBase}
        onClick={() => onChange(qty - 1)}
        disabled={disabled || qty === 0}
        aria-label={`Decrease ${label}`}
      >
        <Minus className="size-3.5" />
      </button>
      <span
        className={`min-w-4 text-center font-semibold ${size === 'md' ? 'text-[16px]' : 'text-[14px]'}`}
        aria-live="polite"
      >
        {qty}
      </span>
      <button
        type="button"
        className={btnBase}
        onClick={() => onChange(qty + 1)}
        disabled={disabled || qty >= MAX_QTY}
        aria-label={`Increase ${label}`}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
