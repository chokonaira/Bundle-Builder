import { useBundle } from '../store/BundleProvider'
import { StepSection } from './StepSection'

export function BuilderAccordion() {
  const { catalog } = useBundle()
  return (
    <div className="flex flex-col gap-4">
      {catalog.steps.map((step, i) => (
        <StepSection key={step.id} step={step} index={i} nextStep={catalog.steps[i + 1]} />
      ))}
    </div>
  )
}
