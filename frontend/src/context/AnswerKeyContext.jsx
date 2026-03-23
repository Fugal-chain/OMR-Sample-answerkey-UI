import { createContext, useContext, useEffect, useState } from 'react'

const AnswerKeyContext = createContext(null)
const STORAGE_KEY = 'omr-exam-dashboard-answer-keys'

function normalizeSavedRecord(examId, value) {
  if (Array.isArray(value)) {
    return {
      examId,
      questions: value,
    }
  }

  if (value && typeof value === 'object' && Array.isArray(value.questions)) {
    return {
      examId: value.examId ?? examId,
      questions: value.questions,
    }
  }

  return {
    examId,
    questions: [],
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

/**
 * Provides global saved answer key state across the app.
 */
export function AnswerKeyProvider({ children }) {
  const [savedAnswers, setSavedAnswers] = useState(loadSavedAnswers)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedAnswers))
  }, [savedAnswers])

  const saveAnswers = (examId, questions) => {
    setSavedAnswers((prev) => ({
      ...prev,
      [examId]: {
        examId,
        questions,
      },
    }))
  }

  const getAnswers = (examId) => savedAnswers[examId]?.questions || null

  return (
    <AnswerKeyContext.Provider value={{ savedAnswers, saveAnswers, getAnswers }}>
      {children}
    </AnswerKeyContext.Provider>
  )
}

export function useAnswerKey() {
  const ctx = useContext(AnswerKeyContext)
  if (!ctx) throw new Error('useAnswerKey must be used within AnswerKeyProvider')
  return ctx
}
