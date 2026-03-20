import { useEffect, useMemo, useState } from 'react'
import {
  parseNumericValues,
  validateNumericInputValue,
} from '../../utils/validation.js'

function getSuggestions(value, maxDigits) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed || trimmed.includes(',') || trimmed.startsWith('-') || trimmed.includes('.')) {
    return []
  }

  if (!/^\d+$/.test(trimmed)) return []

  const suggestionSet = new Set()
  for (let length = trimmed.length + 1; length <= maxDigits; length += 1) {
    suggestionSet.add(trimmed.padStart(length, '0'))
  }

  return Array.from(suggestionSet)
}

/**
 * NumericInput — allows adding multiple accepted numeric answers.
 */
export function NumericInput({
  answers,
  onChange,
  validationError,
  inputRef,
  isAnswered,
  isHighlighted,
  totalBubbles = 4,
  suggestionsEnabled = true,
}) {
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')

  const suggestions = useMemo(
    () => (suggestionsEnabled ? getSuggestions(inputValue, totalBubbles) : []),
    [inputValue, suggestionsEnabled, totalBubbles]
  )

  useEffect(() => {
    setInputError(validateNumericInputValue(inputValue, answers) || '')
  }, [answers, inputValue])

  const addAnswer = (value = inputValue) => {
    const parsedValues = parseNumericValues(value)
    if (!parsedValues.length) return

    const error = validateNumericInputValue(value, answers)
    if (error) {
      setInputError(error)
      return
    }

    setInputError('')
    onChange([...answers, ...parsedValues])
    setInputValue('')
  }

  const removeAnswer = (index) => {
    onChange(answers.filter((_, i) => i !== index))
  }

  const showError = inputError || validationError

  return (
    <div className="numeric-stack">
      {answers.length > 0 && (
        <div style={{
          background: '#fff',
          border: '1px solid #bbf7d0',
          borderRadius: 14,
          padding: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Accepted Answers
            </span>
            <span style={{ fontSize: 11, color: 'var(--success)' }}>{answers.length} answer(s)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {answers.map((ans, i) => (
              <AnswerChip key={`${ans}-${i}`} value={ans} onRemove={() => removeAnswer(i)} />
            ))}
          </div>
        </div>
      )}

      <div className="numeric-entry-row">
        <div
          className={`numeric-input-shell${isAnswered ? ' is-answered' : ''}${isHighlighted ? ' is-highlighted' : ''}${showError ? ' is-error' : ''}`}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAnswer()}
            placeholder="Enter numeric value(s), e.g. 2,3,12"
            className="numeric-entry-input"
          />
        </div>
        <button
          onClick={() => addAnswer()}
          style={{
            padding: '11px 18px',
            background: 'var(--success)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            boxShadow: '0 8px 18px rgba(22,163,74,0.22)',
            whiteSpace: 'nowrap',
            minHeight: 46,
          }}
        >
          + Add
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="suggestion-chip-row">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="suggestion-chip"
              onClick={() => addAnswer(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {showError && (
        <p style={{ fontSize: 12, color: 'var(--color-red)', marginTop: -4 }}>
          {showError}
        </p>
      )}
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
      background: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--success)',
    }}>
      {value}
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--success)',
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
