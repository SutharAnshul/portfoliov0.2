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

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return Response.json(
      {
        error: 'not_configured',
        message:
          "I can't reach my brain at the moment — no API key is configured. Ask Anshul directly at s.anshul@iitg.ac.in.",
      },
      { status: 503 },
    )
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
        { error: 'upstream', message: 'Something went wrong reaching my brain. Try again shortly.' },
        { status: 502 },
      )
    }

    const data = await res.json()
    const message = data.content?.[0]?.text ?? ''
    return Response.json({ message })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json(
      { error: 'failed', message: 'Something went wrong on my end. Try again shortly.' },
      { status: 500 },
    )
  }
}
