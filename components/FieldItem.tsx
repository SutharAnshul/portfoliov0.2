'use client'

import { useEffect, useRef } from 'react'
import { joinField, type FieldOptions } from '@/lib/field'
import { installMaterial } from '@/lib/physics'

/**
 * Registers its wrapper with the global cursor field, so the element drifts
 * toward the pointer under the same inverse-power law as the portrait.
 *
 * The deflection is deliberately tiny — a few pixels. The point is that the
 * page feels like it has mass and is aware of you, not that things visibly
 * move around.
 */
interface Props extends FieldOptions {
  children: React.ReactNode
  className?: string
}

export function FieldItem({ children, className = '', ...options }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { maxShift, radiusRatio, mass } = options

  useEffect(() => {
    installMaterial()
    const el = ref.current
    if (!el) return
    return joinField(el, { maxShift, radiusRatio, mass })
  }, [maxShift, radiusRatio, mass])

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  )
}
