/**
 * Purple rosette approximating the design's "100% Wyze satisfaction
 * guarantee" seal. Swap for the exported Figma asset when available.
 */
export function GuaranteeBadge({ label }: { label: string }) {
  return (
    <div
      className="relative flex size-[76px] shrink-0 items-center justify-center"
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 76 76" className="absolute inset-0 text-brand" aria-hidden="true">
        <path fill="currentColor" d={rosettePath(38, 38, 36, 32, 24)} />
      </svg>
      <span className="relative px-3 text-center text-[8px] leading-[1.25] font-semibold text-white">
        100% Wyze satisfaction guarantee
      </span>
    </div>
  )
}

/** Scalloped-seal outline: alternating outer/inner radius points. */
function rosettePath(cx: number, cy: number, outer: number, inner: number, teeth: number): string {
  const points: string[] = []
  const steps = teeth * 2
  for (let i = 0; i < steps; i++) {
    const r = i % 2 === 0 ? outer : inner
    const angle = (i / steps) * Math.PI * 2 - Math.PI / 2
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return `${points.join(' ')} Z`
}
