import { useEffect, useMemo, useState } from 'react'
import { useDndMonitor } from '@dnd-kit/core'
import { Undo2, Redo2, Upload, Save, Trash2, CircleHelp } from 'lucide-react'
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
    const totalBubbles =
      omrQ.type === 'Numeric'
        ? savedQuestion?.totalBubbles ?? omrQ.totalBubbles ?? 4
        : undefined

    return {
      questionNumber: omrQ.questionNumber,
      type: omrQ.type,
      answer: omrQ.type === 'MCQ' ? savedAnswer : '',
      totalBubbles,
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
  onStartTour,
  enableDragDrop = true,
}) {
  const [historySeed, setHistorySeed] = useState(() =>
    buildInitialQuestions(quiz.omrConfiguration, savedQuestions)
  )

  useEffect(() => {
    setHistorySeed(buildInitialQuestions(quiz.omrConfiguration, savedQuestions))
  }, [quiz.id])

  const {
    questions,
    setQuestions,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useAnswerKeyHistory(historySeed)

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
      if (!enableDragDrop) return

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
    <section className="answer-panel">
      <div className="answer-panel-header">
        <div className="answer-panel-title-row">
          <button
            onClick={onBack}
            title="Back to quiz list"
            className="soft-button"
            style={{ padding: 0, width: 42, height: 42, flexShrink: 0 }}
          >←</button>

          <div className="answer-panel-title">
            <h2>Answer Key Setup</h2>
            <p>{quiz.name}</p>
          </div>

          <div className="answer-panel-actions">
            <div className="action-group">
            <IconButton onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
              <Undo2 size={16} />
            </IconButton>
            <IconButton onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
              <Redo2 size={16} />
            </IconButton>
            </div>

          <button
            onClick={onBulkImport}
            className="soft-button"
            data-tour="bulk-import"
          >
            <Upload size={14} /> Bulk Import
          </button>

          <button
            onClick={handleClearAll}
            disabled={answeredCount === 0}
            className="danger-button"
          >
            <Trash2 size={14} /> Clear All
          </button>

          <button
            onClick={onStartTour}
            className="soft-button tour-button"
          >
            <CircleHelp size={15} /> Help / Tour
          </button>

          <button
            onClick={handleSave}
            className="primary-button"
            style={saveSuccess ? { background: 'linear-gradient(135deg, #16a34a, #15803d)' } : undefined}
            data-tour="save-answer-key"
          >
            <Save size={15} />
            {saveSuccess ? 'Saved!' : 'Save Answer Key'}
          </button>
          </div>
        </div>

        <ProgressBar
          value={answeredCount}
          max={questionList.length}
          label={`Progress: ${answeredCount} of ${questionList.length} questions`}
        />

        {errorCount > 0 && (
          <div style={{
            marginTop: 12,
            padding: '10px 14px',
            background: 'var(--color-red-light)',
            border: '1px solid #fca5a5',
            borderRadius: 14,
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

      <div className="answer-panel-body" data-tour="answer-input-section">
        {questionList.map((question) => (
          <QuestionRow
            key={question.questionNumber}
            question={question}
            validationError={validationErrors[question.questionNumber]}
            enableDragDrop={enableDragDrop}
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

      <div className="answer-panel-footer">
        <span>⌨️ <strong>Ctrl+Z</strong> Undo</span>
        <span>⌨️ <strong>Ctrl+Y</strong> Redo</span>
        <span>↵ <strong>Enter</strong> Add numeric value</span>
      </div>
    </section>
  )
}

/* ---- reusable icon button ---- */
function IconButton({ onClick, disabled, title, children }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      className="icon-button"
    >
      {children}
    </button>
  )
}
