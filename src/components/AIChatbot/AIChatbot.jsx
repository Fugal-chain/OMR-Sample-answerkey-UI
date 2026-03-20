import { useState, useRef, useEffect } from 'react'
import { BOT_RESPONSES, QUICK_ACTIONS } from '../../data/quizzes.js'

/**
 * Picks the right canned response from the BOT_RESPONSES map.
 */
function getBotResponse(userText) {
  const t = userText.toLowerCase()
  if (t.includes('bulk') || t.includes('import'))           return BOT_RESPONSES.bulk
  if (t.includes('tag')  || t.includes('drag'))             return BOT_RESPONSES.tag
  if (t.includes('numeric') || t.includes('number'))        return BOT_RESPONSES.numeric
  if (t.includes('undo') || t.includes('redo') || t.includes('keyboard') || t.includes('shortcut')) return BOT_RESPONSES.undo
  if (t.includes('export'))                                  return BOT_RESPONSES.export
  if (t.includes('valid') || t.includes('error'))           return BOT_RESPONSES.validate
  return BOT_RESPONSES.default
}

/**
 * AIChatbot — right-panel assistant.
 * Supports free-text input and quick-action chips.
 */
export function AIChatbot() {
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
    if (!isOpen) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const sendMessage = (text) => {
    if (!text.trim()) return

    // Add user message
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: text.trim() }])
    setInputValue('')
    setIsTyping(true)

    // Simulate bot thinking
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'bot', text: getBotResponse(text) },
      ])
    }, 650)
  }

  return (
    <>
      {isOpen && <div className="chatbot-overlay" onClick={() => setIsOpen(false)} />}

      {isOpen && (
        <div className="chatbot-sheet">
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--color-gray-200)',
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40,
                background: 'var(--color-green)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-gray-900)' }}>AI Assistant</div>
                <div style={{ fontSize: 11, color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: 'var(--color-green)', borderRadius: '50%', display: 'inline-block' }} />
                  Ready to help
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: '#fff',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 12,
                width: 36,
                height: 36,
                color: 'var(--color-gray-600)',
                fontSize: 18,
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 68px)' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--color-gray-200)', display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0 }}>
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.key}
                  onClick={() => sendMessage(action.label)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-gray-200)',
                    background: 'var(--color-gray-50)',
                    fontSize: 11,
                    color: 'var(--color-gray-700)',
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-gray-200)', display: 'flex', gap: 8, flexShrink: 0, background: 'var(--color-gray-50)' }}>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                placeholder="Ask a question..."
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  outline: 'none',
                  background: '#fff',
                  color: 'var(--color-gray-900)',
                }}
              />
              <button
                onClick={() => sendMessage(inputValue)}
                style={{
                  padding: '10px 14px',
                  background: 'var(--color-green)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: 16,
                  minWidth: 46,
                  minHeight: 46,
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fab-chatbot">
        <button
          className="fab-chatbot-button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
        >
          {isOpen ? '×' : '🤖'}
        </button>
      </div>
    </>
  )
}

/* ---- sub-components ---- */

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
