import { useState, useRef, useEffect } from 'react'
import { Undo2, Redo2, Info, Loader2 } from 'lucide-react'

/**
 * TopBar — sticky header with logo, breadcrumb, autosave status,
 * Info (i) dropdown (undo/redo + help), and user avatar.
 */
export function TopBar({ selectedQuiz, undoRedoFns, autosaveStatus }) {
  const [infoOpen, setInfoOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!infoOpen) return
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setInfoOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [infoOpen])

  const { undo, redo, canUndo, canRedo } = undoRedoFns || {}

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#fff',
      borderBottom: '2px solid var(--color-gray-200)',
      padding: '0 32px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Left: Logo + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Logo */}
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-purple))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
          flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>O</span>
        </div>

        {/* App name */}
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-gray-900)', lineHeight: 1.2 }}>
            OMR Exam System
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-gray-500)' }}>
            Answer Key Management
          </div>
        </div>

        {/* Breadcrumb separator */}
        {selectedQuiz && (
          <>
            <span style={{ color: 'var(--color-gray-300)', fontSize: 20, lineHeight: 1 }}>›</span>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-gray-500)',
              maxWidth: 280,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {selectedQuiz.name}
            </span>
          </>
        )}
      </div>

      {/* Right: Autosave + Info + Date + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Autosave indicator */}
        {selectedQuiz && autosaveStatus && (
          <AutosaveIndicator status={autosaveStatus} />
        )}

        {/* Undo, Redo, and Info (i) buttons — only in setup mode */}
        {selectedQuiz && undoRedoFns && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => undoRedoFns.undo?.()}
              disabled={!undoRedoFns.canUndo}
              title="Undo (Ctrl+Z)"
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: '2px solid var(--color-gray-200)', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: undoRedoFns.canUndo ? 'var(--color-gray-700)' : 'var(--color-gray-300)',
                cursor: undoRedoFns.canUndo ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              <Undo2 size={18} />
            </button>

            <button
              onClick={() => undoRedoFns.redo?.()}
              disabled={!undoRedoFns.canRedo}
              title="Redo (Ctrl+Y)"
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: '2px solid var(--color-gray-200)', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: undoRedoFns.canRedo ? 'var(--color-gray-700)' : 'var(--color-gray-300)',
                cursor: undoRedoFns.canRedo ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              <Redo2 size={18} />
            </button>

            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setInfoOpen(!infoOpen)}
                title="Help"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  border: `2px solid ${infoOpen ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
                  background: infoOpen ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: infoOpen ? 'var(--color-primary)' : 'var(--color-gray-600)',
                  transition: 'all 0.15s',
                }}
              >
                <Info size={18} />
              </button>

              {infoOpen && (
                <InfoDropdown onClose={() => setInfoOpen(false)} />
              )}
            </div>
          </div>
        )}

        {/* Date chip */}
        <div style={{
          padding: '7px 14px',
          background: 'var(--color-gray-100)',
          borderRadius: 10,
          fontSize: 12,
          color: 'var(--color-gray-700)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 500,
        }}>
          <span>📅</span>
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>

        {/* User avatar */}
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          color: '#fff',
          fontSize: 14,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          T
        </div>
      </div>
    </header>
  )
}

/* ---- Autosave Indicator ---- */
function AutosaveIndicator({ status }) {
  if (!status || status.state === 'idle') return null

  if (status.state === 'saving') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 8,
        background: '#fef9c3', border: '1px solid #fde68a',
        fontSize: 11, fontWeight: 600, color: '#92400e',
      }}>
        <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
        Saving...
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (status.state === 'saved' && status.savedAt) {
    const timeStr = status.savedAt.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 8,
        background: '#dcfce7', border: '1px solid #86efac',
        fontSize: 11, fontWeight: 600, color: '#15803d',
      }}>
        ✓ Saved at {timeStr}
      </div>
    )
  }

  return null
}

/* ---- Info Dropdown ---- */
function InfoDropdown({ onClose }) {
  return (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      width: 280,
      background: '#fff',
      borderRadius: 14,
      border: '2px solid var(--color-gray-200)',
      boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
      zIndex: 200,
      padding: 14,
      animation: 'dropdownIn 0.15s ease',
    }}>
      <style>{`@keyframes dropdownIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Help / Keyboard shortcuts */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Keyboard Shortcuts
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <ShortcutRow keys="Ctrl+Z" desc="Undo last change" />
          <ShortcutRow keys="Ctrl+Y" desc="Redo last change" />
          <ShortcutRow keys="Enter" desc="Add numeric value" />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-gray-200)', margin: '12px 0' }} />

      {/* Help tips */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Quick Tips
        </div>
        <ul style={{ fontSize: 12, color: 'var(--color-gray-600)', lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
          <li>Drag options from the sidebar onto MCQ rows</li>
          <li>Use comma-separated values for numeric inputs</li>
          <li>Click "Bulk Import" for batch entry</li>
          <li>All changes auto-save</li>
        </ul>
      </div>
    </div>
  )
}

function ShortcutRow({ keys, desc }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: 'var(--color-gray-600)' }}>{desc}</span>
      <code style={{
        fontSize: 10,
        padding: '2px 8px',
        background: 'var(--color-gray-100)',
        borderRadius: 6,
        color: 'var(--color-gray-700)',
        fontWeight: 600,
      }}>
        {keys}
      </code>
    </div>
  )
}
