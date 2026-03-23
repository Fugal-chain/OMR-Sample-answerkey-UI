/**
 * TagDropZone — shows the dropped answer-option tag for an MCQ question.
 * Displays the coloured letter pill when a tag has been assigned,
 * or an empty dashed placeholder when not.
 */
export function TagDropZone({ tag, onRemove }) {
  if (!tag) {
    return (
      <div style={{
        width: 90,
        padding: '18px 0',
        borderRadius: 12,
        textAlign: 'center',
        border: '2px dashed var(--color-gray-300)',
        color: 'var(--color-gray-400)',
        fontSize: 11,
        lineHeight: 1.4,
        userSelect: 'none',
      }}>
        Drop<br />here
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        width: 90,
        padding: '12px 0',
        borderRadius: 12,
        background: tag.color,
        color: '#fff',
        textAlign: 'center',
        boxShadow: `0 4px 14px ${tag.color}66`,
        cursor: 'default',
      }}
      onMouseEnter={(e) => { e.currentTarget.querySelector('.remove-btn').style.opacity = '1' }}
      onMouseLeave={(e) => { e.currentTarget.querySelector('.remove-btn').style.opacity = '0' }}
    >
      <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{tag.option}</div>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, opacity: 0.85, marginTop: 3 }}>
        Option {tag.option}
      </div>

      {/* Remove button */}
      <button
        className="remove-btn"
        onClick={onRemove}
        style={{
          position: 'absolute',
          top: -8,
          right: -8,
          width: 22,
          height: 22,
          background: '#ef4444',
          border: '2px solid #fff',
          borderRadius: '50%',
          color: '#fff',
          cursor: 'pointer',
          fontSize: 13,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 0.15s',
          fontWeight: 700,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}
      >
        ×
      </button>
    </div>
  )
}
