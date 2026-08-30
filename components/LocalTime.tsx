'use client'

import { useEffect, useState } from 'react'

/**
 * His clock, not yours.
 *
 * The reference card says where he is by telling you what time it is there,
 * which is a friendlier way of saying "different timezone, expect a delay"
 * than a UTC offset would be.
 *
 * Rendered empty on the server and filled on mount: the server has no idea
 * what minute it is in the visitor's browser, and printing a time there would
 * either mismatch on hydration or go stale the moment the page was cached.
 */
export function LocalTime({ timeZone = 'Asia/Kolkata', label = 'IST' }: { timeZone?: string; label?: string }) {
  const [now, setNow] = useState<string | null>(null)

  useEffect(() => {
    const read = () =>
      setNow(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone,
        }).format(new Date()),
      )

    read()
    // Tick on the minute boundary rather than every 60s from mount, so the
    // displayed minute changes when the real one does.
    let interval: number
    const timeout = window.setTimeout(() => {
      read()
      interval = window.setInterval(read, 60_000)
    }, (60 - new Date().getSeconds()) * 1000)

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [timeZone])

  // A reserved character cell, so the line does not reflow when the time lands.
  return <span suppressHydrationWarning>{now ? `${now} (${label})` : ' '}</span>
}
