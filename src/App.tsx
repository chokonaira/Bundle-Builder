import { BuilderAccordion } from './components/BuilderAccordion'
import { ReviewPanel } from './components/ReviewPanel'
import { BundleProvider } from './store/BundleProvider'

function App() {
  return (
    <BundleProvider>
      <main className="mx-auto max-w-[1196px] px-4 py-8">
        <h1 className="mb-4 hidden text-center text-[24px] font-semibold max-lg:block">
          Let&rsquo;s get started!
        </h1>
        <div className="flex gap-[29px] max-lg:flex-col">
          <div className="min-w-0 flex-1">
            <BuilderAccordion />
          </div>
          <aside className="w-[399px] shrink-0 self-start max-lg:w-full lg:sticky lg:top-4">
            <ReviewPanel />
          </aside>
        </div>
      </main>
    </BundleProvider>
  )
}

export default App
