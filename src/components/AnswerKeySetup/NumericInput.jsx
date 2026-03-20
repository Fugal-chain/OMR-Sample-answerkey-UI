import { useState, useMemo } from 'react'
import { isValidNumeric, hasDuplicateNumeric, generatePaddedSuggestions } from '../../utils/validation.js'

const QUICK_VALUES = ['0', '1', '2', '5', '10', '100']

/**
 * NumericInput — allows adding multiple accepted numeric answers.
 * Supports:
 *  - Comma-separated input (e.g. "2,3,12")
 *  - Quick-value buttons
 *  - Enter-key submission
 *  - Zero-padded auto-suggestions
 *  - Duplicate prevention with inline error
 *  - Dashed green border when answered
 */
export function NumericInput({ answers, onChange, hasError }) {
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')

  const hasAnswers = answers.length > 0

  /* ---- auto-suggestions based on current input ---- */
  const suggestions = useMemo(() => {
    const trimmed = inputValue.trim()
    if (!trimmed || trimmed.includes(',')) return []
    return generatePaddedSuggestions(trimmed, answers)
  }, [inputValue, answers])

  /* ---- add one or more answers ---- */
  const addAnswers = (rawValue = inputValue) => {
    const parts = rawValue.split(',').map((v) => v.trim()).filter(Boolean)
    if (parts.length === 0) return

    const newAnswers = [...answers]
    let errorMsg = ''

    for (const part of parts) {
      if (!isValidNumeric(part)) {
        errorMsg = `"${part}" is not a valid number (e.g. 42 or 3.14)`
        break
      }
      if (hasDuplicateNumeric(newAnswers, part)) {
        errorMsg = 'Duplicate values are not allowed'
        break
      }
      newAnswers.push(part)
    }

    if (errorMsg) {
      setInputError(errorMsg)
      return
    }

    setInputError('')
    onChange(newAnswers)
    setInputValue('')
  }

  const addSuggestion = (val) => {
    if (hasDuplicateNumeric(answers, val)) {
      setInputError('Duplicate values are not allowed')
      return
    }
    setInputError('')
    onChange([...answers, val])
  }

  const addQuickValue = (val) => {
    if (hasDuplicateNumeric(answers, val)) {
      setInputError('Duplicate values are not allowed')
      return
    }
    setInputError('')
    onChange([...answers, val])
    setInputValue('')
  }

  const removeAnswer = (index) => {
    onChange(answers.filter((_, i) => i !== index))
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    if (inputError) setInputError('')
  }

  /* ---- border for the outer container ---- */
  const containerBorder = hasAnswers
    ? '2px dashed #86efac'
    : hasError
      ? '2px solid #fca5a5'
      : '2px solid transparent'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 10,
      padding: 10, borderRadius: 14,
      border: containerBorder,
      transition: 'border-color 0.2s',
    }}>
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
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && addAnswers()}
          placeholder="Enter value(s) — e.g. 42 or 2,3,12"
          style={{
            flex: 1,
            padding: '11px 14px',
            borderRadius: 10,
            fontSize: 14,
            border: `2px solid ${hasError || inputError ? '#fca5a5' : 'var(--color-gray-300)'}`,
            outline: 'none',
            transition: 'border-color 0.15s',
            minHeight: 44,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#a78bfa' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = hasError || inputError ? '#fca5a5' : 'var(--color-gray-300)' }}
        />
        <button
          onClick={() => addAnswers()}
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
            minHeight: 44,
          }}
        >
          + Add
        </button>
      </div>

      {inputError && (
        <p style={{ fontSize: 12, color: 'var(--color-red)', marginTop: -4 }}>⚠️ {inputError}</p>
      )}

      {/* Auto-suggestions */}
      {suggestions.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-gray-500)' }}>Suggestions:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => addSuggestion(s)}
              style={{
                padding: '5px 12px',
                background: '#ede9fe',
                border: '1px solid #c4b5fd',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: '#6d28d9',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ddd6fe' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#ede9fe' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Quick value buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-gray-500)' }}>Quick:</span>
        {QUICK_VALUES.map((v) => (
          <button
            key={v}
            onClick={() => addQuickValue(v)}
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
