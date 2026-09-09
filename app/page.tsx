import { Settle } from '@/components/Settle'
import { AboutStage } from '@/components/AboutStage'

/**
 * About.
 *
 * A portrait, a record and a statement, floating in the dark — see AboutStage
 * for how the three are arranged and why nothing on it is framed.
 *
 * The page itself is just the container and the boot animation.
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
        <Settle boot mass="light">
          <AboutStage />
        </Settle>
      </div>
    </div>
  )
}
