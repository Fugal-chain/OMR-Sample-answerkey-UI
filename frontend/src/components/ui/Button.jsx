/**
 * Reusable Button component with multiple variants.
 */
export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  title,
  style = {},
  ...props
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    border: 'none',
    borderRadius: 10,
    fontFamily: 'inherit',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  }

  const sizes = {
    sm: { padding: '5px 12px', fontSize: 12 },
    md: { padding: '9px 18px', fontSize: 13 },
    lg: { padding: '12px 24px', fontSize: 15 },
    icon: { width: 36, height: 36, padding: 0, fontSize: 16 },
  }

  const variants = {
    primary: {
      background: 'var(--color-primary)',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
    },
    secondary: {
      background: '#fff',
      color: 'var(--color-gray-700)',
      border: '2px solid var(--color-gray-200)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-gray-600)',
      border: '2px solid transparent',
    },
    danger: {
      background: 'var(--color-red)',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(220,38,38,0.25)',
    },
    success: {
      background: 'var(--color-green)',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
    },
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={title}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
