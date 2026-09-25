import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * A picture's own pixel size, read from the file's header when the page is
 * built.
 *
 * Without width and height on the <img>, a frame is nothing until it loads and
 * the page reflows under every frame below it. That is invisible while you are
 * looking at the top of a record — and fatal to anything that measures the
 * page as you scroll. The index in the margin reads frame positions to decide
 * which one you are on; against a layout still settling, it reported the
 * fifteenth frame while the reader was at the top of the page.
 *
 * Read rather than recorded: the numbers belong to the file, and a number
 * typed beside it in a record goes stale the first time the file is exported
 * again. This runs at build time, so it costs nothing at run time, and every
 * record here is built ahead.
 *
 * PNG and JPEG, which is everything the records hold. Anything else — a format
 * this does not read, a file that has moved — returns null, and the frame
 * renders the way it did before.
 */

type Size = { w: number; h: number }

const cache = new Map<string, Size | null>()

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function read(file: string): Size | null {
  const b = readFileSync(file)

  /* PNG: IHDR is first and fixed, so the size is at a known offset. */
  if (b.length > 24 && b.subarray(0, 8).equals(PNG)) {
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }
  }

  /* JPEG: walk the markers to the start-of-frame, the only one carrying the
     dimensions. C4, C8 and CC sit in the same range and are not it. */
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let o = 2
    while (o + 9 < b.length) {
      if (b[o] !== 0xff) {
        o++
        continue
      }
      const marker = b[o + 1]
      const len = b.readUInt16BE(o + 2)
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { h: b.readUInt16BE(o + 5), w: b.readUInt16BE(o + 7) }
      }
      o += 2 + len
    }
  }

  return null
}

/** `src` is the public path a frame is written with, e.g. /images/x/01.png */
export function frameSize(src: string): Size | null {
  const hit = cache.get(src)
  if (hit !== undefined) return hit

  let size: Size | null = null
  try {
    size = read(join(process.cwd(), 'public', src))
  } catch {
    /* A frame whose file cannot be read still renders; it only loses its
       reserved box. Failing the build over it would be the wrong trade. */
    size = null
  }

  cache.set(src, size)
  return size
}
