import { useEffect } from 'react'

/**
 * Reusable modal overlay with backdrop.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 560,
  allowBackgroundScroll = false,
}) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '0 20px',
        pointerEvents: allowBackgroundScroll ? 'none' : 'auto',
      }}
      onClick={allowBackgroundScroll ? undefined : onClose}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          background: '#fff', borderRadius: 20, boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          width: '100%', maxWidth, overflow: 'hidden',
          animation: 'modalIn 0.2s ease',
          pointerEvents: 'auto',
        }}
      >
        <style>{`@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(-10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>

        {/* Header */}
        <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid var(--color-gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {icon && (
              <div style={{ width: 42, height: 42, background: 'var(--color-primary-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {icon}
              </div>
            )}
            <div>
              {title && <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-gray-900)' }}>{title}</div>}
              {subtitle && <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 2 }}>{subtitle}</div>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--color-gray-400)', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
