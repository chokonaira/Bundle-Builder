import { Cctv, Grip, Radar, ShieldCheck, type LucideIcon } from 'lucide-react'
import type { Step } from '../types/catalog'

const icons: Record<Step['icon'], LucideIcon> = {
  camera: Cctv,
  shield: ShieldCheck,
  sensor: Radar,
  grid: Grip,
}

export function StepIcon({ icon, className }: { icon: Step['icon']; className?: string }) {
  const Icon = icons[icon]
  return <Icon className={className} aria-hidden="true" />
}
