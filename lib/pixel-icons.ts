/**
 * The nav's pixel icon set, rebuilt on the geometry of the reference marks
 * rather than on one of my own.
 *
 * Those references were measured off the files instead of read off the
 * thumbnails, because reading them off the thumbnails is how the handset went
 * wrong five times. The LinkedIn and Behance icons turn out to be a 13x13 tile
 * with its top and bottom rows inset by a cell, two cells of padding, and a
 * 9x9 glyph — and exactly two colours. No outline, no lit row, no shaded row.
 * The set my earlier drawings carried had all three, and they were decoration
 * that the marks they sit beside do not have.
 *
 * Those two are transcribed cell for cell, blue and all: the reference set
 * gives LinkedIn and Behance one shared blue rather than each brand's own, and
 * copying it is the point. The handset and the envelope come from files drawn
 * at other resolutions, so they are redrawn here at this one — see the notes on
 * each. Everything else follows the same tile.
 *
 * Drawn at 26px, exactly 2x the grid. At a fractional scale some cells land one
 * device pixel wide and some two, and that unevenness is the whole difference
 * between pixel art and a small blurry picture.
 *
 * Legend: '.' transparent | 'W' glyph | anything else is the ground.
 */

export type PixelIcon = {
  /** The tile's flat colour. */
  ground: string
  /** Nine rows of nine, centred in the tile with two cells of padding. */
  glyph: readonly string[]
}

/** The references' off-white. Not #fff — that reads harder than the marks do. */
export const GLYPH = '#e6e5e5'

export const PIXEL_ICONS: Record<string, PixelIcon> = {
  mail: {
    ground: '#e41e2f',
    glyph: [
      '.........',
      '..WWWWW..',
      '.W.WWW.W.',
      '.WW.W.WW.',
      '.WWW.WWW.',
      '.WWWWWWW.',
      '.WWWWWWW.',
      '.WWWWWWW.',
      '.........',
    ],
  },

  phone: {
    ground: '#00953e',
    glyph: [
      'WWW......',
      'WWW......',
      'WWW......',
      'WW.......',
      '.WW......',
      '..WW.....',
      '...WW.WWW',
      '....WWWWW',
      '.....WWWW',
    ],
  },

  linkedin: {
    ground: '#26659f',
    glyph: [
      'WW.......',
      'WW.......',
      '.........',
      'WW.WW.WW.',
      'WW.WWW.WW',
      'WW.WW..WW',
      'WW.WW..WW',
      'WW.WW..WW',
      'WW.WW..WW',
    ],
  },

  behance: {
    ground: '#26659f',
    glyph: [
      '.........',
      '......WW.',
      'WWW......',
      'W..W..WW.',
      'WWW..WWWW',
      'W..W.W...',
      'WWW...WW.',
      '.........',
      '.........',
    ],
  },

  about: {
    ground: '#e8a020',
    glyph: [
      '...WWW...',
      '..WWWWW..',
      '..WWWWW..',
      '..WWWWW..',
      '...WWW...',
      '.........',
      '..WWWWW..',
      '.WWWWWWW.',
      'WWWWWWWWW',
    ],
  },

  /* The two transport arrows.
     Solid triangles rather than outlined chevrons: at nine cells an outline is
     one cell of ink either side of one cell of hole, and it closes up into a
     smudge at any size a browser is likely to draw it. A filled shape is the
     only kind that survives this grid.

     One ground for both, and a neutral one — every other tile here is a brand
     or a study's own colour, and these two are controls rather than
     identities. Dark enough to read as a key on the faceplate they sit on. */
  prev: {
    ground: '#23262c',
    glyph: [
      '.........',
      '......W..',
      '.....WW..',
      '....WWW..',
      '...WWWW..',
      '....WWW..',
      '.....WW..',
      '......W..',
      '.........',
    ],
  },

  next: {
    ground: '#23262c',
    glyph: [
      '.........',
      '..W......',
      '..WW.....',
      '..WWW....',
      '..WWWW...',
      '..WWW....',
      '..WW.....',
      '..W......',
      '.........',
    ],
  },

  work: {
    ground: '#7c4dff',
    glyph: [
      'WWWW.WWWW',
      'WWWW.WWWW',
      'WWWW.WWWW',
      'WWWW.WWWW',
      '.........',
      'WWWW.WWWW',
      'WWWW.WWWW',
      'WWWW.WWWW',
      'WWWW.WWWW',
    ],
  },
}

/** Four wide, seven tall: two digits and a one-cell gap fill the nine. */
const DIGITS: Record<string, readonly string[]> = {
  '0': ['WWWW', 'W..W', 'W..W', 'W..W', 'W..W', 'W..W', 'WWWW'],
  '1': ['..W.', '.WW.', '..W.', '..W.', '..W.', '..W.', 'WWWW'],
  '2': ['WWWW', '...W', '...W', 'WWWW', 'W...', 'W...', 'WWWW'],
  '3': ['WWWW', '...W', '...W', '.WWW', '...W', '...W', 'WWWW'],
  '4': ['W..W', 'W..W', 'W..W', 'WWWW', '...W', '...W', '...W'],
}

/**
 * Each case study gets its own ground, which is the reason to draw the number
 * at all: it stops being metadata beside a title and becomes the study's mark.
 * The first is the site's accent rather than a pink of its own — there is one
 * pink here, and the signature's wavefront reads from the same variable.
 */
const STUDY_GROUNDS = ['var(--brand)', '#1fa8c4', '#e09420', '#2fa85c']

STUDY_GROUNDS.forEach((ground, i) => {
  const glyph = ['.........']
  for (let r = 0; r < 7; r++) glyph.push(DIGITS['0'][r] + '.' + DIGITS[String(i + 1)][r])
  glyph.push('.........')
  PIXEL_ICONS[`no${i + 1}`] = { ground, glyph }
})

/** The tile for a one-based index, wrapping past the fourth ground. */
export const studyIcon = (i: number) => `no${((i - 1) % STUDY_GROUNDS.length) + 1}`
