/**
 * Reusable animated progress bar.
 */
export function ProgressBar({ value = 0, max = 100, label, showPercent = true, color = 'var(--color-primary)', height = 10 }) {
  const safeMax = Math.max(max, 1)
  const safeValue = Math.min(Math.max(value, 0), safeMax)
  const pct = Math.round((safeValue / safeMax) * 100)

  return (
    <div>
      {(label || showPercent) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
          {label && <span style={{ fontWeight: 600, color: 'var(--color-gray-700)' }}>{label}</span>}
          {showPercent && <span style={{ fontWeight: 700, color }}>{pct}%</span>}
        </div>
      )}
      <div style={{ height, background: 'var(--color-gray-200)', borderRadius: height, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: height,
          transition: 'width 0.4s ease',
          boxShadow: pct > 0 ? `0 0 12px ${color}` : 'none',
        }} />
      </div>
    </div>
  )
}
