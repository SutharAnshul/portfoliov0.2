import { Settle } from '@/components/Settle'
import { AboutStage } from '@/components/AboutStage'
import { PhoneOnly } from '@/components/PhoneOnly'
import { WorkIndex } from '@/components/WorkIndex'

/**
 * About.
 *
 * A portrait, a record and a statement, floating in the dark — see AboutStage
 * for how the three are arranged and why nothing on it is framed.
 *
 * On a phone the work index follows it in the same scroll. There is no rail
 * down there to move between two sections with any more, and a phone is a
 * scrolling device before it is a navigating one: the two things worth reading
 * are About and the work, so they are one document and the thumb is the only
 * control needed. The "more to explore" at the foot of the About stage stops
 * being a joke about a page that ends and becomes a label for what is under
 * it.
 *
 * The desktop keeps them apart. There the rail is always on screen, both
 * destinations are one press away, and stacking them would only make the
 * page longer without making anything easier to reach.
 */
export default function Page() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* A container, not just a wrapper: the stage's breakpoints have to read
          the width of this column rather than of the window. The sidebar and
          the chat panel both take space the viewport knows nothing about, so
          at 1500px of window there can be as little as 778px of column. */}
      <div className="about-page">
        {/* One Settle around all three rather than one each. Staggering them
            in would say they arrive in an order; they do not. */}
        <Settle boot mass="light" className="about-settle">
          <AboutStage />
        </Settle>
      </div>

      <PhoneOnly>
        <section className="about-continues" aria-label="Selected work">
          <WorkIndex />
        </section>
      </PhoneOnly>
    </div>
  )
}
