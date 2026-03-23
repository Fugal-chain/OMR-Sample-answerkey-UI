import { useEffect, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { MCQInput } from './MCQInput.jsx'
import { NumericInput } from './NumericInput.jsx'
import { TagDropZone } from './TagDropZone.jsx'

/**
 * QuestionRow — one row in the answer-key editor.
 *
 * Handles:
 *  - MCQ button selection
 *  - Numeric multi-answer input
 *  - Drag-and-drop tag assignment
 *  - Validation error display
 *  - Visual status (answered / error / neutral)
 */
export function QuestionRow({
  question,
  validationError,
  onAnswerChange,
  onAnswersChange,
  onPointsChange,
  onRemoveTag,
  inputRef,
  rowRef,
  isHighlighted = false,
  suggestionsEnabled = true,
  enableDragDrop = true,
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `question-${question.questionNumber}`,
    data: {
      type: 'question-row',
      questionNumber: question.questionNumber,
      questionType: question.type,
    },
    disabled: question.type !== 'MCQ' || !enableDragDrop,
  })

  const hasAnswer =
    question.type === 'MCQ'
      ? !!question.answer
      : question.answers?.length > 0

  let borderColor = 'var(--color-gray-200)'
  let bgColor = '#fff'
  if (isOver) { borderColor = 'var(--color-primary)'; bgColor = '#eff6ff' }
  else if (validationError) { borderColor = '#fca5a5'; bgColor = '#fff' }

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        if (typeof rowRef === 'function') rowRef(node)
      }}
      className="question-row"
      style={{
        border: `1px solid ${borderColor}`,
        background: bgColor,
        boxShadow: isOver
          ? '0 0 0 4px rgba(59,130,246,0.15)'
          : 'var(--shadow-sm)',
      }}
    >
      <div className={`question-row-inner${!enableDragDrop ? ' is-compact' : ''}`}>
        <div className="question-main-area">
          <QuestionMeta
            number={question.questionNumber}
            type={question.type}
          />

          <div className={`question-input-area${question.type === 'MCQ' ? ' is-mcq' : ' is-numeric'}`}>
          {question.type === 'MCQ' ? (
            <MCQInput
              selectedAnswer={question.answer}
              onChange={onAnswerChange}
              hasError={!!validationError}
              isAnswered={hasAnswer}
              isHighlighted={isHighlighted}
              inputRef={inputRef}
            />
          ) : (
            <NumericInput
              answers={question.answers || []}
              onChange={onAnswersChange}
              validationError={validationError}
              inputRef={inputRef}
              isAnswered={hasAnswer}
              isHighlighted={isHighlighted}
              totalBubbles={question.totalBubbles}
              suggestionsEnabled={suggestionsEnabled}
              allowDecimal={question.allowDecimal}
              allowFraction={question.allowFraction}
              allowNegative={question.allowNegative}
            />
          )}
        </div>
        </div>

        <div className="question-points-area">
          <QuestionPoints
            points={question.points ?? 1}
            onPointsChange={onPointsChange}
          />
        </div>

        {question.type === 'MCQ' && enableDragDrop && (
          <div className="question-preview-area">
            <TagDropZone tag={question.tag} onRemove={onRemoveTag} />
          </div>
        )}
      </div>

      {validationError && (
        <div className="inline-error">
          {validationError}
        </div>
      )}
    </div>
  )
}

/* ---- small sub-component ---- */
function QuestionMeta({ number, type }) {
  return (
    <div className="question-meta">
      <div style={{
        width: 42,
        height: 42,
        borderRadius: 14,
        background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 16,
        color: 'var(--color-gray-800)',
        boxShadow: '0 8px 18px rgba(15,23,42,0.08)',
      }}>
        {number}
      </div>

      {/* Type badge */}
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        padding: '4px 10px',
        borderRadius: 20,
        background: '#f0fdf4',
        color: 'var(--success)',
        border: '1px solid #bbf7d0',
        whiteSpace: 'nowrap',
      }}>
        {type}
      </span>
    </div>
  )
}

function QuestionPoints({ points = 1, onPointsChange }) {
  const [draftValue, setDraftValue] = useState(String(points))

  useEffect(() => {
    setDraftValue(String(points))
  }, [points])

  const commitPoints = () => {
    const numericValue = Number(draftValue)
    if (!Number.isFinite(numericValue)) return

    const nextValue = Math.min(100, Math.max(1, Math.round(numericValue)))
    onPointsChange?.(nextValue)
    setDraftValue(String(nextValue))
  }

  return (
    <div className="points-stack">
      <span className="points-label">Marks</span>
      <div className="points-input-row">
        <input
          type="number"
          min="1"
          max="100"
          inputMode="numeric"
          className="points-input"
          value={draftValue}
          onChange={(event) => setDraftValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commitPoints()
            }
          }}
        />
        <button
          type="button"
          className="points-set-button"
          onClick={commitPoints}
        >
          Set
        </button>
      </div>
    </div>
  )
}
