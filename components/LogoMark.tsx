'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * An institution's mark, shown inline before its name.
 *
 * Hides itself when the file is missing rather than leaving a broken image, so
 * the line still reads correctly before the asset is supplied.
 *
 * onError alone is not enough: the image is server-rendered, so a 404 fires its
 * error event before React hydrates and attaches the handler. The effect below
 * re-checks the element's own loaded state on mount, which catches the failure
 * either way.
 */
export function LogoMark({
  src,
  alt,
  size = 18,
  className = '',
}: {
  src: string
  alt: string
  size?: number
  /** `mark-mono` strips the colour, for pages that hold a monochrome line. */
  className?: string
}) {
  const ref = useRef<HTMLImageElement>(null)
  const [ok, setOk] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.complete && el.naturalWidth === 0) setOk(false)
  }, [src])

  if (!ok) return null

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => setOk(false)}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        flex: 'none',
        display: 'inline-block',
        verticalAlign: '-4px',
        marginRight: 7,
      }}
    />
  )
}
