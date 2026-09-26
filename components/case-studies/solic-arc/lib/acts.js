// Each act owns a colour field. Values tuned against the photographs they carry.
export const ACTS = [
  { n: '01', title: "The object I couldn't find", bg: '#F1ECE3', fg: '#16140F', mu: 'rgba(22,20,15,.58)', rule: 'rgba(22,20,15,.16)', blue: '#2438E8', red: '#B02A20', acc: '#16140F' },
  { n: '02', title: 'The contradiction', bg: '#131311', fg: '#ECE7DD', mu: 'rgba(236,231,221,.56)', rule: 'rgba(236,231,221,.15)', blue: '#5068FF', red: '#E0513F', acc: '#ECE7DD' },
  { n: '03', title: 'What players actually want', bg: '#D6DFE1', fg: '#102024', mu: 'rgba(16,32,36,.62)', rule: 'rgba(16,32,36,.17)', blue: '#2236D6', red: '#A8281E', acc: '#102024' },
  { n: '04', title: 'Building a language for shape', bg: '#E7E2D7', fg: '#1A1814', mu: 'rgba(26,24,20,.6)', rule: 'rgba(26,24,20,.16)', blue: '#1F35E0', red: '#A82519', acc: '#1A1814' },
  { n: '05', title: 'Draw → Build → Feel', bg: '#A6563E', fg: '#FBF1E7', mu: 'rgba(251,241,231,.74)', rule: 'rgba(251,241,231,.28)', blue: '#DCE3FF', red: '#2A120B', acc: '#FBF1E7' },
  { n: '06', title: 'Making the object', bg: '#17221D', fg: '#E6E1D4', mu: 'rgba(230,225,212,.6)', rule: 'rgba(230,225,212,.15)', blue: '#6F86FF', red: '#E0674F', acc: '#C9A46A' },
  { n: '07', title: 'Put it in their hands', bg: '#0E1730', fg: '#EEF0F6', mu: 'rgba(238,240,246,.62)', rule: 'rgba(238,240,246,.15)', blue: '#7C92FF', red: '#E86A55', acc: '#D3AB67' },
  { n: 'Coda', title: 'People × Products', bg: '#F1ECE3', fg: '#16140F', mu: 'rgba(22,20,15,.58)', rule: 'rgba(22,20,15,.16)', blue: '#2438E8', red: '#B02A20', acc: '#16140F' },
]

export const actVars = (i) => {
  const a = ACTS[i]
  return { '--fg': a.fg, '--mu': a.mu, '--rule': a.rule, '--blue': a.blue, '--red': a.red, '--acc': a.acc, color: a.fg }
}

const hex = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16))
export const mixHex = (a, b, t) => {
  const A = hex(a), B = hex(b)
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`
}
export const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))
export const lerp = (a, b, t) => a + (b - a) * t
export const clamp01 = (t) => Math.max(0, Math.min(1, t))
