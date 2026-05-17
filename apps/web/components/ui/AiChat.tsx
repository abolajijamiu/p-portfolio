'use client'

import { useState, useRef, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type Message = { role: 'user' | 'assistant'; content: string }

export function AiChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi — I\'m the E-Tech. assistant. Ask me about our services, themes, or pricing.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const next: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      setMessages([...next, { role: 'assistant', content: data.message ?? 'Sorry, something went wrong.' }])
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Sorry, I\'m having trouble connecting. Email us at hello@deempiretech.com.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close AI chat' : 'Chat with AI assistant'}
        className="absolute bottom-0 right-0 h-12 w-12 rounded-full bg-brand text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity duration-150"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 110 16A8 8 0 0112 4zm-1 5v2H9v2h2v2h2v-2h2v-2h-2V9h-2z"/>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="absolute bottom-14 right-0 w-[320px] bg-white border border-[#e8e8e8] rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ height: 420 }}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa] flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-ink flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-semibold">ET</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink leading-none">E-Tech. Assistant</p>
              <p className="text-[10px] text-muted/60 mt-0.5">Typically replies instantly</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={[
                  'max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed',
                  m.role === 'user'
                    ? 'bg-ink text-white rounded-br-sm'
                    : 'bg-surface text-ink rounded-bl-sm border border-[#f0f0f0]',
                ].join(' ')}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface border border-[#f0f0f0] px-3 py-2 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1 items-center h-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#f0f0f0] px-3 py-2.5 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask anything…"
              className="flex-1 text-[13px] outline-none placeholder:text-muted/40 text-ink bg-transparent"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="h-7 w-7 rounded-full bg-ink flex items-center justify-center disabled:opacity-30 transition-opacity duration-150"
            >
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
