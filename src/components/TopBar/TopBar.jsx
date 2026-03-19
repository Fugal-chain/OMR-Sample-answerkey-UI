/**
 * TopBar — sticky header with logo, breadcrumb, and user avatar.
 */
export function TopBar({ selectedQuiz }) {
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

      {/* Right: Date chip + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
