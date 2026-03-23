import { useEffect, useMemo, useRef, useState } from 'react'
import { useDndMonitor } from '@dnd-kit/core'
import { LoaderCircle, Save, Trash2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAnswerKeyHistory } from '../../hooks/useAnswerKeyHistory.js'
import { ANSWER_TAGS } from '../../data/quizzes.js'
import { validateAllQuestions, validateQuestion } from '../../utils/validation.js'
import { ProgressBar } from '../ui/index.js'
import { QuestionRow } from './QuestionRow.jsx'

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
      points: savedQuestion?.points ?? 1,
      answer: omrQ.type === 'MCQ' ? savedAnswer : '',
      totalBubbles,
      allowDecimal:
        omrQ.type === 'Numeric'
          ? savedQuestion?.allowDecimal ?? omrQ.allowDecimal ?? true
          : undefined,
      allowFraction:
        omrQ.type === 'Numeric'
          ? savedQuestion?.allowFraction ?? omrQ.allowFraction ?? true
          : undefined,
      allowNegative:
        omrQ.type === 'Numeric'
          ? savedQuestion?.allowNegative ?? omrQ.allowNegative ?? true
          : undefined,
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

function isQuestionAnswered(question) {
  if (question.type === 'MCQ') return Boolean(question.answer)
  return Array.isArray(question.answers) && question.answers.some((answer) => String(answer).trim())
}

function clearQuestionValues(question) {
  return {
    ...question,
    points: question.points ?? 1,
    answer: question.type === 'MCQ' ? '' : question.answer,
    answers: question.type === 'Numeric' ? [] : question.answers,
    tag: undefined,
  }
}

function findFirstErrorQuestion(questions, errors) {
  const firstEmptyQuestion = questions.find(
    (question) => errors[question.questionNumber] && !isQuestionAnswered(question)
  )

  if (firstEmptyQuestion) return firstEmptyQuestion.questionNumber

  return questions.find((question) => errors[question.questionNumber])?.questionNumber ?? null
}

function serializeQuestions(questions = []) {
  return JSON.stringify(Array.isArray(questions) ? questions : [])
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
  onRegisterNavbarActions,
  onSaveStatusChange,
  enableDragDrop = true,
}) {
  const [historySeed, setHistorySeed] = useState(() =>
    buildInitialQuestions(quiz.omrConfiguration, savedQuestions)
  )
  const [validationErrors, setValidationErrors] = useState({})
  const [isManualSaving, setIsManualSaving] = useState(false)
  const [highlightedQuestion, setHighlightedQuestion] = useState(null)
  const [numericSuggestionsEnabled, setNumericSuggestionsEnabled] = useState(true)
  const questionRefs = useRef(new Map())
  const inputRefs = useRef(new Map())
  const hasHydratedRef = useRef(false)
  const onSaveRef = useRef(onSave)
  const onSaveStatusChangeRef = useRef(onSaveStatusChange)

  useEffect(() => {
    setHistorySeed(buildInitialQuestions(quiz.omrConfiguration, savedQuestions))
  }, [quiz.id, savedQuestions])

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  useEffect(() => {
    onSaveStatusChangeRef.current = onSaveStatusChange
  }, [onSaveStatusChange])

  const {
    questions,
    setQuestions,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useAnswerKeyHistory(historySeed)

  const questionList = useMemo(
    () => (Array.isArray(questions) ? questions : []),
    [questions]
  )
  const serializedQuestionList = useMemo(
    () => serializeQuestions(questionList),
    [questionList]
  )
  const serializedSavedQuestions = useMemo(
    () => serializeQuestions(savedQuestions),
    [savedQuestions]
  )

  useEffect(() => {
    onRegisterNavbarActions?.({
      undo,
      redo,
      canUndo,
      canRedo,
      startTour: onStartTour,
    })

    return () => onRegisterNavbarActions?.(null)
  }, [canRedo, canUndo, onRegisterNavbarActions, onStartTour, redo, undo])

  useEffect(() => {
    if (!bulkImportPayload?.entries?.length) return
    if (bulkImportPayload.quizId !== quiz.id) return

    const nextQuestions = questionList.map((question) => {
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

    setQuestions(nextQuestions)
    setValidationErrors(validateAllQuestions(nextQuestions))

    onBulkImportApplied?.()
  }, [bulkImportPayload, onBulkImportApplied, questionList, quiz.id, setQuestions])

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

  useEffect(() => {
    if (!questionList.length) return

    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true
      return
    }

    if (serializedQuestionList === serializedSavedQuestions) {
      onSaveStatusChangeRef.current?.({ state: 'saved', savedAt: Date.now() })
      return
    }

    onSaveStatusChangeRef.current?.({ state: 'saving', savedAt: null })
    const autosaveTimer = window.setTimeout(() => {
      onSaveRef.current?.(questionList)
      onSaveStatusChangeRef.current?.({ state: 'saved', savedAt: Date.now() })
    }, 400)

    return () => window.clearTimeout(autosaveTimer)
  }, [questionList, serializedQuestionList, serializedSavedQuestions])

  useEffect(() => {
    if (!highlightedQuestion) return undefined

    const timer = window.setTimeout(() => setHighlightedQuestion(null), 2200)
    return () => window.clearTimeout(timer)
  }, [highlightedQuestion])

  const updateQuestion = (questionNumber, patch) => {
    const nextQuestions = questionList.map((question) =>
      question.questionNumber === questionNumber ? { ...question, ...patch } : question
    )

    const updatedQuestion = nextQuestions.find(
      (question) => question.questionNumber === questionNumber
    )
    const nextError = updatedQuestion ? validateQuestion(updatedQuestion) : null

    setQuestions(nextQuestions)
    setValidationErrors((prev) => {
      const next = { ...prev }
      if (nextError) next[questionNumber] = nextError
      else delete next[questionNumber]
      return next
    })
  }

  const focusQuestion = (questionNumber) => {
    const rowNode = questionRefs.current.get(questionNumber)
    const inputNode = inputRefs.current.get(questionNumber)

    rowNode?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => {
      inputNode?.focus?.()
    }, 180)
    setHighlightedQuestion(questionNumber)
  }

  const handleSave = async () => {
    const errors = validateAllQuestions(questionList)
    setValidationErrors(errors)

    const firstErrorQuestion = findFirstErrorQuestion(questionList, errors)
    if (firstErrorQuestion) {
      focusQuestion(firstErrorQuestion)
      return
    }

    setIsManualSaving(true)
    onSaveStatusChangeRef.current?.({ state: 'saving', savedAt: null })
    onSaveRef.current?.(questionList)

    await new Promise((resolve) => window.setTimeout(resolve, 300))

    setIsManualSaving(false)
    onSaveStatusChangeRef.current?.({ state: 'saved', savedAt: Date.now() })
    toast.success('Answer key saved successfully')
  }

  const handleClearAll = () => {
    const hasAnswers = questionList.some(isQuestionAnswered)
    if (!hasAnswers) return

    const confirmed = window.confirm(
      'Clear all entered answers for this quiz? This will remove all MCQ, numeric, and dropped tag values.'
    )

    if (!confirmed) return

    const nextQuestions = questionList.map(clearQuestionValues)
    setQuestions(nextQuestions)
    setValidationErrors(validateAllQuestions(nextQuestions))
  }

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
              onClick={handleSave}
              className="primary-button save-button"
              data-tour="save-answer-key"
              disabled={isManualSaving}
            >
              {isManualSaving ? <LoaderCircle size={15} className="spin-icon" /> : <Save size={15} />}
              Save Answer Key
            </button>
          </div>
        </div>

        <ProgressBar
          value={answeredCount}
          max={questionList.length}
          label={`Progress: ${answeredCount} of ${questionList.length} questions`}
        />

        {questionList.some((question) => question.type === 'Numeric') && (
          <label className="numeric-toggle-row numeric-toggle-global">
            <input
              type="checkbox"
              checked={numericSuggestionsEnabled}
              onChange={(event) => setNumericSuggestionsEnabled(event.target.checked)}
            />
            <span>Auto suggestions for all numeric inputs</span>
          </label>
        )}

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
            isHighlighted={highlightedQuestion === question.questionNumber}
            rowRef={(node) => {
              if (node) questionRefs.current.set(question.questionNumber, node)
              else questionRefs.current.delete(question.questionNumber)
            }}
            inputRef={(node) => {
              if (node) inputRefs.current.set(question.questionNumber, node)
              else inputRefs.current.delete(question.questionNumber)
            }}
            suggestionsEnabled={numericSuggestionsEnabled}
            onPointsChange={(points) =>
              updateQuestion(question.questionNumber, { points })
            }
            onAnswerChange={(value) =>
              updateQuestion(question.questionNumber, {
                answer: value,
                tag: question.type === 'MCQ' ? findTagForOption(value) : question.tag,
              })
            }
            onAnswersChange={(answers) =>
              updateQuestion(question.questionNumber, { answers })
            }
            onRemoveTag={() =>
              updateQuestion(question.questionNumber, { tag: undefined, answer: '' })
            }
          />
        ))}
      </div>

      <div className="answer-panel-footer">
        <span>↵ <strong>Enter</strong> Add numeric values</span>
        <span>Use commas to add multiple numeric values at once</span>
      </div>
    </section>
  )
}
