'use client'

import { useState, useEffect, useRef } from 'react'
import ExperimentNav from '@/components/ExperimentNav'

type HoverContext = {
  type: 'paragraph' | 'background'
  content: string
}

export default function HoverDemo() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [hoverContext, setHoverContext] = useState<HoverContext | null>(null)
  const [reaction, setReaction] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const lastContextRef = useRef<string>('')
  const streamAbortRef = useRef<AbortController | null>(null)

  // Track cursor position globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // React to hover context changes
  useEffect(() => {
    if (hoverContext) {
      const contextKey = `${hoverContext.type}:${hoverContext.content.substring(0, 50)}`
      
      // Only fetch new reaction if context changed
      if (contextKey !== lastContextRef.current) {
        lastContextRef.current = contextKey
        fetchReaction(hoverContext)
      }
    }
  }, [hoverContext])

  const fetchReaction = async (context: HoverContext) => {
    // Abort previous stream if still running
    if (streamAbortRef.current) {
      streamAbortRef.current.abort()
    }

    setIsStreaming(true)
    setReaction('')

    const abortController = new AbortController()
    streamAbortRef.current = abortController

    try {
      const response = await fetch('/api/hover-react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
        signal: abortController.signal
      })

      if (!response.ok) throw new Error('Failed to fetch reaction')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) return

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        setReaction(prev => prev + chunk)
      }

      setIsStreaming(false)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching reaction:', error)
        setIsStreaming(false)
      }
    }
  }

  const handleHover = (type: HoverContext['type'], content: string) => {
    setHoverContext({ type, content })
  }

  const handleLeave = () => {
    // When leaving specific elements, show background context
    setHoverContext({
      type: 'background',
      content: 'Cursor is floating in the space between elements'
    })
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-8"
      style={{ backgroundColor: '#FCF9F6', cursor: 'none' }}
      onMouseMove={() => {
        if (!hoverContext) {
          handleHover('background', 'Empty space')
        }
      }}
    >
      {/* Content Area */}
      <div className="max-w-2xl space-y-8">
        <p 
          className="text-lg leading-relaxed text-muted-foreground hover:text-foreground transition-colors duration-200"
          style={{ cursor: 'none' }}
          onMouseEnter={() => handleHover('paragraph', "The future of interfaces isn't about adding more buttons or menus. It's about understanding context—knowing what you need before you ask.")}
          onMouseLeave={handleLeave}
        >
          The future of interfaces isn&apos;t about adding more buttons or menus. It&apos;s about understanding context—knowing what you need before you ask.
        </p>
        
        <p 
          className="text-lg leading-relaxed text-muted-foreground hover:text-foreground transition-colors duration-200"
          style={{ cursor: 'none' }}
          onMouseEnter={() => handleHover('paragraph', 'Cursor-level AI represents a fundamental shift: from interfaces that wait for commands to interfaces that participate in your thinking process.')}
          onMouseLeave={handleLeave}
        >
          Cursor-level AI represents a fundamental shift: from interfaces that wait for commands to interfaces that participate in your thinking process.
        </p>
      </div>

      {/* Custom Cursor Dot */}
      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div 
          className="w-2 h-2 rounded-full bg-foreground"
          style={{
            animation: hoverContext && hoverContext.type === 'paragraph' ? 'pulse 2s ease-in-out infinite' : 'none'
          }}
        />
      </div>

      {/* AI Reaction Text Below Cursor */}
      {reaction && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: cursorPosition.x + 15,
            top: cursorPosition.y + 15,
            maxWidth: '320px',
          }}
        >
          <div 
            className="text-sm leading-relaxed text-muted-foreground p-4 rounded-2xl backdrop-blur-sm"
            style={{
              backgroundColor: 'rgba(252, 249, 246, 0.95)',
              boxShadow: `
                0 0 40px 20px rgba(252, 249, 246, 0.9),
                0 0 20px 10px rgba(252, 249, 246, 0.7),
                0 0 10px 5px rgba(252, 249, 246, 0.5),
                0 4px 16px rgba(0, 0, 0, 0.08)
              `,
            }}
          >
            <span className="animate-in fade-in duration-300">{reaction}</span>
          </div>
        </div>
      )}
      <ExperimentNav />
    </div>
  )
}
