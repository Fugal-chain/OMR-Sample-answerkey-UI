import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleHelp, Info, Redo2, Undo2 } from 'lucide-react'

function formatSaveStatus(saveStatus) {
  if (!saveStatus) return ''
  if (saveStatus.state === 'saving') return 'Saving...'
  if (saveStatus.savedAt) {
    return `Saved at ${new Date(saveStatus.savedAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })}`
  }
  return ''
}

/**
 * TopBar — sticky header with logo, breadcrumb, autosave state, and info menu.
 */
export function TopBar({ selectedQuiz, saveStatus, editorControls }) {
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const menuRef = useRef(null)

  const saveStatusLabel = useMemo(() => formatSaveStatus(saveStatus), [saveStatus])

  useEffect(() => {
    if (!isInfoOpen) return undefined

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsInfoOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [isInfoOpen])

  return (
    <header className="top-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
        <div className="top-bar-logo">
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>O</span>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-gray-900)', lineHeight: 1.2 }}>
            OMR Exam System
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-gray-500)' }}>
            Answer Key Management
          </div>
        </div>

        {selectedQuiz && (
          <>
            <span className="top-bar-separator">›</span>
            <span className="top-bar-breadcrumb">
              {selectedQuiz.name}
            </span>
          </>
        )}
      </div>

      <div className="top-bar-actions">
        {selectedQuiz && saveStatusLabel && (
          <div className={`top-bar-status-chip${saveStatus?.state === 'saving' ? ' is-saving' : ''}`}>
            <span className={`status-dot${saveStatus?.state === 'saving' ? ' is-saving' : ''}`} />
            {saveStatusLabel}
          </div>
        )}

        <div className="top-bar-date-chip">
          <span>📅</span>
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>

        {selectedQuiz && editorControls && (
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="top-bar-info-button"
              onClick={() => setIsInfoOpen((prev) => !prev)}
              aria-label="Open info menu"
            >
              <Info size={18} />
            </button>

            {isInfoOpen && (
              <div className="top-bar-info-menu">
                <button
                  type="button"
                  className="top-bar-info-item"
                  onClick={() => {
                    editorControls.undo()
                    setIsInfoOpen(false)
                  }}
                  disabled={!editorControls.canUndo}
                >
                  <Undo2 size={15} />
                  Undo
                </button>

                <button
                  type="button"
                  className="top-bar-info-item"
                  onClick={() => {
                    editorControls.redo()
                    setIsInfoOpen(false)
                  }}
                  disabled={!editorControls.canRedo}
                >
                  <Redo2 size={15} />
                  Redo
                </button>

                <button
                  type="button"
                  className="top-bar-info-item"
                  onClick={() => {
                    editorControls.startTour()
                    setIsInfoOpen(false)
                  }}
                >
                  <CircleHelp size={15} />
                  Help / Tour
                </button>
              </div>
            )}
          </div>
        )}

        <div className="top-bar-avatar">
          T
        </div>
      </div>
    </header>
  )
}
