/**
 * Cat, and the English underneath it.
 *
 * Every English word becomes one meow of the same character count: "meow"
 * padded with w's when the word is longer, clipped to "me"/"meo" when it is
 * shorter. That is not a joke about length — it is what makes the translation
 * legible. Because both sides render in the same monospace family, a meow and
 * the word it becomes occupy exactly the same width, so swapping them one at a
 * time moves nothing else on the line. The paragraph resolves in place instead
 * of reflowing under the reader.
 *
 * Capitalisation and trailing punctuation are carried across for the same
 * reason: the meow has to scan as the same sentence, just not in English.
 */

export interface Token {
  /** What Orion actually said. */
  meow: string
  /** What he meant. */
  en: string
}

const WORD = /^([^\s]*?)([^A-Za-z0-9']*)$/

/** One English word in, one equal-length meow out. */
export function meowWord(word: string): string {
  const m = word.match(WORD)
  const core = m ? m[1] : word
  const tail = m ? m[2] : ''
  const n = core.length

  let said: string
  if (n <= 0) said = ''
  else if (n === 1) said = 'm'
  else if (n === 2) said = 'me'
  else if (n === 3) said = 'meo'
  else said = 'meow' + 'w'.repeat(n - 4)

  // Match the word's own casing so sentences still start like sentences.
  if (/^[A-Z]/.test(core)) said = said.charAt(0).toUpperCase() + said.slice(1)

  return said + tail
}

export function tokenise(english: string): Token[] {
  return english
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((en) => ({ en, meow: meowWord(en) }))
}

/**
 * Groups tokens into lines that fit the drawer's measure, so the meow arrives
 * as speech — one line at a time — rather than as a block of text appearing at
 * once. Widths are counted in characters, which is exact in a monospace face.
 */
export function intoLines(tokens: Token[], maxChars = 30): Token[][] {
  const lines: Token[][] = []
  let line: Token[] = []
  let width = 0

  for (const t of tokens) {
    const add = (line.length ? 1 : 0) + t.meow.length
    if (line.length && width + add > maxChars) {
      lines.push(line)
      line = [t]
      width = t.meow.length
    } else {
      line.push(t)
      width += add
    }
  }
  if (line.length) lines.push(line)

  return lines
}
