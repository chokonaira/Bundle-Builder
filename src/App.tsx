import { BuilderAccordion } from './components/BuilderAccordion'
import { ReviewPanel } from './components/ReviewPanel'
import { catalog } from './data/catalog'
import { BundleProvider } from './store/BundleProvider'
import { loadSavedState } from './store/persistence'

function App() {
  // Restore a saved system if the shopper left one behind; otherwise the
  // seed state renders the app exactly as the design shows it.
  const restored = loadSavedState(catalog)

  return (
    <BundleProvider initial={restored ?? undefined}>
      <main className="mx-auto max-w-[1196px] px-4 py-8">
        {/* Visible heading on mobile per the design; stays in the a11y tree on desktop. */}
        <h1 className="mb-4 text-center text-[24px] font-semibold lg:sr-only">
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
