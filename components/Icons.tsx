/**
 * One icon set, drawn as objects from the room rather than stock glyphs.
 *
 *   Aperture      an iris — the about page, where the portrait develops
 *   Contact sheet a frame grid with one chinagraph select marked
 *   Bolt          a hex head with a slot — things he tinkers with
 *
 * All on a 24 grid, 1.25px stroke, currentColor, no fills, so they sit at the
 * same weight as the hairlines everywhere else.
 */

interface Props {
  size?: number
  className?: string
}

const base = (size: number) => ({
  style: { overflow: 'visible' as const },
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

/** Iris diaphragm — six blades around a circular opening. */
export function IconAperture({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="9.2" />
      <g className="mech-blades">
        <path d="M13.9 8.4 L18.9 17.1" />
        <path d="M10.1 8.4 L20.1 8.4" />
        <path d="M8.2 11.7 L13.2 3" />
        <path d="M10.1 15.6 L5.1 6.9" />
        <path d="M13.9 15.6 L3.9 15.6" />
        <path d="M15.8 12.3 L10.8 21" />
      </g>
    </svg>
  )
}

/** Contact sheet: six frames, one circled the way a select is marked. */
export function IconSheet({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="4.5" width="18" height="15" rx="1" />
      <path d="M9 4.5v15M15 4.5v15M3 12h18" />
      <circle className="mech-select" cx="12" cy="8.25" r="2.1" />
    </svg>
  )
}

/** Hex bolt, slotted. */
export function IconBolt({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path className="mech-bolt" d="M12 2.8 L19 6.9 V15.1 L12 19.2 L5 15.1 V6.9 Z" />
      <circle cx="12" cy="11" r="3.4" />
      <path className="mech-slot" d="M12 7.6v6.8" />
    </svg>
  )
}

/** Sun, for the light theme. */
export function IconSun({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
    </svg>
  )
}

/** Crescent, for the dark theme. */
export function IconMoon({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M20.5 14.2A8.6 8.6 0 1 1 9.8 3.5a6.8 6.8 0 0 0 10.7 10.7Z" />
    </svg>
  )
}

// ── Transport ───────────────────────────────────────────────────────────

export function IconPrev({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M18.5 5.5v13L9 12l9.5-6.5Z" />
      <path d="M5.5 5v14" />
    </svg>
  )
}

export function IconNext({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5.5 5.5v13L15 12 5.5 5.5Z" />
      <path d="M18.5 5v14" />
    </svg>
  )
}

export function IconPlay({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M7 4.8v14.4L19.5 12 7 4.8Z" />
    </svg>
  )
}

export function IconPause({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M9 4.5v15M15 4.5v15" />
    </svg>
  )
}

export function IconClose({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

// ── Contact ─────────────────────────────────────────────────────────────
// Filled marks rather than hairline outlines: these carry brand colour, and a
// 1.25px stroke cannot hold a colour the way a solid shape can.

const solid = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': true,
})

export function IconMail({ size = 18, className }: Props) {
  return (
    <svg {...solid(size)} className={className}>
      <path d="M2.5 6.4A2.4 2.4 0 0 1 4.9 4h14.2a2.4 2.4 0 0 1 2.4 2.4v.2L12 12.9 2.5 6.6Z" />
      <path d="M2.5 8.7 12 14.9l9.5-6.2v8.9a2.4 2.4 0 0 1-2.4 2.4H4.9a2.4 2.4 0 0 1-2.4-2.4Z" />
    </svg>
  )
}

export function IconPhone({ size = 18, className }: Props) {
  return (
    <svg {...solid(size)} className={className}>
      <path d="M6.7 3H5.6A2.6 2.6 0 0 0 3 5.6C3 14.1 9.9 21 18.4 21a2.6 2.6 0 0 0 2.6-2.6v-1.1a1.3 1.3 0 0 0-.9-1.2l-3.8-1.3a1.3 1.3 0 0 0-1.4.4l-1.2 1.5a15.6 15.6 0 0 1-6.5-6.5l1.5-1.2a1.3 1.3 0 0 0 .4-1.4L7.9 3.9A1.3 1.3 0 0 0 6.7 3Z" />
    </svg>
  )
}

export function IconLinkedIn({ size = 18, className }: Props) {
  return (
    <svg {...solid(size)} className={className}>
      <path d="M20.4 2H3.6A1.6 1.6 0 0 0 2 3.6v16.8A1.6 1.6 0 0 0 3.6 22h16.8a1.6 1.6 0 0 0 1.6-1.6V3.6A1.6 1.6 0 0 0 20.4 2ZM8.1 18.7H5.2V9.6h2.9Zm-1.5-10.4a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4Zm12.1 10.4h-2.9v-4.4c0-1.1 0-2.4-1.5-2.4s-1.7 1.1-1.7 2.3v4.5H9.7V9.6h2.8v1.3h.1a3.1 3.1 0 0 1 2.8-1.6c3 0 3.5 2 3.5 4.5Z" />
    </svg>
  )
}

export function IconBehance({ size = 18, className }: Props) {
  return (
    <svg {...solid(size)} className={className}>
      <path d="M9.4 11.5c.8-.4 1.2-1.1 1.2-2.2 0-2.2-1.6-2.9-3.5-2.9H1.1v11.3h6.1c2.1 0 4-1 4-3.3 0-1.4-.7-2.5-1.8-2.9ZM3.6 8.3h2.6c1 0 1.9.3 1.9 1.4s-.7 1.4-1.7 1.4H3.6Zm2.9 7.3H3.6v-3.2h3c1.2 0 2 .5 2 1.7s-.9 1.5-2.1 1.5ZM23 12.9c0-2.6-1.6-4.8-4.3-4.8s-4.4 2-4.4 4.6 1.7 4.6 4.4 4.6c2 0 3.4-.9 4.1-2.9h-2.2c-.3.7-1 1.1-1.8 1.1-1.3 0-2-.8-2-2.1H23Zm-6.2-1.4c.1-1.1.8-1.8 1.9-1.8s1.8.6 1.9 1.8ZM15.4 5.7h5.4V7h-5.4z" />
    </svg>
  )
}

// ── Marigold ────────────────────────────────────────────────────────────

/**
 * The bloom on the Orion button. Drawn rather than a PNG so it stays crisp at
 * any size and needs no asset — swap the <svg> for an <img> if a photographed
 * flower is preferred; the positioning in CSS is independent of what fills it.
 *
 * Two petal rings offset by half a step give the head depth without needing a
 * gradient, and the stem is drawn long so it can run past the button edge.
 */
export function Marigold({ size = 44, className }: { size?: number; className?: string }) {
  const cx = 22
  const cy = 22
  const ring = (count: number, rx: number, ry: number, dist: number, fill: string, offset = 0) =>
    Array.from({ length: count }).map((_, i) => {
      const angle = (360 / count) * i + offset
      return (
        <ellipse
          key={`${fill}-${i}`}
          cx={cx}
          cy={cy - dist}
          rx={rx}
          ry={ry}
          fill={fill}
          transform={`rotate(${angle} ${cx} ${cy})`}
        />
      )
    })

  return (
    <svg
      width={size}
      height={size * (64 / 44)}
      viewBox="0 0 44 64"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ overflow: 'visible' }}
    >
      {/* Stem, drawn from below the frame so it can emerge from an edge */}
      <path d="M22 64V30" stroke="#3F7D34" strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="M22 47c-5.4 0-8.6-3-9.2-7.6 5-.6 8.6 2 9.2 7.6Z"
        fill="#4E9A3F"
      />
      <path
        d="M22 39c4.4-.5 6.8-3.2 6.6-7.3-4.2.3-6.4 2.8-6.6 7.3Z"
        fill="#5CAF4A"
      />

      {/* Head */}
      {ring(11, 5.2, 9.4, 8.6, '#F59E0B')}
      {ring(9, 4.4, 7.4, 6.4, '#F97316', 20)}
      {ring(7, 3.2, 5, 4, '#EA580C', 12)}
      <circle cx={cx} cy={cy} r="4.6" fill="#FDE047" />
      <circle cx={cx} cy={cy} r="2.1" fill="#F59E0B" />
    </svg>
  )
}


/**
 * Orion. A ginger tabby, sitting.
 *
 * Proportion is what stops a sitting cat reading as a loaf: the body tapers to
 * roughly the width of the head rather than spreading past it, the legs are
 * drawn in front so there is a front to the animal, and the head is set at
 * about a fifth of the total height. Stripes, whiskers and pupils are what
 * make it a particular cat instead of a cat-shaped icon — they cost nothing at
 * 44px and are the difference between a mark and a pet.
 *
 * The parts are named rather than merged into one path so CSS can move them
 * independently: the tail turns from where it meets the body, the ears from
 * their own bases, and the eyes blink on their own clock.
 */
export function CatMark({ size = 40, className }: { size?: number; className?: string }) {
  const h = (size * 48) / 40
  return (
    <svg
      className={`cat ${className ?? ''}`}
      width={size}
      height={h}
      viewBox="0 0 40 48"
      fill="none"
      aria-hidden="true"
    >
      {/* Tail, drawn first so it sits behind the body */}
      <g className="cat-tail">
        <path
          d="M27.6 42c6.9.5 10-5.5 7-11-1-1.8-2.6-2.8-4-2.6"
          stroke="#C9702F"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path d="M33.9 37.6c.7.5 1.5.6 2.2.3" stroke="#B0601F" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M34.2 31.6c.6-.5 1.3-.7 2-.5" stroke="#B0601F" strokeWidth="1.1" strokeLinecap="round" />
      </g>

      {/* Body — tapers to about the width of the head */}
      <path
        className="cat-body"
        d="M20 19.5c4.8 0 7.4 6 8 18 .2 3.9-1.4 6-4.4 6h-7.2c-3 0-4.6-2.1-4.4-6 .6-12 3.2-18 8-18z"
        fill="#D9803C"
      />
      <path
        className="cat-bib"
        d="M20 27c2.6 0 3.8 5 4 12.5.1 2.5-.8 4-2.2 4h-3.6c-1.4 0-2.3-1.5-2.2-4 .2-7.5 1.4-12.5 4-12.5z"
        fill="#F0AA6B"
      />

      {/* Front legs, so the animal has a front */}
      <rect x="15.5" y="35.6" width="3.5" height="7.9" rx="1.75" fill="#EDA463" />
      <rect x="21" y="35.6" width="3.5" height="7.9" rx="1.75" fill="#EDA463" />

      <g className="cat-head">
        <g className="cat-ear-l">
          <path d="M12.8 10.5 11.4 1.8l7.8 4.8z" fill="#D9803C" />
          <path d="M13.9 9.1 13.1 4.3l4.3 2.9z" fill="#E9A0A4" />
        </g>
        <g className="cat-ear-r">
          <path d="M27.2 10.5 28.6 1.8l-7.8 4.8z" fill="#D9803C" />
          <path d="M26.1 9.1l.8-4.8-4.3 2.9z" fill="#E9A0A4" />
        </g>

        <circle cx="20" cy="14.8" r="8.3" fill="#D9803C" />

        {/* Tabby marking */}
        <g stroke="#B8682C" strokeWidth="1.1" strokeLinecap="round">
          <path d="M17.7 8.6l1.1 2.3" />
          <path d="M20 8.1v2.6" />
          <path d="M22.3 8.6l-1.1 2.3" />
        </g>

        <ellipse cx="20" cy="18.5" rx="4.6" ry="3.2" fill="#F0AA6B" />

        <g className="cat-eyes">
          <ellipse cx="16.7" cy="14.1" rx="2" ry="2.4" fill="#4FA871" />
          <ellipse cx="23.3" cy="14.1" rx="2" ry="2.4" fill="#4FA871" />
          <ellipse cx="16.7" cy="14.1" rx=".75" ry="1.9" fill="#1B3326" />
          <ellipse cx="23.3" cy="14.1" rx=".75" ry="1.9" fill="#1B3326" />
        </g>

        <path d="M20 17.4l1.3 1.2h-2.6z" fill="#C9525A" />
        <path d="M20 18.9v1.1M20 20c-.7.8-1.6.8-2.2.2M20 20c.7.8 1.6.8 2.2.2"
          stroke="#A85A34" strokeWidth=".8" strokeLinecap="round" />

        <g stroke="#F3C79E" strokeWidth=".6" strokeLinecap="round" opacity=".75">
          <path d="M15.2 18.4 10 17.3M15.2 19.8 10.3 20.4" />
          <path d="M24.8 18.4 30 17.3M24.8 19.8 29.7 20.4" />
        </g>
      </g>
    </svg>
  )
}

/**
 * Orion in profile, mid-leap. A different drawing from the sitting mark on
 * purpose — a front-facing cat slid along a path reads as a sticker, and no
 * amount of easing fixes that. This one faces right, body extended, and is
 * built so the leap can actually be acted:
 *
 *  - `leg-front` and `leg-back` rotate from their shoulder and hip, so the
 *    legs can reach ahead on the descent, fold under the body at contact, and
 *    trail on the way up.
 *  - `tail-s` pivots where it meets the body and is animated a beat behind
 *    everything else, because a tail follows the cat rather than moving with it.
 *  - The spine is drawn slightly arched so that squashing it at contact reads
 *    as the animal compressing rather than the picture being scaled.
 */
export function CatSide({ size = 62, className }: { size?: number; className?: string }) {
  const h = (size * 36) / 64
  return (
    <svg
      className={`cat-side ${className ?? ''}`}
      width={size}
      height={h}
      viewBox="0 0 64 36"
      fill="none"
      aria-hidden="true"
    >
      <g className="tail-s">
        <path
          d="M15 18c-6-1-9-5-7.5-9.5"
          stroke="#C9702F"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M8.6 12.4c-.7.3-1.4.2-2-.2" stroke="#B0601F" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Back legs — the ones that do the pushing */}
      <g className="leg-back">
        <path d="M22 20c-2.4 2.6-5.4 4.6-8.4 5.4" stroke="#C9702F" strokeWidth="4.4" strokeLinecap="round" />
        <path d="M13.8 25.2c-1.6.4-2.8.5-4 .3" stroke="#EDA463" strokeWidth="3.4" strokeLinecap="round" />
      </g>

      {/* Body — spine slightly arched */}
      <path
        className="body-s"
        d="M16 19.5c0-6.2 6.4-9.5 16-9.5s15.5 3.2 15.5 9c0 5.4-6 8-15.5 8s-16-1.8-16-7.5z"
        fill="#D9803C"
      />
      <path
        className="belly-s"
        d="M20 24.5c3 2 8 2.8 13 2.4 4-.3 7-1.3 8.6-2.6-2.4 2.2-6.6 3.2-11.6 3.2-4.4 0-8-.9-10-3z"
        fill="#F0AA6B"
      />

      {/* Front legs — the ones that reach */}
      <g className="leg-front">
        <path d="M42 20c2.6 2.8 5.8 5 9 6" stroke="#D9803C" strokeWidth="4.4" strokeLinecap="round" />
        <path d="M50.4 25.6c1.4.5 2.6.7 3.8.6" stroke="#EDA463" strokeWidth="3.4" strokeLinecap="round" />
      </g>

      <g className="head-s">
        <path d="M45.4 10.4 44.6 4.6l5.2 3.4z" fill="#D9803C" />
        <path d="M46.2 9.6l-.5-3.4 3 2z" fill="#E9A0A4" />
        <path d="M53.6 9.6 55.6 4.4l2.4 4.6z" fill="#D9803C" />
        <path d="M54.6 9.2l1.2-3.1 1.4 2.8z" fill="#E9A0A4" />

        <circle cx="51.4" cy="14" r="6.6" fill="#D9803C" />
        <ellipse cx="56.4" cy="16.4" rx="3.4" ry="2.6" fill="#F0AA6B" />
        <ellipse cx="53.2" cy="13.2" rx="1.5" ry="1.8" fill="#4FA871" />
        <ellipse cx="53.2" cy="13.2" rx=".55" ry="1.4" fill="#1B3326" />
        <path d="M58.4 15.2l1.2 1h-2.4z" fill="#C9525A" />
        <g stroke="#F3C79E" strokeWidth=".55" strokeLinecap="round" opacity=".7">
          <path d="M57.4 16.6 62.6 15.6M57.4 17.6 62.4 18.6" />
        </g>
      </g>
    </svg>
  )
}
