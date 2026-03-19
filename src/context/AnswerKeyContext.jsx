import { createContext, useContext, useEffect, useState } from 'react'

const AnswerKeyContext = createContext(null)
const STORAGE_KEY = 'omr-exam-dashboard-answer-keys'

function loadSavedAnswers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
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

  const saveAnswers = (quizId, answers) => {
    setSavedAnswers((prev) => ({ ...prev, [quizId]: answers }))
  }

  const getAnswers = (quizId) => savedAnswers[quizId] || null

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
