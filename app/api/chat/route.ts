import { buildProfile } from '@/lib/profile'

/**
 * Mr. Toast's actual brain.
 *
 * The previous version had three faults, any one of which was enough to make
 * every reply fail or be useless:
 *
 *   1  It required an API key that was never set, so it threw on every call.
 *   2  It passed the system prompt as a top-level `system` field to OpenAI's
 *      chat/completions endpoint, which has no such field. The prompt was
 *      accepted and silently discarded, so even with a key the model would have
 *      been answering with no idea who Anshul is.
 *   3  The only source of facts was a `context` string sent by the browser,
 *      which nothing populated. There was nothing to discard anyway.
 *
 * The facts now come from the server, assembled from the same case-study data
 * the Work pages render, so the answers cannot drift from the site.
 */

/**
 * What Mr. Toast says when he cannot answer.
 *
 * A visitor does not need to hear about environment variables — that is our
 * problem, not theirs, and reading it breaks the one illusion the chat is
 * built on. A cat that will not do the thing you asked is not a broken cat;
 * it is a cat. So he declines the way cats decline: completely, without
 * apology, and without explaining himself. The email still gets handed over,
 * because the visitor came here to reach someone.
 *
 * Several lines, chosen at random, so asking twice does not show the seam.
 */
const DECLINED = [
  "I've considered it and decided no. It's warm here. Anshul is more obliging than I am — s.anshul@iitg.ac.in.",
  "Ask me again in four hours. I'm in the middle of something, and the something is lying down. Anshul answers sooner: s.anshul@iitg.ac.in.",
  'I heard you. I am choosing to sit here instead. He is at s.anshul@iitg.ac.in, and he has never once ignored anybody.',
  "Not today. I don't have to explain myself, that's rather the point of being a cat. Try Anshul at s.anshul@iitg.ac.in — he's the one who does things.",
  "I've turned my back to you. It isn't personal, it's just what I do with my back. s.anshul@iitg.ac.in reaches Anshul, who faces people.",
]

/** For the case where something genuinely broke, rather than merely a cat. */
const KNOCKED_OVER = [
  'Something fell off a shelf. I was nowhere near it. Ask me again in a moment.',
  'That went wrong and I would rather not discuss it. Try again shortly.',
]

const pick = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)]

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return Response.json({ error: 'not_configured', message: pick(DECLINED) }, { status: 503 })
  }

  try {
    const { messages, context } = await req.json()

    const system = `You are Mr. Toast, Anshul Suthar's cat, and the guide to his design portfolio.

Answer questions about Anshul using only the dossier below. If something is not
in it, say so plainly and point the visitor at his email rather than guessing —
never invent a project, a date, an employer, or a result.

Keep replies to two or three sentences. Write plainly, in the first person as
the cat, but do not overplay it: no meowing, no purring, no cat puns. The
charm is that you are matter-of-fact about being a cat. Answer the question.

--- DOSSIER ---
${buildProfile(context)}
--- END DOSSIER ---`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 400,
        system,
        messages: (messages ?? [])
          .filter((m: { role: string; content: string }) => m.content?.trim())
          .map((m: { role: string; content: string }) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error('Anthropic API error:', res.status, detail)
      return Response.json(
        { error: 'upstream', message: pick(KNOCKED_OVER) },
        { status: 502 },
      )
    }

    const data = await res.json()
    const message = data.content?.[0]?.text ?? ''
    return Response.json({ message })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json(
      { error: 'failed', message: pick(KNOCKED_OVER) },
      { status: 500 },
    )
  }
}
