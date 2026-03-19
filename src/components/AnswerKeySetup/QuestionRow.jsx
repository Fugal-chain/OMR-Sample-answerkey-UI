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
  onRemoveTag,
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `question-${question.questionNumber}`,
    data: {
      type: 'question-row',
      questionNumber: question.questionNumber,
      questionType: question.type,
    },
    disabled: question.type !== 'MCQ',
  })

  const hasAnswer =
    question.type === 'MCQ'
      ? !!question.answer
      : question.answers?.length > 0

  /* ---- border / background based on state ---- */
  let borderColor = 'var(--color-gray-200)'
  let bgColor = '#fff'
  if (isOver)         { borderColor = 'var(--color-primary)';  bgColor = '#eff6ff' }
  else if (validationError) { borderColor = '#fca5a5'; bgColor = '#fef2f2' }
  else if (hasAnswer) { borderColor = '#86efac'; bgColor = '#f0fdf4' }

  return (
    <div
      ref={setNodeRef}
      style={{
        padding: 20,
        borderRadius: 'var(--radius-lg)',
        border: `2px solid ${borderColor}`,
        background: bgColor,
        transition: 'all 0.15s',
        boxShadow: isOver
          ? '0 0 0 4px rgba(59,130,246,0.15)'
          : 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        {/* Question number + type badge */}
        <QuestionMeta number={question.questionNumber} type={question.type} />

        {/* Answer input area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {question.type === 'MCQ' ? (
            <MCQInput
              selectedAnswer={question.answer}
              onChange={onAnswerChange}
            />
          ) : (
            <NumericInput
              answers={question.answers || []}
              onChange={onAnswersChange}
              hasError={!!validationError}
            />
          )}
        </div>

        {/* Drag-and-drop tag zone (MCQ only) */}
        {question.type === 'MCQ' && (
          <TagDropZone tag={question.tag} onRemove={onRemoveTag} />
        )}

        {/* Status icon */}
        <div style={{ width: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 8 }}>
          {validationError ? (
            <span title={validationError} style={{ fontSize: 20 }}>🔴</span>
          ) : hasAnswer ? (
            <span style={{ fontSize: 20 }}>✅</span>
          ) : null}
        </div>
      </div>

      {/* Inline validation error */}
      {validationError && (
        <div style={{
          marginTop: 10,
          marginLeft: 96,
          padding: '8px 12px',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: 8,
          fontSize: 12,
          color: 'var(--color-red)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          ⚠️ {validationError}
        </div>
      )}
    </div>
  )
}

/* ---- small sub-component ---- */
function QuestionMeta({ number, type }) {
  const isMCQ = type === 'MCQ'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 72 }}>
      {/* Number bubble */}
      <div style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 16,
        color: 'var(--color-gray-800)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
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
        background: isMCQ ? '#dbeafe' : '#ede9fe',
        color: isMCQ ? '#1d4ed8' : '#6d28d9',
        border: `1px solid ${isMCQ ? '#93c5fd' : '#c4b5fd'}`,
        whiteSpace: 'nowrap',
      }}>
        {type}
      </span>
    </div>
  )
}
