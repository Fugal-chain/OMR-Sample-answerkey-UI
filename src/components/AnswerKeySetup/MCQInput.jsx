import { OPTION_COLORS } from '../../data/quizzes.js'

/**
 * MCQInput — four clickable option buttons (A / B / C / D).
 * Highlights the currently selected answer.
 * Shows dashed green border around the button grid when an answer is selected.
 */
export function MCQInput({ selectedAnswer, onChange }) {
  const hasAnswer = Boolean(selectedAnswer)

  return (
    <div style={{
      display: 'flex', gap: 10, flexWrap: 'wrap',
      padding: 8, borderRadius: 14,
      border: hasAnswer ? '2px dashed #86efac' : '2px solid transparent',
      transition: 'border-color 0.2s',
    }}>
      {['A', 'B', 'C', 'D'].map((opt) => {
        const isSelected = selectedAnswer === opt
        const color = OPTION_COLORS[opt]

        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              fontWeight: 800,
              fontSize: 20,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: isSelected ? color : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
              color: isSelected ? '#fff' : 'var(--color-gray-700)',
              boxShadow: isSelected
                ? `0 4px 14px ${color}55`
                : '0 2px 6px rgba(0,0,0,0.08)',
              transform: isSelected ? 'scale(1.12)' : 'scale(1)',
              minHeight: 44,
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.background = '#d1d5db'
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.background = 'linear-gradient(135deg, #f3f4f6, #e5e7eb)'
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
