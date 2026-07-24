/**
 * The design's purple satisfaction seal: scalloped edge, "100%" over
 * "Wyze satisfaction guarantee" in the middle, and "Try worry-free for
 * 30 days" running around the rim. Drawn to match the Figma art until
 * an exported asset replaces it.
 */
export function GuaranteeBadge({ label }: { label: string }) {
  return (
    <div
      className="relative flex size-[86px] shrink-0 items-center justify-center"
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 text-brand" aria-hidden="true">
        <path fill="currentColor" d={rosettePath(50, 50, 49, 45, 28)} />
        <defs>
          <path id="badge-rim" d={circlePath(50, 50, 38.5)} />
        </defs>
        <text className="fill-white/90" fontSize="8.2" letterSpacing="0.8">
          <textPath href="#badge-rim" startOffset="2%">
            Try worry-free for 30 days
          </textPath>
          <textPath href="#badge-rim" startOffset="52%">
            Try worry-free for 30 days
          </textPath>
        </text>
      </svg>
      <span className="relative flex flex-col items-center leading-none text-white">
        <span className="text-[17px] font-bold">100%</span>
        <span className="mt-0.5 w-[52px] text-center text-[7.5px] leading-[1.3] font-semibold">
          Wyze satisfaction guarantee
        </span>
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
    points.push(
      `${i === 0 ? 'M' : 'L'}${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`,
    )
  }
  return `${points.join(' ')} Z`
}

/** Full circle as two arcs so textPath can run along it, starting at the top. */
function circlePath(cx: number, cy: number, r: number): string {
  return `M ${cx - r},${cy} a ${r},${r} 0 1,1 ${2 * r},0 a ${r},${r} 0 1,1 ${-2 * r},0`
}
