import { useEffect, useMemo, useState } from 'react'
import { useDndMonitor } from '@dnd-kit/core'
import { Undo2, Redo2, Upload, Save, Trash2 } from 'lucide-react'
import { useAnswerKeyHistory } from '../../hooks/useAnswerKeyHistory.js'
import { ANSWER_TAGS } from '../../data/quizzes.js'
import { validateAllQuestions } from '../../utils/validation.js'
import { ProgressBar } from '../ui/index.js'
import { QuestionRow } from './QuestionRow.jsx'

/**
 * Builds the initial questions array from the quiz's OMR configuration.
 */
function buildInitialQuestions(omrConfiguration, savedQuestions = []) {
  const savedByQuestionNumber = new Map(
    (Array.isArray(savedQuestions) ? savedQuestions : []).map((question) => [
      question.questionNumber,
      question,
    ])
  )

  return omrConfiguration.map((omrQ) => {
    const savedQuestion = savedByQuestionNumber.get(omrQ.questionNumber)
    const savedAnswer = savedQuestion?.answer || ''
    const savedTag = savedQuestion?.tag || findTagForOption(savedAnswer)

    return {
      questionNumber: omrQ.questionNumber,
      type: omrQ.type,
      answer: omrQ.type === 'MCQ' ? savedAnswer : '',
      answers:
        omrQ.type === 'Numeric' && Array.isArray(savedQuestion?.answers)
          ? savedQuestion.answers
          : [],
      tag: omrQ.type === 'MCQ' ? savedTag : undefined,
    }
  })
}

function findTagForOption(option) {
  return ANSWER_TAGS.find((tag) => tag.option === option)
}

/**
 * AnswerKeySetup — the main answer-key editor panel (center column).
 *
 * Features:
 *  - Per-question MCQ / Numeric inputs
 *  - Drag-and-drop tag assignment
 *  - Undo / Redo (full history, keyboard shortcuts via hook)
 *  - Bulk import callback
 *  - Progress bar
 *  - Validation on save
 */
function isQuestionAnswered(question) {
  if (question.type === 'MCQ') return Boolean(question.answer)
  return Array.isArray(question.answers) && question.answers.some((answer) => String(answer).trim())
}

function clearQuestionValues(question) {
  return {
    ...question,
    answer: question.type === 'MCQ' ? '' : question.answer,
    answers: question.type === 'Numeric' ? [] : question.answers,
    tag: undefined,
  }
}

export function AnswerKeySetup({
  quiz,
  savedQuestions,
  bulkImportPayload,
  onBulkImportApplied,
  onBack,
  onSave,
  onBulkImport,
}) {
  const initialQuestions = useMemo(
    () => buildInitialQuestions(quiz.omrConfiguration, savedQuestions),
    [quiz.omrConfiguration, savedQuestions]
  )

  const {
    questions,
    setQuestions,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useAnswerKeyHistory(initialQuestions)

  const [validationErrors, setValidationErrors] = useState({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  /* ---- helpers to update one question ---- */
  const updateQuestion = (questionNumber, patch) => {
    setQuestions((currentQuestions = []) =>
      currentQuestions.map((q) =>
        q.questionNumber === questionNumber ? { ...q, ...patch } : q
      )
    )
  }

  useEffect(() => {
    if (!bulkImportPayload?.entries?.length) return
    if (bulkImportPayload.quizId !== quiz.id) return

    setQuestions((currentQuestions = []) =>
      currentQuestions.map((question) => {
        const importedEntry = bulkImportPayload.entries.find(
          (entry) => entry.questionNumber === question.questionNumber
        )

        if (!importedEntry) return question

        const importedAnswer = String(importedEntry.answer ?? '').trim().toUpperCase()

        if (question.type === 'MCQ') {
          return {
            ...question,
            answer: importedAnswer,
            tag: findTagForOption(importedAnswer),
          }
        }

        return {
          ...question,
          answers: importedAnswer ? [importedAnswer] : [],
        }
      })
    )
    setValidationErrors({})
    onBulkImportApplied?.()
  }, [bulkImportPayload, onBulkImportApplied, quiz.id, setQuestions])

  useDndMonitor({
    onDragEnd(event) {
      const tag = event.active?.data?.current?.tag
      const overData = event.over?.data?.current

      if (!tag || overData?.type !== 'question-row' || overData.questionType !== 'MCQ') {
        return
      }

      updateQuestion(overData.questionNumber, {
        tag,
        answer: tag.option,
      })
    },
  })

  /* ---- save ---- */
  const handleSave = () => {
    const errors = validateAllQuestions(questionList)
    setValidationErrors(errors)

    if (Object.keys(errors).length === 0) {
      onSave(questionList)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const handleClearAll = () => {
    const hasAnswers = questionList.some(isQuestionAnswered)
    if (!hasAnswers) return

    const confirmed = window.confirm(
      'Clear all entered answers for this quiz? This will remove all MCQ, numeric, and dropped tag values.'
    )

    if (!confirmed) return

    setQuestions((currentQuestions = []) => currentQuestions.map(clearQuestionValues))
    setValidationErrors({})
    setSaveSuccess(false)
  }

  /* ---- progress ---- */
  const questionList = Array.isArray(questions) ? questions : []

  useEffect(() => {
    const autosaveTimer = window.setTimeout(() => {
      onSave(questionList)
    }, 400)

    return () => window.clearTimeout(autosaveTimer)
  }, [onSave, questionList])

  const answeredCount = questionList.filter(isQuestionAnswered).length

  const errorCount = Object.keys(validationErrors).length

  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      border: '2px solid var(--color-gray-200)',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 160px)',
    }}>
      {/* ---- Header ---- */}
      <div style={{
        padding: '18px 24px',
        borderBottom: '2px solid var(--color-gray-200)',
        background: 'linear-gradient(135deg, var(--color-gray-50), #fff)',
        flexShrink: 0,
      }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          {/* Back button */}
          <button
            onClick={onBack}
            title="Back to quiz list"
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: '2px solid var(--color-gray-200)',
              background: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: 'var(--color-gray-600)',
              flexShrink: 0,
            }}
          >←</button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-gray-900)', lineHeight: 1.2 }}>
              Answer Key Setup
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-gray-500)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {quiz.name}
            </p>
          </div>

          {/* Undo / Redo */}
          <div style={{ display: 'flex', gap: 4, paddingRight: 12, borderRight: '2px solid var(--color-gray-200)' }}>
            <IconButton onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
              <Undo2 size={16} />
            </IconButton>
            <IconButton onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
              <Redo2 size={16} />
            </IconButton>
          </div>

          {/* Bulk Import */}
          <button
            onClick={onBulkImport}
            style={{
              padding: '8px 14px', border: '2px solid var(--color-gray-200)',
              background: '#fff', borderRadius: 10, cursor: 'pointer',
              fontWeight: 600, fontSize: 12, color: 'var(--color-gray-700)',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.color = 'var(--color-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-gray-200)'; e.currentTarget.style.color = 'var(--color-gray-700)' }}
          >
            <Upload size={14} /> Bulk Import
          </button>

          <button
            onClick={handleClearAll}
            disabled={answeredCount === 0}
            style={{
              padding: '8px 14px',
              border: '2px solid #fecaca',
              background: '#fff5f5',
              borderRadius: 10,
              cursor: answeredCount === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: 12,
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
              opacity: answeredCount === 0 ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (answeredCount > 0) {
                e.currentTarget.style.background = '#fee2e2'
                e.currentTarget.style.borderColor = '#fca5a5'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff5f5'
              e.currentTarget.style.borderColor = '#fecaca'
            }}
          >
            <Trash2 size={14} /> Clear All
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            style={{
              padding: '9px 20px',
              border: 'none',
              background: saveSuccess ? 'var(--color-green)' : 'var(--color-primary)',
              color: '#fff',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 0.25s',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}
          >
            <Save size={15} />
            {saveSuccess ? 'Saved!' : 'Save Answer Key'}
          </button>
        </div>

        {/* Progress bar */}
        <ProgressBar
          value={answeredCount}
          max={questionList.length}
          label={`Progress: ${answeredCount} of ${questionList.length} questions`}
        />

        {/* Validation summary */}
        {errorCount > 0 && (
          <div style={{
            marginTop: 12,
            padding: '10px 14px',
            background: 'var(--color-red-light)',
            border: '2px solid #fca5a5',
            borderRadius: 10,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-red)', fontSize: 13 }}>
                {errorCount} validation error{errorCount > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>
                Please fix the highlighted questions before saving.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---- Questions list ---- */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {questionList.map((question) => (
          <QuestionRow
            key={question.questionNumber}
            question={question}
            validationError={validationErrors[question.questionNumber]}
            onAnswerChange={(val) =>
              updateQuestion(question.questionNumber, {
                answer: val,
                tag: question.type === 'MCQ' ? findTagForOption(val) : question.tag,
              })
            }
            onAnswersChange={(ans) => updateQuestion(question.questionNumber, { answers: ans })}
            onRemoveTag={() => updateQuestion(question.questionNumber, { tag: undefined, answer: '' })}
          />
        ))}
      </div>

      {/* ---- Footer hint ---- */}
      <div style={{
        padding: '10px 24px',
        borderTop: '1px solid var(--color-gray-100)',
        display: 'flex',
        gap: 18,
        fontSize: 11,
        color: 'var(--color-gray-400)',
        flexShrink: 0,
      }}>
        <span>⌨️ <strong>Ctrl+Z</strong> Undo</span>
        <span>⌨️ <strong>Ctrl+Y</strong> Redo</span>
        <span>↵ <strong>Enter</strong> Add numeric value</span>
      </div>
    </div>
  )
}

/* ---- reusable icon button ---- */
function IconButton({ onClick, disabled, title, children }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 36, height: 36,
        borderRadius: 10,
        border: '2px solid var(--color-gray-200)',
        background: '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-gray-600)',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = 'var(--color-gray-100)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
    >
      {children}
    </button>
  )
}
