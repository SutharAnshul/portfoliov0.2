import { About } from '@/components/About'
import { WorkGrid } from '@/components/WorkGrid'
import { ContactRow } from '@/components/ContactRow'

/**
 * The whole site above the records: who he is, then what he has made.
 *
 * One page and one scroll. There used to be a rail holding two destinations
 * and a list of projects, and two routes behind it; the page is short enough
 * that all of it was navigation to somewhere a thumb's worth of scrolling
 * would have reached anyway.
 */
export default function Home() {
  return (
    <>
      <About />
      <WorkGrid />

      {/* The CV has gone up the page to stand beside "Open to work", where
          it is read at the moment it is wanted. */}
      <footer className="foot">
        <ContactRow />
      </footer>
    </>
  )
}
