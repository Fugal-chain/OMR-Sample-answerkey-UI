/**
 * Reusable Badge for status labels.
 */
export function Badge({ children, variant = 'default', style = {} }) {
  const variants = {
    default: { background: 'var(--color-gray-100)', color: 'var(--color-gray-600)', border: '1px solid var(--color-gray-200)' },
    primary: { background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid #93c5fd' },
    success: { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' },
    warning: { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' },
    danger:  { background: 'var(--color-red-light)', color: 'var(--color-red)', border: '1px solid #fca5a5' },
    purple:  { background: 'var(--color-purple-light)', color: 'var(--color-purple)', border: '1px solid #c4b5fd' },
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      ...variants[variant],
      ...style,
    }}>
      {children}
    </span>
  )
}
