'use client'

import { useState, useRef, useEffect } from 'react'
import { OrionCat } from '@/components/OrionCat'
import { tokenise, intoLines, type Token } from '@/lib/meow'

/**
 * Orion is a cat.
 *
 * Ask him something and he answers immediately — in cat. The meow is real: its
 * length is drawn from your question, so a long question gets a long reply
 * before a single English word exists. The translation lands a beat later and
 * replaces it in place, the way subtitles arrive behind speech.
 *
 * Deriving the meow from the question rather than the answer is what lets it
 * appear at once, which also means it fills the wait instead of a spinner: the
 * pet responds, and the transcript catches up.
 */

type Phase = 'listening' | 'speaking' | 'translating' | 'done'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  /** Assistant only. The reply, word by word, in both languages. */
  lines?: Token[][]
  /** How many lines he has said so far. */
  linesSaid: number
  /** How many words have been translated so far. */
  wordsDone: number
  phase: Phase
}

interface ChatDrawerProps {
  context?: string
  width: number
  onClose: () => void
}

const CHAT_SUGGESTIONS = [
  "Tell me about Anshul's B2B product design experience",
  "What's the story behind the SolicArc project?",
  'What design tools and methodologies does Anshul use?',
]

/** One line of cat every this long — the pace of speech, not of typing. */
const LINE_MS = 260

/** Beat between the last line landing and the translation starting. */
const BEFORE_TRANSLATE_MS = 520

/** Per word. Fast enough to feel mechanical, slow enough to watch. */
const WORD_MS = 55

export function ChatDrawer({ context, width, onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const bedRef = useRef<HTMLSpanElement>(null)
  const perchRef = useRef<HTMLButtonElement>(null)
  const inputPerchRef = useRef<HTMLFormElement>(null)

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const patch = (id: number, next: Partial<Message>) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...next } : m)))

  /**
   * Drives the reply through its phases. Each step schedules exactly one timer
   * and the effect re-runs on the resulting state change, so the chain cleans
   * itself up on unmount and cannot outlive the message it is animating.
   */
  useEffect(() => {
    const m = messages[messages.length - 1]
    if (!m || m.role !== 'assistant' || !m.lines) return

    if (m.phase === 'speaking') {
      const total = m.lines.length
      if (m.linesSaid < total) {
        const t = setTimeout(() => patch(m.id, { linesSaid: m.linesSaid + 1 }), LINE_MS)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => patch(m.id, { phase: 'translating' }), BEFORE_TRANSLATE_MS)
      return () => clearTimeout(t)
    }

    if (m.phase === 'translating') {
      const words = m.lines.reduce((n, l) => n + l.length, 0)
      if (m.wordsDone < words) {
        const t = setTimeout(() => patch(m.id, { wordsDone: m.wordsDone + 1 }), WORD_MS)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => {
        patch(m.id, { phase: 'done' })
        setIsLoading(false)
      }, 240)
      return () => clearTimeout(t)
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const question = input.trim()
    if (!question || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: question,
      timestamp: new Date(),
      linesSaid: 0,
      wordsDone: 0,
      phase: 'done',
    }

    const replyId = userMessage.id + 1
    const reply: Message = {
      id: replyId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      linesSaid: 0,
      wordsDone: 0,
      phase: 'listening',
    }

    setMessages((prev) => [...prev, userMessage, reply])
    setInput('')
    setIsLoading(true)

    let english: string
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], context }),
      })
      const data = await response.json()
      // A 503 still carries a sentence worth showing — it says the key is
      // missing, which is more use than a generic apology.
      if (!response.ok && !data?.message) throw new Error(String(response.status))
      english = data.message
    } catch (error) {
      console.error('Chat error:', error)
      english =
        "I'm still learning about Anshul's work. Try asking about specific projects or areas of expertise."
    }

    // He says the whole thing in cat first — same words, same lengths — and the
    // effect above walks it out line by line, then translates it word by word.
    patch(replyId, {
      content: english,
      lines: intoLines(tokenise(english)),
      phase: 'speaking',
    })
  }

  return (
    <>
      {/* On a phone the sheet leaves a strip of page above it, and tapping that
          strip is how everyone expects to dismiss a sheet. */}
      <button className="chat-scrim" aria-label="Close chat" onClick={onClose} />
    <div
      ref={drawerRef}
      style={{ ["--chat-w" as string]: `${width}px` } as React.CSSProperties}
      className="chat-surface"
    >
      {/* A sheet you can grab. Only drawn on a phone, where it means something. */}
      <span className="chat-grip" aria-hidden="true" />
      {/* The cat lives above the drawer's content and is clipped by its edges,
          which is what lets him walk out of one side and in through the other. */}
      <OrionCat
        active={!isLoading}
        hostRef={drawerRef}
        bedRef={bedRef}
        perchRef={perchRef}
        altPerchRef={inputPerchRef}
      />
      {/* Header — passing over it wakes the cat */}
      <div className="cat-wake" style={{ padding: 'var(--s5)' }}>
        <button
          onClick={onClose}
          data-sfx="tick"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-[var(--r-sm)] text-foreground/45 transition-colors hover:bg-foreground/10 hover:text-foreground"
          aria-label="Close chat"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3" style={{ paddingRight: 'var(--s5)' }}>
          <span ref={bedRef} className="orion-mark" data-thinking={isLoading} />
          <h2 className="t-head" style={{ fontSize: '1.375rem' }}>
            Mr. Toast
          </h2>
        </div>

        <p className="t-body" style={{ marginTop: 'var(--s3)', opacity: 0.75 }}>
          Anshul&apos;s cat, and unusually well briefed on the work. Ask him anything.
        </p>
      </div>

      <hr className="rule" />

      {/* Transcript */}
      <div
        data-lenis-prevent
        className="flex-1 overflow-y-auto"
        style={{ padding: 'var(--s5)' }}
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="t-meta max-w-[26ch] text-center">
              Pick a question below, or ask your own.
            </p>
          </div>
        ) : (
          <div className="stack">
            {messages.map((message) => {
              const mine = message.role === 'user'
              if (mine) {
                return (
                  <div key={message.id} className="flex flex-col items-end gap-1">
                    <div className="msg msg-user t-body">{message.content}</div>
                    <span className="t-meta">{formatTime(message.timestamp)}</span>
                  </div>
                )
              }

              // Words are numbered across the whole reply, so the translation
              // runs continuously from one line into the next.
              let n = 0
              return (
                <div key={message.id} className="flex flex-col items-start gap-1">
                  <span className="t-label">
                    {message.phase === 'listening'
                      ? 'Mr. Toast'
                      : message.phase === 'done'
                        ? 'Mr. Toast · translated'
                        : 'Mr. Toast · in cat'}
                  </span>

                  <div className="msg msg-orion said">
                    {(message.lines ?? []).slice(0, message.linesSaid).map((line, li) => (
                      <div key={li} className="said-line">
                        {line.map((tok) => {
                          const done = n++ < message.wordsDone
                          return done ? (
                            <span key={`en${n}`} className="said-word said-en">
                              {tok.en}{' '}
                            </span>
                          ) : (
                            <span key={`me${n}`} className="said-word said-meow">
                              {tok.meow}{' '}
                            </span>
                          )
                        })}
                      </div>
                    ))}
                  </div>

                  {message.phase === 'translating' && (
                    <span className="t-label said-translating">Translating…</span>
                  )}

                  {message.phase === 'done' && (
                    <span className="t-meta">{formatTime(message.timestamp)}</span>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Openers */}
      {messages.length === 0 && (
        <div style={{ padding: '0 var(--s5) var(--s3)' }}>
          <div className="stack">
            {CHAT_SUGGESTIONS.map((suggestion, i) => (
              <button
                ref={i === 0 ? perchRef : undefined}
                key={suggestion}
                onClick={() => setInput(suggestion)}
                data-sfx="tick"
                className="card-link t-body text-left"
              >
                ↳ {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: 'var(--s4) var(--s5) var(--s5)' }}>
        <hr className="rule" style={{ marginBottom: 'var(--s4)' }} />
        <form ref={inputPerchRef} onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            className="t-body flex-1 rounded-[var(--r-sm)] border border-[var(--card-line)] bg-[var(--card-fill)] px-3 py-2 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-[var(--card-line-strong)]"
            disabled={isLoading}
          />
          <button
            type="submit"
            data-sfx="tick"
            disabled={isLoading || !input.trim()}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--r-sm)] border border-[var(--card-line-strong)]/40 bg-[var(--card-fill)] text-foreground transition-all hover:bg-[var(--card-fill-hover)] disabled:opacity-40"
            aria-label="Send message"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
    </>
  )
}
