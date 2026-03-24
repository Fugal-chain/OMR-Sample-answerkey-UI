import { createContext, useContext, useEffect, useState } from 'react'

const AnswerKeyContext = createContext(null)
const STORAGE_KEY = 'omr-exam-dashboard-answer-keys'

function normalizeSavedRecord(examId, value) {
  if (Array.isArray(value)) {
    return {
      examId,
      questions: value,
      source: 'legacy',
    }
  }

  if (value && typeof value === 'object' && Array.isArray(value.questions)) {
    return {
      examId: value.examId ?? examId,
      questions: value.questions,
      source: value.source ?? 'legacy',
    }
  }

  return {
    examId,
    questions: [],
    source: 'legacy',
  }
}

function loadSavedAnswers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw)
    return Object.fromEntries(
      Object.entries(parsed).map(([examId, value]) => [examId, normalizeSavedRecord(examId, value)])
    )
  } catch {
    return {}
  }
}

export function AnswerKeyProvider({ children }) {
  const [savedAnswers, setSavedAnswers] = useState(loadSavedAnswers)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedAnswers))
  }, [savedAnswers])

  const saveAnswers = (examId, questions, options = {}) => {
    setSavedAnswers((prev) => ({
      ...prev,
      [examId]: {
        examId,
        questions,
        source: options.source ?? 'local-draft',
      },
    }))
  }

  const getAnswers = (examId) => savedAnswers[examId]?.questions || null
  const getAnswerRecord = (examId) => savedAnswers[examId] ?? null

  return (
    <AnswerKeyContext.Provider value={{ savedAnswers, saveAnswers, getAnswers, getAnswerRecord }}>
      {children}
    </AnswerKeyContext.Provider>
  )
}

export function useAnswerKey() {
  const ctx = useContext(AnswerKeyContext)
  if (!ctx) throw new Error('useAnswerKey must be used within AnswerKeyProvider')
  return ctx
}
