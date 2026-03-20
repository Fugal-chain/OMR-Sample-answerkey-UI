import { OPTION_COLORS } from '../../data/quizzes.js'

/**
 * MCQInput — four clickable option buttons (A / B / C / D).
 * Highlights the currently selected answer.
 */
export function MCQInput({ selectedAnswer, onChange }) {
  return (
    <div className="mcq-grid">
      {['A', 'B', 'C', 'D'].map((opt) => {
        const isSelected = selectedAnswer === opt
        const color = OPTION_COLORS[opt]

        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="mcq-choice"
            style={{
              transition: 'all 0.15s',
              background: isSelected ? color : 'linear-gradient(135deg, #f8fafc, #e5e7eb)',
              color: isSelected ? '#fff' : 'var(--color-gray-700)',
              boxShadow: isSelected
                ? `0 14px 22px ${color}33`
                : '0 10px 18px rgba(15,23,42,0.06)',
              transform: isSelected ? 'translateY(-1px)' : 'translateY(0)',
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
