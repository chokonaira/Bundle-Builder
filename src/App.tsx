import { BuilderAccordion } from './components/BuilderAccordion'
import { BundleProvider } from './store/BundleProvider'

function App() {
  return (
    <BundleProvider>
      <main className="mx-auto flex max-w-[1196px] gap-[29px] px-4 py-8 max-lg:flex-col">
        <h1 className="hidden text-center text-[24px] font-semibold max-lg:block">
          Let&rsquo;s get started!
        </h1>
        <div className="min-w-0 flex-1">
          <BuilderAccordion />
        </div>
        <aside className="w-[399px] shrink-0 max-lg:w-full">
          {/* Review panel lands in the next commit */}
        </aside>
      </main>
    </BundleProvider>
  )
}

export default App
