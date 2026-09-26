'use client'
import { useEffect } from 'react'
import './solic-fonts.css'
import './solic.css'
import { ImgBase } from './components/ui'
import Chrome from './components/Chrome'
import Act01 from './acts/Act01'
import Act02 from './acts/Act02'
import Act03 from './acts/Act03'
import Act04 from './acts/Act04'
import Act05 from './acts/Act05'
import Act06 from './acts/Act06'
import Act07 from './acts/Act07'
import Coda from './acts/Coda'

/**
 * Solic Arc case study — a full-page, scroll-driven editorial.
 *
 * Mount it on its own route, outside any layout that scrolls inside an overflow container:
 * every effect (act colours, the shape morph, reveals) reads the WINDOW scroll position.
 *
 * @param {string}  imgBase    URL prefix for the images, with trailing slash. Default '/solic-arc/img/'.
 * @param {string}  backHref   Optional link shown in the top bar, e.g. '/work'.
 * @param {string}  backLabel  Text for that link. Default 'All work'.
 * @param {boolean} resetScroll Scroll to the top when the page mounts. Default true.
 */
export default function SolicArc({ imgBase = '/solic-arc/img/', backHref, backLabel, resetScroll = true }) {
  useEffect(() => {
    if (resetScroll) window.scrollTo(0, 0)
  }, [resetScroll])

  return (
    <ImgBase.Provider value={imgBase}>
      <div className="solic">
        <Chrome backHref={backHref} backLabel={backLabel} />
        <main>
          <Act01 />
          <Act02 />
          <Act03 />
          <Act04 />
          <Act05 />
          <Act06 />
          <Act07 />
          <Coda />
        </main>
      </div>
    </ImgBase.Provider>
  )
}
