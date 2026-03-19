import { useState } from 'react'
import { isValidNumeric } from '../../utils/validation.js'

const QUICK_VALUES = ['0', '1', '2', '5', '10', '100']

/**
 * NumericInput — allows adding multiple accepted numeric answers.
 * Supports quick-value buttons and Enter-key submission.
 */
export function NumericInput({ answers, onChange, hasError }) {
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')

  const addAnswer = (val = inputValue) => {
    const trimmed = val.trim()
    if (!trimmed) return
    if (!isValidNumeric(trimmed)) {
      setInputError('Enter a valid number (e.g. 42 or 3.14)')
      return
    }
    setInputError('')
    onChange([...answers, trimmed])
    setInputValue('')
  }

  const removeAnswer = (index) => {
    onChange(answers.filter((_, i) => i !== index))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Accepted answers chips */}
      {answers.length > 0 && (
        <div style={{
          background: '#fff',
          border: '2px solid #c4b5fd',
          borderRadius: 10,
          padding: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Accepted Answers
            </span>
            <span style={{ fontSize: 11, color: '#7c3aed' }}>{answers.length} answer(s)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {answers.map((ans, i) => (
              <AnswerChip key={i} value={ans} onRemove={() => removeAnswer(i)} />
            ))}
          </div>
        </div>
      )}

      {/* Text input + Add button */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setInputError('') }}
          onKeyDown={(e) => e.key === 'Enter' && addAnswer()}
          placeholder="Enter numeric value (e.g. 42 or 3.14)"
          style={{
            flex: 1,
            padding: '11px 14px',
            borderRadius: 10,
            fontSize: 14,
            border: `2px solid ${hasError || inputError ? '#fca5a5' : 'var(--color-gray-300)'}`,
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#a78bfa' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = hasError || inputError ? '#fca5a5' : 'var(--color-gray-300)' }}
        />
        <button
          onClick={() => addAnswer()}
          style={{
            padding: '11px 18px',
            background: '#7c3aed',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          + Add
        </button>
      </div>

      {inputError && (
        <p style={{ fontSize: 12, color: 'var(--color-red)', marginTop: -4 }}>⚠️ {inputError}</p>
      )}

      {/* Quick value buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-gray-500)' }}>Quick:</span>
        {QUICK_VALUES.map((v) => (
          <button
            key={v}
            onClick={() => addAnswer(v)}
            style={{
              padding: '5px 12px',
              background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
              border: '1px solid var(--color-gray-300)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-gray-700)',
              transition: 'all 0.12s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#d1d5db' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

function AnswerChip({ value, onRemove }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 12px',
      background: '#ede9fe',
      border: '1px solid #c4b5fd',
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 600,
      color: '#4c1d95',
    }}>
      {value}
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#7c3aed',
          fontSize: 16,
          lineHeight: 1,
          padding: '0 1px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        ×
      </button>
    </div>
  )
}
