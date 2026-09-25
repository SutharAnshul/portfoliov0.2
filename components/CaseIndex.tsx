'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Where you are in a record, in the margin beside it.
 *
 * The frames take the right two thirds of the page and the left third is
 * empty; this is what that space is for. Every frame has a line here, and the
 * list moves as you scroll so the line for the frame you are looking at always
 * sits on the same mark. It reads as a tape running past a head rather than as
 * a list with something highlighted in it — which is the difference between
 * knowing there are thirty-one frames and knowing you are on the ninth.
 *
 * The lines are taken from what each frame is already described as, so the
 * index cannot fall out of step with the record: nothing is written twice.
 *
 * A line is also a way back to its frame. Nothing about it says so — no
 * underline, no hand — because the marker is the point and a column of
 * thirty-one links would shout over the work it is describing.
 *
 * It is a pointer's tool, so it is not drawn on a phone: there is no room
 * beside a full-width frame, and a finger has the scrollbar and the numbers in
 * the corner of each plate for the same job.
 */

/** The height of one line, and the distance the tape moves per frame. */
const ROW = 22

/** Where the head sits: the line the current frame is read against. */
const HEAD = 0.42

export function CaseIndex({ labels }: { labels: string[] }) {
  const [at, setAt] = useState(0)
  const frames = useRef<HTMLElement[]>([])

  useEffect(() => {
    frames.current = [...document.querySelectorAll<HTMLElement>('[data-frame]')]
    if (!frames.current.length) return

    let queued = 0

    const read = () => {
      queued = 0
      const line = window.innerHeight * HEAD
      let now = 0
      for (let i = 0; i < frames.current.length; i++) {
        /* The last frame whose top has passed the head. Tops rather than
           midpoints: a frame taller than the window would otherwise hand over
           to the next one while most of it is still on screen. */
        if (frames.current[i].getBoundingClientRect().top <= line) now = i
      }
      setAt(now)
    }

    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    /* Anything that changes where the frames are. Their boxes are reserved
       from the files' own dimensions, so this should be quiet — but a record
       is a long page, and being right about position is this thing's only
       job. */
    const ro = new ResizeObserver(onScroll)
    ro.observe(document.body)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      ro.disconnect()
      if (queued) cancelAnimationFrame(queued)
    }
  }, [labels.length])

  const go = (i: number) => {
    const el = frames.current[i]
    if (!el) return
    const y = window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.18
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <nav className="case-index" aria-label="Frames in this record">
      <div className="case-index-window" style={{ ['--row' as string]: `${ROW}px` }}>
        <ol className="case-index-tape" style={{ ['--at' as string]: at }}>
          {labels.map((label, i) => (
            <li key={i} className="case-index-row" data-on={i === at}>
              <button type="button" onClick={() => go(i)}>
                <span className="case-index-no">{String(i + 1).padStart(2, '0')}</span>
                <span className="case-index-label">{label}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
