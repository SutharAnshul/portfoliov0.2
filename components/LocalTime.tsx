'use client'

import { useEffect, useState } from 'react'

/**
 * His clock, not yours, and actually running.
 *
 * The location card says where he is by telling you what time it is there,
 * which is a friendlier way of saying "different timezone, expect a delay"
 * than a UTC offset would be. A clock that does not move says the opposite —
 * it reads as a screenshot of a time rather than the time.
 *
 * Rendered empty on the server and filled on mount: the server has no idea
 * what second it is in the visitor's browser, and printing one there would
 * either mismatch on hydration or be stale the moment the page was cached.
 */
export function LocalTime({
  timeZone = 'Asia/Kolkata',
  label = 'IST',
}: {
  timeZone?: string
  label?: string
}) {
  const [now, setNow] = useState<string | null>(null)

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone,
    })

    const read = () => setNow(fmt.format(new Date()))
    read()

    /**
     * Re-aimed at the next whole second on every tick rather than left on a
     * fixed 1000ms interval. setInterval drifts, and a background tab has its
     * timers throttled to about once a minute — a clock that resumes half a
     * minute behind is worse than one that never moved. Reading the wall clock
     * each time means it is correct on the first tick after the tab wakes.
     */
    let timer = 0
    const schedule = () => {
      timer = window.setTimeout(() => {
        read()
        schedule()
      }, 1000 - (Date.now() % 1000))
    }
    schedule()

    return () => window.clearTimeout(timer)
  }, [timeZone])

  return (
    // Tabular figures: in a proportional face the seconds digit changes width
    // as it counts and drags the rest of the line back and forth once a second.
    <span suppressHydrationWarning style={{ fontVariantNumeric: 'tabular-nums' }}>
      {now ? `${now} (${label})` : ' '}
    </span>
  )
}
