'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SideNav } from '@/components/SideNav'
import { ChatDrawer } from '@/components/ChatDrawer'
import { MobileChrome } from '@/components/MobileChrome'
import { BreadcrumbNav } from '@/components/BreadcrumbNav'

const NAV_MIN = 300
const NAV_MAX = 480
const CHAT_MIN = 300
const CHAT_MAX = 640

interface LayoutShellProps {
  context: string
  children: React.ReactNode
}

export function LayoutShell({ context, children }: LayoutShellProps) {
  const pathname = usePathname()
  const [navWidth, setNavWidth] = useState(324)
  // Mr. Toast matches the nav opposite him, so the page sits centred between
  // two equal columns rather than being pushed off-axis by a wider one.
  const [chatWidth, setChatWidth] = useState(324)
  // Open beside the page on a desktop, closed on a phone. There it is a
  // full-height sheet, so opening it by default means the site loads with its
  // own content hidden behind a chat nobody asked for yet.
  const [chatOpen, setChatOpen] = useState(false)

  /**
   * Mr. Toast, parked.
   *
   * Nothing of his has been removed — the drawer, the route, the cat, the
   * suggestions and every style they use are all still here, and this one
   * constant is the whole switch. He is out of the way until he is worth
   * having out.
   */
  const TOAST = false
  const chatShown = TOAST && chatOpen
  const openChat = TOAST ? () => setChatOpen(true) : undefined
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    setChatOpen(window.matchMedia('(min-width: 768px)').matches)
  }, [])

  const draggingRef = useRef<null | 'nav' | 'chat'>(null)

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

  const startNavResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    draggingRef.current = 'nav'
    setIsResizing(true)
  }, [])

  const startChatResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    draggingRef.current = 'chat'
    setIsResizing(true)
  }, [])

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!draggingRef.current) return
      if (draggingRef.current === 'nav') {
        setNavWidth(clamp(e.clientX, NAV_MIN, NAV_MAX))
      } else {
        setChatWidth(clamp(window.innerWidth - e.clientX, CHAT_MIN, CHAT_MAX))
      }
    }
    const handleUp = () => {
      if (!draggingRef.current) return
      draggingRef.current = null
      setIsResizing(false)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [])

  // Prevent text selection / set cursor globally while dragging
  useEffect(() => {
    if (isResizing) {
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'
    } else {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    return () => {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isResizing])

  /**
   * Closing Mr. Toast hands his column back to the page, and the page should
   * be seen taking it rather than being found already wider.
   *
   * On the site's own spring, so the column arrives the way everything else
   * here does. Off entirely while a divider is being dragged: an easing curve
   * between the pointer and the edge it is holding reads as lag, not weight.
   */
  const transition = isResizing
    ? 'none'
    : 'margin var(--dur-light, 380ms) var(--ease-light, cubic-bezier(0.22, 1, 0.36, 1))'
  const edgeTransition = isResizing
    ? 'none'
    : 'left var(--dur-light, 380ms) var(--ease-light, cubic-bezier(0.22, 1, 0.36, 1)), right var(--dur-light, 380ms) var(--ease-light, cubic-bezier(0.22, 1, 0.36, 1))'
  const rightEdge = chatShown ? chatWidth : 0

  /**
   * Publish the columns' widths so fixed-position furniture can centre on the
   * page rather than on the window.
   *
   * Both are React state — the rail is draggable — so CSS has no way to know
   * them. The same approach the mobile chrome uses to publish the masthead's
   * measured height.
   */
  useEffect(() => {
    const css = document.documentElement.style
    css.setProperty('--nav-w', `${navWidth}px`)
    css.setProperty('--aside-w', `${rightEdge}px`)
  }, [navWidth, rightEdge])

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <SideNav width={navWidth} />

      {/* The breadcrumb spans the same column and has to travel with it —
          left to its own timing it snapped to the new width while the page
          beneath it was still moving. */}
      <BreadcrumbNav
        left={navWidth}
        right={rightEdge}
        transition={edgeTransition}
        chatOpen={chatShown}
        onOpenChat={openChat}
      />

      <main
        style={{
          marginLeft: navWidth,
          marginRight: rightEdge,
          transition,
        }}
        data-page-content
        className="pt-20 min-h-screen"
      >
        {children}
      </main>

      {/* Nav divider. A hairline and nothing else: the col-resize pointer is
          what says the edge moves, so a drawn grip only added an object to
          look at. Sits above both panels so nothing clips it. */}
      <div
        onPointerDown={startNavResize}
        style={{ left: navWidth }}
        className="group fixed top-0 z-50 flex h-screen w-2 -translate-x-1/2 cursor-col-resize items-center justify-center"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize navigation"
      >
        <div className="nav-edge" />
      </div>

      {chatShown && (
        <>
          {/* Chat divider, same treatment. */}
          <div
            onPointerDown={startChatResize}
            style={{ right: chatWidth }}
            className="group fixed top-0 z-50 flex h-screen w-2 translate-x-1/2 cursor-col-resize items-center justify-center"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize chat"
          >
            <div className="nav-edge" />
          </div>

        </>
      )}
      </div>

      {/*
        Mr. Toast lives outside both trees. Rendered inside the desktop one he
        was display:none on a phone — present in the DOM, measuring 0x0, and
        opening nothing when you tapped him.
      */}
      {chatShown && (
        <ChatDrawer context={context} width={chatWidth} onClose={() => setChatOpen(false)} />
      )}

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-screen bg-background">
        <MobileChrome onOpenChat={openChat} />
        <div data-scroll-root data-page-content className="flex-1 overflow-y-auto">
          {/* A handle for the opening: the page rises from the bottom of the
              screen as the mark settles into the masthead, and it needs an
              element of its own to be moved by. See .m-page in globals.css. */}
          <div className="m-page">{children}</div>
        </div>
      </div>
    </>
  )
}
