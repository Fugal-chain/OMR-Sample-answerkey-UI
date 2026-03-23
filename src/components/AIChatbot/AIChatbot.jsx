import { useEffect, useRef, useState } from 'react'
import { BOT_RESPONSES, QUICK_ACTIONS } from '../../data/quizzes.js'

function getBotResponse(userText) {
  const t = userText.toLowerCase()
  if (t.includes('bulk') || t.includes('import')) return BOT_RESPONSES.bulk
  if (t.includes('tag') || t.includes('drag')) return BOT_RESPONSES.tag
  if (t.includes('numeric') || t.includes('number')) return BOT_RESPONSES.numeric
  if (t.includes('undo') || t.includes('redo') || t.includes('keyboard') || t.includes('shortcut')) return BOT_RESPONSES.undo
  if (t.includes('export')) return BOT_RESPONSES.export
  if (t.includes('valid') || t.includes('error')) return BOT_RESPONSES.validate
  return BOT_RESPONSES.default
}

function handleComposerEnter(event, submit) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    submit()
  }
}

/**
 * AIChatbot — embedded assistant panel.
 * Desktop: fills the left sidebar area.
 * Mobile: renders as a collapsible panel at the top.
 */
export function AIChatbot({ variant = 'desktop' }) {
  const isMobile = variant === 'mobile'
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: "Hello! 👋 I can help you with drag & drop, numeric answers, bulk import, undo/redo, and more.\n\nWhat would you like to know?",
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    setIsOpen(false)
  }, [isMobile])

  const sendMessage = (text) => {
    if (!text.trim()) return

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: text.trim() }])
    setInputValue('')
    setIsTyping(true)

    window.setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'bot', text: getBotResponse(text) },
      ])
    }, 650)
  }

  if (!isMobile && !isOpen) {
    return (
      <div className="chatbot-launcher-wrap">
        <button
          type="button"
          className="chatbot-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI assistant"
        >
          <div className="chatbot-avatar">🤖</div>
        </button>
      </div>
    )
  }

  return (
    <section className={isMobile ? 'chatbot-mobile-panel' : 'sidebar-panel chatbot-panel'}>
      <button
        type="button"
        className={`chatbot-header${isMobile ? ' is-collapsible' : ''}`}
        onClick={isMobile ? () => setIsOpen((prev) => !prev) : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            className="chatbot-icon-button"
            onClick={(event) => {
              event.stopPropagation()
              setIsOpen((prev) => !prev)
            }}
            aria-label={isOpen ? 'Collapse AI assistant' : 'Expand AI assistant'}
          >
            <div className="chatbot-avatar">🤖</div>
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-gray-900)' }}>AI Assistant</div>
            <div style={{ fontSize: 11, color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, background: 'var(--color-green)', borderRadius: '50%', display: 'inline-block' }} />
              Ready to help
            </div>
          </div>
        </div>
        {isMobile && <span className="chatbot-toggle">{isOpen ? '−' : '+'}</span>}
      </button>

      {isOpen && (
        <div className={`chatbot-body${isMobile ? ' is-mobile' : ''}`}>
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          <div className="chatbot-quick-actions">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={() => sendMessage(action.label)}
                className="chatbot-quick-chip"
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="chatbot-input-row">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => handleComposerEnter(e, () => sendMessage(inputValue))}
              placeholder="Ask a question and press Enter..."
              className="chatbot-input"
            />
          </div>
        </div>
      )}
    </section>
  )
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '88%',
        padding: '10px 13px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser ? 'var(--color-primary)' : 'var(--color-gray-100)',
        color: isUser ? '#fff' : 'var(--color-gray-900)',
        fontSize: 12,
        lineHeight: 1.65,
        whiteSpace: 'pre-line',
        wordBreak: 'break-word',
      }}>
        {message.text}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{
        padding: '10px 16px',
        borderRadius: '14px 14px 14px 4px',
        background: 'var(--color-gray-100)',
        display: 'flex',
        gap: 4,
        alignItems: 'center',
      }}>
        <style>{`
          @keyframes bounce { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1.2); opacity: 1; } }
        `}</style>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--color-gray-400)',
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}
